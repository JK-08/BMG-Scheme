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
import { sendJoinSchemeNotification } from "../../services/CommonNotificationService"; // NEW IMPORT
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
    return data; // Array of schemes
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
  const { schemeId, schemeName } = route.params || {};

  const [token, setToken] = useState(null);

  // Payment state
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // NEW STATE: Track payment completion and processing status
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false); // NEW: For showing loading after WebView closes
  const nowDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [memberData, setMemberData] = useState({
    namePrefix: "Mr",
    name: "",
    surname: "",
    doorNo: "",
    address1: "",
    address2: "",
    area: "",
    city: "",
    pincode: "",
    selectedState: "",
    country: "India",
    mobile: "",
    email: "",
    panNumber: "",
    aadharNumber: "",
    dob: null,
  });

  const [schemeData, setSchemeData] = useState({
    selectedSchemeId: schemeId ? Number(schemeId) : null,
    selectedGroupCodeObj: null,
    selectedCurrentRegNoObj: null,
    amount: "",
    accCode: "",
    modePay: "C",
    calculatedWeight: "",
  });

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

  //Referal

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

  // NEW EFFECT: Handle payment completion
  useEffect(() => {
    if (paymentCompleted) {
      // Directly navigate to home after payment completion
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
    } catch (error) {
      console.error("Error fetching all schemes:", error);
      Alert.alert("Error", "Failed to fetch schemes. Please try again.");
    } finally {
      setIsFetchingSchemes(false);
    }
  };

  // Get scheme name based on scheme type logic
  const getSchemeName = (id) => {
    if (!id) return schemeName || "No Scheme Selected";
    const numericId = Number(id);
    const scheme = allSchemes.find((s) => s.SchemeId === numericId);

    if (!scheme) return schemeName || "Unknown Scheme";

    // Return the actual scheme name from API response
    return scheme.schemeName || schemeName || "Unknown Scheme";
  };

  // Get scheme short name from API response
  // const getSchemeShortName = (id) => {
  //   if (!id) return "";
  //   const numericId = Number(id);
  //   const scheme = allSchemes.find((s) => s.SchemeId === numericId);

  //   if (!scheme) return "";

  //   // Return the actual scheme short name from API response
  //   return scheme.SchemeSName || "";
  // };

  // Get scheme type for internal logic (this can still use the logic)
  // const getSchemeType = (id) => {
  //   if (!id) return null;
  //   const numericId = Number(id);
  //   const scheme = allSchemes.find((s) => s.SchemeId === numericId);

  //   if (!scheme) return null;

  //   // Use the logic to determine scheme type without hardcoding names
  //   if (scheme.WeightLedger === "N" && scheme.FixedIns === "Y") {
  //     return "AMOUNT_SCHEME";
  //   } else if (scheme.WeightLedger === "Y" && scheme.FixedIns === "N") {
  //     return "DIGI_SILVER";
  //   } else if (scheme.WeightLedger === "N" && scheme.FixedIns === "N") {
  //     return "FIXED_DEPOSIT";
  //   } else {
  //     return "OTHER";
  //   }
  // };

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
    if (schemeId) {
      const numericSchemeId = Number(schemeId);
      setSchemeData((prev) => ({ ...prev, selectedSchemeId: numericSchemeId }));
      fetchSchemeOptions(numericSchemeId);
    }
  }, [schemeId]);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem("authToken");
      console.log("🟢 Saved token:", savedToken);
      if (savedToken) setToken(savedToken);
    })();
  }, []);

  const handleBack = () => {
    if (showWebView) {
      // If in payment flow, go back to scheme details
      setShowWebView(false);
      setPaymentUrl("");
      setIsProcessingPayment(false);
      setProcessingPayment(false); // Reset processing state
    } else if (currentStep === 2) {
      // If in scheme details, go back to member details
      setCurrentStep(1);
    } else {
      // If in member details, go to main landing
      navigation.navigate("MainLanding");
    }
  };

  const getDefaultInitial = (firstName) => {
    if (!firstName || firstName.trim().length === 0) return "";
    return firstName.trim().charAt(0).toUpperCase();
  };

  const handleNextStep = (memberFormData) => {
    const errors = {};

    // Validate name
    if (!memberFormData.name?.trim()) {
      errors.name = "Name is required";
    }

    // Validate mobile
    if (!memberFormData.mobile?.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (memberFormData.mobile.length !== 10) {
      errors.mobile = "Mobile number must be 10 digits";
    }

    // Validate email if provided
    if (memberFormData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(memberFormData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Validate Aadhar number if provided
    if (memberFormData.aadharNumber?.trim()) {
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(memberFormData.aadharNumber)) {
        errors.aadharNumber = "Aadhar number must be 12 digits";
      }
    }

    // Validate PAN number if provided
    if (memberFormData.panNumber?.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(memberFormData.panNumber.toUpperCase())) {
        errors.panNumber = "Please enter a valid PAN number";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly."
      );
      return;
    }

    setMemberData(memberFormData);
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
        `https://scheme.bmgjewellers.com/api/orders/create`,
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentPayload),
      });
      const initiateData = await initiateRes.json();
      console.log("Initiate payment response:", initiateData);
      if (!initiateRes.ok) throw new Error(initiateData.message);

      if (!initiateData.tranCtx) throw new Error("Transaction context missing");

      // Step 2: Get redirect/payment URL using tranCtx
      const redirectRes = await fetch(`${API_BASE_URL}/payment/redirect-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        "https://scheme.bmgjewellers.com/api/v1/payment/status",
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

  // Submit member data after successful payment
  // Submit member data after successful payment
  const submitMemberData = async (
    numericSchemeId,
    schemeFormData,
    groupCode,
    regNo,
    paymentResponse = null,
    cashPayment = false // Flag for cash payment
  ) => {
    try {
      // 1️⃣ Member Details
      const newMember = {
        title: "",
        initial: getDefaultInitial(memberData.name),
        pName: memberData.name || "",
        sName: memberData.surname || "",
        doorNo: memberData.doorNo || "",
        address1: memberData.address1 || "",
        address2: memberData.address2 || "",
        area: memberData.area || "",
        city: memberData.city || "",
        state: memberData.selectedState || "",
        country: memberData.country || "India",
        pinCode: memberData.pincode || "",
        mobile: memberData.mobile || "",
        idProof: "Aadhaar",
        idProofNo: memberData.aadharNumber || "",
        panNumber: memberData.panNumber || "",
        dob: memberData.dob || "",
        email: memberData.email || "",
        upDateTime: nowDateTime,
        userId: "999",
        appVer: "WEB",
      };

      // 2️⃣ Scheme Summary
      const createSchemeSummary = {
        schemeId: numericSchemeId,
        groupCode,
        regNo,
        joinDate: nowDateTime,
        upDateTime2: nowDateTime,
        openingDate: nowDateTime,
        userId2: "9999",
      };

      // 3️⃣ Payment Details (Fail-safe)
      let paymentDetails = {
        chqBankCode: "",
        chqCardNo: "",
        chqBranch: "",
        chkBank: "",
        chqRtnReason: "",
      };

      if (cashPayment) {
        // Cash payment defaults
        const { cardNumber, rtnReason } = generateCashPaymentDetails();
        paymentDetails = {
          chqBankCode: schemeFormData.accCode || "CASH",
          chqCardNo: cardNumber || "0000000000",
          chqBranch: "Received",
          chkBank: "CASH",
          chqRtnReason: rtnReason || "CASH-000000",
        };
      } else if (paymentResponse?.payphiResponse) {
        // Online payment from API response
        const resp = paymentResponse.payphiResponse;
        paymentDetails = {
          chqBankCode: schemeFormData.accCode || resp?.bankCode || "",
          chqCardNo: resp?.txnID || "N/A",
          chqBranch: resp?.paymentSubInstType || "N/A",
          chkBank: resp?.paymentMode || "N/A",
          chqRtnReason: resp?.merchantTxnNo || "N/A",
        };
      }

      // 4️⃣ Scheme Collection Insert
      const schemeCollectInsert = {
        amount: parseFloat(schemeFormData.amount || "0"),
        modePay: schemeFormData.modePay || "C",
        accCode: schemeFormData.accCode || "CASH",
        ...paymentDetails,
      };

      // 5️⃣ Final Request Body
      const requestBody = {
        newMember,
        createSchemeSummary,
        schemeCollectInsert,
        referralCode: ReferralCode || "", // Include referral code here
      };

      // 6️⃣ Submit API Call
      const submitResponse = await fetch(`${API_BASE_URL_OLD}/member/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!submitResponse.ok) throw new Error(`HTTP ${submitResponse.status}`);
      const responseData = await submitResponse.json();
      console.log("✅ Member Create API Response:", responseData);

      return true;
    } catch (error) {
      console.error("❌ Error submitting member data:", error);
      throw error;
    }
  };

  // Handle WebView navigation changes
  const handleWebViewNavigation = (navState) => {
    const { url } = navState;
    console.log("🌐 Navigating to:", url);

    if (paymentProcessed) return;

    const successUrl = "https://bmgjewellers.com/payment-success";
    const failureUrl = "https://bmgjewellers.com/payment-failure";

    if (url.includes(successUrl)) {
      setPaymentProcessed(true);
      // Immediately hide WebView and show loading while processing
      setShowWebView(false);
      setProcessingPayment(true); // Show loading indicator
      setTimeout(() => {
        handlePaymentSuccess();
      }, 1000);
    } else if (url.includes(failureUrl)) {
      setPaymentProcessed(true);
      // Immediately hide WebView and show loading while processing
      setShowWebView(false);
      setProcessingPayment(true); // Show loading indicator
      setTimeout(() => {
        handlePaymentFailure();
      }, 1000);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!orderDetails?.merchantTxnNo) {
        throw new Error("No merchant transaction number found");
      }

      // Check payment status
      const paymentStatus = await checkPaymentStatus(
        orderDetails.merchantTxnNo
      );

      if (paymentStatus?.orderStatus === "PAID") {
        // 1️⃣ Submit Member Data with payment response
        await submitMemberData(
          currentPaymentData.numericSchemeId,
          currentPaymentData.schemeData,
          currentPaymentData.groupCode,
          currentPaymentData.regNo,
          paymentStatus // Pass the payment status response
        );

        // 2️⃣ Send Welcome SMS
        try {
          await smsService.sendWelcomeSMS(
            memberData.mobile,
            memberData.name,
            getSchemeName(currentPaymentData.numericSchemeId),
            currentPaymentData.schemeData.amount,
            new Date().toISOString().slice(0, 10),
            "BMG JEWELLERS PVT LTD"
          );
          console.log("📩 Welcome SMS sent");
        } catch (smsErr) {
          console.log("❌ SMS sending failed:", smsErr);
        }

        // 3️⃣ NEW: Send Join Scheme Notification
        try {
          await sendJoinSchemeNotification(
            currentPaymentData.numericSchemeId,
            parseFloat(currentPaymentData.schemeData.amount),
            getSchemeName(currentPaymentData.numericSchemeId)
          );
          console.log("🔔 Join Scheme Notification sent");
        } catch (notifErr) {
          console.log("❌ Notification sending failed:", notifErr);
        }

        // Hide loading and show success popup
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
        throw new Error("Payment not confirmed");
      }
    } catch (error) {
      console.error("Error in payment success handling:", error);
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
    // Hide loading and show failure popup
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

    const numericSchemeId = Number(schemeFormData.selectedSchemeId);
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
      const response = await fetch(
        `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiData = await response.json();
      if (!apiData || apiData.length === 0)
        throw new Error("No scheme data returned from API.");

      let selectedRecord;

      if (schemeFormData.amount) {
        selectedRecord = apiData.find(
          (item) =>
            parseFloat(item.AMOUNT || 0) === parseFloat(schemeFormData.amount)
        );
      }

      if (!selectedRecord) selectedRecord = apiData[0];

      const groupCode = selectedRecord.GROUPCODE;
      const regNo =
        selectedRecord.CURRENTREGNO ||
        selectedRecord.REGNO ||
        generateRandomRegNo();

      // ✅ Submit member data for CASH payment
      await submitMemberData(
        numericSchemeId,
        schemeFormData,
        groupCode,
        regNo,
        null, // no online payment
        true // cash payment flag
      );

      // Send welcome SMS
      await smsService.sendWelcomeSMS(
        memberData.mobile,
        memberData.name,
        getSchemeName(numericSchemeId),
        schemeFormData.amount,
        new Date().toISOString().slice(0, 10),
        "BMG JEWELLERS PVT LTD"
      );

      // NEW: Send Join Scheme Notification for cash payment
      try {
        await sendJoinSchemeNotification(
          numericSchemeId,
          parseFloat(schemeFormData.amount),
          getSchemeName(numericSchemeId)
        );
        console.log("🔔 Join Scheme Notification sent (Cash)");
      } catch (notifErr) {
        console.log("❌ Notification sending failed:", notifErr);
      }

      Alert.alert(
        "Success",
        `Member added successfully to ${getSchemeName(numericSchemeId)}!`,
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
      console.error("Error during member creation (cash):", error);
      Alert.alert(
        "Submission Error",
        error.message || "Failed to create member. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const processOnlinePayment = async (schemeFormData, numericSchemeId) => {
    setIsProcessingPayment(true);
    try {
      // Fetch GROUPCODE and REGNO from API dynamically
      const response = await fetch(
        `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiData = await response.json();

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

      // Prepare data for payment flow
      const defaultName = `${memberData.name} ${memberData.surname}`.trim();
      const defaultContact = memberData.mobile;
      const amount = schemeFormData.amount;

      // Step 1: Create payment order
      const orderData = await createPaymentOrder(
        amount,
        defaultName,
        defaultContact,
        regNo,
        groupCode
      );

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
        personalInfo: {
          name: memberData.name,
          surname: memberData.surname,
          mobile: memberData.mobile,
          email: memberData.email,
        },
      };

      // Store data for later use
      setOrderDetails(currentOrderDetails);
      setCurrentPaymentData({
        numericSchemeId,
        schemeData: schemeFormData,
        groupCode,
        regNo,
      });

      // Show WebView
      setPaymentUrl(paymentData.paymentUrl);
      setShowWebView(true);
      setPaymentProcessed(false);
    } catch (error) {
      console.error("Error during payment processing:", error);
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
    setMemberData({
      namePrefix: "Mr",
      name: "",
      surname: "",
      doorNo: "",
      address1: "",
      address2: "",
      area: "",
      city: "",
      pincode: "",
      selectedState: "",
      country: "India",
      mobile: "",
      email: "",
      panNumber: "",
      aadharNumber: "",
      dob: null,
    });

    setSchemeData({
      selectedSchemeId: schemeId ? Number(schemeId) : null,
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
    setProcessingPayment(false); // Reset processing state
  };

  // NEW: Loading component for payment processing
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
    // If payment is completed, don't render anything (will navigate to home)
    if (paymentCompleted) {
      return null;
    }

    // NEW: Show loading indicator while processing payment after WebView closes
    if (processingPayment) {
      return renderProcessingPayment();
    }

    if (showWebView) {
      // Render WebView for payment
      return (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleWebViewNavigation}
            onLoadStart={() => setPaymentLoading(true)}
            onLoadEnd={() => setPaymentLoading(false)}
            startInLoadingState={true}
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
            memberData={memberData}
            onNext={handleNextStep}
            onBack={handleBack}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
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
            API_BASE_URL={API_BASE_URL_OLD}
            schemes={allSchemes} // Pass dynamically fetched schemes
            selectedSchemeId={schemeData.selectedSchemeId}
            schemeName={getSchemeName(schemeData.selectedSchemeId)}
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
  // NEW: Styles for payment processing screen
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
