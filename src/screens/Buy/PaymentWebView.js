// screens/PaymentWebView.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  BackHandler,
  Text,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertSchemeCollection } from "../../services/InstallmentUpdateService";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";
import { API_BASE_URL } from "../../Config/API";
import {
  fetchWithTimeout,
  classifyGatewayUrl,
  interpretPaymentStatus,
  wasTxnProcessed,
  markTxnProcessed,
  savePendingPayment,
  clearPendingPayment,
} from "../../utils/PaymentUtils";

const PaymentWebView = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Refs (not state) so redirect races can't fire the handler twice —
  // state updates are async, refs are synchronous.
  const paymentProcessedRef = useRef(false);
  const statusCheckedRef = useRef(false);

  const { paymentUrl, orderDetails, productData, payTypeResponse } =
    route.params || {};

  // Persist a pending-payment record so the payment can be recovered
  // if the app is closed/killed while the gateway is open.
  useEffect(() => {
    const txn = orderDetails?.merchantTxnNo || orderDetails?.orderId;
    if (txn) {
      savePendingPayment({
        merchantTxnNo: txn,
        type: "installment",
        payload: { orderDetails, productData },
      });
    }
  }, []);

  // -------------------------------------------------------------
  //  HANDLE BACK BUTTON – CONFIRM BEFORE EXITING PAYMENT
  // -------------------------------------------------------------
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log("[Payment] Back button pressed - showing confirmation");
        Alert.alert(
          "Cancel Payment?",
          "Are you sure you want to cancel this payment?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                console.log("[Payment] User cancelled payment");
                navigation.replace("PaymentCancelled", {
                  // Changed to PaymentCancelled
                  orderDetails,
                  productData,
                  isCashPayment: false,
                });
              },
            },
          ]
        );
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // -------------------------------------------------------------
  //  SAVE PAYMENT DATA LOCALLY
  // -------------------------------------------------------------
  const storePaymentData = async (paymentStatus) => {
    try {
      console.log("[Payment] Storing payment data locally");
      const paymentData = {
        payphiResponse: paymentStatus?.payphiResponse,
        orderStatus: paymentStatus?.orderStatus,
        message: paymentStatus?.message,
        timestamp: new Date().toISOString(),
        orderDetails: orderDetails,
      };

      await AsyncStorage.setItem(
        "paymentResponse",
        JSON.stringify(paymentData)
      );
      console.log("[Payment] Payment data saved successfully");
    } catch (error) {
      console.error("[Payment] Error saving payment data:", error);
    }
  };

  // -------------------------------------------------------------
  //  CREATE INSERT PAYLOAD FOR SCHEME COLLECTION
  // -------------------------------------------------------------
  const buildSchemeData = (paymentStatus) => {
    console.log("\n📋 [INSTALLMENT-WEBVIEW] buildSchemeData called");
    if (!paymentStatus) {
      console.warn("⚠️ [INSTALLMENT-WEBVIEW] No paymentStatus, using fallback");
      paymentStatus = {};
    }

    const schemeInfo = orderDetails?.schemeInfo || {};
    console.log("📋 [INSTALLMENT-WEBVIEW] schemeInfo:", JSON.stringify(schemeInfo, null, 2));
    const pay = paymentStatus?.payphiResponse || {};
    console.log("📋 [INSTALLMENT-WEBVIEW] payphiResponse:", JSON.stringify(pay, null, 2));

    const groupCode =
      orderDetails?.customer?.groupCode || productData?.groupCode || "BMA";

    const regNo =
      orderDetails?.customer?.regNo?.toString() ||
      productData?.regNo?.toString() ||
      "41";

    const amount =
      orderDetails?.amount?.toString() ||
      productData?.amount?.toString() ||
      pay?.amount?.toString() ||
      "1000";
    const SchemeId = schemeInfo.schemeId || schemeInfo.SchemeId;

    const installment =
      (parseInt(
        schemeInfo?.schemaSummaryTransBalance?.insPaid ??
          productData?.installmentPaid ??
          0
      ) || 0) + 1;

    const payload = {
      groupCode,
      regNo,
      rDate: new Date().toISOString().split("T")[0],
      amount,
      modePay: "O",
      accCode: "2",
      updateTime: new Date().toISOString().split("T")[0],
      installment,
      userID: "9999",
      chqBankCode: "2" || "",
      chqCardNo: pay.txnID || "",
      chqBranch: pay.paymentSubInstType || "",
      chkBank: pay.paymentMode || "",
      chqRtnReason: pay.merchantTxnNo || "",
      schemeId: SchemeId,
    };

    console.log("📋 [INSTALLMENT-WEBVIEW] Built payload:", JSON.stringify(payload, null, 2));
    return payload;
  };

  // -------------------------------------------------------------
  //  CHECK PAYMENT STATUS (AFTER REDIRECT BLOCKED)
  // -------------------------------------------------------------
  // In PaymentWebView.js - Update the checkPaymentStatus function and handleRequest function

  const fetchPaymentStatusOnce = async (merchantTxnNo) => {
    const statusPayload = {
      merchantId: "T_03342",
      merchantTxnNo,
      originalTxnNo: merchantTxnNo,
      transactionType: "STATUS",
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/payment/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(statusPayload),
      },
      30000
    );

    return response.json();
  };

  const checkPaymentStatus = async (merchantTxnNo) => {
    console.log("\n🔍 [INSTALLMENT-WEBVIEW] checkPaymentStatus called");
    if (!merchantTxnNo) {
      console.warn("⚠️ [INSTALLMENT-WEBVIEW] No merchantTxnNo — aborting");
      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: { message: "Missing transaction reference" },
        isCashPayment: false,
      });
      return;
    }
    if (statusCheckedRef.current) {
      console.log("🔍 [INSTALLMENT-WEBVIEW] Already checked — skipping");
      return;
    }
    statusCheckedRef.current = true;

    try {
      // Poll status up to 3 times — gateways can take a moment to settle.
      let data = null;
      let verdict = "PENDING";
      for (let attempt = 1; attempt <= 3; attempt++) {
        data = await fetchPaymentStatusOnce(merchantTxnNo);
        verdict = interpretPaymentStatus(data);
        console.log(
          `🔍 [INSTALLMENT-WEBVIEW] status attempt ${attempt}: orderStatus=${data?.orderStatus} txnStatus=${data?.payphiResponse?.txnStatus} → ${verdict}`
        );
        if (verdict !== "PENDING") break;
        await new Promise((r) => setTimeout(r, 3000));
      }

      await storePaymentData(data);

      if (verdict === "CANCELLED") {
        console.log("🚫 [INSTALLMENT-WEBVIEW] Payment CANCELLED");
        await clearPendingPayment(merchantTxnNo);
        navigation.replace("PaymentCancelled", {
          orderDetails,
          productData,
          isCashPayment: false,
        });
        return;
      }

      if (verdict === "PAID") {
        console.log("✅ [INSTALLMENT-WEBVIEW] Payment CONFIRMED PAID by backend");

        // Idempotency: never insert the same transaction twice.
        if (await wasTxnProcessed(merchantTxnNo)) {
          console.log("🔁 [INSTALLMENT-WEBVIEW] Txn already credited — skipping insert");
          await clearPendingPayment(merchantTxnNo);
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
            isInstallmentPayment: true,
            paymentType: "installment",
          });
          return;
        }

        const schemeData = buildSchemeData(data);
        let inserted = false;
        let lastInsertError = null;

        // Retry the credit insert up to 3 times before declaring it pending.
        for (let attempt = 1; attempt <= 3 && !inserted; attempt++) {
          try {
            const insertResult = await insertSchemeCollection(schemeData);
            console.log("✅ [INSTALLMENT-WEBVIEW] insert result:", insertResult);
            inserted = true;
          } catch (insertErr) {
            lastInsertError = insertErr;
            console.warn(
              `⚠️ [INSTALLMENT-WEBVIEW] insert attempt ${attempt} failed:`,
              insertErr.message
            );
            if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
          }
        }

        if (inserted) {
          await markTxnProcessed(merchantTxnNo);
          await clearPendingPayment(merchantTxnNo);
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            schemeData,
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
            isInstallmentPayment: true,
            paymentType: "installment",
          });
        } else {
          // Payment IS confirmed, but crediting failed. Keep the pending
          // record for recovery and tell the user the truth — never show a
          // plain success screen for an uncredited payment.
          console.error(
            "❌ [INSTALLMENT-WEBVIEW] Payment PAID but credit insert failed:",
            lastInsertError?.message
          );
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            creditPending: true,
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
            isInstallmentPayment: true,
            paymentType: "installment",
          });
        }
        return;
      }

      if (verdict === "PENDING") {
        console.log("⏳ [INSTALLMENT-WEBVIEW] Payment still PENDING after polling");
        // Keep the pending record — recovery will re-check on next launch.
        navigation.replace("PaymentFailure", {
          orderDetails,
          productData,
          paymentStatus: {
            ...data,
            message:
              "Your payment is still being processed. If money was deducted, it will be credited automatically — please check Payment History shortly.",
            isPending: true,
          },
          isCashPayment: false,
        });
        return;
      }

      // FAILED
      console.log("❌ [INSTALLMENT-WEBVIEW] Payment FAILED");
      await clearPendingPayment(merchantTxnNo);
      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: data,
        isCashPayment: false,
      });
    } catch (error) {
      console.error("❌ [INSTALLMENT-WEBVIEW] checkPaymentStatus error:", error.message);
      // Do NOT clear the pending record — status is unknown, recovery will re-check.
      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: {
          message:
            "We couldn't confirm your payment due to a network problem. If money was deducted, it will be verified automatically on your next app launch.",
          isPending: true,
        },
        isCashPayment: false,
      });
    }
  };
  const handleRequest = (request) => {
    const url = request.url;
    console.log("\n🌐 [INSTALLMENT-WEBVIEW] URL intercepted:", url.substring(0, 150));

    if (paymentProcessedRef.current) {
      console.log("🌐 [INSTALLMENT-WEBVIEW] Already processed — blocking");
      return false;
    }

    // Strict, exact-path classification — never bare "/success" substrings.
    const outcome = classifyGatewayUrl(url);

    if (outcome === "success") {
      console.log("✅ [INSTALLMENT-WEBVIEW] SUCCESS redirect detected");
      paymentProcessedRef.current = true;
      setProcessing(true);

      const txn = orderDetails?.merchantTxnNo || orderDetails?.orderId;
      // Backend remains the source of truth — verify before doing anything.
      setTimeout(() => checkPaymentStatus(txn), 1000);
      return false;
    }

    if (outcome === "failure") {
      console.log("❌ [INSTALLMENT-WEBVIEW] FAILURE redirect detected");
      paymentProcessedRef.current = true;
      setProcessing(true);

      const txn = orderDetails?.merchantTxnNo || orderDetails?.orderId;
      clearPendingPayment(txn);
      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: { message: "Payment was declined or failed" },
        isCashPayment: false,
      });
      return false;
    }

    if (outcome === "cancel") {
      console.log("🚫 [INSTALLMENT-WEBVIEW] CANCEL redirect detected");
      paymentProcessedRef.current = true;
      setProcessing(true);

      const txn = orderDetails?.merchantTxnNo || orderDetails?.orderId;
      clearPendingPayment(txn);
      navigation.replace("PaymentCancelled", {
        orderDetails,
        productData,
        isCashPayment: false,
      });
      return false;
    }

    return true;
  };

  // -------------------------------------------------------------
  //  UI
  // -------------------------------------------------------------
  return (
    <View style={styles.container}>
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <ActivityIndicator size={SIZES.icon.xxxl} color={COLORS.primary} />
            <Text style={styles.processingText}>Processing Payment</Text>
            <Text style={styles.processingSub}>
              Please wait while we confirm your transaction
            </Text>
          </View>
        </View>
      )}

      {paymentUrl ? (
        <>
          <WebView
            source={{ uri: paymentUrl }}
            onShouldStartLoadWithRequest={handleRequest}
            onLoadStart={() => {
              console.log("[WebView] Page load started");
              setLoading(true);
            }}
            onLoadEnd={() => {
              console.log("[WebView] Page load completed");
              setLoading(false);
            }}
            onError={(err) => {
              console.error("[WebView] Load error:", err);
              Alert.alert(
                "Connection Error",
                "Unable to load payment page. Please try again.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />

          {loading && !processing && (
            <View style={styles.loader}>
              <ActivityIndicator
                size={SIZES.icon.xxxl}
                color={COLORS.primary}
              />
              <Text style={styles.loadingText}>Loading Payment Gateway</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Payment URL Not Available</Text>
            <Text style={styles.errorDescription}>
              Unable to process payment at the moment. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log(
                  "[Payment] User navigating back due to missing URL"
                );
                navigation.goBack();
              }}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// -------------------------------------------------------------
//  STYLES
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: SIZES.padding.md,
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },

  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  processingContent: {
    alignItems: "center",
    padding: SIZES.padding.xl,
  },

  processingText: {
    marginTop: SIZES.padding.lg,
    ...FONTS.h4,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semiBold,
    textAlign: "center",
  },

  processingSub: {
    marginTop: SIZES.padding.sm,
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.sm * 1.5,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.xl,
    backgroundColor: COLORS.background,
  },

  errorContent: {
    alignItems: "center",
    width: "100%",
  },

  errorIcon: {
    fontSize: SIZES.icon.xxxl,
    marginBottom: SIZES.padding.lg,
  },

  errorTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semiBold,
    marginBottom: SIZES.padding.sm,
    textAlign: "center",
  },

  errorDescription: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.padding.xl,
    lineHeight: SIZES.font.md * 1.5,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    minWidth: 120,
    ...SHADOWS.sm,
  },

  retryButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    textAlign: "center",
  },
});

export default PaymentWebView;
