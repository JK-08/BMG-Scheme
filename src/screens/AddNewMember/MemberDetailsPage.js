import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTab } from "../../components";
import { SHADOWS, COLORS, SIZES, FONTS } from "../../utils/AppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  validateAadhaar,
  validatePAN,
  validateMobile,
  validateEmail,
  validatePincode,
} from "./Validations";
import {
  startDigiLockerFlow,
  verifyAndFetchAadhaarData,
} from "../../services/DigiLockerService";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  dateOfBirth: "",
  maritalStatus: "",
  anniversaryDate: "",
  doorNo: "",
  street: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  nomeni: "",
  mobile2: "",
  panNumber: "",
  aadharNumber: "",
  selectedSchemeId: null,
  selectedSchemeName: "",
};

const AADHAAR_STATUS = {
  NOT_STARTED: "not_started",
  VERIFICATION_INITIATED: "verification_initiated",
  PENDING: "pending",
  VERIFIED: "verified",
  FAILED: "failed",
  EXPIRED: "expired",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper functions for Aadhaar data processing
const extractAllDetailsFromAadhaar = (aadhaarData) => {
  if (!aadhaarData) {
    return {
      name: "",
      dob: "",
      gender: "",
      address: null,
      rawData: null
    };
  }

  // Extract basic details
  const name = aadhaarData.name || "";
  const dob = aadhaarData.dob || "";
  const gender = aadhaarData.gender || "";
  
  // Extract and format address
  const address = aadhaarData.split_address ? {
    doorNo: aadhaarData.split_address.house || "",
    street: aadhaarData.split_address.street || "",
    area: aadhaarData.split_address.vtc || aadhaarData.split_address.locality || "",
    pincode: aadhaarData.split_address.pincode || "",
    city: aadhaarData.split_address.dist || aadhaarData.split_address.city || "",
    state: aadhaarData.split_address.state || "",
    country: aadhaarData.split_address.country || "India",
    landmark: aadhaarData.split_address.landmark || "",
    po: aadhaarData.split_address.po || "",
    subdist: aadhaarData.split_address.subdist || ""
  } : null;

  // Extract care_of (father's name)
  const careOf = aadhaarData.care_of || "";
  const fatherName = careOf.replace(/^S\/O:\s*/i, "").replace(/^C\/O:\s*/i, "");

  return {
    name,
    dob,
    gender,
    address,
    fatherName,
    rawData: aadhaarData
  };
};

const formatAadhaarDate = (dobString) => {
  if (!dobString) return "";
  const [day, month, year] = dobString.split("-");
  return `${year}-${month}-${day}`;
};

const getGenderDisplay = (genderCode) => {
  const genderMap = {
    'M': 'Male',
    'F': 'Female',
    'T': 'Transgender'
  };
  return genderMap[genderCode] || genderCode;
};

const MemberDetailsPage = ({
  onNext,
  onBack,
  onSchemeSelect,
  validationErrors,
  setValidationErrors,
  initialSchemeId,
  initialSchemeName,
  allSchemes,
  isFetchingSchemes
}) => {
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const navigation = useNavigation();
  const route = useRoute();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [formDisabled, setFormDisabled] = useState(true);

  // Enhanced Aadhaar state management
  const [aadhaarStatus, setAadhaarStatus] = useState(
    AADHAAR_STATUS.NOT_STARTED
  );
  const [aadhaarVerificationId, setAadhaarVerificationId] = useState("");
  const [aadhaarPollingCount, setAadhaarPollingCount] = useState(0);
  const [showAddressConfirmModal, setShowAddressConfirmModal] = useState(false);
  const [aadhaarAddress, setAadhaarAddress] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isCheckingExistingVerification, setIsCheckingExistingVerification] =
    useState(false);

  // Scheme selection state
  const [selectedScheme, setSelectedScheme] = useState({
    id: initialSchemeId || null,
    name: initialSchemeName || "Select a Scheme"
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    day: "01",
    month: "01",
    year: "1990",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // Polling timer ref
  const pollingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
    };
  }, []);

  // LOAD SAVED FORM + AADHAAR STATUS
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stored = await AsyncStorage.getItem("digigoldMemberForm");
        const savedData = stored ? JSON.parse(stored) : {};

        const [email, username, phone] = await Promise.all([
          AsyncStorage.getItem("userEmail"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("userPhoneNumber"),
        ]);

        setFormData((prev) => ({
          ...prev,
          ...savedData,
          name: username || savedData.name || "",
          mobile: phone || savedData.mobile || "",
          email: email || savedData.email || "",
          selectedSchemeId: initialSchemeId || savedData.selectedSchemeId || null,
          selectedSchemeName: initialSchemeName || savedData.selectedSchemeName || "",
        }));

        // Update selectedScheme state
        if (initialSchemeId || savedData.selectedSchemeId) {
          setSelectedScheme({
            id: initialSchemeId || savedData.selectedSchemeId,
            name: initialSchemeName || savedData.selectedSchemeName || "Select a Scheme"
          });
        }

        if (savedData.dateOfBirth) {
          const [year, month, day] = savedData.dateOfBirth.split("-");
          setSelectedDate({ day, month, year });
        }

        // Load Aadhaar verification status
        await loadAadhaarStatus();
      } catch (e) {
        console.error("Load error:", e);
      }
    };

    loadInitialData();
  }, [initialSchemeId, initialSchemeName]);
  

  // Handle route params from WebView
  useEffect(() => {
    console.log("🔄 Route params changed:", route.params);

    const handleVerificationCallback = async () => {
      if (route.params?.verificationId) {
        console.log("🎯 Received verification ID from route:", route.params.verificationId);

        const verificationId = route.params.verificationId;

        try {
          // Save to AsyncStorage first
          console.log("💾 Saving verification ID immediately:", verificationId);
          await AsyncStorage.setItem("aadhaarVerificationId", verificationId);
          await AsyncStorage.setItem("aadhaarVerificationStatus", AADHAAR_STATUS.PENDING);

          // Update state
          console.log("🔄 Updating state with verification ID:", verificationId);
          setAadhaarVerificationId(verificationId);
          setAadhaarStatus(AADHAAR_STATUS.PENDING);
          setLoading(true);

          // Start polling immediately
          console.log("🚀 Starting polling for verification ID:", verificationId);
          pollForAadhaarData();

        } catch (error) {
          console.error("❌ Error handling verification callback:", error);
          Alert.alert("Error", "Failed to process verification. Please try again.");
          setLoading(false);
        }
      }

      if (route.params?.verificationFailed) {
        Alert.alert("Verification Failed", "Aadhaar verification failed. Please try again.");
        setAadhaarStatus(AADHAAR_STATUS.FAILED);
        setLoading(false);
      }
    };

    handleVerificationCallback();
  }, [route.params]);

  // Load Aadhaar status from storage
  const loadAadhaarStatus = async () => {
    try {
      const [status, savedVerificationId, savedAadhaarData] = await Promise.all([
        AsyncStorage.getItem("aadhaarVerificationStatus"),
        AsyncStorage.getItem("aadhaarVerificationId"),
        AsyncStorage.getItem("aadhaarData"),
      ]);

      console.log("Loaded from storage:", { status, savedVerificationId });

      if (savedVerificationId) {
        setAadhaarVerificationId(savedVerificationId);

        if (status === AADHAAR_STATUS.VERIFIED && savedAadhaarData) {
          try {
            const parsedData = JSON.parse(savedAadhaarData);
            setAadhaarData(parsedData);
            setAadhaarAddress(parsedData.address || null);
            setAadhaarStatus(AADHAAR_STATUS.VERIFIED);
            setFormDisabled(false);
            
            // Auto-fill data if we have it
            if (parsedData) {
              autoFillFromAadhaar(parsedData);
            }
          } catch (e) {
            console.error("Error parsing saved Aadhaar data:", e);
          }
        } else if (status === AADHAAR_STATUS.PENDING) {
          setAadhaarStatus(AADHAAR_STATUS.PENDING);
          pollForAadhaarData();
        }
      }
    } catch (error) {
      console.error("Error loading Aadhaar status:", error);
    }
  };

  // Auto-check verification when Aadhaar number changes
  useEffect(() => {
    const checkExistingVerification = async () => {
      if (
        formData.aadharNumber.length === 12 &&
        !isCheckingExistingVerification
      ) {
        setIsCheckingExistingVerification(true);

        try {
          const savedAadhaarData = await AsyncStorage.getItem("aadhaarData");
          const savedVerificationId = await AsyncStorage.getItem("aadhaarVerificationId");

          if (savedAadhaarData && savedVerificationId) {
            const parsedData = JSON.parse(savedAadhaarData);
            const savedAadhaarNum = parsedData.uid?.replace(/\D/g, "") || "";
            const enteredAadhaarNum = formData.aadharNumber.replace(/\D/g, "");

            if (savedAadhaarNum === enteredAadhaarNum) {
              // Same Aadhaar number, load existing verification
              await loadAadhaarStatus();
            } else {
              // Different Aadhaar number, reset verification
              await resetAadhaarVerification();
            }
          }
        } catch (error) {
          console.error("Error checking existing verification:", error);
        } finally {
          setIsCheckingExistingVerification(false);
        }
      } else if (formData.aadharNumber.length < 12) {
        setFormDisabled(true);
      }
    };

    const timeoutId = setTimeout(checkExistingVerification, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.aadharNumber]);

  // Enable/disable form based on Aadhaar verification status
  useEffect(() => {
    if (aadhaarStatus === AADHAAR_STATUS.VERIFIED) {
      setFormDisabled(false);
    } else {
      setFormDisabled(true);
    }
  }, [aadhaarStatus]);

  // SAVE FORM ON CHANGE
  useEffect(() => {
    const dataToSave = {
      ...formData,
      selectedSchemeId: selectedScheme.id,
      selectedSchemeName: selectedScheme.name,
    };
    AsyncStorage.setItem("digigoldMemberForm", JSON.stringify(dataToSave)).catch(
      (err) => console.error("Save error:", err)
    );
  }, [formData, selectedScheme]);

  // KEYBOARD HANDLING
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);

      if (activeInput && inputRefs.current[activeInput]) {
        setTimeout(() => {
          inputRefs.current[activeInput].measureLayout(
            scrollViewRef.current,
            (x, y, w, h) => {
              scrollViewRef.current?.scrollTo({
                y: y - 80,
                animated: true,
              });
            }
          );
        }, 100);
      }
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [activeInput]);

  // FETCH PINCODE -> DISTRICT & STATE
  useEffect(() => {
    if (formData.pincode.length !== 6) {
      setFormData((prev) => ({ ...prev, city: "", state: "" }));
      return;
    }

    const fetchLocation = async () => {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${formData.pincode}`
        );
        const data = await response.json();

        if (data[0]?.Status === "Success") {
          const district = data[0].PostOffice[0].District || "";
          const state = data[0].PostOffice[0].State || "";

          setFormData((prev) => ({
            ...prev,
            city: district,
            state: state,
          }));
        } else {
          setFormData((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch (e) {
        console.error("Pincode fetch error:", e);
      }
    };

    fetchLocation();
  }, [formData.pincode]);

  // Reset Aadhaar verification
  const resetAadhaarVerification = async () => {
    setAadhaarStatus(AADHAAR_STATUS.NOT_STARTED);
    setAadhaarVerificationId("");
    setAadhaarData(null);
    setAadhaarAddress(null);
    setFormDisabled(true);

    await AsyncStorage.multiRemove([
      "aadhaarVerificationId",
      "aadhaarVerificationStatus",
      "aadhaarData",
    ]);
  };

  // FIELD UPDATE HANDLER
  const updateField = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));

    // Clear any existing error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear Aadhaar verification if Aadhaar number changes
    if (field === "aadharNumber" && aadhaarStatus === AADHAAR_STATUS.VERIFIED) {
      resetAadhaarVerification();
    }
  };

  // Auto-fill all details from Aadhaar
  const autoFillFromAadhaar = (aadhaarData) => {
    if (!aadhaarData) return;

    const extractedData = extractAllDetailsFromAadhaar(aadhaarData);
    const address = extractedData.address;

    console.log("📋 Auto-filling details from Aadhaar:", extractedData);

    // Auto-fill name
    if (extractedData.name) {
      updateField("name", extractedData.name);
    }

    // Auto-fill date of birth
    if (extractedData.dob) {
      const formattedDOB = formatAadhaarDate(extractedData.dob);
      updateField("dateOfBirth", formattedDOB);
      
      // Also update the selectedDate state for date picker
      if (formattedDOB) {
        const [year, month, day] = formattedDOB.split("-");
        setSelectedDate({ day, month, year });
      }
    }

    // Auto-fill address if available
    if (address) {
      setFormData((prev) => ({
        ...prev,
        doorNo: address.doorNo || "",
        street: address.street || "",
        area: address.area || "",
        pincode: address.pincode || "",
        city: address.city || "",
        state: address.state || "",
      }));
    }

    // Extract father's name from care_of (can be used for nominee if needed)
    if (extractedData.fatherName && !formData.nomeni) {
      // Optionally set nominee as father's name if nominee field is empty
      updateField("nomeni", extractedData.fatherName);
      console.log("Father's name available:", extractedData.fatherName);
    }
  };

  // Extract address from Aadhaar data
  const extractAddressFromAadhaar = (aadhaarData) => {
    if (!aadhaarData || !aadhaarData.split_address) {
      return {
        doorNo: "",
        street: "",
        area: "",
        pincode: "",
        city: "",
        state: "",
        country: "India"
      };
    }

    const addr = aadhaarData.split_address;
    return {
      doorNo: addr.house || "",
      street: addr.street || "",
      area: addr.vtc || addr.locality || "",
      pincode: addr.pincode || "",
      city: addr.dist || addr.city || "",
      state: addr.state || "",
      country: addr.country || "India",
      landmark: addr.landmark || "",
      po: addr.po || "",
      subdist: addr.subdist || ""
    };
  };

  // Enhanced AADHAAR VERIFICATION HANDLERS
  const verifyAadhaar = async () => {
    const aadhaarErr = validateAadhaar(formData.aadharNumber || "");
    if (aadhaarErr) {
      Alert.alert("Invalid Aadhaar", aadhaarErr);
      return;
    }

    setLoading(true);
    setAadhaarStatus(AADHAAR_STATUS.VERIFICATION_INITIATED);

    try {
      const verificationId = `VER_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Save to AsyncStorage immediately
      await AsyncStorage.multiSet([
        ["aadhaarVerificationId", verificationId],
        ["aadhaarVerificationStatus", AADHAAR_STATUS.VERIFICATION_INITIATED],
      ]);

      // Update state
      setAadhaarVerificationId(verificationId);

      const result = await startDigiLockerFlow({
        verificationId,
        redirectUrl: "https://bmgjewellers.com",
      });

      if (result.step === "URL_CREATED") {
        // Open DigiLocker WebView
        navigation.navigate("DigiLockerWebViewScreen", {
          url: result.url,
          verificationId: verificationId,
        });
      } else {
        throw new Error("Failed to start verification");
      }
    } catch (error) {
      console.error("Verify Aadhaar error:", error);
      setAadhaarStatus(AADHAAR_STATUS.FAILED);
      Alert.alert("Error", "Failed to start Aadhaar verification");
      setLoading(false);
    }
  };

  const MAX_POLL_ATTEMPTS = 15;
  const POLL_INTERVAL = 2000;

  const pollForAadhaarData = async (attempt = 1) => {
    try {
      if (attempt === 1) {
        console.log("🔄 Starting polling process...");
        setLoading(true);
        setAadhaarPollingCount(0);
        setAadhaarStatus(AADHAAR_STATUS.PENDING);
      }

      // Always get verification ID from AsyncStorage to ensure we have the latest
      const verificationIdToUse = await AsyncStorage.getItem("aadhaarVerificationId");

      if (!verificationIdToUse) {
        console.error("❌ No verification ID found for polling");
        setAadhaarStatus(AADHAAR_STATUS.FAILED);
        setLoading(false);
        Alert.alert("Error", "Verification ID not found. Please try again.");
        return;
      }

      console.log(`🔄 Polling attempt ${attempt} with ID:`, verificationIdToUse);
      setAadhaarPollingCount(attempt);

      const result = await verifyAndFetchAadhaarData(verificationIdToUse);
      console.log("📊 Poll result:", result);

      if (result.step === "SUCCESS") {
        console.log("✅ Verification successful!");
        const fetchedData = result.data;
        const address = extractAddressFromAadhaar(fetchedData);

        setAadhaarData(fetchedData);
        setAadhaarAddress(address);
        setAadhaarStatus(AADHAAR_STATUS.VERIFIED);
        setLoading(false);

        await AsyncStorage.multiSet([
          ["aadhaarVerificationStatus", AADHAAR_STATUS.VERIFIED],
          ["aadhaarData", JSON.stringify({ ...fetchedData, address })],
        ]);

        // Auto-fill all details from Aadhaar
        autoFillFromAadhaar(fetchedData);

        // Show address confirmation modal
        setTimeout(() => {
          setShowAddressConfirmModal(true);
        }, 500);

        return;
      }

      if (result.step === "PENDING") {
        if (attempt >= MAX_POLL_ATTEMPTS) {
          console.log("⏰ Polling timeout reached");
          setAadhaarStatus(AADHAAR_STATUS.EXPIRED);
          setLoading(false);
          Alert.alert(
            "Verification Timeout",
            "Aadhaar verification is taking longer than expected. Please try again."
          );
        } else {
          // Continue polling
          console.log("⏳ Still pending, continuing polling...");
          setTimeout(() => pollForAadhaarData(attempt + 1), POLL_INTERVAL);
        }
        return;
      }

      if (result.step === "FAILED") {
        throw new Error("Verification failed on server");
      }

    } catch (error) {
      console.error("❌ Polling error:", error);
      setAadhaarStatus(AADHAAR_STATUS.FAILED);
      setLoading(false);
      Alert.alert(
        "Verification Failed",
        "Unable to verify Aadhaar. Please try again."
      );
    }
  };

  // Clear Aadhaar verification
  const clearAadhaarVerification = async () => {
    try {
      await resetAadhaarVerification();
      Alert.alert("Cleared", "Aadhaar verification has been cleared.");
    } catch (error) {
      console.error("Error clearing Aadhaar:", error);
    }
  };

  const handleUseAadhaarAddress = () => {
    if (aadhaarAddress) {
      setFormData((prev) => ({
        ...prev,
        doorNo: aadhaarAddress.doorNo || "",
        street: aadhaarAddress.street || "",
        area: aadhaarAddress.area || "",
        pincode: aadhaarAddress.pincode || "",
        city: aadhaarAddress.city || "",
        state: aadhaarAddress.state || "",
      }));
    }
    setShowAddressConfirmModal(false);
  };

  const handleManualAddress = () => {
    setShowAddressConfirmModal(false);
  };

  // Scheme selection handler
  const handleSchemeSelection = () => {
    if (formDisabled) {
      Alert.alert(
        "Action Required",
        "Please verify Aadhaar first to select scheme."
      );
      return;
    }

    if (!allSchemes || allSchemes.length === 0) {
      Alert.alert("No Schemes", "No schemes available. Please try again later.");
      return;
    }

    // Create scheme options for Alert
    const schemeOptions = allSchemes.map(scheme => ({
      text: scheme.schemeName || `Scheme ${scheme.SchemeId}`,
      onPress: () => {
        const newSelectedScheme = {
          id: scheme.SchemeId,
          name: scheme.schemeName || `Scheme ${scheme.SchemeId}`
        };
        setSelectedScheme(newSelectedScheme);

        // Update formData
        setFormData(prev => ({
          ...prev,
          selectedSchemeId: scheme.SchemeId,
          selectedSchemeName: scheme.schemeName || `Scheme ${scheme.SchemeId}`
        }));

        // Notify parent component
        if (onSchemeSelect) {
          onSchemeSelect(scheme.SchemeId, scheme.schemeName);
        }
      }
    }));

    schemeOptions.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      "Select Scheme",
      "Choose a scheme to join:",
      schemeOptions
    );
  };

  // DATE HANDLERS
  const openDatePicker = (type) => {
    if (formDisabled) {
      Alert.alert(
        "Action Required",
        "Please verify Aadhaar first to fill other details."
      );
      return;
    }

    if (type === "dob" && formData.dateOfBirth) {
      const [year, month, day] = formData.dateOfBirth.split("-");
      setSelectedDate({ day, month, year });
    } else if (type === "anniversary" && formData.anniversaryDate) {
      const [year, month, day] = formData.anniversaryDate.split("-");
      setSelectedDate({ day, month, year });
    } else {
      setSelectedDate({ day: "", month: "", year: "" });
    }
    setShowDatePicker(type);
  };

  const handleDateConfirm = () => {
    if (!selectedDate.day || !selectedDate.month || !selectedDate.year) {
      Alert.alert("Error", "Please select a valid date");
      return;
    }

    const formattedDate = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;

    if (showDatePicker === "dob") {
      updateField("dateOfBirth", formattedDate);
    } else if (showDatePicker === "anniversary") {
      updateField("anniversaryDate", formattedDate);
    }

    setShowDatePicker(null);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // MARITAL STATUS HANDLER
  const handleMaritalStatus = (status) => {
    if (formDisabled) {
      Alert.alert(
        "Action Required",
        "Please verify Aadhaar first to fill other details."
      );
      return;
    }
    updateField("maritalStatus", status);
    if (status === "unmarried") {
      updateField("anniversaryDate", "");
    }
  };

  // Special handlers
  const handleMobile = (t) => {
    if (formDisabled) return;
    updateField("mobile", t.replace(/\D/g, ""));
  };

  const handleNomineeMobile = (t) => {
    if (formDisabled) return;
    updateField("mobile2", t.replace(/\D/g, ""));
  };

  const handlePincode = (t) => {
    if (formDisabled) return;
    updateField("pincode", t.replace(/\D/g, ""));
  };

  const handlePan = (t) => {
    if (formDisabled) return;
    updateField("panNumber", t.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
  };

  const handleAadhar = (t) => {
    const cleanValue = t.replace(/\D/g, "");
    updateField("aadharNumber", cleanValue);

    // If Aadhaar number changes and was previously verified, clear verification
    if (cleanValue.length !== 12 && aadhaarStatus === AADHAAR_STATUS.VERIFIED) {
      clearAadhaarVerification();
    }
  };

  // VALIDATION
  const validate = (d = {}) => {
    const errors = {};

    // Safety guard (prevents crashes)
    if (!d || typeof d !== "object") {
      errors.form = "Form data missing";
      setValidationErrors(errors);
      return errors;
    }

    /* ---------------- Aadhaar must be verified FIRST ---------------- */
    if (aadhaarStatus !== AADHAAR_STATUS.VERIFIED) {
      errors.aadharNumber = "Please complete Aadhaar verification first";
      setValidationErrors(errors);
      return errors;
    }

    /* ---------------- Scheme selection ---------------- */
    if (!selectedScheme?.id) {
      errors.scheme = "Please select a scheme";
      setValidationErrors(errors);
      return errors; // ⛔ Do NOT show Alert here (UI handles it)
    }

    /* ---------------- Name ---------------- */
    if (!d.name?.trim()) {
      errors.name = "Name is required";
    } else if (d.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    /* ---------------- Date of Birth ---------------- */
    if (!d.dateOfBirth?.trim()) {
      errors.dateOfBirth = "Date of Birth is required";
    } else {
      const dob = new Date(d.dateOfBirth);
      const today = new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    /* ---------------- Marital Status ---------------- */
    if (!d.maritalStatus) {
      errors.maritalStatus = "Marital Status is required";
    }

    /* ---------------- Anniversary (if married) ---------------- */
    if (
      d.maritalStatus === "married" &&
      !d.anniversaryDate?.trim()
    ) {
      errors.anniversaryDate = "Anniversary Date is required";
    }

    /* ---------------- Mobile ---------------- */
    const mobileErr = validateMobile(d.mobile || "");
    if (mobileErr) errors.mobile = mobileErr;

    /* ---------------- Email (optional) ---------------- */
    if (d.email?.trim()) {
      const emailErr = validateEmail(d.email);
      if (emailErr) errors.email = emailErr;
    }

    /* ---------------- Address ---------------- */
    if (!d.doorNo?.trim()) errors.doorNo = "Door No. is required";
    if (!d.street?.trim()) errors.street = "Street is required";
    if (!d.area?.trim()) errors.area = "Area/Locality is required";

    const pinErr = validatePincode(d.pincode || "");
    if (pinErr) errors.pincode = pinErr;

    if (!d.city?.trim()) errors.city = "City is required";
    if (!d.state?.trim()) errors.state = "State is required";

    /* ---------------- Nominee ---------------- */
    if (!d.nomeni?.trim()) {
      errors.nomeni = "Nominee Name is required";
    }

    const nomMobileErr = validateMobile(d.mobile2 || "");
    if (nomMobileErr) errors.mobile2 = nomMobileErr;

    /* ---------------- PAN (optional) ---------------- */
    if (d.panNumber?.trim()) {
      const panErr = validatePAN(d.panNumber);
      if (panErr) errors.panNumber = panErr;
    }

    /* ---------------- Aadhaar ---------------- */
    if (!d.aadharNumber?.trim()) {
      errors.aadharNumber = "Aadhaar is required";
    } else {
      const aErr = validateAadhaar(d.aadharNumber);
      if (aErr) errors.aadharNumber = aErr;
    }

    setValidationErrors(errors);
    return errors;
  };

  // NEXT BUTTON - Fixed to properly call onNext
  const handleNext = () => {
    const errors = validate(formData);
    
    if (Object.keys(errors).length === 0 && selectedScheme.id) {
      const transformedData = {
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        anniversaryDate: formData.anniversaryDate,
        doorNo: formData.doorNo.trim(),
        address1: formData.street.trim(),
        address2: formData.area.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode,
        selectedState: formData.state.trim(),
        country: "India",
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber,
        aadhaarVerified: aadhaarStatus === AADHAAR_STATUS.VERIFIED,
        nomeni: formData.nomeni.trim(),
        mobile2: formData.mobile2,
        // Include scheme data
        selectedSchemeId: selectedScheme.id,
        selectedSchemeName: selectedScheme.name,
        // Include aadhaarData if needed
        aadhaarData: aadhaarData ? JSON.stringify(aadhaarData) : null,
        // Include extracted father's name if needed
        fatherName: aadhaarData?.care_of ? aadhaarData.care_of.replace(/^S\/O:\s*/i, "") : "",
      };

      console.log("Transformed data for next step:", transformedData);

      // Call onNext prop
      if (onNext && typeof onNext === 'function') {
        onNext(transformedData);
      }

      return;
    }

    // Focus the first error field
    const firstError = Object.keys(errors)[0];
    if (firstError && inputRefs.current[firstError]) {
      try {
        inputRefs.current[firstError].measure((x, y, w, h, px, py) => {
          scrollViewRef.current?.scrollTo({ y: py - 100, animated: true });
          inputRefs.current[firstError]?.focus?.();
        });
      } catch (e) {
        // Some readOnly fields may not support focus/measure - ignore
      }
    }

    if (!selectedScheme.id) {
      Alert.alert("Scheme Required", "Please select a scheme to continue.");
    } else {
      Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
    }
  };

  // CLEAR DATA
  const clearSavedData = async () => {
    await AsyncStorage.removeItem("digigoldMemberForm");
    await AsyncStorage.multiRemove([
      "aadhaarVerificationId",
      "aadhaarVerificationStatus",
      "aadhaarData",
    ]);

    setFormData((prev) => ({
      ...INITIAL_FORM,
      mobile: prev.mobile, // Preserve user mobile number
    }));

    setSelectedScheme({
      id: initialSchemeId || null,
      name: initialSchemeName || "Select a Scheme"
    });

    setValidationErrors({});
    setAadhaarStatus(AADHAAR_STATUS.NOT_STARTED);
    setAadhaarVerificationId("");
    setAadhaarAddress(null);
    setAadhaarData(null);
    setFormDisabled(true);
    Alert.alert("Cleared", "Form data reset (mobile number preserved).");
  };

  // Helper function to render input with disabled state
  const renderInput = (field, label, handler, isRequired = true) => {
    const isAadhaarField = field === "aadharNumber";
    const isDisabled = formDisabled && !isAadhaarField;

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDisabled && styles.disabledLabel]}>
          {label} {isRequired ? "*" : ""}
        </Text>
        <TextInput
          style={[
            styles.input,
            validationErrors[field] && styles.errorInput,
            isDisabled && styles.disabledInput,
            field === "aadharNumber" &&
            aadhaarStatus === AADHAAR_STATUS.VERIFIED &&
            styles.verifiedInput,
          ]}
          value={formData[field]}
          onChangeText={handler || ((t) => updateField(field, t))}
          onFocus={() => setActiveInput(field)}
          ref={(ref) => (inputRefs.current[field] = ref)}
          placeholder={`Enter ${label}`}
          placeholderTextColor={
            isDisabled
              ? COLORS.inputPlaceholderDisabled
              : COLORS.inputPlaceholder
          }
          editable={!isDisabled}
          selectTextOnFocus={!isDisabled}
        />

        {validationErrors[field] && (
          <Text style={styles.errorText}>{validationErrors[field]}</Text>
        )}
      </View>
    );
  };

  // Scheme selector component
  const renderSchemeSelector = () => {
    const isDisabled = formDisabled;

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDisabled && styles.disabledLabel]}>
          Selected Scheme *
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            !selectedScheme.id && styles.errorInput,
            isDisabled && styles.disabledInput,
          ]}
          onPress={handleSchemeSelection}
          disabled={isDisabled}
        >
          <Text
            style={[
              selectedScheme.id ? styles.dateText : styles.placeholderText,
              isDisabled && styles.disabledText,
            ]}
          >
            {isFetchingSchemes ? "Loading schemes..." : selectedScheme.name}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color={isDisabled ? COLORS.inputPlaceholderDisabled : COLORS.textSecondary}
          />
        </TouchableOpacity>
        {!selectedScheme.id && !isDisabled && (
          <Text style={styles.errorText}>Please select a scheme</Text>
        )}
        {isFetchingSchemes && (
          <Text style={styles.loadingText}>Loading schemes...</Text>
        )}
      </View>
    );
  };

  // Custom Picker Component
  const renderCustomPicker = () => {
    return (
      <View style={styles.pickerContainer}>
        {/* Day Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Day</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.pickerItem,
                  selectedDate.day === day && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, day }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.day === day && styles.pickerItemTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Month</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {months.map((month) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.pickerItem,
                  selectedDate.month === month && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, month }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.month === month &&
                    styles.pickerItemTextSelected,
                  ]}
                >
                  {MONTHS[parseInt(month) - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.pickerItem,
                  selectedDate.year === year && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, year }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.year === year && styles.pickerItemTextSelected,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Enhanced Aadhaar verification UI component
  const renderAadhaarVerification = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Step 1: Aadhaar Verification (Mandatory)
      </Text>

      <View style={styles.inputGroup}>
        <View style={styles.aadhaarHeader}>
          <Text style={styles.label}>Aadhaar Number *</Text>

          {/* Status Badge */}
          {aadhaarStatus === AADHAAR_STATUS.VERIFIED && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {aadhaarStatus === AADHAAR_STATUS.PENDING && (
            <View style={styles.pendingBadge}>
              <MaterialIcons name="hourglass-empty" size={16} color={COLORS.warning} />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
          {aadhaarStatus === AADHAAR_STATUS.FAILED && (
            <View style={styles.failedBadge}>
              <MaterialIcons name="error" size={16} color={COLORS.error} />
              <Text style={styles.failedText}>Failed</Text>
            </View>
          )}
          {aadhaarStatus === AADHAAR_STATUS.VERIFICATION_INITIATED && (
            <View style={styles.initiatedBadge}>
              <MaterialIcons name="hourglass-empty" size={16} color={COLORS.info} />
              <Text style={styles.initiatedText}>Initiated</Text>
            </View>
          )}
          {aadhaarStatus === AADHAAR_STATUS.NOT_STARTED && (
            <View style={styles.notStartedBadge}>
              <MaterialIcons name="info" size={16} color={COLORS.textSecondary} />
              <Text style={styles.notStartedText}>Not Verified</Text>
            </View>
          )}
          {aadhaarStatus === AADHAAR_STATUS.EXPIRED && (
            <View style={styles.failedBadge}>
              <MaterialIcons name="error" size={16} color={COLORS.error} />
              <Text style={styles.failedText}>Expired</Text>
            </View>
          )}
        </View>

        <View style={styles.aadhaarContainer}>
          <TextInput
            style={[
              styles.input,
              styles.aadhaarInput,
              validationErrors.aadharNumber && styles.errorInput,
              aadhaarStatus === AADHAAR_STATUS.VERIFIED && styles.verifiedInput,
              aadhaarStatus === AADHAAR_STATUS.PENDING && styles.pendingInput,
            ]}
            value={formData.aadharNumber}
            onChangeText={handleAadhar}
            onFocus={() => setActiveInput("aadharNumber")}
            ref={(ref) => (inputRefs.current.aadharNumber = ref)}
            placeholder="Enter 12-digit Aadhaar Number"
            placeholderTextColor={COLORS.inputPlaceholder}
            keyboardType="numeric"
            editable={aadhaarStatus !== AADHAAR_STATUS.VERIFIED}
            maxLength={12}
            autoFocus={true}
          />

          {/* Action Buttons */}
          <View style={styles.aadhaarActions}>
            {aadhaarStatus === AADHAAR_STATUS.VERIFIED ? (
              <>
                {/* <TouchableOpacity
                  style={[styles.aadhaarButton, styles.viewDetailsButton]}
                  onPress={() => {
                    if (aadhaarData) {
                      const extractedData = extractAllDetailsFromAadhaar(aadhaarData);
                      Alert.alert(
                        "Aadhaar Details",
                        `Name: ${extractedData.name}\n` +
                        `DOB: ${extractedData.dob}\n` +
                        `Gender: ${getGenderDisplay(extractedData.gender)}\n` +
                        `Father's Name: ${extractedData.fatherName || "Not available"}\n` +
                        `Address: ${aadhaarAddress?.doorNo || ""}, ${aadhaarAddress?.street || ""}, ${aadhaarAddress?.area || ""}`
                      );
                    }
                  }}
                >
                  <MaterialIcons name="visibility" size={16} color={COLORS.primary} />
                  <Text style={styles.viewDetailsText}>View</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={[styles.aadhaarButton, styles.clearButton]}
                  onPress={clearAadhaarVerification}
                >
                  <MaterialIcons name="close" size={16} color={COLORS.error} />
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  loading && styles.verifyButtonDisabled,
                  aadhaarStatus === AADHAAR_STATUS.PENDING && styles.pendingButton,
                  (formData.aadharNumber.length !== 12 ||
                    aadhaarStatus === AADHAAR_STATUS.VERIFICATION_INITIATED ||
                    aadhaarStatus === AADHAAR_STATUS.PENDING) && styles.verifyButtonDisabled,
                ]}
                onPress={verifyAadhaar}
                disabled={
                  loading ||
                  formData.aadharNumber.length !== 12 ||
                  aadhaarStatus === AADHAAR_STATUS.PENDING ||
                  aadhaarStatus === AADHAAR_STATUS.VERIFICATION_INITIATED
                }
              >
                {aadhaarStatus === AADHAAR_STATUS.PENDING ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>
                      Verifying ({aadhaarPollingCount}/{MAX_POLL_ATTEMPTS})
                    </Text>
                  </>
                ) : aadhaarStatus === AADHAAR_STATUS.VERIFICATION_INITIATED ? (
                  <Text style={styles.verifyButtonText}>Initializing...</Text>
                ) : (
                  <>
                    <MaterialIcons name="verified-user" size={18} color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>
                      {aadhaarStatus === AADHAAR_STATUS.FAILED ||
                        aadhaarStatus === AADHAAR_STATUS.EXPIRED
                        ? "Retry"
                        : "Verify"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {validationErrors.aadharNumber && (
          <Text style={styles.errorText}>{validationErrors.aadharNumber}</Text>
        )}

        {/* Status Messages */}
        <View style={styles.statusMessages}>
          {aadhaarStatus === AADHAAR_STATUS.NOT_STARTED && (
            <Text style={styles.aadhaarNote}>
              Please enter your 12-digit Aadhaar number and click "Verify" to
              authenticate via DigiLocker. Other fields will be auto-filled after
              successful verification.
            </Text>
          )}
          {aadhaarStatus === AADHAAR_STATUS.VERIFICATION_INITIATED && (
            <Text style={styles.infoNote}>
              Verification initiated. Please complete the process in DigiLocker.
            </Text>
          )}
          {aadhaarStatus === AADHAAR_STATUS.PENDING && (
            <Text style={styles.infoNote}>
              Waiting for verification to complete... This may take a few
              moments.
            </Text>
          )}
          {aadhaarStatus === AADHAAR_STATUS.VERIFIED && (
            <Text style={styles.successNote}>
              ✓ Aadhaar successfully verified! Personal details have been auto-filled.
            </Text>
          )}
          {aadhaarStatus === AADHAAR_STATUS.FAILED && (
            <Text style={styles.errorNote}>
              ✗ Verification failed. Please try again.
            </Text>
          )}
          {aadhaarStatus === AADHAAR_STATUS.EXPIRED && (
            <Text style={styles.errorNote}>
              ⚠ Verification session expired. Please start again.
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // Helper to render section with lock state
  const renderSection = (title, children, isLocked = false) => {
    return (
      <View style={[styles.section, isLocked && styles.lockedSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isLocked && styles.lockedTitle]}>
            {title}
            {isLocked && " 🔒"}
          </Text>
          {isLocked && (
            <Text style={styles.lockedMessage}>
              Complete Aadhaar verification to unlock
            </Text>
          )}
        </View>
        {children}
      </View>
    );
  };

  // Updated address confirmation modal with all Aadhaar details
  const renderAadhaarDetailsModal = () => (
    <Modal
      visible={showAddressConfirmModal}
      transparent
      animationType="slide"
      onRequestClose={handleManualAddress}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.detailsModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aadhaar Details Found</Text>
            <TouchableOpacity onPress={handleManualAddress}>
              <MaterialIcons
                name="close"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsScrollView}>
            {/* Personal Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Personal Details</Text>
              {aadhaarData?.name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{aadhaarData.name}</Text>
                </View>
              )}
              {aadhaarData?.dob && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date of Birth:</Text>
                  <Text style={styles.detailValue}>{aadhaarData.dob}</Text>
                </View>
              )}
              {aadhaarData?.gender && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gender:</Text>
                  <Text style={styles.detailValue}>
                    {getGenderDisplay(aadhaarData.gender)}
                  </Text>
                </View>
              )}
              {aadhaarData?.care_of && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Father's Name:</Text>
                  <Text style={styles.detailValue}>
                    {aadhaarData.care_of.replace(/^S\/O:\s*/i, "")}
                  </Text>
                </View>
              )}
            </View>

            {/* Address Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Address Details</Text>
              {aadhaarAddress?.doorNo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Door No:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.doorNo}</Text>
                </View>
              )}
              {aadhaarAddress?.street && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Street:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.street}</Text>
                </View>
              )}
              {aadhaarAddress?.area && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Area/Locality:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.area}</Text>
                </View>
              )}
              {aadhaarAddress?.city && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>City/District:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.city}</Text>
                </View>
              )}
              {aadhaarAddress?.state && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>State:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.state}</Text>
                </View>
              )}
              {aadhaarAddress?.pincode && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PIN Code:</Text>
                  <Text style={styles.detailValue}>{aadhaarAddress.pincode}</Text>
                </View>
              )}
            </View>

            <Text style={styles.modalQuestion}>
              Would you like to use these details?
            </Text>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, styles.wideButton]}
              onPress={handleManualAddress}
            >
              <Text style={styles.cancelButtonText}>No, Enter Manually</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.setButton, styles.wideButton]}
              onPress={handleUseAadhaarAddress}
            >
              <Text style={styles.setButtonText}>Yes, Use These Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight || 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Confirm Your KYC Details</Text>
          <Text style={styles.headerSubtitle}>
            {formDisabled ? "Verify Aadhaar First" : "To Join Our Schemes"}
          </Text>

          <TouchableOpacity onPress={clearSavedData} style={styles.clearBtn}>
            <MaterialIcons name="delete" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* AADHAAR VERIFICATION - Always first */}
        {renderAadhaarVerification()}

        {/* SCHEME SELECTOR - Conditionally locked */}
        {/* {renderSection(
          "Scheme Selection",
          renderSchemeSelector(),
          formDisabled
        )} */}

        {/* BASIC DETAILS - Conditionally locked */}
        {renderSection(
          "Basic Details",
          <>
            {renderInput("name", "Name", null, true)}

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                Date of Birth *
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  validationErrors.dateOfBirth && styles.errorInput,
                  formDisabled && styles.disabledInput,
                ]}
                onPress={() => openDatePicker("dob")}
                disabled={formDisabled}
              >
                <Text
                  style={[
                    formData.dateOfBirth
                      ? styles.dateText
                      : styles.placeholderText,
                    formDisabled && styles.disabledText,
                  ]}
                >
                  {formData.dateOfBirth
                    ? formatDateDisplay(formData.dateOfBirth)
                    : "Select Date of Birth"}
                </Text>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={
                    formDisabled
                      ? COLORS.inputPlaceholderDisabled
                      : COLORS.textSecondary
                  }
                  style={styles.dateIcon}
                />
              </TouchableOpacity>
              {validationErrors.dateOfBirth && (
                <Text style={styles.errorText}>
                  {validationErrors.dateOfBirth}
                </Text>
              )}
            </View>

            {/* Marital Status */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                Marital Status *
              </Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formData.maritalStatus === "married" &&
                    styles.checkboxSelected,
                    formDisabled && styles.disabledCheckbox,
                  ]}
                  onPress={() => handleMaritalStatus("married")}
                  disabled={formDisabled}
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      formData.maritalStatus === "married" &&
                      styles.checkboxTextSelected,
                      formDisabled && styles.disabledText,
                    ]}
                  >
                    Married
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    formData.maritalStatus === "unmarried" &&
                    styles.checkboxSelected,
                    formDisabled && styles.disabledCheckbox,
                  ]}
                  onPress={() => handleMaritalStatus("unmarried")}
                  disabled={formDisabled}
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      formData.maritalStatus === "unmarried" &&
                      styles.checkboxTextSelected,
                      formDisabled && styles.disabledText,
                    ]}
                  >
                    Unmarried
                  </Text>
                </TouchableOpacity>
              </View>
              {validationErrors.maritalStatus && (
                <Text style={styles.errorText}>
                  {validationErrors.maritalStatus}
                </Text>
              )}
            </View>

            {/* Anniversary Date (only show if married) */}
            {formData.maritalStatus === "married" && (
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.label, formDisabled && styles.disabledLabel]}
                >
                  Anniversary Date *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    validationErrors.anniversaryDate && styles.errorInput,
                    formDisabled && styles.disabledInput,
                  ]}
                  onPress={() => openDatePicker("anniversary")}
                  disabled={formDisabled}
                >
                  <Text
                    style={[
                      formData.anniversaryDate
                        ? styles.dateText
                        : styles.placeholderText,
                      formDisabled && styles.disabledText,
                    ]}
                  >
                    {formData.anniversaryDate
                      ? formatDateDisplay(formData.anniversaryDate)
                      : "Select Anniversary Date"}
                  </Text>
                  <MaterialIcons
                    name="event"
                    size={20}
                    color={
                      formDisabled
                        ? COLORS.inputPlaceholderDisabled
                        : COLORS.textSecondary
                    }
                    style={styles.dateIcon}
                  />
                </TouchableOpacity>
                {validationErrors.anniversaryDate && (
                  <Text style={styles.errorText}>
                    {validationErrors.anniversaryDate}
                  </Text>
                )}
              </View>
            )}

            {/* Mobile */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                Mobile Number *
              </Text>
              <View
                style={[
                  styles.mobileInput,
                  formDisabled && styles.disabledInput,
                ]}
              >
                <Text
                  style={[
                    styles.countryCode,
                    formDisabled && styles.disabledText,
                  ]}
                >
                  +91
                </Text>
                <TextInput
                  style={[
                    styles.mobileField,
                    validationErrors.mobile && styles.errorInput,
                    formDisabled && styles.disabledText,
                  ]}
                  value={formData.mobile}
                  editable={!formDisabled}
                  keyboardType="numeric"
                  onChangeText={handleMobile}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor={
                    formDisabled
                      ? COLORS.inputPlaceholderDisabled
                      : COLORS.inputPlaceholder
                  }
                  onFocus={() => setActiveInput("mobile")}
                  ref={(ref) => (inputRefs.current.mobile = ref)}
                />
              </View>
              {validationErrors.mobile && (
                <Text style={styles.errorText}>{validationErrors.mobile}</Text>
              )}
            </View>

            {/* Email */}
            {renderInput("email", "Email", null, false)}
          </>,
          formDisabled
        )}

        {/* ADDRESS - Conditionally locked */}
        {renderSection(
          "Address",
          <>
            {renderInput("doorNo", "Door No.", null, true)}
            {renderInput("street", "Street", null, true)}
            {renderInput("area", "Area / Locality", null, true)}

            {/* PIN */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                PIN Code *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.pincode && styles.errorInput,
                  formDisabled && styles.disabledInput,
                ]}
                value={formData.pincode}
                keyboardType="numeric"
                onFocus={() => setActiveInput("pincode")}
                onChangeText={handlePincode}
                ref={(ref) => (inputRefs.current.pincode = ref)}
                placeholder="Enter PIN Code"
                placeholderTextColor={
                  formDisabled
                    ? COLORS.inputPlaceholderDisabled
                    : COLORS.inputPlaceholder
                }
                editable={!formDisabled}
              />
              {validationErrors.pincode && (
                <Text style={styles.errorText}>{validationErrors.pincode}</Text>
              )}
            </View>

            {/* DISTRICT */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                District *
              </Text>
              <TextInput
                style={[styles.input, formDisabled && styles.disabledInput]}
                value={formData.city}
                editable={false}
                selectTextOnFocus={false}
                placeholder="Auto-filled"
                placeholderTextColor={
                  formDisabled
                    ? COLORS.inputPlaceholderDisabled
                    : COLORS.inputPlaceholder
                }
              />
              {validationErrors.city && (
                <Text style={styles.errorText}>{validationErrors.city}</Text>
              )}
            </View>

            {/* STATE */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                State *
              </Text>
              <TextInput
                style={[styles.input, formDisabled && styles.disabledInput]}
                value={formData.state}
                editable={false}
                selectTextOnFocus={false}
                placeholder="Auto-filled"
                placeholderTextColor={
                  formDisabled
                    ? COLORS.inputPlaceholderDisabled
                    : COLORS.inputPlaceholder
                }
              />
              {validationErrors.state && (
                <Text style={styles.errorText}>{validationErrors.state}</Text>
              )}
            </View>
          </>,
          formDisabled
        )}

        {/* PAN (Optional) */}
        {renderSection(
          "PAN Card (Optional)",
          <>
            <Text style={styles.optionalNote}>
              PAN is optional but recommended for financial transactions.
            </Text>
            {renderInput("panNumber", "PAN Number", handlePan, false)}
          </>,
          formDisabled
        )}

        {/* NOMINEE */}
        {renderSection(
          "Nominee Details",
          <>
            {renderInput("nomeni", "Nominee Name", null, true)}

            {/* Nominee Mobile */}
            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, formDisabled && styles.disabledLabel]}
              >
                Nominee Mobile Number *
              </Text>
              <View
                style={[
                  styles.mobileInput,
                  formDisabled && styles.disabledInput,
                ]}
              >
                <Text
                  style={[
                    styles.countryCode,
                    formDisabled && styles.disabledText,
                  ]}
                >
                  +91
                </Text>
                <TextInput
                  style={[
                    styles.mobileField,
                    formDisabled && styles.disabledText,
                  ]}
                  value={formData.mobile2}
                  onChangeText={handleNomineeMobile}
                  onFocus={() => setActiveInput("mobile2")}
                  ref={(ref) => (inputRefs.current.mobile2 = ref)}
                  placeholder="Enter Nominee Mobile"
                  keyboardType="numeric"
                  editable={!formDisabled}
                  placeholderTextColor={
                    formDisabled
                      ? COLORS.inputPlaceholderDisabled
                      : COLORS.inputPlaceholder
                  }
                />
              </View>
              {validationErrors.mobile2 && (
                <Text style={styles.errorText}>{validationErrors.mobile2}</Text>
              )}
            </View>
          </>,
          formDisabled
        )}

        {/* CONFIRM BUTTON */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (loading || formDisabled || !selectedScheme.id) && styles.confirmBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={loading || formDisabled || !selectedScheme.id}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.confirmText}>
              {formDisabled ? "Verify Aadhaar First" : !selectedScheme.id ? "Select Scheme First" : "Confirm & Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* CUSTOM DATE PICKER MODAL */}
      <Modal visible={!!showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker === "dob"
                  ? "Select Date of Birth"
                  : "Select Anniversary Date"}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedDatePreview}>
              Selected: {selectedDate.day}/{selectedDate.month}/
              {selectedDate.year}
            </Text>

            {renderCustomPicker()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setButton}
                onPress={handleDateConfirm}
              >
                <Text style={styles.setButtonText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AADHAAR DETAILS CONFIRMATION MODAL */}
      {renderAadhaarDetailsModal()}

      <BottomTab />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding.lg,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
    position: "relative",
    ...SHADOWS.md,
  },
  backBtn: {
    position: "absolute",
    left: SIZES.padding.lg,
    top: SIZES.padding.lg,
  },
  clearBtn: {
    position: "absolute",
    right: SIZES.padding.lg,
    top: SIZES.padding.lg,
    backgroundColor: COLORS.primaryDark,
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.white,
    marginTop: SIZES.margin.sm,
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginTop: SIZES.margin.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  lockedSection: {
    opacity: 0.7,
    backgroundColor: COLORS.inputBackground,
  },
  sectionHeader: {
    marginBottom: SIZES.margin.md,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
  },
  lockedTitle: {
    color: COLORS.textSecondary,
  },
  lockedMessage: {
    ...FONTS.caption,
    color: COLORS.warning,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  optionalNote: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SIZES.margin.md,
  },
  inputGroup: {
    marginBottom: SIZES.margin.md,
  },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  disabledLabel: {
    color: COLORS.textSecondary,
  },
  input: {
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    justifyContent: "center",
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledInput: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.borderLight,
    opacity: 0.7,
  },
  errorInput: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  verifiedInput: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  pendingInput: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warningLight,
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.inputPlaceholder,
    flex: 1,
  },
  disabledText: {
    color: COLORS.inputPlaceholderDisabled,
  },
  dateIcon: {
    marginLeft: SIZES.margin.sm,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.margin.xs,
  },
  checkbox: {
    flex: 1,
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.margin.xs,
  },
  disabledCheckbox: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.borderLight,
    opacity: 0.7,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  checkboxText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  checkboxTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  mobileInput: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.padding.md,
  },
  countryCode: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginRight: SIZES.margin.sm,
  },
  mobileField: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
  },
  loadingText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: SIZES.button.lg,
    borderRadius: SIZES.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SIZES.margin.xl,
    ...SHADOWS.md,
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.disabled,
  },
  confirmText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  // Aadhaar specific styles
  aadhaarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  aadhaarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  aadhaarInput: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  aadhaarActions: {
    flexDirection: "row",
  },
  aadhaarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    marginLeft: SIZES.margin.xs,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.infoLight,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  viewDetailsText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginLeft: 4,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clearText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: "600",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    minHeight: SIZES.input.height,
    justifyContent: "center",
    minWidth: 100,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  verifyButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginLeft: SIZES.margin.xs,
    fontWeight: "600",
  },
  pendingButton: {
    backgroundColor: COLORS.warning,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  verifiedText: {
    ...FONTS.caption,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: "600",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  pendingText: {
    ...FONTS.caption,
    color: COLORS.warning,
    marginLeft: 4,
    fontWeight: "600",
  },
  failedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  failedText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: "600",
  },
  initiatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  initiatedText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginLeft: 4,
    fontWeight: "600",
  },
  notStartedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  notStartedText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: "600",
  },
  statusMessages: {
    marginTop: SIZES.margin.xs,
  },
  aadhaarNote: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  infoNote: {
    ...FONTS.caption,
    color: COLORS.info,
    fontStyle: "italic",
  },
  successNote: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: "600",
  },
  errorNote: {
    ...FONTS.caption,
    color: COLORS.error,
    fontStyle: "italic",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.padding.lg,
    width: "100%",
    maxWidth: 400,
  },
  detailsModalContent: {
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  modalTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedDatePreview: {
    ...FONTS.body,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SIZES.margin.lg,
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    height: 200,
    marginBottom: SIZES.margin.lg,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },
  pickerLabel: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.margin.sm,
    fontWeight: "600",
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    marginVertical: 2,
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerItemText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  pickerItemTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.margin.lg,
  },
  wideButton: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },
  cancelButton: {
    height: SIZES.button.md,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.md,
  },
  cancelButtonText: {
    ...FONTS.button,
    color: COLORS.textSecondary,
  },
  setButton: {
    height: SIZES.button.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.md,
  },
  setButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  // Aadhaar details modal styles
  detailsScrollView: {
    maxHeight: 300,
  },
  detailsSection: {
    marginBottom: SIZES.margin.lg,
  },
  detailsSectionTitle: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginBottom: SIZES.margin.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SIZES.padding.xs,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: SIZES.margin.sm,
  },
  detailLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    width: 120,
    fontWeight: "600",
  },
  detailValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalQuestion: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginVertical: SIZES.margin.lg,
    fontWeight: "600",
  },
});

export default MemberDetailsPage;