// screens/BuyPage.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL, API_BASE_URL_OLD } from "../../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { insertSchemeCollection } from "../../services/InstallmentUpdateService";

const generateCashPaymentDetails = () => {
  const cardNumber = Math.floor(
    1000000000 + Math.random() * 9000000000
  ).toString();
  const rtnNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const rtnReason = `CASH-${rtnNumber}`;
  return { cardNumber, rtnReason };
};

// -----------------------------
// API Functions
// -----------------------------
const getRedirectUrlApi = async (tranCtx) => {
  const url = `${API_BASE_URL}/payment/redirect-url`;
  console.log("[Payment] Getting redirect URL for transaction context");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tranCtx }),
  });

  if (!response.ok) {
    console.error(`[Payment] Redirect URL API failed: ${response.status}`);
    throw new Error(`Failed to get URL: ${response.status}`);
  }

  const raw = await response.text();

  let data = null;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.log("[Payment] Response is not JSON, returning raw text");

    // If server already returned URL directly
    if (raw.startsWith("http")) {
      return raw.trim();
    }

    throw new Error("Invalid JSON from redirect URL API");
  }

  return data.redirectUrl || data.url;
};

// -----------------------------
// BuyPage component
// -----------------------------
const BuyPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productData } = route.params || {};

  // ---------- memoized product info ----------
  const productInfo = useMemo(
    () => ({
      weightLedger: productData?.schemeSummary?.weightLedger || "N",
      FixedIns: productData?.schemeSummary?.FixedIns || "N",
      defaultAmount: productData?.amount || "",
      defaultName:
        productData?.personalInfo?.pName ||
        productData?.personalInfo?.pname ||
        productData?.accountDetails?.personalInfo?.pName ||
        "Customer",
      defaultContact: productData?.personalInfo?.mobile || "9876543210",
      defaultGroupCode: productData?.groupCode || "",
      defaultRegNo: productData?.regNo || "",
      schemeId: productData?.schemeSummary?.schemeId || "",
    }),
    [productData]
  );

  // ---------- state ----------
  const [token, setToken] = useState(null);
  const [amount, setAmount] = useState(
    productInfo.weightLedger === "Y" || productInfo.FixedIns === "Y"
      ? productInfo.defaultAmount?.toString()
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [payType, setPayType] = useState("CASH");
  const [inputFocused, setInputFocused] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [fetchingPaymentType, setFetchingPaymentType] = useState(true);
  const [payTypeResponse, setPayTypeResponse] = useState(null);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // refs
  const isMountedRef = useRef(true);
  const retryPaymentRef = useRef(() => {}); // will be set to a safe retry fn
  const handleBuyRef = useRef(null); // to hold current handleBuy function

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ---------- derived ----------
  const payTypeObj = useMemo(() => {
    if (!payTypeResponse) return null;
    return payTypeResponse.find((item) => item.NAME === payType) || null;
  }, [payType, payTypeResponse]);

  const getPaymentTypeStyle = (type) => {
    switch (type) {
      case "CASH":
        return {
          icon: "💵",
          gradient: COLORS.gradient.primary,
          bgColor: COLORS.primaryLight,
          borderColor: COLORS.primary,
          textColor: COLORS.white,
        };
      case "ONLINE":
        return {
          icon: "💳",
          gradient: COLORS.gradient.primary,
          bgColor: COLORS.primaryLight,
          borderColor: COLORS.primary,
          textColor: COLORS.white,
        };
      case "UPI":
        return {
          icon: "📱",
          gradient: COLORS.gradient.warm,
          bgColor: COLORS.primaryOpacity10,
          borderColor: COLORS.primary,
          textColor: COLORS.primary,
        };
      default:
        return {
          icon: "💰",
          gradient: COLORS.gradient.primary,
          bgColor: COLORS.primaryOpacity10,
          borderColor: COLORS.primary,
          textColor: COLORS.primary,
        };
    }
  };

  const currentPaymentStyle = getPaymentTypeStyle(payType);

  // ---------- validation ----------
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
    // Add minimum amount validation
    if (numValue < 100) {
      setAmountError("Minimum amount is ₹100");
      return false;
    }
    if (numValue > 10000000) {
      setAmountError("Amount cannot exceed ₹1,00,00,000");
      return false;
    }
    setAmountError("");
    return true;
  }, []);

  const handleAmountChange = useCallback(
    (value) => {
      const sanitized = value.replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) return;
      if (parts[1] && parts[1].length > 2) return;
      setAmount(sanitized);
      if (sanitized) validateAmount(sanitized);
      else setAmountError("");
    },
    [validateAmount]
  );

  // ---------- token loader ----------
  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        if (!isMountedRef.current) return;
        if (savedToken) {
          setToken(savedToken);
          console.log("[Auth] Token loaded successfully");
        } else {
          console.warn("[Auth] No token found, redirecting to login");
          Alert.alert("Authentication Required", "Please login", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        console.error("[Auth] Error fetching token:", error);
        if (!isMountedRef.current) return;
        Alert.alert("Error", "Failed to authenticate. Please try again.");
      }
    };
    getToken();
  }, [navigation]);

  // ---------- fetch payment types ----------
  useEffect(() => {
    let active = true;
    const fetchPaymentType = async () => {
      try {
        const url = `${API_BASE_URL_OLD}/account/getTranType`;
        console.log("[Payment] Fetching payment types...");
        const res = await fetch(url);
        const json = await res.json();

        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("Invalid payment types data");
        }

        if (!active) return;

        setPayTypeResponse(json);
        setPayType(json[0].NAME);
        console.log(`[Payment] Loaded ${json.length} payment types`);
      } catch (error) {
        console.error("[Payment] Error fetching payment types:", error);
      } finally {
        if (active) setFetchingPaymentType(false);
      }
    };
    fetchPaymentType();
    return () => {
      active = false;
    };
  }, []);

  // Move this function inside the BuyPage component
  const createOrder = useCallback(async (amount, productInfo) => {
    try {
      // Validate amount
      const paymentAmount = amount || productInfo.defaultAmount;
      if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
        throw new Error("Invalid amount provided");
      }

      // Create payload
      const orderPayload = {
        amount: parseFloat(paymentAmount),
        customer: {
          name: productInfo.defaultName,
          contact: productInfo.defaultContact,
          REGNO: productInfo.defaultRegNo,
          GROUPCODE: productInfo.defaultGroupCode,
        },
      };

      console.log("Creating payment order with payload:", orderPayload);

      // API call
      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      console.log("Create order response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Create order error response:", errorText);
        throw new Error(`Failed to create order: HTTP ${response.status}`);
      }

      // Convert data to JSON
      const data = await response.json();
      console.log("Order created successfully:", data);

      // Extract order ID from response (adjust based on your API response structure)
      const orderId =
        data.order_id || data.id || data.transactionId || data.referenceNo;
      console.log("Extracted order ID:", orderId);
      if (!orderId) {
        console.warn("No order ID found in response, using timestamp:", data);
        // Generate a fallback order ID
        return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }

      return orderId;
    } catch (error) {
      console.log("Order creation error:", error);
      throw error;
    }
  }, []);

  // -----------------------------
  // Build scheme collection payload
  // -----------------------------
  const buildSchemeData = useCallback(() => {
    const schemeInfo = productData?.schemeSummary || {};
    const cashDetails = generateCashPaymentDetails();

    return {
      groupCode: productInfo.defaultGroupCode || "BMA",
      regNo: productInfo.defaultRegNo?.toString() || "41",
      rDate: new Date().toISOString().split("T")[0],
      amount: amount || productInfo.defaultAmount?.toString() || "1000",
      modePay: payTypeObj?.CARDTYPE || "",
      accCode: payTypeObj?.ACCOUNT || "",
      updateTime: new Date().toISOString().split("T")[0],
      installment:
        parseInt(
          schemeInfo?.schemaSummaryTransBalance?.insPaid?.toString() || "0"
        ) + 1 || 1,
      userID: "999",
      chqBankCode: "2",
      chqCardNo: cashDetails.cardNumber,
      chqBranch: "RECEIVED",
      chkBank: "CASH",
      chqRtnReason: cashDetails.rtnReason,
      schemeId: schemeInfo.schemeId,
    };
  }, [
    amount,
    payTypeObj,
    productData,
    productInfo.defaultGroupCode,
    productInfo.defaultRegNo,
    productInfo.defaultAmount,
    productInfo.schemeId,
  ]);

  // -----------------------------
  // Insert cash payment immediately
  // -----------------------------
  const insertCashPayment = useCallback(async () => {
    try {
      console.log("[Payment] Processing cash payment...");
      const schemeData = buildSchemeData();
      await insertSchemeCollection(schemeData);

      console.log("[Payment] Cash payment processed successfully");
      navigation.navigate("PaymentSuccess", {
        status: "SUCCESS",
        orderDetails: {
          amount: parseFloat(amount || productInfo.defaultAmount),
          customer: {
            name: productInfo.defaultName,
            contact: productInfo.defaultContact,
            regNo: productInfo.defaultRegNo,
            groupCode: productInfo.defaultGroupCode,
          },
          payType: payType,
          schemeInfo: productData?.schemeSummary || {},
        },
        schemeData,
        paymentStatus: {
          orderStatus: "PAID",
          message: "Cash payment processed successfully",
        },
        productData,
        isCashPayment: true,
      });
    } catch (error) {
      console.error("[Payment] Cash payment failed:", error);
      // Navigate to PaymentFailure for cash payment errors too
      navigation.navigate("PaymentFailure", {
        orderDetails: {
          amount: parseFloat(amount || productInfo.defaultAmount),
          customer: {
            name: productInfo.defaultName,
            contact: productInfo.defaultContact,
            regNo: productInfo.defaultRegNo,
            groupCode: productInfo.defaultGroupCode,
          },
          payType: payType,
        },
        productData,
        paymentStatus: {
          message: error.message || "Cash payment processing failed",
        },
        isCashPayment: true,
      });
    }
  }, [buildSchemeData, navigation, amount, productInfo, payType, productData]);

  // -----------------------------
  // Handle Buy (main)
  // -----------------------------
  const handleBuy = useCallback(async () => {
    // Validate
    if (
      productInfo.weightLedger === "N" &&
      productInfo.FixedIns === "N" &&
      !validateAmount(amount)
    ) {
      Alert.alert(
        "Invalid Amount",
        amountError || "Please enter a valid amount."
      );
      return;
    }

    console.log(`[Payment] Starting ${payType} payment process`);
    setLoading(true);

    try {
      if (payType === "CASH") {
        await insertCashPayment();
        return;
      }

      // ONLINE/UPI flow
      if (!token) {
        console.warn("[Payment] No authentication token available");
        Alert.alert("Authentication Required", "Please login to continue", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // Get the order ID with correct parameters
      const orderId = await createOrder(amount, productInfo);
      console.log(`[Payment] Order ID created: ${orderId}`);

      const payload = {
        merchantTxnNo: orderId,
        amount: parseFloat(amount || productInfo.defaultAmount),
        currencyCode: "356",
        transactionType: "SALE",
        payType: "ONLINE",
        addlParam1: productInfo.defaultRegNo,
        addlParam2: productInfo.defaultGroupCode,
        returnURL: "https://app.bmgjewellers.com/api/v1/payment/success",
      };

      console.log(`[Payment] Payload for initiate-sale:`, payload);
      console.log("T", token);
      console.log(
  "[Payment] Redirect API Authorization:",
  `Bearer ${token}`
);

      const initiate = await fetch(`${API_BASE_URL}/payment/initiate-sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },

        body: JSON.stringify(payload),
      });

      if (!initiate.ok) {
        const errorData = await initiate.json().catch(() => ({}));
        console.error(
          `[Payment] Initiation failed: ${initiate.status}`,
          errorData
        );
        throw new Error(
          errorData.message || `Payment initiation failed: ${initiate.status}`
        );
      }

      const data = await initiate.json();
      if (!data.tranCtx) {
        throw new Error("Transaction context not received");
      }

      console.log("[Payment] Getting redirect URL...");
      let redirectUrl;
      try {
        redirectUrl = await getRedirectUrlApi(data.tranCtx);
        console.log("[Payment] Redirect URL obtained successfully");
      } catch (err) {
        console.error("[Payment] Failed to get redirect URL:", err);
        Alert.alert(
          "Payment Error",
          "Failed to obtain payment redirect URL. Would you like to retry?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Retry",
              onPress: () => {
                try {
                  (handleBuyRef.current || (() => {}))();
                } catch (e) {
                  console.error("[Payment] Retry call failed:", e);
                }
              },
            },
          ]
        );
        return;
      }

      const orderDetails = {
        orderId,
        merchantTxnNo: orderId,
        amount: parseFloat(amount || productInfo.defaultAmount),
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

      console.log("[Payment] Navigating to payment webview");
      navigation.navigate("PaymentWebView", {
        paymentUrl: redirectUrl,
        orderDetails,
        productData,
        payTypeResponse,
      });
    } catch (error) {
      console.error("[Payment] Processing failed:", error);
      Alert.alert(
        "Payment Error",
        error.message || "Unable to process payment. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Retry",
            onPress: () => {
              try {
                (handleBuyRef.current || (() => {}))();
              } catch (e) {
                console.error("[Payment] Retry call failed:", e);
              }
            },
          },
        ]
      );
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [
    amount,
    amountError,
    insertCashPayment,
    navigation,
    payType,
    payTypeResponse,
    productData,
    productInfo,
    token,
    validateAmount,
    createOrder,
  ]);

  // keep a stable ref to handleBuy so that Alert retry can call it safely
  useEffect(() => {
    handleBuyRef.current = handleBuy;
    retryPaymentRef.current = () => {
      try {
        handleBuyRef.current && handleBuyRef.current();
      } catch (e) {
        console.error("[Payment] Retry payment ref failed:", e);
      }
    };
  }, [handleBuy]);

  // ---------- helpers for UI ----------
  const formatCurrency = (value) => {
    if (!value) return "0.00";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "0.00";
    return numValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (payType === "CASH") return "Confirm Payment";
    return "Proceed to Pay";
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    if (fetchingPaymentType) return true;

    // If both are "N", amount input is enabled - validate amount
    if (productInfo.weightLedger === "N" && productInfo.FixedIns === "N") {
      if (!!amountError) return true;
      if (!amount) return true;
    }

    return false;
  };

  // ---------- styles ----------
  const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      padding: SIZES.padding.lg,
      paddingBottom: SIZES.padding.xxl,
    },
    mainCard: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      marginBottom: SIZES.margin.lg,
      ...SHADOWS.sm,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SIZES.margin.md,
      paddingBottom: SIZES.padding.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
    },
    sectionIcon: { fontSize: SIZES.icon.md, marginRight: SIZES.margin.sm },
    sectionTitle: { ...FONTS.h5, color: COLORS.textPrimary },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SIZES.padding.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.backgroundSecondary,
    },
    infoLabel: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1 },
    infoValue: {
      ...FONTS.bodyMedium,
      color: COLORS.textPrimary,
      flex: 1.2,
      textAlign: "right",
    },
    paymentDropdownContainer: { marginTop: SIZES.margin.md },
    dropdownLabel: {
      ...FONTS.bodyMedium,
      color: COLORS.textSecondary,
      marginBottom: SIZES.margin.xs,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: currentPaymentStyle.bgColor,
      borderRadius: SIZES.radius.md,
      paddingHorizontal: SIZES.padding.md,
      borderWidth: 1.5,
      borderColor: currentPaymentStyle.borderColor,
      height: SIZES.input.height,
    },
    dropdownButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    dropdownIcon: { fontSize: SIZES.icon.md, marginRight: SIZES.margin.sm },
    dropdownText: {
      ...FONTS.bodyMedium,
      color: currentPaymentStyle.textColor,
      fontSize: SIZES.font.md,
    },
    dropdownArrow: {
      fontSize: SIZES.font.md,
      color: currentPaymentStyle.textColor,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      width: "85%",
      maxHeight: "70%",
      ...SHADOWS.lg,
    },
    modalHeader: {
      ...FONTS.h5,
      color: COLORS.textPrimary,
      marginBottom: SIZES.margin.md,
      textAlign: "center",
    },
    paymentOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      marginBottom: SIZES.margin.sm,
      borderWidth: 1.5,
      height: SIZES.button.lg,
    },
    paymentOptionIcon: {
      fontSize: SIZES.icon.lg,
      marginRight: SIZES.margin.md,
    },
    paymentOptionText: { ...FONTS.bodyMedium },
    amountSection: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      marginBottom: SIZES.margin.lg,
      ...SHADOWS.sm,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    inputContainer: { marginTop: SIZES.margin.sm },
    inputLabel: {
      ...FONTS.bodyMedium,
      color: COLORS.textPrimary,
      marginBottom: SIZES.margin.xs,
    },
    inputWrapper: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
    },
    currencySymbol: {
      position: "absolute",
      left: SIZES.padding.md,
      top: "40%",
      transform: [{ translateY: -12 }],
      fontSize: SIZES.font.xxl,
      color: COLORS.textPrimary,
      zIndex: 1,
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: SIZES.radius.md,
      paddingLeft: SIZES.padding.xxl + 4,
      ...FONTS.h4,
      color: COLORS.textPrimary,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      height: SIZES.input.height + 2,
      marginBottom: 4,
      includeFontPadding: false,
      textAlignVertical: "center",
      width: "100%",
    },
    inputFocused: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.white,
    },
    inputError: { borderColor: COLORS.error },
    errorText: {
      color: COLORS.error,
      ...FONTS.caption,
      marginTop: SIZES.margin.xs,
      marginLeft: SIZES.margin.xs,
    },
    fixedAmountDisplay: {
      backgroundColor: COLORS.warningLight,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      borderWidth: 1.5,
      borderColor: COLORS.warning,
      height: SIZES.input.lg,
      justifyContent: "center",
    },
    amountValue: {
      ...FONTS.h3,
      color: COLORS.textPrimary,
      textAlign: "center",
    },
    buttonContainer: { marginTop: SIZES.margin.lg },
    buttonGradient: {
      borderRadius: SIZES.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      height: SIZES.button.lg,
      ...SHADOWS.md,
    },
    buttonText: { ...FONTS.button, color: COLORS.white },
    disabledButton: { opacity: 0.6 },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      ...FONTS.bodyMedium,
      color: COLORS.white,
      marginLeft: SIZES.margin.sm,
    },
    securityBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: SIZES.margin.md,
      padding: SIZES.padding.sm,
      backgroundColor: COLORS.successLight,
      borderRadius: SIZES.radius.md,
      borderWidth: 1,
      borderColor: COLORS.success,
    },
    securityText: {
      ...FONTS.caption,
      color: COLORS.success,
      marginLeft: SIZES.margin.xs,
    },
  });

  // ---------- render ----------
  return (
    <View style={styles.background}>
      <CommonHeader title="Payment Details" />
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
          {/* Customer Information Card */}
          <View style={styles.mainCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Customer Details</Text>
            </View>

            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{productInfo.defaultName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reg No.</Text>
                <Text style={styles.infoValue}>{productInfo.defaultRegNo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Group</Text>
                <Text style={styles.infoValue}>
                  {productInfo.defaultGroupCode}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>
                  {productInfo.defaultContact}
                </Text>
              </View>
            </View>

            {/* Payment Type Dropdown */}
            <View style={styles.paymentDropdownContainer}>
              <Text style={styles.dropdownLabel}>Payment Method</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPaymentDropdown(true)}
                disabled={fetchingPaymentType || loading}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownButtonContent}>
                  <Text style={styles.dropdownIcon}>
                    {currentPaymentStyle.icon}
                  </Text>
                  <Text style={styles.dropdownText}>
                    {fetchingPaymentType ? "Loading..." : payType}
                  </Text>
                </View>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>
                {productInfo.weightLedger === "N" &&
                productInfo.FixedIns === "N"
                  ? "Enter Amount"
                  : "Payment Amount"}
              </Text>
            </View>

            {productInfo.weightLedger === "N" &&
            productInfo.FixedIns === "N" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor={COLORS.inputPlaceholder}
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
                  <Text
                    style={[styles.errorText, { color: COLORS.textTertiary }]}
                  >
                    Enter amount between ₹100 - ₹1,00,00,000
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.fixedAmountDisplay}>
                <Text style={styles.amountValue}>
                  ₹ {formatCurrency(productInfo.defaultAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Proceed Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleBuy}
              disabled={isButtonDisabled()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={currentPaymentStyle.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buttonGradient,
                  isButtonDisabled() && styles.disabledButton,
                ]}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} size="small" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>{getButtonText()}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Security Badge */}
          {payType !== "CASH" && !fetchingPaymentType && (
            <View style={styles.securityBadge}>
              <Text style={{ fontSize: SIZES.icon.sm }}>🔒</Text>
              <Text style={styles.securityText}>
                Secure & Encrypted Payment Gateway
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment Type Selection Modal */}
      <Modal
        visible={showPaymentDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Payment Method</Text>
            {payTypeResponse &&
              payTypeResponse.map((item) => {
                const style = getPaymentTypeStyle(item.NAME);
                const isSelected = payType === item.NAME;
                return (
                  <TouchableOpacity
                    key={item.NAME}
                    style={[
                      styles.paymentOption,
                      {
                        backgroundColor: isSelected
                          ? style.bgColor
                          : COLORS.backgroundSecondary,
                        borderColor: isSelected
                          ? style.borderColor
                          : COLORS.border,
                      },
                    ]}
                    onPress={() => {
                      setPayType(item.NAME);
                      setShowPaymentDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.paymentOptionIcon}>{style.icon}</Text>
                    <Text
                      style={[
                        styles.paymentOptionText,
                        {
                          color: isSelected
                            ? style.textColor
                            : COLORS.textPrimary,
                        },
                      ]}
                    >
                      {item.NAME}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default BuyPage;
