// screens/BuyPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL, API_BASE_URL_OLD } from "../../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appTheme from "../../utils/Theme";
import CommonHeader from '../../components/CommonHeader/CommonHeader'

const BuyPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { COLORS, SIZES, FONTS } = appTheme;

  const { productData } = route.params || {};

  // Memoized extracted values
  const productInfo = useMemo(() => ({
    weightLedger: productData?.schemeSummary?.weightLedger || "N",
    defaultAmount: productData?.amount || "",
    defaultName:
      productData?.personalInfo?.pName ||
      productData?.personalInfo?.pname ||
      productData?.accountDetails?.personalInfo?.pName ||
      "Customer",
    defaultContact: productData?.personalInfo?.contact || "9876543210",
    defaultGroupCode: productData?.groupCode || "",
    defaultRegNo: productData?.regNo || "",
  }), [productData]);

  const [token, setToken] = useState(null);
  const [amount, setAmount] = useState(
    productInfo.weightLedger === "Y" ? "" : productInfo.defaultAmount?.toString()
  );
  const [loading, setLoading] = useState(false);
  const [payType, setPayType] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [amountError, setAmountError] = useState("");

  // Validate amount input
  const validateAmount = useCallback((value) => {
    if (!value || value.trim() === "") {
      setAmountError("Amount is required");
      return false;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return false;
    }
    
    if (numValue > 10000000) {
      setAmountError("Amount cannot exceed ₹1,00,00,000");
      return false;
    }
    
    setAmountError("");
    return true;
  }, []);

  // Handle amount change with validation
  const handleAmountChange = useCallback((value) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(sanitized);
    if (sanitized) {
      validateAmount(sanitized);
    } else {
      setAmountError("");
    }
  }, [validateAmount]);

  // Get token with error handling
  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        if (savedToken) {
          setToken(savedToken);
        } else {
          Alert.alert(
            "Authentication Required",
            "Please login to continue",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        Alert.alert("Error", "Failed to authenticate. Please try again.");
      }
    };
    getToken();
  }, [navigation]);

  // Fetch payment type with retry logic
  useEffect(() => {
    const fetchPaymentType = async (retries = 3) => {
      try {
        const res = await fetch(`${API_BASE_URL_OLD}/account/getTranType`, {
          timeout: 10000,
        });
        
        if (!res.ok) throw new Error("Failed to fetch payment type");
        
        const data = await res.json();
        setPayType(data?.[0]?.NAME || "CASH");
      } catch (error) {
        console.error("Error fetching payment type:", error);
        if (retries > 0) {
          setTimeout(() => fetchPaymentType(retries - 1), 2000);
        } else {
          setPayType("CASH"); // Fallback
        }
      }
    };
    fetchPaymentType();
  }, []);

  // Create order with better error handling
  const createOrder = async () => {
    try {
      const payload = {
        amount: parseFloat(amount),
        customer: {
          name: productInfo.defaultName,
          contact: productInfo.defaultContact,
          REGNO: productInfo.defaultRegNo,
          GROUPCODE: productInfo.defaultGroupCode,
        },
      };

      const res = await fetch(
        "https://scheme.bmgjewellers.com/api/orders/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 15000,
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
      
      if (!data.order_id) {
        throw new Error("Order ID not received from server");
      }

      return data.order_id;
    } catch (error) {
      console.error("Create order error:", error);
      throw new Error(error.message || "Failed to create order");
    }
  };

  // Build payload
  const buildPayload = useCallback((orderId) => ({
    merchantTxnNo: orderId,
    amount: parseFloat(amount),
    currencyCode: "356",
    transactionType: "SALE",
    payType: "ONLINE",
    addlParam1: productInfo.defaultRegNo,
    addlParam2: productInfo.defaultGroupCode,
    returnURL: "https://app.bmgjewellers.com/api/v1/payment/success",
  }), [amount, productInfo]);

  // Get redirect URL
  const getRedirectUrl = async (tranCtx) => {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/redirect-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tranCtx }),
        timeout: 15000,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error ${res.status}`);
      }

      const text = await res.text();
      const cleanUrl = text.replace(/^"+|"+$/g, "").trim();
      
      if (!cleanUrl.startsWith("http")) {
        throw new Error("Invalid redirect URL received");
      }

      return cleanUrl;
    } catch (error) {
      console.error("Redirect URL error:", error);
      throw new Error(error.message || "Failed to get payment URL");
    }
  };

  // Handle Buy with comprehensive error handling
  const handleBuy = async () => {
    // Validate amount
    if (!validateAmount(amount)) {
      Alert.alert("Invalid Amount", amountError || "Please enter a valid amount.");
      return;
    }

    // Check token
    if (!token) {
      Alert.alert(
        "Authentication Required",
        "Please login to continue",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderId = await createOrder();
      
      // Step 2: Build payload
      const payload = buildPayload(orderId);

      // Step 3: Initiate payment
      const initiate = await fetch(`${API_BASE_URL}/payment/initiate-sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        timeout: 15000,
      });

      if (!initiate.ok) {
        const errorData = await initiate.json();
        throw new Error(errorData.message || `Payment initiation failed: ${initiate.status}`);
      }

      const data = await initiate.json();
      
      if (!data.tranCtx) {
        throw new Error("Transaction context not received");
      }

      // Step 4: Get redirect URL
      const redirectUrl = await getRedirectUrl(data.tranCtx);

      // Step 5: Build complete order details
      const orderDetails = {
        orderId,
        merchantTxnNo: orderId,
        amount: parseFloat(amount),
        payType: payType || "ONLINE",
        customer: {
          name: productInfo.defaultName,
          contact: productInfo.defaultContact,
          regNo: productInfo.defaultRegNo,
          groupCode: productInfo.defaultGroupCode,
        },
        schemeInfo: productData?.schemeSummary || {},
        accountInfo: productData?.accountDetails || {},
        personalInfo: productData?.personalInfo || {},
        paymentUrl: redirectUrl,
        timestamp: new Date().toISOString(),
      };

      // Navigate to payment webview
      navigation.navigate("PaymentWebView", {
        paymentUrl: redirectUrl,
        orderDetails,
        productData,
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      
      Alert.alert(
        "Payment Error",
        error.message || "Unable to process payment. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: handleBuy }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return "0.00";
    return parseFloat(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: SIZES.padding,
      paddingBottom: SIZES.padding * 2,
    },
    headerContainer: {
      marginBottom: SIZES.margin,
      alignItems: "center",
    },
    title: {
      ...FONTS.h3,
      textAlign: "center",
      marginBottom: SIZES.margin / 2,
      color: COLORS.title,
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
    inputError: {
      borderColor: COLORS.error || "#e74c3c",
    },
    errorText: {
      color: COLORS.error || "#e74c3c",
      fontSize: SIZES.fontSm,
      marginTop: 4,
      marginLeft: 4,
    },
    amountDisplay: {
      backgroundColor: COLORS.surfaceVariant,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      alignItems: "center",
      marginVertical: SIZES.margin,
    },
    amountLabel: {
      fontSize: SIZES.fontSm,
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
      padding: SIZES.padding - 3,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 54,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      width: "80%",
      height: 54,
      alignSelf: "center",
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
    <ImageBackground
      source={require("../../assets/bg4.jpg")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollContent}>
            <CommonHeader title="Payment Details" />

            {/* Customer Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer:</Text>
                <Text style={styles.infoValue}>{productInfo.defaultName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reg No:</Text>
                <Text style={styles.infoValue}>{productInfo.defaultRegNo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Group:</Text>
                <Text style={styles.infoValue}>{productInfo.defaultGroupCode}</Text>
              </View>

              {/* Payment Type */}
              <View style={styles.paymentTypeContainer}>
                <Text style={styles.paymentTypeText}>
                  Payment Type: {payType || "Loading..."}
                </Text>
              </View>
            </View>

            {/* Amount Input or Display */}
            {productInfo.weightLedger === "Y" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Amount *</Text>
                <TextInput
                  placeholder="Enter amount (e.g., 5000.00)"
                  placeholderTextColor={COLORS.placeholder}
                  value={amount}
                  onChangeText={handleAmountChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    inputFocused && styles.inputFocused,
                    amountError && styles.inputError,
                  ]}
                  maxLength={10}
                  editable={!loading}
                />
                {amountError ? (
                  <Text style={styles.errorText}>{amountError}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.amountDisplay}>
                <Text style={styles.amountLabel}>Amount to Pay</Text>
                <Text style={styles.amountValue}>
                  ₹{formatCurrency(productInfo.defaultAmount)}
                </Text>
              </View>
            )}

            {/* Proceed Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleBuy}
                disabled={loading || !token || (productInfo.weightLedger === "Y" && !!amountError)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary6}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.button,
                    (loading || !token || (productInfo.weightLedger === "Y" && !!amountError)) && 
                      styles.disabledButton
                  ]}
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
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default BuyPage;