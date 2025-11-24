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
        console.log("🔙 Hardware back pressed");
        Alert.alert(
          "Cancel Payment?",
          "Are you sure you want to cancel this payment?",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => console.log("❌ Payment not cancelled"),
            },
            {
              text: "Yes",
              onPress: () => {
                console.log("✅ Payment cancelled by user");
                navigation.replace("PaymentSuccess", {
                  status: "CANCELLED",
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
      console.log("💾 Storing payment data locally:", paymentStatus);
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
      console.log("✅ Payment data saved to AsyncStorage");
    } catch (error) {
      console.error("❌ Error saving payment:", error);
    }
  };

  // -------------------------------------------------------------
  //  CREATE INSERT PAYLOAD FOR SCHEME COLLECTION
  // -------------------------------------------------------------
  const buildSchemeData = (paymentStatus) => {
    if (!paymentStatus) {
      console.warn("⚠️ Payment status not provided, using fallback values");
      paymentStatus = {};
    }

    const schemeInfo = orderDetails?.schemeInfo || {};
    const pay = paymentStatus?.payphiResponse || {};

    // Use fallback values if anything is missing
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

      // ⭐ Dynamic values from payment response
      chqBankCode: pay.paymentMode || "", // e.g., "NB"
      chqCardNo: pay.txnID || "", // e.g., "7700202588422"
      chqBranch: pay.paymentSubInstType || "", // e.g., "Phicom Test bank"
      chkBank: pay.paymentMode || "", // e.g., "NB"
      CHQRTNREASON: pay.merchantTxnNo || "", // e.g., "ORDER-13AE67CB76"
    };

    console.log("📦 FINAL INSERT PAYLOAD:\n", payload);
    return payload;
  };

  // -------------------------------------------------------------
  //  CHECK PAYMENT STATUS (AFTER REDIRECT BLOCKED)
  // -------------------------------------------------------------
  const checkPaymentStatus = async (merchantTxnNo) => {
    if (!merchantTxnNo) {
      console.log("⚠️ No merchant transaction number available");
      return;
    }
    if (paymentStatusChecked) {
      console.log("ℹ️ Payment status already checked, skipping");
      return;
    }

    setPaymentStatusChecked(true);
    console.log("⏳ Checking payment status for txn:", merchantTxnNo);

    try {
      const statusPayload = {
        merchantId: "T_03342",
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        transactionType: "STATUS",
      };

      const response = await fetch(
        "https://scheme.bmgjewellers.com/api/v1/payment/status",
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
      console.log("📩 Payment status response:", data);

      await storePaymentData(data);

      const isSuccess =
        data?.orderStatus === "PAID" ||
        data?.status === "SUCCESS" ||
        data?.payphiResponse?.transactionStatus === "SUCCESS" ||
        data?.message?.toLowerCase()?.includes("success");

      if (isSuccess) {
        console.log("🎉 Payment successful");

        const schemeData = buildSchemeData(data); // <-- pass 'data' here

        try {
          await insertSchemeCollection(schemeData);
          console.log("✅ Scheme collection inserted successfully");

          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            schemeData,
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
          });
        } catch (insertErr) {
          console.warn("⚠️ Failed to insert scheme collection:", insertErr);
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            paymentStatus: data,
            orderDetails,
            productData,
            isCashPayment: false,
          });
        }
      } else {
        console.log("❌ Payment failed");
        navigation.replace("PaymentSuccess", {
          status: "FAILED",
          paymentStatus: data,
          orderDetails,
          productData,
          isCashPayment: false,
        });
      }
    } catch (error) {
      console.error("⚠️ Error checking payment status:", error);
      navigation.replace("PaymentSuccess", {
        status: "PENDING",
        orderDetails,
        productData,
        isCashPayment: false,
      });
    }
  };

  // -------------------------------------------------------------
  //  BLOCK REDIRECT USING onShouldStartLoadWithRequest
  // -------------------------------------------------------------
  const handleRequest = (request) => {
    const url = request.url;
    console.log("🌐 Request URL:", url);

    if (paymentProcessed) {
      console.log("ℹ️ Payment already processed, blocking request");
      return false;
    }

    // SUCCESS
    if (
      url.includes(successUrl) ||
      url.includes("/payment-success") ||
      url.includes("/success")
    ) {
      console.log("⚡ SUCCESS URL BLOCKED");
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
      console.log("⚡ FAILURE URL BLOCKED");
      setPaymentProcessed(true);
      setProcessing(true);

      navigation.replace("PaymentSuccess", {
        status: "FAILED",
        orderDetails,
        productData,
        isCashPayment: false,
      });
      return false;
    }

    // CANCEL
    if (url.includes("/cancel") || url.includes("/cancelled")) {
      console.log("⚡ CANCEL URL BLOCKED");
      setPaymentProcessed(true);
      setProcessing(true);

      navigation.replace("PaymentSuccess", {
        status: "CANCELLED",
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
              console.log("🔄 WebView load started");
              setLoading(true);
            }}
            onLoadEnd={() => {
              console.log("✅ WebView load ended");
              setLoading(false);
            }}
            onError={(err) => {
              console.error("❌ WebView load error:", err);
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
                console.log("🔙 User pressed Go Back due to missing URL");
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
