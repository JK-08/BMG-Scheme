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
import appTheme from "../../utils/MainTheme";
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import {BottomTab} from '../../components'

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
    defaultContact: productData?.personalInfo?.mobile || "9876543210",
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
      backgroundColor: COLORS.white,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: SIZES.padding.lg,
      paddingBottom: SIZES.padding.xl,
    },
    headerContainer: {
      marginBottom: SIZES.lg,
      alignItems: "center",
    },
    title: {
      ...FONTS.h4,
      textAlign: "center",
      marginBottom: SIZES.sm,
      color: COLORS.textPrimary,
      fontFamily: FONTS.family.bodyBold,
    },
    mainCard: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      marginBottom: SIZES.lg,
      ...appTheme.SHADOWS.md,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SIZES.md,
      paddingBottom: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
    },
    cardIcon: {
      width: SIZES.icon.md,
      height: SIZES.icon.md,
      borderRadius: SIZES.radius.sm,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SIZES.sm,
    },
    cardTitle: {
      ...FONTS.h5,
      color: COLORS.textPrimary,
      fontFamily: FONTS.family.bodyBold,
    },
    infoGrid: {
      marginBottom: SIZES.md,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
    },
    infoLabel: {
      ...FONTS.bodySmall,
      color: COLORS.textSecondary,
      fontFamily: FONTS.family.body,
      flex: 1,
    },
    infoValue: {
      ...FONTS.body,
      color: COLORS.textPrimary,
      fontFamily: FONTS.family.bodyBold,
      flex: 1,
      textAlign: 'right',
    },
    paymentTypeBadge: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.sm,
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.xs,
      marginTop: SIZES.sm,
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    paymentTypeText: {
      ...FONTS.bodySmall,
      color: COLORS.primary,
      fontFamily: FONTS.family.bodyBold,
      textAlign: "center",
    },
    amountSection: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      marginBottom: SIZES.lg,
      ...appTheme.SHADOWS.md,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    amountHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SIZES.md,
    },
    amountTitle: {
      ...FONTS.h5,
      color: COLORS.textPrimary,
      fontFamily: FONTS.family.bodyBold,
      marginLeft: SIZES.sm,
    },
    inputContainer: {
      marginBottom: SIZES.xs,
    },
    inputLabel: {
      ...FONTS.body,
      color: COLORS.textPrimary,
      marginBottom: SIZES.xs,
      fontFamily: FONTS.family.bodyBold,
    },
    inputWrapper: {
      position: 'relative',
    },
    currencySymbol: {
      position: 'absolute',
      left: SIZES.padding.md,
      top: SIZES.padding.md,
      ...FONTS.bodyLarge,
      color: COLORS.textPrimary,
      fontFamily: FONTS.family.bodyBold,
      zIndex: 1,
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.xs,
      paddingLeft: SIZES.padding.xl * 2,
      ...FONTS.bodyLarge,
      color: COLORS.textPrimary,
      borderWidth: 2,
      borderColor: COLORS.inputBorder,
      fontFamily: FONTS.family.body,
      height: SIZES.input.height,
    },
    inputFocused: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.white,
      ...appTheme.SHADOWS.sm,
    },
    inputError: {
      borderColor: COLORS.error,
    },
    errorText: {
      color: COLORS.error,
      ...FONTS.bodySmall,
      marginTop: SIZES.xs,
      marginLeft: SIZES.xs,
      fontFamily: FONTS.family.body,
    },
    fixedAmountDisplay: {
      backgroundColor: COLORS.accentLight1,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.lg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: COLORS.accentLight,
      ...appTheme.SHADOWS.sm,
    },
    amountLabel: {
      ...FONTS.bodySmall,
      color: COLORS.textSecondary,
      marginBottom: SIZES.xs,
      fontFamily: FONTS.family.body,
    },
    amountValue: {
      ...FONTS.h3,
      color: COLORS.primary,
      fontFamily: FONTS.family.bodyBold,
    },
    buttonContainer: {
      marginTop: SIZES.lg,
    },
    button: {
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: SIZES.button.lg,
      ...appTheme.SHADOWS.lg,
      width: "100%",
    },
    buttonGradient: {
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: SIZES.button.lg,
      width: "100%",
    },
    buttonText: {
      ...FONTS.h5,
      color: COLORS.white,
      fontFamily: FONTS.family.bodyBold,
      letterSpacing: 0.5,
    },
    disabledButton: {
      opacity: 0.6,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      ...FONTS.body,
      color: COLORS.white,
      marginLeft: SIZES.sm,
      fontFamily: FONTS.family.body,
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SIZES.lg,
      padding: SIZES.sm,
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.radius.md,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    securityText: {
      ...FONTS.bodySmall,
      color: COLORS.textSecondary,
      marginLeft: SIZES.xs,
      fontFamily: FONTS.family.body,
    },
  });

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CommonHeader title="Payment Details" />

          {/* Customer Information Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Text style={{ color: COLORS.primary, fontFamily: FONTS.family.bodyBold }}>👤</Text>
              </View>
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer Name</Text>
                <Text style={styles.infoValue}>{productInfo.defaultName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registration No</Text>
                <Text style={styles.infoValue}>{productInfo.defaultRegNo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Group Code</Text>
                <Text style={styles.infoValue}>{productInfo.defaultGroupCode}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{productInfo.defaultContact}</Text>
              </View>
            </View>

            {/* Payment Type Badge */}
            <View style={styles.paymentTypeBadge}>
              <Text style={styles.paymentTypeText}>
                {payType ? `${payType} PAYMENT` : "Loading Payment Type..."}
              </Text>
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.amountHeader}>
              <View style={styles.cardIcon}>
                <Text style={{ color: COLORS.primary, fontFamily: FONTS.family.bodyBold }}>💰</Text>
              </View>
              <Text style={styles.amountTitle}>
                {productInfo.weightLedger === "Y" ? "Enter Payment Amount" : "Payment Amount"}
              </Text>
            </View>

            {productInfo.weightLedger === "Y" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textTertiary}
                    value={amount}
                    onChangeText={handleAmountChange}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => {
                      setInputFocused(false);
                      if (amount) validateAmount(amount);
                    }}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      inputFocused && styles.inputFocused,
                      amountError && styles.inputError,
                    ]}
                    maxLength={10}
                    editable={!loading}
                    returnKeyType="done"
                  />
                </View>
                {amountError ? (
                  <Text style={styles.errorText}>{amountError}</Text>
                ) : (
                  <Text style={[styles.errorText, { color: COLORS.textTertiary }]}>
                    Enter amount between ₹1 - ₹1,00,00,000
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.fixedAmountDisplay}>
                <Text style={styles.amountLabel}>Total Amount to Pay</Text>
                <Text style={styles.amountValue}>
                  ₹{formatCurrency(productInfo.defaultAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Proceed Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleBuy}
              disabled={loading || !token || (productInfo.weightLedger === "Y" && !!amountError)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradient.brand1}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buttonGradient,
                  (loading || !token || (productInfo.weightLedger === "Y" && !!amountError)) && 
                    styles.disabledButton
                ]}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} size="small" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>PROCEED TO PAYMENT</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Text style={{ color: COLORS.success, fontFamily: FONTS.family.bodyBold }}>🔒</Text>
            <Text style={styles.securityText}>Secure & Encrypted Payment</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTab />
    </ImageBackground>
  );
};

export default BuyPage;