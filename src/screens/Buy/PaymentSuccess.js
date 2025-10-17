// screens/PaymentSuccess.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentSuccess = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [storedPaymentData, setStoredPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    status,
    orderDetails,
    productData,
    schemeData,
    paymentStatus,
  } = route.params || {};

  const isSuccess = status === "SUCCESS";

  // ✅ Load stored payment data from AsyncStorage
  useEffect(() => {
    loadStoredPaymentData();
  }, []);

  // ✅ Auto navigate to MainLanding after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainLanding" }],
      });
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  const loadStoredPaymentData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('paymentResponse');
      if (storedData) {
        setStoredPaymentData(JSON.parse(storedData));
        console.log("📱 Loaded stored payment data:", JSON.parse(storedData));
      }
    } catch (error) {
      console.error("❌ Error loading stored payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainLanding" }],
    });
  };

  // ✅ Use paymentStatus from params or stored data
  const finalPaymentStatus = paymentStatus || storedPaymentData;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={
        isSuccess
          ? ["#d4edda", "#ffffff"]
          : ["#f8d7da", "#ffffff"]
      }
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Ionicons
            name={isSuccess ? "checkmark-circle" : "close-circle"}
            size={80}
            color={isSuccess ? "#4CAF50" : "#E53935"}
          />

          <Text
            style={[
              styles.title,
              { color: isSuccess ? "#4CAF50" : "#E53935" },
            ]}
          >
            {isSuccess ? "Payment Successful!" : "Payment Failed"}
          </Text>

          <Text style={styles.subtitle}>
            {isSuccess
              ? "Thank you for your payment."
              : "Unfortunately, your payment could not be completed."}
          </Text>

          <View style={styles.detailsBox}>
            <DetailRow label="Order ID" value={orderDetails?.orderId} />
            <DetailRow label="Merchant Txn No" value={orderDetails?.merchantTxnNo} />
            <DetailRow label="Reg No" value={orderDetails?.customer?.regNo} />
            <DetailRow label="Group Code" value={orderDetails?.customer?.groupCode} />
            <DetailRow label="Customer" value={orderDetails?.customer?.name} />
            <DetailRow label="Scheme Name" value={orderDetails?.schemeInfo?.schemeName || "N/A"} />
            <DetailRow label="Installment" value={schemeData?.installment} />
            <DetailRow label="Amount Paid" value={`₹ ${orderDetails?.amount}`} />
            <DetailRow label="Payment Mode" value={finalPaymentStatus?.payphiResponse?.paymentMode} />
            <DetailRow
              label="Payment Date"
              value={finalPaymentStatus?.payphiResponse?.paymentDateTime || new Date().toISOString().split("T")[0]}
            />
            
            {/* Payphi Response Details */}
            {finalPaymentStatus?.payphiResponse && (
              <>
                <Text style={styles.sectionTitle}>Transaction Details</Text>
                <DetailRow label="Transaction ID" value={finalPaymentStatus.payphiResponse.txnID} />
                <DetailRow label="Auth ID" value={finalPaymentStatus.payphiResponse.txnAuthID} />
                <DetailRow label="Status" value={finalPaymentStatus.payphiResponse.txnStatus} />
                <DetailRow label="Response Code" value={finalPaymentStatus.payphiResponse.txnResponseCode} />
                <DetailRow label="Bank" value={finalPaymentStatus.payphiResponse.paymentSubInstType} />
                <DetailRow label="Customer Email" value={finalPaymentStatus.payphiResponse.customerEmailID} />
                <DetailRow label="Customer Mobile" value={finalPaymentStatus.payphiResponse.customerMobileNo} />
              </>
            )}
          </View>

          <Text style={styles.note}>
            Redirecting to MainLanding in a few seconds...
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isSuccess ? "#4CAF50" : "#E53935" },
            ]}
            onPress={handleGoHome}
          >
            <Text style={styles.buttonText}>Go to MainLanding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  card: {
    width: "90%",
    padding: 25,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  note: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});