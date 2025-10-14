import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import appTheme from "../../utils/Theme";
import MemberDetailsPage from "./MemberDetailsPage";
import SchemeDetailsPage from "./SchemeDetailsPage";
import { API_BASE_URL_OLD } from "../../Config/API";

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
      const response = await fetch(`${API_BASE_URL_OLD}/member/schemeid?schemeId=${schemeId}`);
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

  const handleBack = () => {
    navigation.navigate("MainLanding");
  };

  const getDefaultInitial = (firstName) => {
    if (!firstName || firstName.trim().length === 0) return "";
    return firstName.trim().charAt(0).toUpperCase();
  };

  const handleNextStep = (memberFormData) => {
    const errors = {};
    if (!memberFormData.name?.trim()) errors.name = "Name is required";
    if (!memberFormData.mobile?.trim()) errors.mobile = "Mobile number is required";
    else if (memberFormData.mobile.length !== 10) errors.mobile = "Mobile number must be 10 digits";
    if (!memberFormData.aadharNumber?.trim()) errors.aadharNumber = "Aadhaar number is required";
    else if (memberFormData.aadharNumber.length !== 12) errors.aadharNumber = "Aadhaar number must be 12 digits";
    if (!memberFormData.panNumber?.trim()) errors.panNumber = "PAN number is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert("Validation Error", "Please fill all required fields correctly.");
      return;
    }

    setMemberData(memberFormData);
    setCurrentStep(2);
  };

const handleSubmit = async (schemeFormData) => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  const numericSchemeId = Number(schemeFormData.selectedSchemeId);
  if (!numericSchemeId || isNaN(numericSchemeId)) {
    Alert.alert("Error", "Please select a valid scheme.");
    setIsSubmitting(false);
    return;
  }
  if (!schemeFormData.amount || parseFloat(schemeFormData.amount) <= 0) {
    Alert.alert("Error", "Please enter a valid amount.");
    setIsSubmitting(false);
    return;
  }
  if (!schemeFormData.accCode) {
    Alert.alert("Error", "Please select a payment mode.");
    setIsSubmitting(false);
    return;
  }

  try {
    // Fetch GROUPCODE and REGNO from API dynamically
    const response = await fetch(`${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const apiData = await response.json();

    if (!apiData || apiData.length === 0) throw new Error("No scheme data returned from API.");

    let selectedRecord;

    // Try to match by amount first
    if (schemeFormData.amount) {
      selectedRecord = apiData.find(
        (item) => parseFloat(item.AMOUNT || 0) === parseFloat(schemeFormData.amount)
      );
    }

    // If no matching amount found, just pick the first record (for schemes like BDS or BFD)
    if (!selectedRecord) {
      selectedRecord = apiData[0];
    }

    const groupCode = selectedRecord.GROUPCODE;
    const regNo = selectedRecord.CURRENTREGNO || selectedRecord.REGNO || generateRandomRegNo();

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
      ...(numericSchemeId === 2 && schemeFormData.calculatedWeight && {
        calculatedWeight: parseFloat(schemeFormData.calculatedWeight),
      }),
    };

    const schemeCollectInsert = {
      amount: parseFloat(schemeFormData.amount || "0"),
      modePay: schemeFormData.modePay,
      accCode: schemeFormData.accCode,
    };

    const requestBody = { newMember, createSchemeSummary, schemeCollectInsert };

    const submitResponse = await fetch(`${API_BASE_URL_OLD}/member/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!submitResponse.ok) throw new Error(`HTTP ${submitResponse.status}`);

    Alert.alert("Success", `Member added successfully to ${getSchemeName(numericSchemeId)}!`, [
      { text: "OK", onPress: () => navigation.navigate("MainLanding") },
    ]);

    resetFormFields();
  } catch (error) {
    console.error("Error during member creation:", error);
    Alert.alert("Submission Error", error.message || "Failed to create member. Please try again.");
  } finally {
    setIsSubmitting(false);
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
  };

  const renderStep = () => {
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
            onBack={() => setCurrentStep(1)}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting}
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
});

export default AddNewMember;
