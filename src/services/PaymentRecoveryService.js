// services/PaymentRecoveryService.js
// Recovers payments that were interrupted mid-flow (app closed/killed, network
// dropped after the gateway, credit insert failed). Runs on app resume:
//   1. Reads persisted pending-payment records.
//   2. Verifies each with the backend /payment/status (backend = source of truth).
//   3. If PAID and not yet processed → completes the enrollment/credit exactly once.
//   4. If FAILED/CANCELLED → clears the record. If PENDING → leaves it for next run.

import { API_BASE_URL } from "../Config/API";
import {
  fetchWithTimeout,
  interpretPaymentStatus,
  wasTxnProcessed,
  markTxnProcessed,
  getPendingPayments,
  clearPendingPayment,
} from "../utils/PaymentUtils";
import { insertSchemeCollection } from "./InstallmentUpdateService";
import { buildMemberCreateBody, createMember } from "./MemberCreateService";

let recoveryInFlight = false; // single-flight lock across screens

const fetchPaymentStatus = async (merchantTxnNo) => {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/payment/status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchantId: "T_03342",
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        transactionType: "STATUS",
      }),
    },
    30000
  );
  return response.json();
};

// Rebuild the installment credit payload from the persisted record + fresh
// payment status (mirrors PaymentWebView.buildSchemeData).
const buildInstallmentInsertPayload = (record, paymentStatus) => {
  const { orderDetails = {}, productData = {} } = record.payload || {};
  const schemeInfo = orderDetails.schemeInfo || {};
  const pay = paymentStatus?.payphiResponse || {};

  const groupCode = orderDetails.customer?.groupCode || productData.groupCode;
  const regNo =
    orderDetails.customer?.regNo?.toString() || productData.regNo?.toString();
  const amount =
    orderDetails.amount?.toString() ||
    productData.amount?.toString() ||
    pay.amount?.toString();
  const schemeId = schemeInfo.schemeId || schemeInfo.SchemeId;

  if (!groupCode || !regNo || !amount) {
    throw new Error("Pending record is missing account details");
  }

  const installment =
    (parseInt(
      schemeInfo?.schemaSummaryTransBalance?.insPaid ??
        productData?.installmentPaid ??
        0
    ) || 0) + 1;

  const today = new Date().toISOString().split("T")[0];

  return {
    groupCode,
    regNo,
    rDate: today,
    amount,
    modePay: "O",
    accCode: "2",
    updateTime: today,
    installment,
    userID: "9999",
    chqBankCode: "2",
    chqCardNo: pay.txnID || "",
    chqBranch: pay.paymentSubInstType || "",
    chkBank: pay.paymentMode || "",
    chqRtnReason: pay.merchantTxnNo || record.merchantTxnNo || "",
    schemeId,
  };
};

/**
 * Recover all pending payments.
 * Returns { recovered: [...], stillPending: n } for optional UI notification.
 */
export const recoverPendingPayments = async () => {
  if (recoveryInFlight) return { recovered: [], stillPending: 0 };
  recoveryInFlight = true;

  const recovered = [];
  let stillPending = 0;

  try {
    const records = await getPendingPayments();
    if (!records.length) return { recovered: [], stillPending: 0 };

    console.log(`🔄 [Recovery] Found ${records.length} pending payment(s)`);

    for (const record of records) {
      const txn = record.merchantTxnNo;
      try {
        const status = await fetchPaymentStatus(txn);
        const verdict = interpretPaymentStatus(status);
        console.log(`🔄 [Recovery] ${txn} → ${verdict}`);

        if (verdict === "FAILED" || verdict === "CANCELLED") {
          await clearPendingPayment(txn);
          continue;
        }

        if (verdict === "PENDING") {
          stillPending += 1;
          continue;
        }

        // PAID — complete exactly once
        if (await wasTxnProcessed(txn)) {
          await clearPendingPayment(txn);
          continue;
        }

        if (record.type === "installment") {
          const payload = buildInstallmentInsertPayload(record, status);
          await insertSchemeCollection(payload);
          await markTxnProcessed(txn);
          await clearPendingPayment(txn);
          recovered.push({
            merchantTxnNo: txn,
            type: "installment",
            amount: payload.amount,
          });
        } else if (record.type === "join") {
          const p = record.payload || {};
          const requestBody = buildMemberCreateBody({
            memberData: p.transformedMemberData,
            numericSchemeId: p.numericSchemeId,
            groupCode: p.groupCode,
            regNo: p.regNo,
            schemeFormData: p.schemeFormData,
            referralCode: p.referralCode || "",
            paymentResponse: status,
            cashPayment: false,
          });
          await createMember(requestBody);
          await markTxnProcessed(txn);
          await clearPendingPayment(txn);
          recovered.push({
            merchantTxnNo: txn,
            type: "join",
            amount: p.schemeFormData?.amount,
          });
        } else {
          // Unknown record type — clear so it can't loop forever
          await clearPendingPayment(txn);
        }
      } catch (err) {
        // Leave the record in place; next launch will retry.
        console.warn(`⚠️ [Recovery] ${txn} failed:`, err.message);
        stillPending += 1;
      }
    }
  } catch (err) {
    console.error("❌ [Recovery] Unexpected error:", err.message);
  } finally {
    recoveryInFlight = false;
  }

  if (recovered.length) {
    console.log(`✅ [Recovery] Completed ${recovered.length} payment(s)`);
  }
  return { recovered, stillPending };
};
