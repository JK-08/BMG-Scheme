// screens/PaymentWebView.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertSchemeCollection } from "../../services/InstallmentUpdateService";

const PaymentWebView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const { paymentUrl, orderDetails, productData } = route.params || {};
  const [loading, setLoading] = useState(true);

  const successUrl = "https://bmgjewellers.com/payment-success";
  const failureUrl = "https://bmgjewellers.com/payment-failure";

  // ✅ Store Payphi Response in AsyncStorage
  const storePaymentData = async (paymentStatus) => {
    try {
      const paymentData = {
        payphiResponse: paymentStatus.payphiResponse,
        orderStatus: paymentStatus.orderStatus,
        message: paymentStatus.message,
        timestamp: new Date().toISOString(),
        orderDetails: orderDetails
      };

      await AsyncStorage.setItem('paymentResponse', JSON.stringify(paymentData));
      console.log("💾 Payment data stored successfully in AsyncStorage");
    } catch (error) {
      console.error("❌ Error storing payment data:", error);
    }
  };

  // ✅ Build scheme collection payload from orderDetails
  const buildSchemeData = () => {
    const schemeInfo = orderDetails?.schemeInfo || {};
    const personalInfo = orderDetails?.personalInfo || orderDetails?.accountInfo?.personalInfo || {};
    
    const payload = {
      groupCode: orderDetails?.customer?.groupCode || "BMA",
      regNo: orderDetails?.customer?.regNo?.toString() || "41",
      rDate: new Date().toISOString().replace("T", " ").split(".")[0],
      amount: orderDetails?.amount?.toString() || "1000",
      modePay: orderDetails?.payType === "ONLINE" ? "C" : orderDetails?.payType || "C",
      accCode: "1",
      updateTime: new Date().toISOString().replace("T", " ").split(".")[0],
      installment: (parseInt(schemeInfo?.schemaSummaryTransBalance?.insPaid?.toString() || "0") + 1) || 1,
      userID: personalInfo?.personalId || "1",
    };

    console.log("📦 FINAL SCHEME COLLECTION PAYLOAD:", JSON.stringify(payload, null, 2));
    return payload;
  };

  // ✅ Check Payment Status from API
  const checkPaymentStatus = async (merchantTxnNo) => {
    try {
      console.log("🔍 Checking payment status for:", merchantTxnNo);

      const payload = {
       
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        
      };

      console.log("📤 PAYPHI STATUS PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        "https://scheme.bmgjewellers.com/api/v1/payment/status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("✅ Payment Status Response:", JSON.stringify(data, null, 2));

      // ✅ Store payment data in AsyncStorage
      await storePaymentData(data);

      // ✅ If success
      if (data?.orderStatus === "PAID") {
        try {
          const schemeData = buildSchemeData();

          const result = await insertSchemeCollection(schemeData);
          console.log("✅ Scheme Insert Success:", result);

          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            orderDetails,
            schemeData,
            paymentStatus: data,
            productData,
          });
        } catch (err) {
          console.error("⚠️ Insert API failed:", err);
          Alert.alert("Warning", "Payment succeeded but data not saved.");
          navigation.replace("PaymentSuccess", {
            status: "SUCCESS",
            orderDetails,
            paymentStatus: data,
            productData,
          });
        }
      } else {
        navigation.replace("PaymentSuccess", {
          status: "FAILED",
          orderDetails,
          paymentStatus: data,
          productData,
        });
      }
    } catch (error) {
      console.error("❌ Payment Status Check Error:", error);
      Alert.alert("Error", "Failed to verify payment status.");
      navigation.replace("PaymentSuccess", {
        status: "FAILED",
        orderDetails,
        productData,
      });
    }
  };

  // ✅ Handle WebView redirect URLs
  const handleNavChange = (navState) => {
    const { url } = navState;
    console.log("🌐 Navigating to:", url);

    if (paymentProcessed) return;

    if (url.includes(successUrl)) {
      setPaymentProcessed(true);
      // Small delay to ensure payment is fully processed
      setTimeout(() => {
        checkPaymentStatus(orderDetails?.merchantTxnNo);
      }, 2000);
    } else if (url.includes(failureUrl)) {
      setPaymentProcessed(true);
      navigation.replace("PaymentSuccess", {
        status: "FAILED",
        orderDetails,
        productData,
      });
    }
  };

  // ✅ Handle WebView load start to show loading
  const handleLoadStart = () => {
    setLoading(true);
  };

  // ✅ Handle WebView load end to hide loading
  const handleLoadEnd = () => {
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#d4af37" />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#d4af37" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaymentWebView;