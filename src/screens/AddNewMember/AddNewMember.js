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
  const { schemeId: routeSchemeId, schemeName: routeSchemeName } = route.params || {};

  // Debug logs
  console.log("🚀 AddNewMember mounted");
  console.log("Route params:", route.params);
  console.log("routeSchemeId:", routeSchemeId);
  console.log("routeSchemeName:", routeSchemeName);

  // Use state for scheme data - parse immediately
  const [selectedScheme, setSelectedScheme] = useState({
    id: routeSchemeId ? Number(routeSchemeId) : null,
    name: routeSchemeName || null
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
    dateOfBirth: "",
    anniversaryDate: "",
    maritalStatus: "",
    nomeni: "",
    mobile2: "",
  });

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
    setSchemeData(prev => ({
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
        const foundScheme = schemes.find((s) => s.SchemeId === selectedScheme.id);
        if (foundScheme) {
          setSelectedScheme(prev => ({
            ...prev,
            name: foundScheme.schemeName || routeSchemeName
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
    console.log("📋 Scheme selected from MemberDetailsPage:", { schemeId, schemeName });

    // Update selectedScheme state
    const numericId = Number(schemeId);
    setSelectedScheme({
      id: numericId,
      name: schemeName || getSchemeName(numericId)
    });

    // Update schemeData
    setSchemeData(prev => ({
      ...prev,
      selectedSchemeId: numericId,
    }));

    // Fetch options for the new scheme
    fetchSchemeOptions(numericId);
  };

  const getDefaultInitial = (firstName) => {
    if (!firstName || firstName.trim().length === 0) return "";
    return firstName.trim().charAt(0).toUpperCase();
  };

  const handleNextStep = (memberFormData = {}) => {
    console.log("📋 MemberDetailsPage onSubmit data:", memberFormData);

    // Hard safety check
    if (!memberFormData || typeof memberFormData !== "object") {
      Alert.alert("Error", "Invalid member details submitted");
      return;
    }

    // Check if scheme was selected in MemberDetailsPage
    if (memberFormData.selectedSchemeId) {
      const numericId = Number(memberFormData.selectedSchemeId);
      setSelectedScheme({
        id: numericId,
        name: memberFormData.selectedSchemeName || getSchemeName(numericId),
      });
    }

    // Store member data safely
    setMemberData(prev => ({
      ...prev,
      ...memberFormData,
    }));

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
        title: memberData.title || "Mr",   // ✅ FIX
        initial: getDefaultInitial(memberData.name),
        pName: memberData.name || "",
        sName: memberData.surname || "",
        doorNo: memberData.doorNo || "",
        address1: memberData.address1 || "",
        address2: memberData.address2 || "",
        area: memberData.area || "",
        city: memberData.city || "",
        state: memberData.selectedState || "",
        country: "India",
        pinCode: memberData.pincode || "", // ✅ FIX (capital C)
        mobile: memberData.mobile || "",
        nomeni: memberData.nomeni,
        mobile2: memberData.mobile2 || "",
        idProof: "Aadhaar",
        idProofNo: memberData.aadharNumber || "",
        panNumber: memberData.panNumber || "",
        dob: memberData.dateOfBirth || "",
        anniversaryDate: memberData.anniversaryDate
          ? `${memberData.anniversaryDate} 00:00:00`
          : "", // ✅ FIX
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
        userId2: "999", // ✅ FIX
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
          chqBankCode: schemeFormData.accCode ||"ONLINE",
          chqCardNo: resp?.txnID || "N/A",
          chqBranch: resp?.paymentSubInstType || "N/A",
          chkBank: resp?.paymentMode || "N/A",
          chqRtnReason: resp?.merchantTxnNo || "N/A",
        };
      }

      // 4️⃣ Scheme Collection Insert
      const schemeCollectInsert = {
        amount: Number(schemeFormData.amount),
        modePay: schemeFormData.modePay, // "O" or "C"
        accCode: "1", // must be numeric "1"
        chqBankCode: "1",
        chqCardNo: paymentDetails.chqCardNo,
        chqBranch: paymentDetails.chqBranch,
        chkBank: paymentDetails.chkBank,
        chqRtnReason: paymentDetails.chqRtnReason,
      };

      console.log("schemecollect", schemeCollectInsert)


      // 5️⃣ Final Request Body
      const requestBody = {
        newMember,
        createSchemeSummary,
        schemeCollectInsert,
        referralCode: ReferralCode || "",
      };

      console.log("Submit Member Data", requestBody);
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

        // 3️⃣ Send Join Scheme Notification
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

      // Send Join Scheme Notification for cash payment
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
      dateOfBirth: "",
      anniversaryDate: "",
      maritalStatus: "",
      nomeni: "",
      mobile2: "",
    });

    // Reset to original route scheme if available
    setSelectedScheme({
      id: routeSchemeId ? Number(routeSchemeId) : null,
      name: routeSchemeName || null
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