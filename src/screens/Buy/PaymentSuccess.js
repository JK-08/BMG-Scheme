import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentSuccess = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [storedPaymentData, setStoredPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Extract all possible params
  const { status, orderDetails, schemeData, paymentStatus, productData } =
    route.params || {};

  const isSuccess = status === "SUCCESS";

  console.log("✅ PaymentSuccess Params:", route.params);

  // ✅ Load stored payment data (from AsyncStorage)
  useEffect(() => {
    const loadStoredPaymentData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("paymentResponse");
        if (storedData) {
          setStoredPaymentData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("❌ Error loading stored payment data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredPaymentData();
  }, []);

  // ✅ Auto navigate to home after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainLanding" }],
      });
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Manual continue
  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainLanding" }],
    });
  };

  // ✅ Navigate to payment history
// ✅ Navigate to payment history
const handleViewInstallments = () => {
  if (!productData) {
    console.warn("⚠️ No productData found to navigate!");
    return;
  }

  navigation.navigate("PaymentHistory", {
    accountDetails: productData,
    schemeName:
      productData?.schemeSummary?.schemeName ||
      orderDetails?.schemeInfo?.schemeName ||
      schemeData?.schemeName ||
      "Unknown Scheme",
    productdata: productData,
  });
};


  const finalPaymentStatus = paymentStatus || storedPaymentData;

  // ✅ Safely extract groupCode & regNo
  const groupCode =
    productData?.groupCode ||
    orderDetails?.groupCode ||
    orderDetails?.productData?.groupCode ||
    "N/A";

  const regNo =
    productData?.regNo ||
    orderDetails?.regNo ||
    orderDetails?.productData?.regNo ||
    "N/A";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C29E59" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/icons/success.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Congratulations!</Text>

        <Text style={styles.subtitle}>
          You've successfully joined in{" "}
          <Text style={{ fontWeight: "bold" }}>
            {orderDetails?.schemeInfo?.schemeName ||
              productData?.schemeSummary?.schemeName ||
              "SuperGold Scheme"}
          </Text>
          .
        </Text>

        <Text style={styles.infoText}>
          Your payment of{" "}
          <Text style={{ fontWeight: "bold" }}>
            ₹{orderDetails?.amount || productData?.amount}
          </Text>{" "}
          has been processed successfully and your Scheme Code is{" "}        </Text>

        {/* ✅ Show Group Code & Reg No */}
        <Text style={[styles.highlightText, { marginTop: 15 }]}>
          {groupCode} - {regNo}
        </Text>

        {/* ✅ Show Transaction ID */}
        <Text style={[styles.infoText, { marginTop: 10 }]}>
          Transaction ID
        </Text>
        <Text style={styles.highlightText}>
          {finalPaymentStatus?.payphiResponse?.txnID || "APP26RCPT7790921"}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewInstallments}
          >
            <Text style={[styles.buttonText, { color: "#C29E59" }]}>
              View Installments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEAF5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  highlightText: {
    fontSize: 15,
    color: "#C29E59",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#C29E59",
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#C29E59",
    backgroundColor: "#fff",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
  },
});
