import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import appTheme from "../../utils/Theme";
import MemberDetailsPage from "./MemberDetailsPage";
import SchemeDetailsPage from "./SchemeDetailsPage";
import { API_BASE_URL_OLD, API_BASE_URL } from "../../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import smsService from "../../services/SMSService";
import { sendJoinSchemeNotification } from "../../services/CommonNotificationService";
import { getAppliedReferralStatus } from "../../services/ReferalService";

const { COLORS } = appTheme;

// Service function to fetch all schemes
const getAllSchemes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL_OLD}/member/scheme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching schemes:", error);
    throw error;
  }
};

const AddNewMember = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();

  // Extract both schemeId and schemeName from route params
  const { schemeId: routeSchemeId, schemeName: routeSchemeName } =
    route.params || {};

 

  // Use state for scheme data - parse immediately
  const [selectedScheme, setSelectedScheme] = useState({
    id: routeSchemeId ? Number(routeSchemeId) : null,
    name: routeSchemeName || null,
  });

  const [token, setToken] = useState(null);

  // Payment state
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Track payment completion and processing status
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const nowDateTime = new Date().toISOString().slice(0, 10) + " 00:00:00";

  // Store transformed data from MemberDetailsPage
  const [transformedMemberData, setTransformedMemberData] = useState(null);

  const [schemeData, setSchemeData] = useState({
    selectedSchemeId: selectedScheme.id,
    selectedGroupCodeObj: null,
    selectedCurrentRegNoObj: null,
    amount: "",
    accCode: "",
    modePay: "C",
    calculatedWeight: "",
  });

  // Update schemeData when selectedScheme changes
  useEffect(() => {
    console.log("🔄 Updating schemeData with selectedScheme:", selectedScheme);
    setSchemeData((prev) => ({
      ...prev,
      selectedSchemeId: selectedScheme.id,
    }));

    // Also fetch scheme options if we have an ID
    if (selectedScheme.id) {
      fetchSchemeOptions(selectedScheme.id);
    }
  }, [selectedScheme]);

  const [schemeOptions, setSchemeOptions] = useState([]);
  const [isFetchingSchemeOptions, setIsFetchingSchemeOptions] = useState(false);

  // New state for storing all schemes
  const [allSchemes, setAllSchemes] = useState([]);
  const [isFetchingSchemes, setIsFetchingSchemes] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment order details
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentPaymentData, setCurrentPaymentData] = useState(null);

  // Referral
  const [ReferralCode, setReferralCode] = useState(null);

  useEffect(() => {
    fetchReferralStatus();
  }, []);

  const fetchReferralStatus = async () => {
    const result = await getAppliedReferralStatus();
    const referralCode = result?.appliedReferralData?.referral_code;
    console.log("Referral Code:", referralCode);
    setReferralCode(referralCode);
  };

  // Fetch all schemes on component mount
  useEffect(() => {
    fetchAllSchemes();
  }, []);

  // Handle payment completion
  useEffect(() => {
    if (paymentCompleted) {
      resetFormFields();
      navigation.navigate("MainLanding");
    }
  }, [paymentCompleted]);

  // Fetch all available schemes
  const fetchAllSchemes = async () => {
    setIsFetchingSchemes(true);
    try {
      const schemes = await getAllSchemes();
      setAllSchemes(schemes);

      // If we have a route schemeId but no name, try to find the name
      if (selectedScheme.id && !selectedScheme.name) {
        const foundScheme = schemes.find(
          (s) => s.SchemeId === selectedScheme.id
        );
        if (foundScheme) {
          setSelectedScheme((prev) => ({
            ...prev,
            name: foundScheme.schemeName || routeSchemeName,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching all schemes:", error);
      Alert.alert("Error", "Failed to fetch schemes. Please try again.");
    } finally {
      setIsFetchingSchemes(false);
    }
  };

  // Get scheme name with proper fallbacks
  const getSchemeName = (id) => {
    if (!id) return selectedScheme.name || "No Scheme Selected";
    const numericId = Number(id);

    // First check selectedScheme state
    if (selectedScheme.id === numericId && selectedScheme.name) {
      return selectedScheme.name;
    }

    // Then check allSchemes
    const scheme = allSchemes.find((s) => s.SchemeId === numericId);
    if (scheme) {
      return scheme.schemeName || "Unknown Scheme";
    }

    // Finally fallback to route scheme name
    return selectedScheme.name || routeSchemeName || "Unknown Scheme";
  };

  // Fetch GROUPCODE and REGNO for selected scheme
  const fetchSchemeOptions = async (schemeId) => {
    if (!schemeId) return;

    setIsFetchingSchemeOptions(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_OLD}/member/schemeid?schemeId=${schemeId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Normalize data
      const normalizedData = data.map((item) => ({
        groupCode: item.GROUPCODE,
        regNo: item.CURRENTREGNO || item.REGNO || generateRandomRegNo(),
        amount: item.AMOUNT || "",
      }));

      setSchemeOptions(normalizedData);

      // Preselect first option
      if (normalizedData.length > 0) {
        setSchemeData((prev) => ({
          ...prev,
          selectedGroupCodeObj: normalizedData[0].groupCode,
          selectedCurrentRegNoObj: normalizedData[0].regNo,
          amount: normalizedData[0].amount?.toString() || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching scheme options:", error);
      Alert.alert("Error", "Failed to fetch scheme details. Please try again.");
    } finally {
      setIsFetchingSchemeOptions(false);
    }
  };

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("authToken");
      console.log("🟢 Saved token:", savedToken);
      if (savedToken) setToken(savedToken);
    })();
  }, []);

  const handleBack = () => {
    if (showWebView) {
      setShowWebView(false);
      setPaymentUrl("");
      setIsProcessingPayment(false);
      setProcessingPayment(false);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigation.navigate("MainLanding");
    }
  };

  // Function to handle scheme selection from MemberDetailsPage
  const handleSchemeSelection = (schemeId, schemeName) => {
    console.log("📋 Scheme selected from MemberDetailsPage:", {
      schemeId,
      schemeName,
    });

    // Update selectedScheme state
    const numericId = Number(schemeId);
    setSelectedScheme({
      id: numericId,
      name: schemeName || getSchemeName(numericId),
    });

    // Update schemeData
    setSchemeData((prev) => ({
      ...prev,
      selectedSchemeId: numericId,
    }));

    // Fetch options for the new scheme
    fetchSchemeOptions(numericId);
  };

  const handleNextStep = (memberFormData = {}) => {
    console.log("📋 MemberDetailsPage onSubmit data:", memberFormData);

    // Store the transformed data directly as-is
    // The MemberDetailsPage already sends transformed data with correct field names
    setTransformedMemberData(memberFormData);

    // Check if scheme was selected in MemberDetailsPage
    if (memberFormData.selectedSchemeId) {
      const numericId = Number(memberFormData.selectedSchemeId);
      setSelectedScheme({
        id: numericId,
        name: memberFormData.selectedSchemeName || getSchemeName(numericId),
      });
    }

    // Move to next step
    setCurrentStep(2);
  };

  // Create payment order
  const createPaymentOrder = async (
    amount,
    defaultName,
    defaultContact,
    defaultRegNo,
    defaultGroupCode
  ) => {
    try {
      const orderPayload = {
        amount: parseFloat(amount),
        customer: {
          name: defaultName,
          contact: defaultContact,
          REGNO: defaultRegNo,
          GROUPCODE: defaultGroupCode,
        },
      };

      console.log("Creating payment order with payload:", orderPayload);

      const response = await fetch(
        `${API_BASE_URL}/orders/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(orderPayload),
        }
      );

      console.log("Create order response:", response);

      if (!response.ok) {
        throw new Error(`Failed to create order: HTTP ${response.status}`);
      }

      const orderData = await response.json();
      console.log("Order created successfully:", orderData);

      // Normalize API response
      return {
        orderId: orderData.order_id || orderData.orderId,
        message: orderData.message,
        status: orderData.status,
      };
    } catch (error) {
      console.error("Error creating payment order:", error);
      throw error;
    }
  };

  // Initiate payment
  const initiatePayment = async (
    orderId,
    amount,
    defaultRegNo,
    defaultGroupCode
  ) => {
    try {
      const paymentPayload = {
        merchantTxnNo: orderId,
        amount: parseFloat(amount),
        currencyCode: "356",
        transactionType: "SALE",
        payType: "ONLINE",
        addlParam1: defaultRegNo,
        addlParam2: defaultGroupCode,
        returnURL: "https://app.bmgjewellers.com/api/v1/payment/success",
      };

      console.log("Initiating payment with payload:", paymentPayload);
      console.log("🟢 Token before initiating:", token);

      // Step 1: Initiate sale
      const initiateRes = await fetch(`${API_BASE_URL}/payment/initiate-sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(paymentPayload),
      });
      const initiateData = await initiateRes.json();
      console.log("initiate payment response:", initiateRes);
      console.log("Initiate payment response:", initiateData);
      if (!initiateRes.ok) throw new Error(initiateData.message);

      if (!initiateData.tranCtx) throw new Error("Transaction context missing");

      // Step 2: Get redirect/payment URL using tranCtx
      const redirectRes = await fetch(`${API_BASE_URL}/payment/redirect-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ tranCtx: initiateData.tranCtx }),
      });
      if (!redirectRes.ok) {
        const errorText = await redirectRes.text();
        throw new Error(errorText);
      }

      const paymentUrl = (await redirectRes.text())
        .replace(/^"+|"+$/g, "")
        .trim();
      console.log("Payment URL:", paymentUrl);

      return {
        ...initiateData,
        paymentUrl,
      };
    } catch (error) {
      console.error("Error initiating payment:", error);
      throw error;
    }
  };

  // Check Payment Status from API
  const checkPaymentStatus = async (merchantTxnNo) => {
    try {
      console.log("🔍 Checking payment status for:", merchantTxnNo);

      const payload = {
        merchantId: "T_03342",
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        transactionType: "STATUS",
      };

      console.log(
        "📤 PAYPHI STATUS PAYLOAD:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(
        `${API_BASE_URL}/payment/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("✅ Payment Status Response:", JSON.stringify(data, null, 2));

      // Store payment data in AsyncStorage
      await storePaymentData(data);

      return data;
    } catch (error) {
      console.error("❌ Payment Status Check Error:", error);
      throw error;
    }
  };

  // Store Payphi Response in AsyncStorage
  const storePaymentData = async (paymentStatus) => {
    try {
      const paymentData = {
        payphiResponse: paymentStatus.payphiResponse,
        orderStatus: paymentStatus.orderStatus,
        message: paymentStatus.message,
        timestamp: new Date().toISOString(),
        orderDetails: orderDetails,
      };

      await AsyncStorage.setItem(
        "paymentResponse",
        JSON.stringify(paymentData)
      );
      console.log("💾 Payment data ", JSON.stringify(paymentData).length);
    } catch (error) {
      console.error("❌ Error storing payment data:", error);
    }
  };

  const generateCashPaymentDetails = () => {
    // Generate random 10-digit number for card
    const cardNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    // Generate 6-digit random number for return reason
    const rtnNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const rtnReason = `CASH-${rtnNumber}`;

    return { cardNumber, rtnReason };
  };

const submitMemberData = async (
  numericSchemeId,
  schemeFormData,
  groupCode,
  regNo,
  paymentResponse = null,
  cashPayment = false
) => {
  try {
    if (!transformedMemberData) {
      throw new Error("No member data available");
    }

    const memberData = transformedMemberData;

    console.log("📊 Transformed memberData:", memberData);

    // Validate required fields
    if (!memberData.pName || memberData.pName.trim() === "") {
      throw new Error("Member name is required");
    }

    if (!memberData.mobile || memberData.mobile.length < 10) {
      throw new Error("Valid mobile number is required");
    }

    if (!memberData.aadharNumber || memberData.aadharNumber.replace(/\s/g, "").length < 12) {
      throw new Error("Valid Aadhaar number is required");
    }

    if (!memberData.dateOfBirth) {
      throw new Error("Date of Birth is required");
    }

    // ✅ Construct newMember object EXACTLY as Postman
    const newMember = {
      title: memberData.title || "Mr",
      initial: memberData.initial || (memberData.pName ? memberData.pName.charAt(0).toUpperCase() : ""),
      pName: memberData.pName || "",
      sName: memberData.sName || "",
      
      // Address details - Use the fields from transformed data
      doorNo: memberData.doorNo || "",
      address1: memberData.address1 || "",
      address2: memberData.address2 || "",
      area: memberData.area || "",
      city: memberData.city || "",
      state: memberData.selectedState || memberData.state || "",
      country: "India",
      pinCode: memberData.pincode || "",

      // Contact details
      mobile: memberData.mobile || "",
      mobile2: memberData.mobile2 || "",

      // Email
      email: memberData.email || "",

      // Nominee details - CRITICAL: Use exact field names from MemberDetailsPage
      nomeni: memberData.nomeni || memberData.nomeni || "",
      nomineeMobile: memberData.mobile2 || memberData.mobile || "",
      nomineeRelationship: memberData.nomineeRelationship || "Spouse",
      nomAddr1: memberData.nomAddr1 || memberData.address1 || "",
      nomAddr2: memberData.nomAddr2 || memberData.address2 || "",
      nomCity: memberData.nomCity || memberData.city || "",
      nomState: memberData.nomState || memberData.state || "",
      nomPincode: memberData.nomPincode || memberData.pincode || "",
      nomCountry: memberData.nomCountry || "India",

      // Nominee Aadhaar details from DigiLocker
      nomineeName: memberData.nomineeName || memberData.nomeni || "",
      nomineeDOB: memberData.nomineeDOB || "",
      nomineeGender: memberData.nomineeGender || "",
      nomineeCareOf: memberData.nomineeCareOf || "",
      nomineeYearOfBirth: memberData.nomineeYearOfBirth || "",

      // ID Proof
      idProof: "Aadhaar",
      idProofNo: (memberData.aadharNumber || "").replace(/\s/g, ""),
      aadhaarMasked: memberData.aadhaarMasked || "XXXX-XXXX-XXXX",
      panNumber: memberData.panNumber || "",

      // Personal details
      dob: memberData.dateOfBirth || "",
      anniversaryDate: memberData.anniversaryDate 
        ? `${memberData.anniversaryDate} 00:00:00`
        : "",
      maritalStatus: memberData.maritalStatus || "",

      // Verification flags - IMPORTANT: These must be booleans
      mobileVerified: memberData.mobileVerified !== undefined ? memberData.mobileVerified : true,
      aadhaarVerified: memberData.aadhaarVerified !== undefined ? memberData.aadhaarVerified : true,
      nomineeMobileVerified: memberData.nomineeMobileVerified !== undefined ? memberData.nomineeMobileVerified : !!memberData.mobile2,
      nomineeAadhaarVerified: memberData.nomineeAadhaarVerified !== undefined ? memberData.nomineeAadhaarVerified : false,

      // System fields
      upDateTime: nowDateTime,
      userId: "999",
      appVer: "WEB",
    };

    // ✅ Construct createSchemeSummary
    const createSchemeSummary = {
      schemeId: numericSchemeId,
      groupCode: groupCode || "BMA",
      regNo: regNo || generateRandomRegNo(),
      joinDate: nowDateTime,
      upDateTime2: nowDateTime,
      openingDate: nowDateTime,
      userId2: "999",
    };

    // ✅ Construct schemeCollectInsert
    let schemeCollectInsert = {
      amount: Number(schemeFormData.amount),
      modePay: schemeFormData.modePay, // "C" for cash, "O" for online
      accCode: "1",
      chqBankCode: "1",
      chqCardNo: "",
      chqBranch: "",
      chkBank: "",
      chqRtnReason: "",
    };

    // Set payment-specific fields
    if (cashPayment) {
      const { cardNumber, rtnReason } = generateCashPaymentDetails();
      schemeCollectInsert.chqCardNo = cardNumber;
      schemeCollectInsert.chqBranch = "Received";
      schemeCollectInsert.chkBank = "CASH";
      schemeCollectInsert.chqRtnReason = rtnReason;
    } else if (paymentResponse?.payphiResponse) {
      const resp = paymentResponse.payphiResponse;
      schemeCollectInsert.chqCardNo = resp?.txnID || "N/A";
      schemeCollectInsert.chqBranch = resp?.paymentSubInstType || "N/A";
      schemeCollectInsert.chkBank = resp?.paymentMode || "N/A";
      schemeCollectInsert.chqRtnReason = resp?.merchantTxnNo || "N/A";
    }

    // ✅ Final request body
    const requestBody = {
      newMember,
      createSchemeSummary,
      schemeCollectInsert,
      referralCode: ReferralCode || "",
    };

    console.log("Referral Code:", ReferralCode);

    // Log the complete request for debugging
    console.log(
      "📤 FINAL REQUEST BODY:",
      JSON.stringify(requestBody, null, 2)
    );

    // ✅ Make API call
    const submitResponse = await fetch(`${API_BASE_URL_OLD}/member/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await submitResponse.text();
    console.log("📥 API Response:", responseText);

    if (!submitResponse.ok) {
      throw new Error(`HTTP ${submitResponse.status}: ${responseText}`);
    }

    const responseData = JSON.parse(responseText);
    console.log("✅ Success Response:", responseData);

    // Send SMS notification
    try {
      await smsService.sendWelcomeSMS(
        memberData.mobile,
        memberData.pName,
        getSchemeName(numericSchemeId),
        schemeFormData.amount,
        new Date().toISOString().slice(0, 10),
        "BMG JEWELLERS PVT LTD"
      );
      console.log("✅ Welcome SMS sent successfully");
    } catch (smsError) {
      console.warn("⚠️ Failed to send welcome SMS:", smsError);
    }

    // Send join scheme notification
    try {
      await sendJoinSchemeNotification(
        numericSchemeId,
        parseFloat(schemeFormData.amount),
        getSchemeName(numericSchemeId)
      );
      console.log("✅ Join scheme notification sent");
    } catch (notifErr) {
      console.warn("⚠️ Failed to send notification:", notifErr);
    }

    return true;
  } catch (error) {
    console.error("❌ Error submitting member data:", error);
    throw error;
  }
};

  const handleWebViewNavigation = (request) => {
    const url = request.url;
    console.log("\n🌐 [JOIN-WEBVIEW] URL intercepted:", url);
    console.log("🌐 [JOIN-WEBVIEW] paymentProcessed:", paymentProcessed);

    if (paymentProcessed) {
      console.log("🌐 [JOIN-WEBVIEW] Already processed — blocking URL");
      return false;
    }

    const successUrl = "https://bmgjewellers.com/payment-success";
    const failureUrl = "https://bmgjewellers.com/payment-failure";

    if (
      url.includes(successUrl) ||
      url.includes("/payment-success") ||
      url.includes("/success")
    ) {
      console.log("✅ [JOIN-WEBVIEW] SUCCESS URL detected — blocking & processing");
      setPaymentProcessed(true);
      setShowWebView(false);
      setProcessingPayment(true);
      setTimeout(() => handlePaymentSuccess(), 1000);
      return false;
    } else if (
      url.includes(failureUrl) ||
      url.includes("/payment-failure") ||
      url.includes("/failure")
    ) {
      console.log("❌ [JOIN-WEBVIEW] FAILURE URL detected — blocking & processing");
      setPaymentProcessed(true);
      setShowWebView(false);
      setProcessingPayment(true);
      setTimeout(() => handlePaymentFailure(), 1000);
      return false;
    } else if (
      url.includes("/cancel") ||
      url.includes("/cancelled") ||
      url.includes("/payment-cancel")
    ) {
      console.log("🚫 [JOIN-WEBVIEW] CANCEL URL detected — blocking");
      setPaymentProcessed(true);
      setShowWebView(false);
      setProcessingPayment(false);
      Alert.alert("Payment Cancelled", "You cancelled the payment.");
      setIsProcessingPayment(false);
      return false;
    }

    console.log("🌐 [JOIN-WEBVIEW] Allowing URL to load");
    return true;
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log("\n🎯 [JOIN-PAYMENT-SUCCESS] handlePaymentSuccess triggered");
      console.log("🎯 [JOIN-PAYMENT-SUCCESS] orderDetails:", JSON.stringify(orderDetails, null, 2));
      console.log("🎯 [JOIN-PAYMENT-SUCCESS] currentPaymentData:", JSON.stringify(currentPaymentData, null, 2));

      if (!orderDetails?.merchantTxnNo) {
        console.error("❌ [JOIN-PAYMENT-SUCCESS] No merchantTxnNo in orderDetails");
        throw new Error("No merchant transaction number found");
      }

      console.log("🔍 [JOIN-PAYMENT-SUCCESS] Checking payment status for:", orderDetails.merchantTxnNo);
      const paymentStatus = await checkPaymentStatus(
        orderDetails.merchantTxnNo
      );
      console.log("📊 [JOIN-PAYMENT-SUCCESS] Payment status result:", JSON.stringify(paymentStatus, null, 2));

      if (paymentStatus?.orderStatus === "PAID") {
        console.log("✅ [JOIN-PAYMENT-SUCCESS] Status is PAID — submitting member data");
        await submitMemberData(
          currentPaymentData.numericSchemeId,
          currentPaymentData.schemeData,
          currentPaymentData.groupCode,
          currentPaymentData.regNo,
          paymentStatus // Pass the payment status response
        );

        // Hide loading and show success popup
        console.log("✅ [JOIN-PAYMENT-SUCCESS] Member data submitted successfully");
        setProcessingPayment(false);
        Alert.alert(
          "Success",
          `Member added successfully to ${getSchemeName(
            currentPaymentData.numericSchemeId
          )}!`,
          [
            {
              text: "OK",
              onPress: () => {
                setPaymentCompleted(true);
              },
            },
          ]
        );
      } else {
        console.warn("⚠️ [JOIN-PAYMENT-SUCCESS] orderStatus is NOT PAID:", paymentStatus?.orderStatus);
        throw new Error("Payment not confirmed");
      }
    } catch (error) {
      console.error("❌ [JOIN-PAYMENT-SUCCESS] Error:", error.message);
      // Hide loading and show error popup
      setProcessingPayment(false);
      Alert.alert(
        "Payment Warning",
        "Payment was successful but there was an issue saving member data. Please contact support.",
        [
          {
            text: "OK",
            onPress: () => {
              setPaymentCompleted(true);
            },
          },
        ]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentFailure = () => {
    console.log("❌ [JOIN-PAYMENT-FAILURE] handlePaymentFailure triggered");
    setProcessingPayment(false);
    Alert.alert(
      "Payment Failed",
      "Your payment was not successful. Please try again.",
      [
        {
          text: "OK",
          onPress: () => {
            setIsProcessingPayment(false);
          },
        },
      ]
    );
  };

  const handleSubmit = async (schemeFormData) => {
    if (isSubmitting || isProcessingPayment) return;

    const numericSchemeId = selectedScheme.id;
    if (!numericSchemeId || isNaN(numericSchemeId)) {
      Alert.alert("Error", "Please select a valid scheme.");
      return;
    }
    if (!schemeFormData.amount || parseFloat(schemeFormData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!schemeFormData.accCode) {
      Alert.alert("Error", "Please select a payment mode.");
      return;
    }

    // For cash payments, proceed directly without payment flow
    if (schemeFormData.modePay === "C" && schemeFormData.accCode !== "ONLINE") {
      await processCashPayment(schemeFormData, numericSchemeId);
      return;
    }

    // For online payments, start payment flow
    await processOnlinePayment(schemeFormData, numericSchemeId);
  };

const processCashPayment = async (schemeFormData, numericSchemeId) => {
  setIsSubmitting(true);
  
  try {
    console.log("\n💰 [JOIN-CASH] Starting cash payment process");
    console.log("💰 [JOIN-CASH] Scheme ID:", numericSchemeId);
    console.log("💰 [JOIN-CASH] Scheme Form Data:", JSON.stringify(schemeFormData, null, 2));
    console.log("💰 [JOIN-CASH] Member Data:", JSON.stringify(transformedMemberData, null, 2));

    if (!transformedMemberData) {
      Alert.alert("Error", "Member data is missing. Please go back and fill member details.");
      setIsSubmitting(false);
      return;
    }

    // 1. Fetch scheme details
    console.log("🔍 Fetching scheme details...");
    const response = await fetch(
      `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to fetch scheme details: HTTP ${response.status}`);
    }
    
    const apiData = await response.json();
    console.log("💰 [JOIN-CASH] Scheme API Data:", JSON.stringify(apiData, null, 2));
    
    if (!apiData || apiData.length === 0) {
      throw new Error("No scheme data available for the selected scheme.");
    }

    // 2. Select appropriate scheme record
    let selectedRecord;
    const targetAmount = parseFloat(schemeFormData.amount);

    if (targetAmount > 0) {
      // Try exact match
      selectedRecord = apiData.find(
        (item) => parseFloat(item.AMOUNT || 0) === targetAmount
      );
      
      // If no exact match, find the closest amount
      if (!selectedRecord) {
        selectedRecord = apiData.find(
          (item) => parseFloat(item.AMOUNT || 0) > 0
        );
      }
    }

    // Fallback to first record
    if (!selectedRecord) {
      selectedRecord = apiData[0];
    }

    console.log("💰 [JOIN-CASH] Selected Scheme Record:", JSON.stringify(selectedRecord, null, 2));

    const groupCode = selectedRecord.GROUPCODE || "BMA";
    const regNo = selectedRecord.CURRENTREGNO || 
                  selectedRecord.REGNO || 
                  generateRandomRegNo();

    console.log("💰 [JOIN-CASH] groupCode:", groupCode);
    console.log("💰 [JOIN-CASH] regNo:", regNo);

    // 3. Submit member data
    console.log("📤 Submitting member data...");
    const success = await submitMemberData(
      numericSchemeId,
      schemeFormData,
      groupCode,
      regNo,
      null, // No online payment response
      true  // Cash payment flag
    );

    if (!success) {
      throw new Error("Member data submission failed.");
    }

    console.log("🎉 [JOIN-CASH] Cash payment process completed successfully");
    
    Alert.alert(
      "Success",
      `Member "${transformedMemberData.pName}" has been successfully added to "${getSchemeName(numericSchemeId)}" scheme!`,
      [
        {
          text: "OK",
          onPress: () => {
            resetFormFields();
            navigation.navigate("MainLanding");
          },
        },
      ]
    );

  } catch (error) {
    console.error("❌ Error during cash payment process:", error);
    
    let errorMessage = "Failed to create member. Please try again.";
    
    // Provide more specific error messages
    if (error.message.includes("mobile")) {
      errorMessage = "Mobile number validation failed. Please check the number.";
    } else if (error.message.includes("Aadhaar")) {
      errorMessage = "Aadhaar number validation failed. Please check the number.";
    } else if (error.message.includes("HTTP")) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.message.includes("scheme data")) {
      errorMessage = "Selected scheme is not available. Please try another scheme.";
    } else if (error.message.includes("already exists")) {
      errorMessage = "Member with these details already exists.";
    } else if (error.message.includes("Member name")) {
      errorMessage = "Member name is required.";
    } else if (error.message.includes("Date of Birth")) {
      errorMessage = "Date of Birth is required.";
    }
    
    Alert.alert(
      "Submission Error",
      errorMessage,
      [
        {
          text: "Retry",
          onPress: () => {
            // Optional: Retry logic
            setIsSubmitting(false);
          }
        },
        {
          text: "Cancel",
          onPress: () => setIsSubmitting(false),
          style: "cancel"
        }
      ]
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const processOnlinePayment = async (schemeFormData, numericSchemeId) => {
    console.log("\n💳 [JOIN-ONLINE] Starting online payment process");
    console.log("💳 [JOIN-ONLINE] Scheme ID:", numericSchemeId);
    console.log("💳 [JOIN-ONLINE] Amount:", schemeFormData.amount);
    console.log("💳 [JOIN-ONLINE] Member:", transformedMemberData?.pName, transformedMemberData?.mobile);
    setIsProcessingPayment(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiData = await response.json();
      console.log("💳 [JOIN-ONLINE] Scheme API data:", JSON.stringify(apiData, null, 2));

      if (!apiData || apiData.length === 0)
        throw new Error("No scheme data returned from API.");

      let selectedRecord;

      // Try to match by amount first
      if (schemeFormData.amount) {
        selectedRecord = apiData.find(
          (item) =>
            parseFloat(item.AMOUNT || 0) === parseFloat(schemeFormData.amount)
        );
      }

      // If no matching amount found, just pick the first record (for schemes like DIGI_SILVER or FIXED_DEPOSIT)
      if (!selectedRecord) {
        selectedRecord = apiData[0];
      }

      const groupCode = selectedRecord.GROUPCODE;
      const regNo =
        selectedRecord.CURRENTREGNO ||
        selectedRecord.REGNO ||
        generateRandomRegNo();

      console.log("💳 [JOIN-ONLINE] groupCode:", groupCode, "| regNo:", regNo);

      const defaultName = transformedMemberData ? `${transformedMemberData.pName} ${transformedMemberData.sName}`.trim() : "Customer";
      const defaultContact = transformedMemberData?.mobile || "";
      const amount = schemeFormData.amount;

      // Step 1: Create payment order
      const orderData = await createPaymentOrder(
        amount,
        defaultName,
        defaultContact,
        regNo,
        groupCode
      );

      console.log("💳 [JOIN-ONLINE] Order created:", JSON.stringify(orderData, null, 2));

      if (!orderData.orderId) {
        throw new Error("No order ID received from payment gateway");
      }

      // Step 2: Initiate payment
      const paymentData = await initiatePayment(
        orderData.orderId,
        amount,
        regNo,
        groupCode
      );

      console.log("💳 [JOIN-ONLINE] Payment initiate response:", JSON.stringify(paymentData, null, 2));
      console.log("💳 [JOIN-ONLINE] Payment URL:", paymentData.paymentUrl);

      if (!paymentData.paymentUrl) {
        throw new Error("No payment URL received from payment gateway");
      }

      // Prepare order details for WebView
      const currentOrderDetails = {
        merchantTxnNo: orderData.orderId,
        amount: parseFloat(amount),
        customer: {
          name: defaultName,
          contact: defaultContact,
          regNo: regNo,
          groupCode: groupCode,
        },
        schemeInfo: {
          schemeId: numericSchemeId,
          schemeName: getSchemeName(numericSchemeId),
        },
        personalInfo: transformedMemberData ? {
          name: transformedMemberData.pName,
          surname: transformedMemberData.sName,
          mobile: transformedMemberData.mobile,
          email: transformedMemberData.email,
        } : {},
      };

      // Store data for later use
      setOrderDetails(currentOrderDetails);
      setCurrentPaymentData({
        numericSchemeId,
        schemeData: schemeFormData,
        groupCode,
        regNo,
      });

      console.log("💳 [JOIN-ONLINE] currentOrderDetails:", JSON.stringify(currentOrderDetails, null, 2));

      setPaymentUrl(paymentData.paymentUrl);
      setShowWebView(true);
      setPaymentProcessed(false);
      console.log("💳 [JOIN-ONLINE] WebView opened with payment URL");
    } catch (error) {
      console.error("❌ [JOIN-ONLINE] Error:", error.message);
      Alert.alert(
        "Payment Error",
        error.message || "Failed to process payment. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const generateRandomRegNo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const resetFormFields = () => {
    // Clear transformed member data
    setTransformedMemberData(null);

    // Reset to original route scheme if available
    setSelectedScheme({
      id: routeSchemeId ? Number(routeSchemeId) : null,
      name: routeSchemeName || null,
    });

    setSchemeData({
      selectedSchemeId: routeSchemeId ? Number(routeSchemeId) : null,
      selectedGroupCodeObj: null,
      selectedCurrentRegNoObj: null,
      amount: "",
      accCode: "",
      modePay: "C",
      calculatedWeight: "",
    });

    setValidationErrors({});
    setSchemeOptions([]);
    setShowWebView(false);
    setPaymentUrl("");
    setPaymentProcessed(false);
    setPaymentCompleted(false);
    setProcessingPayment(false);
  };

  // Loading component for payment processing
  const renderProcessingPayment = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#d4af37" />
      <Text style={styles.processingText}>Processing your payment...</Text>
      <Text style={styles.processingSubText}>
        Please wait while we confirm your payment
      </Text>
    </View>
  );

  const renderStep = () => {
    if (paymentCompleted) {
      return null;
    }

    if (processingPayment) {
      return renderProcessingPayment();
    }

    if (showWebView) {
      return (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: paymentUrl }}
            onShouldStartLoadWithRequest={handleWebViewNavigation}
            onLoadStart={() => setPaymentLoading(true)}
            onLoadEnd={() => setPaymentLoading(false)}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#d4af37" />
              </View>
            )}
          />
          {paymentLoading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#d4af37" />
            </View>
          )}
        </View>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <MemberDetailsPage
            onNext={handleNextStep}
            onBack={handleBack}
            onSchemeSelect={handleSchemeSelection}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            initialSchemeId={selectedScheme.id}
            initialSchemeName={selectedScheme.name}
            allSchemes={allSchemes}
            isFetchingSchemes={isFetchingSchemes}
          />
        );
      case 2:
        return (
          <SchemeDetailsPage
            schemeData={schemeData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting || isProcessingPayment}
            API_BASE_URL_OLD={API_BASE_URL_OLD}
            schemes={allSchemes}
            selectedSchemeId={selectedScheme.id}
            schemeName={selectedScheme.name || getSchemeName(selectedScheme.id)}
            schemeOptions={schemeOptions}
            isFetchingSchemeOptions={isFetchingSchemeOptions}
            isFetchingSchemes={isFetchingSchemes}
          />
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  processingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: COLORS.primary,
    textAlign: "center",
  },
  processingSubText: {
    fontSize: 14,
    marginTop: 10,
    color: COLORS.text,
    textAlign: "center",
    opacity: 0.7,
  },
});

export default AddNewMember;