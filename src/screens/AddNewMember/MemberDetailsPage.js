import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  Linking, // Add this import
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTab } from "../../components";
import { SHADOWS, COLORS, SIZES, FONTS } from "../../utils/AppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import WebView from "react-native-webview";
import { digiLockerService } from "../../services/DigiLockerService";
import {
  validateAadhaar,
  validatePAN,
  validateMobile,
  validateEmail,
  validatePincode,
  validateName,
  validateDOB,
  validateNomineeName,
  validateAddressField,
} from "./Validations";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

// Constants
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
  nomineeAadhaarNumber: "",
  nomineeAadhaarVerified: false,
  nomineeAadhaarVerificationId: "",
  // Nominee details from DigiLocker
  nomineeName: "",
  nomineeDOB: "",
  nomineeGender: "",
  nomineeAddress: "",
  nomineeCareOf: "",
  nomineeYearOfBirth: "",
  nomineeRelationship: "Spouse", // Default value
  nomAddr1: "",
  nomAddr2: "",
  nomCity: "",
  nomState: "",
  nomPincode: "",
  nomCountry: "India",
  selectedSchemeId: null,
  selectedSchemeName: "",
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

const MemberDetailsPage = ({
  onNext,
  onBack,
  validationErrors,
  setValidationErrors,
  initialSchemeId,
  initialSchemeName,
}) => {
  // Refs
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const navigation = useNavigation();

  // States
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState({
    id: initialSchemeId || null,
    name: initialSchemeName || "Select a Scheme",
  });
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    day: "01",
    month: "01",
    year: "1990",
  });
  const [isAadhaarValid, setIsAadhaarValid] = useState(false);
  const [isValidatingAadhaar, setIsValidatingAadhaar] = useState(false);
  const [nomineeAadhaarStatus, setNomineeAadhaarStatus] = useState({
    isVerified: false,
    isVerifying: false,
    verificationId: "",
    message: "",
    aadhaarData: null, // Store full Aadhaar data
  });
  const [showDigiLockerWebView, setShowDigiLockerWebView] = useState(false);
  const [digiLockerUrl, setDigiLockerUrl] = useState("");
  const [verificationPolling, setVerificationPolling] = useState(null);
  const [failureHandled, setFailureHandled] = useState(false); // Track if failure already handled

  // Memoized values
  const currentYear = new Date().getFullYear();
  const { days, months, years } = useMemo(
    () => ({
      days: Array.from({ length: 31 }, (_, i) =>
        (i + 1).toString().padStart(2, "0")
      ),
      months: Array.from({ length: 12 }, (_, i) =>
        (i + 1).toString().padStart(2, "0")
      ),
      years: Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
        (currentYear - i).toString()
      ),
    }),
    [currentYear]
  );

  // Load saved form data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [stored, email, username, phone] = await Promise.all([
          AsyncStorage.getItem("digigoldMemberForm"),
          AsyncStorage.getItem("userEmail"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("userPhoneNumber"),
        ]);

        const savedData = stored ? JSON.parse(stored) : {};

        setFormData((prev) => ({
          ...prev,
          ...savedData,
          name: username || savedData.name || "",
          mobile: phone || savedData.mobile || "",
          email: email || savedData.email || "",
          selectedSchemeId:
            initialSchemeId || savedData.selectedSchemeId || null,
          selectedSchemeName:
            initialSchemeName || savedData.selectedSchemeName || "",
        }));

        if (initialSchemeId || savedData.selectedSchemeId) {
          setSelectedScheme({
            id: initialSchemeId || savedData.selectedSchemeId,
            name:
              initialSchemeName ||
              savedData.selectedSchemeName ||
              "Select a Scheme",
          });
        }

        if (savedData.dateOfBirth) {
          const [year, month, day] = savedData.dateOfBirth.split("-");
          setSelectedDate({ day, month, year });
        }

        if (savedData.aadharNumber) {
          const aadhaarErr = validateAadhaar(savedData.aadharNumber);
          setIsAadhaarValid(!aadhaarErr);
        }

        if (savedData.nomineeAadhaarVerified) {
          setNomineeAadhaarStatus({
            isVerified: true,
            isVerifying: false,
            verificationId: savedData.nomineeAadhaarVerificationId || "",
            message: "Nominee Aadhaar verified via DigiLocker",
            aadhaarData: savedData.nomineeAadhaarData || null,
          });
        }
      } catch (error) {
        console.error("Load error:", error);
        Alert.alert("Error", "Failed to load saved data");
      }
    };

    loadInitialData();
  }, [initialSchemeId, initialSchemeName]);

  // Save form on change
  useEffect(() => {
    const saveFormData = async () => {
      const dataToSave = {
        ...formData,
        selectedSchemeId: selectedScheme.id,
        selectedSchemeName: selectedScheme.name,
        nomineeAadhaarVerified: nomineeAadhaarStatus.isVerified,
        nomineeAadhaarVerificationId: nomineeAadhaarStatus.verificationId,
        nomineeAadhaarData: nomineeAadhaarStatus.aadhaarData,
      };

      try {
        await AsyncStorage.setItem(
          "digigoldMemberForm",
          JSON.stringify(dataToSave)
        );
      } catch (error) {
        console.error("Save error:", error);
      }
    };

    saveFormData();
  }, [formData, selectedScheme, nomineeAadhaarStatus]);

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShow = (e) => {
      setKeyboardHeight(e.endCoordinates.height);

      if (activeInput && inputRefs.current[activeInput]) {
        setTimeout(() => {
          inputRefs.current[activeInput].measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current?.scrollTo({
                y: y - 80,
                animated: true,
              });
            }
          );
        }, 100);
      }
    };

    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      keyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      keyboardDidHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [activeInput]);

  // Fetch pincode details
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
      } catch (error) {
        console.error("Pincode fetch error:", error);
      }
    };

    const debounceTimer = setTimeout(fetchLocation, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.pincode]);

  // Field update handler - FIXED to update all fields properly
  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear any existing error for this field
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: "" }));
      }

      // Validate Aadhaar in real-time
      if (field === "aadharNumber") {
        const cleanValue = value.replace(/\s/g, "");
        if (cleanValue.length === 12) {
          setIsValidatingAadhaar(true);
          const validationTimer = setTimeout(() => {
            const aadhaarErr = validateAadhaar(cleanValue);
            setIsAadhaarValid(!aadhaarErr);
            setIsValidatingAadhaar(false);

            if (aadhaarErr && validationErrors.aadharNumber !== aadhaarErr) {
              setValidationErrors((prev) => ({
                ...prev,
                aadharNumber: aadhaarErr,
              }));
            } else if (!aadhaarErr && validationErrors.aadharNumber) {
              setValidationErrors((prev) => ({ ...prev, aadharNumber: "" }));
            }
          }, 500);
          return () => clearTimeout(validationTimer);
        } else {
          setIsAadhaarValid(false);
        }
      }

      // Clear nominee verification if Aadhaar number changes
      if (field === "nomineeAadhaarNumber") {
        const cleanValue = value.replace(/\s/g, "");
        if (cleanValue.length === 12) {
          setNomineeAadhaarStatus((prev) => ({
            ...prev,
            isVerified: false,
            verificationId: "",
            message: "",
            aadhaarData: null,
          }));
          setFormData((prev) => ({
            ...prev,
            nomineeAadhaarVerified: false,
            nomineeAadhaarVerificationId: "",
            // Clear auto-filled nominee data when Aadhaar changes
            nomineeName: "",
            nomineeDOB: "",
            nomineeGender: "",
            nomineeAddress: "",
            nomineeCareOf: "",
            nomineeYearOfBirth: "",
            nomAddr1: "",
            nomAddr2: "",
            nomCity: "",
            nomState: "",
            nomPincode: "",
          }));
        }
      }
    },
    [validationErrors, setValidationErrors]
  );

  // Special handlers
  const handleMobile = useCallback(
    (text) => updateField("mobile", text.replace(/\D/g, "")),
    [updateField]
  );
  const handleNomineeMobile = useCallback(
    (text) => updateField("mobile2", text.replace(/\D/g, "")),
    [updateField]
  );
  const handlePincode = useCallback(
    (text) => updateField("pincode", text.replace(/\D/g, "")),
    [updateField]
  );
  const handlePan = useCallback(
    (text) =>
      updateField("panNumber", text.replace(/[^A-Za-z0-9]/g, "").toUpperCase()),
    [updateField]
  );

  const handleAadhar = useCallback(
    (text) => {
      const cleanValue = text.replace(/\D/g, "");
      let formattedValue = cleanValue;
      if (cleanValue.length > 8) {
        formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(
          4,
          8
        )} ${cleanValue.slice(8, 12)}`;
      } else if (cleanValue.length > 4) {
        formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
      }
      updateField("aadharNumber", formattedValue.trim());
    },
    [updateField]
  );

  const handleNomineeAadhaar = useCallback(
    (text) => {
      const cleanValue = text.replace(/\D/g, "");
      let formattedValue = cleanValue;
      if (cleanValue.length > 8) {
        formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(
          4,
          8
        )} ${cleanValue.slice(8, 12)}`;
      } else if (cleanValue.length > 4) {
        formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
      }
      updateField("nomineeAadhaarNumber", formattedValue.trim());
    },
    [updateField]
  );

  // Date handlers
  const openDatePicker = useCallback(
    (type) => {
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
    },
    [formData.dateOfBirth, formData.anniversaryDate]
  );

  const handleDateConfirm = useCallback(() => {
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
  }, [selectedDate, showDatePicker, updateField]);

  const formatDateDisplay = useCallback((dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }, []);

  const formatDateForAPI = useCallback((dateString) => {
    if (!dateString) return "";
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }, []);

  // Marital status handler
  const handleMaritalStatus = useCallback(
    (status) => {
      updateField("maritalStatus", status);
      if (status === "unmarried") {
        updateField("anniversaryDate", "");
      }
    },
    [updateField]
  );

  // Extract address from split_address
  const extractAddressFromSplit = useCallback((splitAddress) => {
    if (!splitAddress) return "";

    const parts = [
      splitAddress.house || "",
      splitAddress.street || "",
      splitAddress.landmark || "",
      splitAddress.loc || "",
      splitAddress.vtc || splitAddress.village || "",
      splitAddress.po || "",
      splitAddress.subdist || "",
      splitAddress.dist || "",
      splitAddress.state || "",
      splitAddress.country || "",
      splitAddress.pincode || "",
    ].filter((part) => part.trim() !== "");

    return parts.join(", ");
  }, []);

  // Format gender from single character
  const formatGender = useCallback((genderChar) => {
    switch (genderChar?.toUpperCase()) {
      case "M":
        return "male";
      case "F":
        return "female";
      case "T":
        return "transgender";
      default:
        return "other";
    }
  }, []);

  // Populate nominee data from Aadhaar response - FIXED to update form directly
  const populateNomineeData = useCallback(
    (aadhaarData) => {
      if (!aadhaarData) return;

      console.log("Populating nominee data from Aadhaar:", aadhaarData);

      // Update form data with nominee information
      setFormData((prev) => {
        const updates = { ...prev };

        // Name
        if (aadhaarData.name) {
          updates.nomeni = aadhaarData.name;
          updates.nomineeName = aadhaarData.name;
        }

        // Date of Birth
        if (aadhaarData.dob) {
          updates.nomineeDOB = formatDateForAPI(aadhaarData.dob);
        }

        // Year of Birth
        if (aadhaarData.year_of_birth) {
          updates.nomineeYearOfBirth = aadhaarData.year_of_birth.toString();
        }

        // Gender
        if (aadhaarData.gender) {
          updates.nomineeGender = formatGender(aadhaarData.gender);
        }

        // Care of
        if (aadhaarData.care_of) {
          updates.nomineeCareOf = aadhaarData.care_of;
        }

        // Address from split_address
        if (aadhaarData.split_address) {
          const splitAddr = aadhaarData.split_address;

          // Full address
          updates.nomineeAddress = extractAddressFromSplit(splitAddr);

          // Individual address components
          updates.nomAddr1 = splitAddr.house || "";
          if (splitAddr.street) {
            updates.nomAddr2 = splitAddr.street;
          }
          updates.nomCity = splitAddr.dist || splitAddr.vtc || "";
          updates.nomState = splitAddr.state || "";
          updates.nomPincode = splitAddr.pincode || "";
          updates.nomCountry = splitAddr.country || "India";
        } else if (aadhaarData.address) {
          // Fallback to full address string
          updates.nomineeAddress = aadhaarData.address;
        }

        // Update verification status
        updates.nomineeAadhaarVerified = true;

        return updates;
      });

      console.log("✅ Nominee data populated from Aadhaar");
    },
    [extractAddressFromSplit, formatGender, formatDateForAPI]
  );

  // Nominee Aadhaar verification
  const startNomineeAadhaarVerification = useCallback(async () => {
    // Reset failure handling flag
    setFailureHandled(false);

    const aadhaarNumber = formData.nomineeAadhaarNumber.replace(/\s/g, "");

    // Validate Aadhaar first
    const aadhaarError = validateAadhaar(aadhaarNumber);
    if (aadhaarError) {
      Alert.alert("Invalid Aadhaar", aadhaarError);
      return;
    }

    // If already verified, don't verify again
    if (nomineeAadhaarStatus.isVerified) {
      Alert.alert(
        "Already Verified",
        "Nominee Aadhaar is already verified. If you need to re-verify, please clear and enter a new Aadhaar number.",
        [{ text: "OK" }]
      );
      return;
    }

    setNomineeAadhaarStatus((prev) => ({
      ...prev,
      isVerifying: true,
      message: "Starting DigiLocker verification...",
    }));

    try {
      const userId = formData.nomeni
        ? `${formData.nomeni.replace(/\s/g, "_")}_${Date.now()}`
        : `nominee_${Date.now()}`;

      const result = await digiLockerService.createVerificationUrl(
        userId,
        aadhaarNumber
      );

      if (result.success && result.verificationUrl) {
        setNomineeAadhaarStatus((prev) => ({
          ...prev,
          verificationId: result.verificationId,
          message: "Opening DigiLocker...",
        }));

        await AsyncStorage.setItem(
          "digilocker_verification_id",
          result.verificationId
        );
        setDigiLockerUrl(result.verificationUrl);
        setShowDigiLockerWebView(true);
      } else {
        Alert.alert(
          "Verification Failed",
          result.message || "Failed to start verification"
        );
        setNomineeAadhaarStatus((prev) => ({
          ...prev,
          isVerifying: false,
          message: "Failed to start verification",
        }));
      }
    } catch (error) {
      console.error("Verification start error:", error);
      Alert.alert("Error", "Failed to start DigiLocker verification");
      setNomineeAadhaarStatus((prev) => ({
        ...prev,
        isVerifying: false,
        message: "Error starting verification",
      }));
    }
  }, [
    formData.nomineeAadhaarNumber,
    formData.nomeni,
    nomineeAadhaarStatus.isVerified,
  ]);

  // Get Aadhaar document data
  const getAadhaarDocumentData = useCallback(async (verificationId) => {
    try {
      console.log(
        "Fetching Aadhaar document for verificationId:",
        verificationId
      );
      const response = await fetch(
        `https://scheme.bmgjewellers.com/api/v1/digilocker/document/AADHAAR?verification_id=${verificationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("Aadhaar document response:", result);

      if (result.status === "FAILURE") {
        console.log("Verification failed with status: FAILURE");
        return {
          success: false,
          status: "FAILURE",
          message: result.message || "Verification failed",
          data: result,
        };
      }

      if (response.ok) {
        return {
          success: true,
          data: result,
          message: result.message || "Aadhaar document fetched successfully",
        };
      } else {
        throw new Error(
          result.message || result.error || "Failed to fetch Aadhaar document"
        );
      }
    } catch (error) {
      console.error("Get Aadhaar document error:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch Aadhaar document",
      };
    }
  }, []);

  // Start polling for verification status - FIXED to handle failure only once
  const startVerificationPolling = useCallback(
    (verificationId) => {
      if (verificationPolling) {
        clearInterval(verificationPolling);
      }

      const pollingInterval = setInterval(async () => {
        try {
          // First check verification status
          const statusResult = await digiLockerService.checkVerificationStatus(
            verificationId
          );

          console.log("Status check response:", statusResult);

          // Check for FAILURE status - only handle once
          if (statusResult.status === "FAILURE" && !failureHandled) {
            console.log("Handling FAILURE status");
            clearInterval(pollingInterval);
            setVerificationPolling(null);
            setFailureHandled(true); // Mark as handled

            // Hide WebView
            setShowDigiLockerWebView(false);

            // Clear verification status
            setNomineeAadhaarStatus({
              isVerified: false,
              isVerifying: false,
              verificationId: "",
              message: "Verification failed",
              aadhaarData: null,
            });

            // Show alert and redirect
            Alert.alert(
              "Verification Failed",
              "Aadhaar verification failed. You will be redirected to continue the process.",
              [
                {
                  text: "OK",
                  onPress: async () => {
                    // Clear stored verification ID
                    await AsyncStorage.removeItem("digilocker_verification_id");
                    // Open website
                    Linking.openURL("https://bmgjewellers.com").catch((err) =>
                      console.error("Failed to open URL:", err)
                    );
                  },
                },
              ]
            );

            return;
          }

          if (statusResult.success && statusResult.verified) {
            // If verified, get Aadhaar document data
            const documentResult = await getAadhaarDocumentData(verificationId);

            // Check if document fetch also returned failure
            if (documentResult.status === "FAILURE" && !failureHandled) {
              clearInterval(pollingInterval);
              setVerificationPolling(null);
              setFailureHandled(true);

              // Hide WebView
              setShowDigiLockerWebView(false);

              // Clear verification status
              setNomineeAadhaarStatus({
                isVerified: false,
                isVerifying: false,
                verificationId: "",
                message: "Verification failed",
                aadhaarData: null,
              });

              Alert.alert(
                "Verification Failed",
                "Aadhaar document verification failed. You will be redirected to continue the process.",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      await AsyncStorage.removeItem(
                        "digilocker_verification_id"
                      );
                      Linking.openURL("https://bmgjewellers.com").catch((err) =>
                        console.error("Failed to open URL:", err)
                      );
                    },
                  },
                ]
              );

              return;
            }

            if (documentResult.success) {
              clearInterval(pollingInterval);
              setVerificationPolling(null);

              const aadhaarData = documentResult.data;

              // Update nominee Aadhaar status
              setNomineeAadhaarStatus({
                isVerified: true,
                isVerifying: false,
                verificationId: verificationId,
                message: "Nominee Aadhaar verified successfully!",
                aadhaarData: aadhaarData,
              });

              // Update form data with verification status
              setFormData((prev) => ({
                ...prev,
                nomineeAadhaarVerified: true,
                nomineeAadhaarVerificationId: verificationId,
              }));

              // Populate nominee data from Aadhaar
              populateNomineeData(aadhaarData);

              Alert.alert(
                "Success",
                "Nominee Aadhaar verified successfully via DigiLocker\n\nNominee details have been auto-filled from Aadhaar data.",
                [{ text: "OK", onPress: () => setShowDigiLockerWebView(false) }]
              );
            } else {
              throw new Error(
                documentResult.message || "Failed to get Aadhaar data"
              );
            }
          } else if (
            statusResult.message?.includes("Failed") ||
            statusResult.status === "REJECTED"
          ) {
            clearInterval(pollingInterval);
            setVerificationPolling(null);

            setNomineeAadhaarStatus((prev) => ({
              ...prev,
              isVerifying: false,
              message: "Verification failed or rejected",
            }));

            Alert.alert(
              "Verification Failed",
              "Please try again or use manual verification"
            );
          }
          // If still pending, continue polling
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);

      setVerificationPolling(pollingInterval);

      // Cleanup function
      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    },
    [
      verificationPolling,
      getAadhaarDocumentData,
      populateNomineeData,
      failureHandled,
    ]
  );

  // Handle WebView navigation
  const handleWebViewNavigationStateChange = useCallback(
    (navState) => {
      const { url } = navState;

      if (
        url.includes("success") ||
        url.includes("callback") ||
        url.includes("redirect")
      ) {
        AsyncStorage.getItem("digilocker_verification_id").then(
          (verificationId) => {
            if (verificationId) {
              startVerificationPolling(verificationId);
            }
          }
        );
      }
    },
    [startVerificationPolling]
  );

  // Validation
  const validate = useCallback(
    (d = {}) => {
      const errors = {};

      if (!d || typeof d !== "object") {
        errors.form = "Form data missing";
        return errors;
      }

      // Name
      const nameErr = validateName(d.name || "");
      if (nameErr) errors.name = nameErr;

      // Date of Birth
      const dobErr = validateDOB(d.dateOfBirth || "");
      if (dobErr) errors.dateOfBirth = dobErr;

      // Marital Status
      if (!d.maritalStatus) {
        errors.maritalStatus = "Marital Status is required";
      }

      // Anniversary
      if (d.maritalStatus === "married" && !d.anniversaryDate?.trim()) {
        errors.anniversaryDate = "Anniversary Date is required";
      } else if (d.maritalStatus === "married" && d.anniversaryDate) {
        const anniversaryDate = new Date(d.anniversaryDate);
        const today = new Date();
        if (anniversaryDate > today) {
          errors.anniversaryDate = "Anniversary cannot be in the future";
        }
      }

      // Mobile
      const mobileErr = validateMobile(d.mobile || "");
      if (mobileErr) errors.mobile = mobileErr;

      // Email (optional)
      if (d.email?.trim()) {
        const emailErr = validateEmail(d.email);
        if (emailErr) errors.email = emailErr;
      }

      // Address
      const doorNoErr = validateAddressField(d.doorNo || "", "Door No.");
      if (doorNoErr) errors.doorNo = doorNoErr;

      const streetErr = validateAddressField(d.street || "", "Street");
      if (streetErr) errors.street = streetErr;

      const areaErr = validateAddressField(d.area || "", "Area/Locality");
      if (areaErr) errors.area = areaErr;

      const pinErr = validatePincode(d.pincode || "");
      if (pinErr) errors.pincode = pinErr;

      if (!d.city?.trim()) errors.city = "City is required";
      if (!d.state?.trim()) errors.state = "State is required";

      // Nominee
      const nomineeErr = validateNomineeName(d.nomeni || "");
      if (nomineeErr) errors.nomeni = nomineeErr;

      const nomMobileErr = validateMobile(d.mobile2 || "");
      if (nomMobileErr) errors.mobile2 = nomMobileErr;

      // Nominee Aadhaar
      if (!d.nomineeAadhaarNumber?.trim()) {
        errors.nomineeAadhaarNumber = "Nominee Aadhaar Number is required";
      } else {
        const nomineeAadhaarErr = validateAadhaar(
          d.nomineeAadhaarNumber.replace(/\s/g, "") || ""
        );
        if (nomineeAadhaarErr) {
          errors.nomineeAadhaarNumber = nomineeAadhaarErr;
        } else if (
          !d.nomineeAadhaarVerified &&
          !nomineeAadhaarStatus.isVerified
        ) {
          errors.nomineeAadhaarNumber =
            "Nominee Aadhaar must be verified via DigiLocker";
        }
      }

      // PAN (optional)
      if (d.panNumber?.trim()) {
        const panErr = validatePAN(d.panNumber);
        if (panErr) errors.panNumber = panErr;
      }

      // Aadhaar
      const aadhaarErr = validateAadhaar(
        d.aadharNumber?.replace(/\s/g, "") || ""
      );
      if (aadhaarErr) errors.aadharNumber = aadhaarErr;

      return errors;
    },
    [nomineeAadhaarStatus.isVerified]
  );

  // Next button handler
  const handleNext = useCallback(() => {
    const errors = validate(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0 && selectedScheme.id) {
      // Get masked Aadhaar
      const getMaskedAadhaar = (aadhaar) => {
        if (!aadhaar || aadhaar.length !== 12) return "";
        return `XXXX-XXXX-${aadhaar.substring(8)}`;
      };

      // Get initial from name
      const getInitial = (name) => {
        if (!name || name.trim().length === 0) return "";
        return name.trim().charAt(0).toUpperCase();
      };

      const transformedData = {
        // Basic details
        title: "Mr", // Default or from form if you have it
        initial: getInitial(formData.name),
        pName: formData.name.trim(),
        sName: "", // Add surname if you have this field
        mobile: formData.mobile,
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        anniversaryDate: formData.anniversaryDate,

        // Address
        doorNo: formData.doorNo.trim(),
        address1: formData.street.trim(),
        address2: formData.area.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode,
        selectedState: formData.state.trim(),
        country: "India",

        // Identification
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber.replace(/\s/g, ""),
        aadhaarVerified: isAadhaarValid,

        // Nominee details
        nomeni: formData.nomeni.trim(),
        mobile2: formData.mobile2,
        nomineeAadhaarNumber: formData.nomineeAadhaarNumber.replace(/\s/g, ""),
        nomineeAadhaarVerified:
          nomineeAadhaarStatus.isVerified || formData.nomineeAadhaarVerified,
        nomineeAadhaarVerificationId:
          nomineeAadhaarStatus.verificationId ||
          formData.nomineeAadhaarVerificationId,

        // Nominee details from DigiLocker
        nomineeName: formData.nomineeName || formData.nomeni.trim(),
        nomineeDOB: formData.nomineeDOB,
        nomineeGender: formData.nomineeGender,
        nomineeAddress: formData.nomineeAddress,
        nomineeCareOf: formData.nomineeCareOf,
        nomineeYearOfBirth: formData.nomineeYearOfBirth,
        nomineeRelationship: formData.nomineeRelationship || "Spouse",
        nomAddr1: formData.nomAddr1,
        nomAddr2: formData.nomAddr2,
        nomCity: formData.nomCity,
        nomState: formData.nomState,
        nomPincode: formData.nomPincode,
        nomCountry: formData.nomCountry || "India",

        // Scheme
        selectedSchemeId: selectedScheme.id,
        selectedSchemeName: selectedScheme.name,

        // Verification flags
        mobileVerified: true,
        aadhaarVerified: isAadhaarValid,
        nomineeMobileVerified: !!formData.mobile2,
        nomineeAadhaarVerified:
          nomineeAadhaarStatus.isVerified || formData.nomineeAadhaarVerified,

        // Display fields
        aadhaarMasked: getMaskedAadhaar(
          formData.aadharNumber.replace(/\s/g, "")
        ),
      };

      console.log("Transformed data for next step:", transformedData);

      if (onNext && typeof onNext === "function") {
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
      } catch (error) {
        // Ignore focus errors for read-only fields
      }
    }

    if (!selectedScheme.id) {
      Alert.alert("Scheme Required", "Please select a scheme to continue.");
    } else {
      Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
    }
  }, [
    formData,
    validate,
    selectedScheme,
    isAadhaarValid,
    nomineeAadhaarStatus,
    setValidationErrors,
    onNext,
  ]);

  // Clear data
  const clearSavedData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("digigoldMemberForm"),
        AsyncStorage.removeItem("digilocker_verification_id"),
      ]);

      setFormData((prev) => ({
        ...INITIAL_FORM,
        mobile: prev.mobile, // Preserve user mobile number
      }));

      setSelectedScheme({
        id: initialSchemeId || null,
        name: initialSchemeName || "Select a Scheme",
      });

      setValidationErrors({});
      setIsAadhaarValid(false);
      setNomineeAadhaarStatus({
        isVerified: false,
        isVerifying: false,
        verificationId: "",
        message: "",
        aadhaarData: null,
      });
      setFailureHandled(false); // Reset failure handling

      if (verificationPolling) {
        clearInterval(verificationPolling);
        setVerificationPolling(null);
      }

      Alert.alert("Cleared", "Form data reset (mobile number preserved).");
    } catch (error) {
      console.error("Clear data error:", error);
      Alert.alert("Error", "Failed to clear data");
    }
  }, [
    initialSchemeId,
    initialSchemeName,
    setValidationErrors,
    verificationPolling,
  ]);

  // Helper function to render input
  const renderInput = useCallback(
    (field, label, handler, isRequired = true, editable = true) => (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} {isRequired ? "*" : ""}
        </Text>
        <TextInput
          style={[
            styles.input,
            validationErrors[field] && styles.errorInput,
            field === "aadharNumber" && isAadhaarValid && styles.verifiedInput,
          ]}
          value={formData[field]}
          onChangeText={handler || ((text) => updateField(field, text))}
          onFocus={() => setActiveInput(field)}
          ref={(ref) => (inputRefs.current[field] = ref)}
          placeholder={`Enter ${label}`}
          placeholderTextColor={COLORS.inputPlaceholder}
          editable={editable}
        />

        {validationErrors[field] && (
          <Text style={styles.errorText}>{validationErrors[field]}</Text>
        )}

        {field === "aadharNumber" && isValidatingAadhaar && (
          <View style={styles.validationStatus}>
            <ActivityIndicator size="small" color={COLORS.info} />
            <Text style={styles.validatingText}>Validating Aadhaar...</Text>
          </View>
        )}

        {field === "aadharNumber" && isAadhaarValid && !isValidatingAadhaar && (
          <View style={styles.validationStatus}>
            <MaterialIcons
              name="check-circle"
              size={16}
              color={COLORS.success}
            />
            <Text style={styles.validText}>Aadhaar is valid</Text>
          </View>
        )}
      </View>
    ),
    [
      formData,
      validationErrors,
      isAadhaarValid,
      isValidatingAadhaar,
      updateField,
    ]
  );

  // Custom Picker Component
  const renderCustomPicker = useCallback(
    () => (
      <View style={styles.pickerContainer}>
        {[
          { label: "Day", data: days, key: "day" },
          { label: "Month", data: months, key: "month", isMonth: true },
          { label: "Year", data: years, key: "year" },
        ].map(({ label, data, key, isMonth }) => (
          <View key={key} style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>{label}</Text>
            <ScrollView
              style={styles.pickerScrollView}
              showsVerticalScrollIndicator={false}
            >
              {data.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pickerItem,
                    selectedDate[key] === item && styles.pickerItemSelected,
                  ]}
                  onPress={() =>
                    setSelectedDate((prev) => ({ ...prev, [key]: item }))
                  }
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedDate[key] === item &&
                        styles.pickerItemTextSelected,
                    ]}
                  >
                    {isMonth ? MONTHS[parseInt(item) - 1] : item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </View>
    ),
    [days, months, years, selectedDate]
  );

  // Aadhaar validation UI component
  const renderAadhaarSection = useCallback(
    () => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aadhaar Verification</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aadhaar Number *</Text>
          <View style={styles.aadhaarContainer}>
            <TextInput
              style={[
                styles.input,
                styles.aadhaarInput,
                validationErrors.aadharNumber && styles.errorInput,
                isAadhaarValid && styles.verifiedInput,
              ]}
              value={formData.aadharNumber}
              onChangeText={handleAadhar}
              onFocus={() => setActiveInput("aadharNumber")}
              ref={(ref) => (inputRefs.current.aadharNumber = ref)}
              placeholder="XXXX XXXX XXXX"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>
          {validationErrors.aadharNumber && (
            <Text style={styles.errorText}>
              {validationErrors.aadharNumber}
            </Text>
          )}
          {isValidatingAadhaar && (
            <Text style={styles.infoNote}>Validating Aadhaar...</Text>
          )}
          {isAadhaarValid && !isValidatingAadhaar && (
            <View style={styles.successContainer}>
              <MaterialIcons name="verified" size={16} color={COLORS.success} />
              <Text style={styles.successNote}>Aadhaar number is valid</Text>
            </View>
          )}
          <Text style={styles.helperText}>
            Enter your 12-digit Aadhaar number. The system will validate it.
          </Text>
        </View>
      </View>
    ),
    [
      formData.aadharNumber,
      validationErrors.aadharNumber,
      isAadhaarValid,
      isValidatingAadhaar,
      handleAadhar,
    ]
  );

  // Nominee Aadhaar section with auto-filled details
  const renderNomineeAadhaarSection = useCallback(
    () => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nominee Aadhaar Verification</Text>

        {/* Nominee Aadhaar Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nominee Aadhaar Number *</Text>
          <View style={styles.aadhaarContainer}>
            <TextInput
              style={[
                styles.input,
                styles.aadhaarInput,
                validationErrors.nomineeAadhaarNumber && styles.errorInput,
                (nomineeAadhaarStatus.isVerified ||
                  formData.nomineeAadhaarVerified) &&
                  styles.verifiedInput,
                nomineeAadhaarStatus.isVerifying && styles.verifyingInput,
              ]}
              value={formData.nomineeAadhaarNumber}
              onChangeText={handleNomineeAadhaar}
              onFocus={() => setActiveInput("nomineeAadhaarNumber")}
              ref={(ref) => (inputRefs.current.nomineeAadhaarNumber = ref)}
              placeholder="XXXX XXXX XXXX"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="numeric"
              maxLength={14}
              editable={
                !nomineeAadhaarStatus.isVerified &&
                !nomineeAadhaarStatus.isVerifying &&
                !formData.nomineeAadhaarVerified
              }
            />
            {!nomineeAadhaarStatus.isVerified &&
              !nomineeAadhaarStatus.isVerifying &&
              !formData.nomineeAadhaarVerified && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={startNomineeAadhaarVerification}
                  disabled={
                    formData.nomineeAadhaarNumber.replace(/\s/g, "").length !==
                    12
                  }
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              )}
          </View>
          {validationErrors.nomineeAadhaarNumber && (
            <Text style={styles.errorText}>
              {validationErrors.nomineeAadhaarNumber}
            </Text>
          )}

          {nomineeAadhaarStatus.isVerifying && (
            <View style={styles.verificationStatus}>
              <ActivityIndicator size="small" color={COLORS.info} />
              <Text style={styles.verifyingText}>
                {nomineeAadhaarStatus.message || "Verifying via DigiLocker..."}
              </Text>
            </View>
          )}

          <Text style={styles.helperText}>
            {(nomineeAadhaarStatus.isVerified ||
              formData.nomineeAadhaarVerified) &&
              " Nominee details have been auto-filled."}
          </Text>
        </View>

        {/* Auto-filled Nominee Details (only show if verified) */}
        {(nomineeAadhaarStatus.isVerified ||
          formData.nomineeAadhaarVerified) && (
          <>
            <Text style={styles.autoFillTitle}>Auto-filled from Aadhaar:</Text>

            {/* Nominee Name (auto-filled) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nominee Name</Text>
              <TextInput
                style={[styles.input, styles.autoFilledInput]}
                value={formData.nomineeName || formData.nomeni}
                editable={false}
                placeholder="Auto-filled from Aadhaar"
                placeholderTextColor={COLORS.inputPlaceholder}
              />
              <Text style={styles.autoFillNote}>From Aadhaar</Text>
            </View>

            {/* Nominee Date of Birth */}
            {formData.nomineeDOB && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nominee Date of Birth</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomineeDOB}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {/* Nominee Gender */}
            {formData.nomineeGender && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nominee Gender</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomineeGender}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}


            {/* Individual Address Components */}
            <Text style={styles.subSectionTitle}>Address Details:</Text>

            {formData.nomAddr1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>House/Flat No.</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomAddr1}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {formData.nomAddr2 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomAddr2}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {formData.nomCity && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomCity}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {formData.nomState && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomState}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {formData.nomPincode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PIN Code</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomPincode}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}

            {/* Nominee Care of */}
            {formData.nomineeCareOf && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Care of</Text>
                <TextInput
                  style={[styles.input, styles.autoFilledInput]}
                  value={formData.nomineeCareOf}
                  editable={false}
                  placeholder="Auto-filled from Aadhaar"
                  placeholderTextColor={COLORS.inputPlaceholder}
                />
                <Text style={styles.autoFillNote}>From Aadhaar</Text>
              </View>
            )}
          </>
        )}
      </View>
    ),
    [
      formData,
      validationErrors.nomineeAadhaarNumber,
      nomineeAadhaarStatus,
      handleNomineeAadhaar,
      startNomineeAadhaarVerification,
    ]
  );

  // Render Nominee Mobile input
  const renderNomineeMobileInput = useCallback(
    () => (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nominee Mobile Number *</Text>
        <View style={styles.mobileInput}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={[
              styles.mobileField,
              validationErrors.mobile2 && styles.errorInput,
            ]}
            value={formData.mobile2}
            onChangeText={handleNomineeMobile}
            onFocus={() => setActiveInput("mobile2")}
            ref={(ref) => (inputRefs.current.mobile2 = ref)}
            placeholder="Enter Nominee Mobile"
            keyboardType="numeric"
            placeholderTextColor={COLORS.inputPlaceholder}
          />
        </View>
        {validationErrors.mobile2 && (
          <Text style={styles.errorText}>{validationErrors.mobile2}</Text>
        )}
      </View>
    ),
    [formData.mobile2, validationErrors.mobile2, handleNomineeMobile]
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Your KYC Details</Text>
          <Text style={styles.headerSubtitle}>To Join Our Schemes</Text>
          <TouchableOpacity onPress={clearSavedData} style={styles.clearBtn}>
            <MaterialIcons name="delete" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Aadhaar Section */}
        {renderAadhaarSection()}

        {/* Basic Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          {renderInput("name", "Name", null, true)}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity
              style={[
                styles.input1,
                validationErrors.dateOfBirth && styles.errorInput,
              ]}
              onPress={() => openDatePicker("dob")}
            >
              <Text
                style={
                  formData.dateOfBirth
                    ? styles.dateText
                    : styles.placeholderText
                }
              >
                {formData.dateOfBirth
                  ? formatDateDisplay(formData.dateOfBirth)
                  : "Select Date of Birth"}
              </Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.textSecondary}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
            {validationErrors.dateOfBirth && (
              <Text style={styles.errorText}>
                {validationErrors.dateOfBirth}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marital Status *</Text>
            <View style={styles.checkboxContainer}>
              {["married", "unmarried"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.checkbox,
                    formData.maritalStatus === status &&
                      styles.checkboxSelected,
                  ]}
                  onPress={() => handleMaritalStatus(status)}
                >
                  <Text
                    style={[
                      styles.checkboxText,
                      formData.maritalStatus === status &&
                        styles.checkboxTextSelected,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors.maritalStatus && (
              <Text style={styles.errorText}>
                {validationErrors.maritalStatus}
              </Text>
            )}
          </View>

          {formData.maritalStatus === "married" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anniversary Date *</Text>
              <TouchableOpacity
                style={[
                  styles.input1,
                  validationErrors.anniversaryDate && styles.errorInput,
                ]}
                onPress={() => openDatePicker("anniversary")}
              >
                <Text
                  style={
                    formData.anniversaryDate
                      ? styles.dateText
                      : styles.placeholderText
                  }
                >
                  {formData.anniversaryDate
                    ? formatDateDisplay(formData.anniversaryDate)
                    : "Select Anniversary Date"}
                </Text>
                <MaterialIcons
                  name="event"
                  size={20}
                  color={COLORS.textSecondary}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={[
                  styles.mobileField,
                  validationErrors.mobile && styles.errorInput,
                ]}
                value={formData.mobile}
                editable={false}
                keyboardType="numeric"
                onChangeText={handleMobile}
                placeholder="Enter Mobile Number"
                placeholderTextColor={COLORS.inputPlaceholder}
                onFocus={() => setActiveInput("mobile")}
                ref={(ref) => (inputRefs.current.mobile = ref)}
              />
            </View>
            {validationErrors.mobile && (
              <Text style={styles.errorText}>{validationErrors.mobile}</Text>
            )}
          </View>

          {renderInput("email", "Email", null, false)}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {renderInput("doorNo", "Door No.", null, true)}
          {renderInput("street", "Street", null, true)}
          {renderInput("area", "Area / Locality", null, true)}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.pincode && styles.errorInput,
              ]}
              value={formData.pincode}
              keyboardType="numeric"
              onFocus={() => setActiveInput("pincode")}
              onChangeText={handlePincode}
              ref={(ref) => (inputRefs.current.pincode = ref)}
              placeholder="Enter PIN Code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.pincode && (
              <Text style={styles.errorText}>{validationErrors.pincode}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled from PIN code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.city && (
              <Text style={styles.errorText}>{validationErrors.city}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled from PIN code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.state && (
              <Text style={styles.errorText}>{validationErrors.state}</Text>
            )}
          </View>
        </View>

        {/* PAN (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAN Card (Optional)</Text>
          <Text style={styles.optionalNote}>
            PAN is optional but recommended for financial transactions.
          </Text>
          {renderInput("panNumber", "PAN Number", handlePan, false)}
        </View>

        {/* Nominee Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nominee Details</Text>

          {/* Nominee Mobile */}
          {renderNomineeMobileInput()}

          {/* Nominee Aadhaar Verification with auto-filled details */}
          {renderNomineeAadhaarSection()}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (loading || !selectedScheme.id) && styles.confirmBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={loading || !selectedScheme.id}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.confirmText}>
              {!selectedScheme.id
                ? "Select Scheme First"
                : "Confirm & Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* DigiLocker WebView Modal */}
      <Modal
        visible={showDigiLockerWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowDigiLockerWebView(false);
          if (verificationPolling) {
            clearInterval(verificationPolling);
            setVerificationPolling(null);
          }
        }}
      >
        <View style={styles.webViewContainer}>
          <CommonHeader
            title="DigiLocker Verification"
            onBackPress={() => setShowDigiLockerWebView(false)}
          />

          {digiLockerUrl ? (
            <WebView
              source={{ uri: digiLockerUrl }}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.webViewLoadingText}>
                    Loading DigiLocker...
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.webViewLoadingText}>
                Preparing verification...
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Date Picker Modal */}
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
    zIndex: 1,
  },
  clearBtn: {
    position: "absolute",
    right: SIZES.padding.lg,
    top: SIZES.padding.lg,
    backgroundColor: COLORS.primaryDark,
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
    zIndex: 1,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.white,
    marginTop: SIZES.margin.sm,
    textAlign: "center",
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginTop: SIZES.margin.xs,
    textAlign: "center",
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
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
  },
  subSectionTitle: {
    ...FONTS.h6,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    marginTop: SIZES.margin.md,
    fontWeight: "600",
  },
  autoFillTitle: {
    ...FONTS.h6,
    color: COLORS.success,
    marginBottom: SIZES.margin.sm,
    marginTop: SIZES.margin.md,
    fontWeight: "600",
  },
  optionalNote: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SIZES.margin.md,
  },
  input1: {
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.xl,
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",

  },
  inputGroup: {
    marginBottom: SIZES.margin.md,
  },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  input: {
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  autoFilledInput: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
    color: COLORS.textSecondary,
  },
  errorInput: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  verifiedInput: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  verifyingInput: {
    borderColor: COLORS.info,
    borderWidth: 2,
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
  autoFillNote: {
    ...FONTS.caption,
    color: COLORS.success,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
    fontSize: 12,
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
  aadhaarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  aadhaarInput: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    minWidth: 80,
    alignItems: "center",
  },
  verifyButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    fontWeight: "600",
  },
  validationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  validatingText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginLeft: SIZES.margin.xs,
  },
  validText: {
    ...FONTS.caption,
    color: COLORS.success,
    marginLeft: SIZES.margin.xs,
    fontWeight: "600",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  infoNote: {
    ...FONTS.caption,
    color: COLORS.info,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  successNote: {
    ...FONTS.caption,
    color: COLORS.success,
    marginTop: SIZES.margin.xs,
    fontWeight: "600",
  },
  helperText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  verificationIdText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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
  cancelButton: {
    flex: 1,
    height: SIZES.button.md,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.margin.sm,
  },
  cancelButtonText: {
    ...FONTS.button,
    color: COLORS.textSecondary,
  },
  setButton: {
    flex: 1,
    height: SIZES.button.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SIZES.margin.sm,
  },
  setButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  // WebView Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webViewHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    paddingTop: Platform.OS === "ios" ? SIZES.padding.xl : SIZES.padding.sm,
  },
  webViewBackButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  webViewBackText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginLeft: SIZES.margin.xs,
  },
  webViewTitle: {
    ...FONTS.h6,
    color: COLORS.white,
    fontWeight: "600",
  },
  webViewPlaceholder: {
    width: 60,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  webViewLoadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },
});

export default MemberDetailsPage;
