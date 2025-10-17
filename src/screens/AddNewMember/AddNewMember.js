import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import appTheme from "../../utils/Theme";
import MemberDetailsPage from "./MemberDetailsPage";
import SchemeDetailsPage from "./SchemeDetailsPage";
import { API_BASE_URL_OLD, API_BASE_URL } from "../../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { COLORS } = appTheme;

// All three schemes
const schemes = [
  { SchemeId: 1, schemeName: "BMG AMOUNT SCHEME", SchemeSName: "BAS" },
  { SchemeId: 2, schemeName: "BMG DIGI SILVER", SchemeSName: "BDS" },
  { SchemeId: 3, schemeName: "BMG FIXED DEPOSIT", SchemeSName: "BFD" },
];

const AddNewMember = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const { schemeId } = route.params || {};
  const [token, setToken] = useState(null);

  // Payment state
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

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

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment order details
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentPaymentData, setCurrentPaymentData] = useState(null);

  // Get scheme name
  const getSchemeName = (id) => {
    if (!id) return "No Scheme Selected";
    const numericId = Number(id);
    const scheme = schemes.find((s) => s.SchemeId === numericId);
    return scheme ? scheme.schemeName : "Unknown Scheme";
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
    if (!memberFormData.name?.trim()) errors.name = "Name is required";
    if (!memberFormData.mobile?.trim())
      errors.mobile = "Mobile number is required";
    else if (memberFormData.mobile.length !== 10)
      errors.mobile = "Mobile number must be 10 digits";
    if (!memberFormData.aadharNumber?.trim())
      errors.aadharNumber = "Aadhaar number is required";
    else if (memberFormData.aadharNumber.length !== 12)
      errors.aadharNumber = "Aadhaar number must be 12 digits";
    if (!memberFormData.panNumber?.trim())
      errors.panNumber = "PAN number is required";

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
  const initiatePayment = async (orderId, amount, defaultRegNo, defaultGroupCode) => {
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

      const paymentUrl = (await redirectRes.text()).replace(/^"+|"+$/g, "").trim();
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
        orderDetails: orderDetails
      };

      await AsyncStorage.setItem('paymentResponse', JSON.stringify(paymentData));
      console.log("💾 Payment data stored successfully in AsyncStorage");
    } catch (error) {
      console.error("❌ Error storing payment data:", error);
    }
  };

  // Submit member data after successful payment
  const submitMemberData = async (
    numericSchemeId,
    schemeFormData,
    groupCode,
    regNo
  ) => {
    try {
      const newMember = {
        title: memberData.namePrefix,
        initial: getDefaultInitial(memberData.name),
        pName: memberData.name,
        sName: memberData.surname,
        doorNo: memberData.doorNo,
        address1: memberData.address1,
        address2: memberData.address2,
        area: memberData.area,
        city: memberData.city,
        state: memberData.selectedState,
        country: memberData.country,
        pinCode: memberData.pincode,
        mobile: memberData.mobile,
        idProof: "Aadhaar",
        idProofNo: memberData.aadharNumber,
        panNumber: memberData.panNumber,
        dob: memberData.dob ? memberData.dob.toISOString().split("T")[0] : "",
        email: memberData.email,
        upDateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId: "999",
        appVer: "19.12.10.1",
      };

      const createSchemeSummary = {
        schemeId: numericSchemeId,
        groupCode,
        regNo,
        joinDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        upDateTime2: new Date().toISOString().slice(0, 19).replace("T", " "),
        openingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId2: "9999",
        amount: parseFloat(schemeFormData.amount || "0"),
        ...(numericSchemeId === 2 &&
          schemeFormData.calculatedWeight && {
            calculatedWeight: parseFloat(schemeFormData.calculatedWeight),
          }),
      };

      const schemeCollectInsert = {
        amount: parseFloat(schemeFormData.amount || "0"),
        modePay: schemeFormData.modePay,
        accCode: schemeFormData.accCode,
      };

      const requestBody = {
        newMember,
        createSchemeSummary,
        schemeCollectInsert,
      };

      const submitResponse = await fetch(`${API_BASE_URL_OLD}/member/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!submitResponse.ok) throw new Error(`HTTP ${submitResponse.status}`);

      return true;
    } catch (error) {
      console.error("Error submitting member data:", error);
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
      // Small delay to ensure payment is fully processed
      setTimeout(() => {
        handlePaymentSuccess();
      }, 2000);
    } else if (url.includes(failureUrl)) {
      setPaymentProcessed(true);
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!orderDetails?.merchantTxnNo) {
        throw new Error("No merchant transaction number found");
      }

      // Check payment status
      const paymentStatus = await checkPaymentStatus(orderDetails.merchantTxnNo);

      if (paymentStatus?.orderStatus === "PAID") {
        // Submit member data
        await submitMemberData(
          currentPaymentData.numericSchemeId,
          currentPaymentData.schemeData,
          currentPaymentData.groupCode,
          currentPaymentData.regNo
        );

        Alert.alert(
          "Success",
          `Member added successfully to ${getSchemeName(currentPaymentData.numericSchemeId)}!`,
          [{ text: "OK", onPress: () => {
            resetFormFields();
            navigation.navigate("MainLanding");
          }}]
        );
      } else {
        throw new Error("Payment not confirmed");
      }
    } catch (error) {
      console.error("Error in payment success handling:", error);
      Alert.alert(
        "Payment Warning",
        "Payment was successful but there was an issue saving member data. Please contact support.",
        [{ text: "OK", onPress: () => navigation.navigate("MainLanding") }]
      );
    } finally {
      setShowWebView(false);
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      "Payment Failed",
      "Your payment was not successful. Please try again.",
      [
        { 
          text: "OK", 
          onPress: () => {
            setShowWebView(false);
            setIsProcessingPayment(false);
          }
        }
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

      // If no matching amount found, just pick the first record (for schemes like BDS or BFD)
      if (!selectedRecord) {
        selectedRecord = apiData[0];
      }

      const groupCode = selectedRecord.GROUPCODE;
      const regNo =
        selectedRecord.CURRENTREGNO ||
        selectedRecord.REGNO ||
        generateRandomRegNo();

      await submitMemberData(numericSchemeId, schemeFormData, groupCode, regNo);

      Alert.alert(
        "Success",
        `Member added successfully to ${getSchemeName(numericSchemeId)}!`,
        [{ text: "OK", onPress: () => navigation.navigate("MainLanding") }]
      );

      resetFormFields();
    } catch (error) {
      console.error("Error during member creation:", error);
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

      // If no matching amount found, just pick the first record (for schemes like BDS or BFD)
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
  };

  const renderStep = () => {
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
            schemes={schemes}
            selectedSchemeId={schemeData.selectedSchemeId}
            schemeName={getSchemeName(schemeData.selectedSchemeId)}
            schemeOptions={schemeOptions}
            isFetchingSchemeOptions={isFetchingSchemeOptions}
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
});

export default AddNewMember;