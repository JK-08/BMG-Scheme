// screens/BuyPage.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL, API_BASE_URL_OLD } from "../../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appTheme from "../../utils/Theme";

const BuyPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { COLORS, SIZES, FONTS } = appTheme;

  const { productData } = route.params || {};
  const weightLedger = productData?.schemeSummary?.weightLedger || "N";

  const defaultAmount = productData?.amount || "";
  const defaultName =
    productData?.personalInfo?.pName ||
    productData?.personalInfo?.pname ||
    productData?.accountDetails?.personalInfo?.pName ||
    "Customer";
  const defaultContact = productData?.personalInfo?.contact || "9876543210";
  const defaultGroupCode = productData?.groupCode || "";
  const defaultRegNo = productData?.regNo || "";

  const [token, setToken] = useState(null);
  const [amount, setAmount] = useState(
    weightLedger === "Y" ? "" : defaultAmount?.toString()
  );
  const [loading, setLoading] = useState(false);
  const [payType, setPayType] = useState(null);

  // 🔹 Get token
  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("authToken");
      if (savedToken) setToken(savedToken);
    })();
  }, []);

  // 🔹 Fetch payment type
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL_OLD}/account/getTranType`);
        const data = await res.json();
        setPayType(data?.[0]?.NAME || "CASH");
      } catch {
        setPayType("CASH");
      }
    })();
  }, []);

  // 🔹 Create order
  const createOrder = async () => {
    const payload = {
      amount: parseFloat(amount),
      customer: {
        name: defaultName,
        contact: defaultContact,
        REGNO: defaultRegNo,
        GROUPCODE: defaultGroupCode,
      },
    };
    const res = await fetch(
      "https://scheme.bmgjewellers.com/api/orders/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.order_id;
  };

  // 🔹 Build payload for initiate
  const buildPayload = (orderId) => ({
    merchantTxnNo: orderId,
    amount: parseFloat(amount),
    currencyCode: "356",
    transactionType: "SALE",
    payType: "ONLINE",
    addlParam1: defaultRegNo,
    addlParam2: defaultGroupCode,
    returnURL: "https://app.bmgjewellers.com/api/v1/payment/success",
  });

  // 🔹 Get redirect URL
  const getRedirectUrl = async (tranCtx) => {
    const res = await fetch(`${API_BASE_URL}/payment/redirect-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tranCtx }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text.replace(/^"+|"+$/g, "").trim();
  };

  // 🔹 Handle Buy
  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const orderId = await createOrder();
      const payload = buildPayload(orderId);

      const initiate = await fetch(`${API_BASE_URL}/payment/initiate-sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await initiate.json();
      if (!initiate.ok) throw new Error(data.message);

      if (data.tranCtx) {
        const redirectUrl = await getRedirectUrl(data.tranCtx);

        // ✅ Build a complete orderDetails object to pass to PaymentWebView
        const orderDetails = {
          orderId,
          merchantTxnNo: orderId,
          amount: parseFloat(amount),
          payType: payType,
          customer: {
            name: defaultName,
            contact: defaultContact,
            regNo: defaultRegNo,
            groupCode: defaultGroupCode,
          },
          schemeInfo: productData?.schemeSummary || {},
          accountInfo: productData?.accountDetails || {},
          personalInfo: productData?.personalInfo || {},
          paymentUrl: redirectUrl,
        };

        navigation.navigate("PaymentWebView", {
          paymentUrl: redirectUrl,
          orderDetails,
          productData: productData, // Make sure this is passed
        });
      }
    } catch (e) {
      console.error("Payment initiation failed:", e);
      Alert.alert("Error", e.message || "Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      padding: SIZES.padding,
    },
    headerContainer: {
      marginBottom: SIZES.margin,
      alignItems: "center",
    },
    title: {
      ...FONTS.h3,
      textAlign: "center",
      marginBottom: SIZES.margin / 2,
    },
    infoCard: {
      backgroundColor: COLORS.card,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      marginBottom: SIZES.margin,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: SIZES.padding / 2,
    },
    infoLabel: {
      ...FONTS.body1,
      fontSize: SIZES.fontSm,
      color: COLORS.textLight,
      fontWeight: "600",
      width: 100,
    },
    infoValue: {
      ...FONTS.body1,
      fontSize: SIZES.fontSm,
      color: COLORS.text,
      flex: 1,
      fontWeight: "500",
    },
    paymentTypeContainer: {
      backgroundColor: COLORS.primaryLight,
      borderRadius: SIZES.radius_sm,
      padding: SIZES.padding / 1.5,
      marginTop: SIZES.margin / 2,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    paymentTypeText: {
      ...FONTS.body1,
      fontSize: SIZES.font,
      color: COLORS.primary,
      fontWeight: "600",
      textAlign: "center",
    },
    inputContainer: {
      marginVertical: SIZES.margin,
    },
    inputLabel: {
      ...FONTS.body1,
      fontSize: SIZES.font,
      color: COLORS.title,
      marginBottom: SIZES.padding / 2,
      fontWeight: "600",
    },
    input: {
      backgroundColor: COLORS.input,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      ...FONTS.body1,
      fontSize: SIZES.fontLg,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.outline,
    },
    inputFocused: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.white,
    },
    amountDisplay: {
      backgroundColor: COLORS.surfaceVariant,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      alignItems: "center",
      marginVertical: SIZES.margin,
    },
    amountLabel: {
      ...FONTS.fontSm,
      color: COLORS.textLight,
      marginBottom: 4,
    },
    amountValue: {
      ...FONTS.h4,
      color: COLORS.primary,
      fontWeight: "bold",
    },
    buttonContainer: {
      marginTop: SIZES.margin,
    },
    button: {
      borderRadius: SIZES.radius,
      padding: SIZES.padding + 2,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 54,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      ...FONTS.body1,
      fontSize: SIZES.fontLg,
      color: COLORS.white,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Buy Scheme</Text>
        </View>

        {/* Customer Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer:</Text>
            <Text style={styles.infoValue}>{defaultName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reg No:</Text>
            <Text style={styles.infoValue}>{defaultRegNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group:</Text>
            <Text style={styles.infoValue}>{defaultGroupCode}</Text>
          </View>

          {/* Payment Type */}
          <View style={styles.paymentTypeContainer}>
            <Text style={styles.paymentTypeText}>
              Payment Type: {payType || "Loading..."}
            </Text>
          </View>
        </View>

        {/* Amount Input or Display */}
        {weightLedger === "Y" ? (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Amount</Text>
            <TextInput
              placeholder="Enter amount"
              placeholderTextColor={COLORS.placeholder}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ) : (
          <View style={styles.amountDisplay}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>₹{defaultAmount}</Text>
          </View>
        )}

        {/* Proceed Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleBuy}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, loading && styles.disabledButton]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Proceed to Pay</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default BuyPage;
