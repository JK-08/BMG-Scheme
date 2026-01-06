// screens/PaymentWebView.js
import React, { useEffect, useState } from "react";
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

const PaymentWebView = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { paymentUrl, orderDetails, productData, payTypeResponse } =
    route.params || {};

  const successUrl = "https://bmgjewellers.com/payment-success";
  const failureUrl = "https://bmgjewellers.com/payment-failure";
  const cancelUrl = "/cancel";

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
    if (!paymentStatus) {
      console.warn(
        "[Payment] No payment status provided, using fallback values"
      );
      paymentStatus = {};
    }

    const schemeInfo = orderDetails?.schemeInfo || {};
    const pay = paymentStatus?.payphiResponse || {};

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
    const SchemeId = schemeInfo.SchemeId;

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

    console.log("[Payment] Scheme data payload built", payload);
    return payload;
  };

  // -------------------------------------------------------------
  //  CHECK PAYMENT STATUS (AFTER REDIRECT BLOCKED)
  // -------------------------------------------------------------
  // In PaymentWebView.js - Update the checkPaymentStatus function and handleRequest function

  const checkPaymentStatus = async (merchantTxnNo) => {
    if (!merchantTxnNo) {
      console.warn("[Payment] No merchant transaction number available");
      return;
    }
    if (paymentStatusChecked) {
      console.log("[Payment] Payment status already checked, skipping");
      return;
    }

    setPaymentStatusChecked(true);
    console.log(`[Payment] Checking payment status for: ${merchantTxnNo}`);

    try {
      const statusPayload = {
        merchantId: "T_03342",
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        transactionType: "STATUS",
      };

      const response = await fetch(
        `${API_BASE_URL}/payment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(statusPayload),
        }
      );
      
      const data = await response.json();
      console.log(
        `[Payment] Status response received: ${
          data.txnStatus
        }`
      );

      await storePaymentData(data);

      const pay = data?.payphiResponse;

      // Check for cancellation status
      const isCancelled =
        data?.orderStatus === "CANCELLED" ||
        data?.status === "CANCELLED" ||
        (pay?.txnStatus && ["CANC", "CANCELLED"].includes(pay?.txnStatus)) ||
        data?.message?.toLowerCase()?.includes("cancel");

      const isSuccess =
        data?.orderStatus === "PAID" ||
        data?.status === "SUCCESS" ||
        (pay?.txnStatus && ["SUC", "SUCCESS"].includes(pay?.txnStatus)) ||
        (pay?.txnResponseCode &&
          ["00", "000", "0000"].includes(pay?.txnResponseCode)) ||
        pay?.txnRespDescription?.toLowerCase()?.includes("success") ||
        data?.message?.toLowerCase()?.includes("success");

      if (isCancelled) {
        console.log(
          "[Payment] Payment cancelled - navigating to PaymentCancelled"
        );
        navigation.replace("PaymentCancelled", {
          orderDetails,
          productData,
          isCashPayment: false,
        });
      } else if (isSuccess) {
        console.log("[Payment] Payment successful - inserting scheme data");
        const schemeData = buildSchemeData(data);

        try {
          await insertSchemeCollection(schemeData);
          console.log("[Payment] Scheme collection inserted successfully");
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            schemeData,
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
          });
        } catch (insertErr) {
          console.warn(
            "[Payment] Failed to insert scheme collection:",
            insertErr.message
          );
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
          });
        }
      } else {
        console.log("[Payment] Payment failed - navigating to PaymentFailure");
        navigation.replace("PaymentFailure", {
          orderDetails,
          productData,
          paymentStatus: data,
          isCashPayment: false,
        });
      }
    } catch (error) {
      console.error("[Payment] Error checking payment status:", error);
      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: { message: "Network error or timeout" },
        isCashPayment: false,
      });
    }
  };
  // Also update the handleRequest function for failure URLs:
  const handleRequest = (request) => {
    const url = request.url;
    console.log(`[WebView] Loading: ${url.substring(0, 100)}...`);

    if (paymentProcessed) {
      console.log("[WebView] Payment already processed, blocking request");
      return false;
    }

    // SUCCESS
    if (
      url.includes(successUrl) ||
      url.includes("/payment-success") ||
      url.includes("/success")
    ) {
      console.log("[WebView] Success URL detected - blocking redirect");
      setPaymentProcessed(true);
      setProcessing(true);

      const txn = orderDetails?.merchantTxnNo || orderDetails?.orderId;
      setTimeout(() => checkPaymentStatus(txn), 1000);
      return false;
    }

    // FAILURE
    if (
      url.includes(failureUrl) ||
      url.includes("/payment-failure") ||
      url.includes("/failure")
    ) {
      console.log("[WebView] Failure URL detected - blocking redirect");
      setPaymentProcessed(true);
      setProcessing(true);

      navigation.replace("PaymentFailure", {
        orderDetails,
        productData,
        paymentStatus: { message: "Payment was declined or failed" },
        isCashPayment: false,
      });
      return false;
    }

    // CANCELLATION - Updated to use PaymentCancelled
    if (
      url.includes("/cancel") ||
      url.includes("/cancelled") ||
      url.includes("/payment-cancel") ||
      url.includes("/payment-cancelled")
    ) {
      console.log("[WebView] Cancel URL detected - blocking redirect");
      setPaymentProcessed(true);
      setProcessing(true);

      navigation.replace("PaymentCancelled", {
        // Changed to PaymentCancelled
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
