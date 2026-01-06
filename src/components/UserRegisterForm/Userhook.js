import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { userService } from "../../services/UserRegisterService";
import {
  validateMobile,
  validateEmail,
  validatePincode,
  validateName,
  validateDOB,
  validateAddressField,
  validateAadhaar,
} from "../../screens/AddNewMember/Validations";
import { digiLockerService } from "../../services/DigiLockerService";
import {
  saveUserData,
  getAuthToken,
  getUserData,
  updateUserData,
  updateUserProfile,
} from "../../utils/AsynchStorageHelper";

export const useUserProfile = () => {
  const navigation = useNavigation();
  const [state, setState] = useState({
    userData: null,
    showForm: false,
    isFetchingPincode: false,
    isLoading: false,
    userId: null,
    showOTPModal: false,
    verifyingOTP: false,
    phoneToVerify: "",
    isFetchingData: false,
    fieldValidity: {},
    isFormDirty: false,
    verificationInProgress: false,
    showTermsModal: false,
    showConsentModal: false,
    pendingAadhaarVerification: false,
  });

  const [formData, setFormData] = useState(userService.getInitialFormState());
  const [errors, setErrors] = useState({});
  const formClosingRef = useRef(false);

  // Helper to update state
  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Helper function to parse Aadhaar address response
  const parseAadhaarAddress = (addressString, splitAddressData) => {
    try {
      if (splitAddressData) {
        return {
          address1: splitAddressData.house || "",
          address2: `${splitAddressData.street || ""} ${
            splitAddressData.landmark || ""
          }`.trim(),
          city: splitAddressData.vtc || splitAddressData.city || "",
          state: splitAddressData.state || "",
          pincode: splitAddressData.pincode || "",
          country: splitAddressData.country || "India",
        };
      }

      if (!addressString) return null;

      const parts = addressString
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part);

      if (parts.length >= 7) {
        const address1 = parts[0] || "";
        const address2 = parts[1] || "";
        const city = parts[2] || "";
        const state = parts[5] || "";
        const pincode = parts[6] || "";
        const country = parts[7] || "India";

        return { address1, address2, city, state, pincode, country };
      }

      return null;
    } catch (error) {
      console.error("Error parsing address:", error);
      return null;
    }
  };

  const mergeUserDataToStorage = async (newData) => {
    try {
      await updateUserData(newData);
      console.log("✅ Profile data merged, token preserved");
    } catch (e) {
      console.error("❌ Failed to merge user data:", e);
    }
  };

  // ===== DATA FETCHING =====
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await getUserData();

      if (storedUserData) {
        updateState({
          userId: storedUserData.id,
          userData: storedUserData,
        });

        if (storedUserData.id) {
          await fetchUserData(storedUserData.id);
        }
      }
    } catch (error) {
      console.error("Failed to load user data", error);
    }
  };

const fetchUserData = async (userId) => {
  if (!userId) return;
  updateState({ isFetchingData: true });

  try {
    console.log("🌐 Fetching user data...");

    const result = await userService.fetchUserData(userId);

    if (result) {
      // IMPORTANT: Merge with existing token from local storage
      const existingData = await getUserData();
      const existingToken = existingData?.token;
      
      const mergedData = {
        ...result,
        token: existingToken || result.token, // Preserve existing token
      };
      
      await updateUserData(mergedData);
      
      updateState({ userData: mergedData });
      setFormData(userService.getInitialFormState(mergedData));
      console.log("✅ User data fetched and updated successfully");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    
    // Fall back to local data
    const localData = await getUserData();
    if (localData) {
      console.log("⚠️ Using local data due to fetch error");
      updateState({ userData: localData });
      setFormData(userService.getInitialFormState(localData));
    } else {
      Alert.alert("Error", "Failed to fetch user data. Please try again.");
    }
  } finally {
    updateState({ isFetchingData: false });
  }
};

  // ===== FORM FIELD UPDATES =====
  const updateField = (field, value) => {
    if (!state.isFormDirty) updateState({ isFormDirty: true });

    // Handle termsAccepted with KYC logic
    if (field === "termsAccepted") {
      const newValue = value;
      const updatedFormData = {
        ...formData,
        [field]: newValue,
        kycVerified: formData.aadhaarVerified && newValue ? true : false,
      };
      setFormData(updatedFormData);
      setErrors((prev) => ({ ...prev, [field]: "" }));
      updateState((prev) => ({
        fieldValidity: {
          ...prev.fieldValidity,
          [field]: true,
          kycVerified: prev.fieldValidity.aadhaarVerified && newValue,
        },
      }));
      return;
    }

    // Handle aadhaarVerified with KYC logic
    if (field === "aadhaarVerified") {
      const newValue = value;
      const updatedFormData = {
        ...formData,
        [field]: newValue,
        kycVerified: newValue && formData.termsAccepted ? true : false,
      };
      setFormData(updatedFormData);
      setErrors((prev) => ({ ...prev, [field]: "" }));
      updateState((prev) => ({
        fieldValidity: {
          ...prev.fieldValidity,
          [field]: true,
          kycVerified: newValue && prev.fieldValidity.termsAccepted,
        },
      }));
      return;
    }

    // Handle Aadhaar number input
    if (field === "idProofNo") {
      const processedValue = value.replace(/[^0-9]/g, "").slice(0, 12);
      const previousAadhaar = formData.idProofNo || "";
      const newAadhaar = processedValue;
      const isSameAadhaar =
        previousAadhaar &&
        newAadhaar &&
        previousAadhaar.substring(8) === newAadhaar.substring(8);

      if (formData.aadhaarVerified && field === "idProofNo" && !isSameAadhaar) {
        const updatedFormData = {
          ...formData,
          [field]: processedValue,
          aadhaarVerified: false,
          maskedAadhaar: "",
          aadhaarVerificationId: "",
          aadhaarVerifiedAt: "",
          aadhaarStatus: "pending",
          kycVerified: false,
        };
        setFormData(updatedFormData);
      } else {
        setFormData({ ...formData, [field]: processedValue });
      }

      if (processedValue && processedValue.length === 12) {
        const aadhaarError = validateAadhaar(processedValue);
        if (aadhaarError) {
          setErrors((prev) => ({ ...prev, [field]: aadhaarError }));
          updateState((prev) => ({
            fieldValidity: { ...prev.fieldValidity, [field]: false },
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: "" }));
          updateState((prev) => ({
            fieldValidity: { ...prev.fieldValidity, [field]: true },
          }));
        }
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      return;
    }

    // Apply field-specific formatting for other fields
    let processedValue = value;
    if (field === "pincode") {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      if (processedValue.length === 6) {
        fetchCityStateFromPincode(processedValue);
      }
    } else if (field === "contactNumber") {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      if (formData.phoneVerified && field === "contactNumber") {
        setFormData((prev) => ({
          ...prev,
          phoneVerified: false,
        }));
      }
    }

    // Update form data
    const updatedFormData = { ...formData, [field]: processedValue };
    setFormData(updatedFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Real-time validation
    if (
      (typeof processedValue === "string" && processedValue.trim()) ||
      [
        "email",
        "username",
        "address1",
        "address2",
        "city",
        "state",
        "pincode",
        "dateOfBirth",
        "contactNumber",
      ].includes(field)
    ) {
      let isValid = false;
      let errorMsg = "";

      switch (field) {
        case "pincode":
          errorMsg = validatePincode(processedValue);
          isValid = !errorMsg;
          break;
        case "email":
          errorMsg = validateEmail(processedValue);
          isValid = !errorMsg;
          break;
        case "username":
          errorMsg = validateName(processedValue);
          isValid = !errorMsg;
          break;
        case "dateOfBirth":
          errorMsg = validateDOB(processedValue);
          isValid = !errorMsg;
          break;
        case "address1":
          errorMsg = validateAddressField(processedValue, "Address Line 1");
          isValid = !errorMsg;
          break;
        case "address2":
          errorMsg = validateAddressField(processedValue, "Address Line 2");
          isValid = !errorMsg;
          break;
        case "city":
          errorMsg = validateAddressField(processedValue, "City");
          isValid = !errorMsg;
          break;
        case "state":
          errorMsg = validateAddressField(processedValue, "State");
          isValid = !errorMsg;
          break;
        case "contactNumber":
          errorMsg = validateMobile(processedValue);
          isValid = !errorMsg;
          break;
        default:
          isValid = true;
      }

      updateState((prev) => ({
        fieldValidity: { ...prev.fieldValidity, [field]: isValid },
      }));

      if (!isValid && errorMsg) {
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
      }
    }
  };

  // ===== PINCODE FETCHING =====
  const fetchCityStateFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;
    updateState({ isFetchingPincode: true });

    try {
      const result = await userService.fetchPincodeDetails(pincode);

      if (result.success) {
        const updatedFormData = {
          ...formData,
          city: result.city,
          state: result.state,
          country: result.country,
        };
        setFormData(updatedFormData);

        setErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
          pincode: "",
        }));

        updateState((prev) => ({
          fieldValidity: {
            ...prev.fieldValidity,
            city: true,
            state: true,
            pincode: true,
          },
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          pincode: "Invalid PIN code. No records found.",
        }));
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          country: "India",
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrors((prev) => ({
        ...prev,
        pincode: "Network error. Please try again.",
      }));
    } finally {
      updateState({ isFetchingPincode: false });
    }
  };

  // ===== AADHAAR VERIFICATION =====
  const handleVerifyAadhaar = async () => {
    const aadhaarNumber = formData.idProofNo;
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      Alert.alert("Error", "Please enter a valid 12-digit Aadhaar number");
      return;
    }

    const aadhaarError = validateAadhaar(aadhaarNumber);
    if (aadhaarError) {
      Alert.alert("Invalid Aadhaar", aadhaarError);
      return;
    }

    updateState({ pendingAadhaarVerification: true, showConsentModal: true });
  };

  const handleConsentAccept = async () => {
    updateState({ showConsentModal: false, verificationInProgress: true });

    try {
      const aadhaarNumber = formData.idProofNo;
      console.log("Starting verification with Aadhaar:", aadhaarNumber);

      const result = await digiLockerService.verifyAadhaar(
        state.userId,
        aadhaarNumber
      );

      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to start verification");
        updateState({
          verificationInProgress: false,
          pendingAadhaarVerification: false,
        });
        return;
      }

      navigation.navigate("DigiLockerWebViewScreen", {
        verificationUrl: result.verificationUrl,
        verificationId: result.verificationId,
        aadhaarNumber: aadhaarNumber,
        originalAadhaarNumber: aadhaarNumber,
        onVerificationComplete: handleVerificationComplete,
      });

      updateState({ pendingAadhaarVerification: false });
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to start verification. Please try again.");
      updateState({
        verificationInProgress: false,
        pendingAadhaarVerification: false,
      });
    }
  };

  const handleConsentClose = () => {
    updateState({ showConsentModal: false, pendingAadhaarVerification: false });
  };
const handleVerificationComplete = async (result) => {
  console.log("Verification result:", JSON.stringify(result, null, 2));

  if (result.success && result.aadhaarVerified) {
    try {
      const aadhaarData = result.userDetails || {};
      const documentData = result.documentData || {};
      const actualAadhaarNumber = formData.idProofNo;

      const maskedAadhaarFromResult = result.maskedAadhaar || "6485";
      const properMaskedAadhaar = `XXXX-XXXX-${maskedAadhaarFromResult}`;

      // Parse address from Aadhaar response
      const addressData = parseAadhaarAddress(
        aadhaarData.address,
        documentData.split_address
      );

      // Format date of birth to "YYYY-MM-DD"
      const formatDateOfBirth = (dob) => {
        if (!dob) return "";
        const parts = dob.split("-");
        if (parts.length === 3) {
          // Convert from "DD-MM-YYYY" to "YYYY-MM-DD"
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
        return dob;
      };

      const updatedFormData = {
        ...formData,
        idProofNo: actualAadhaarNumber,
        aadhaarVerified: true,
        maskedAadhaar: properMaskedAadhaar,
        aadhaarVerificationId:
          result.aadhaarVerificationId || result.verificationId,
        aadhaarVerifiedAt:
          result.aadhaarVerifiedAt || new Date().toISOString(),
        aadhaarStatus: result.aadhaarStatus || "VERIFIED",
        username: aadhaarData.name || formData.username,
        dateOfBirth:
          formatDateOfBirth(aadhaarData.dob) || formData.dateOfBirth,
        gender: (
          aadhaarData.gender ||
          documentData.gender ||
          formData.gender
        )?.toLowerCase(),
        address1:
          addressData?.address1 || aadhaarData.address || formData.address1,
        address2: addressData?.address2 || formData.address2,
        city: addressData?.city || formData.city,
        state: addressData?.state || formData.state,
        pincode:
          addressData?.pincode ||
          documentData.split_address?.pincode ||
          formData.pincode,
        country: addressData?.country || formData.country || "India",
        kycVerified: formData.termsAccepted ? true : false,
      };

      setFormData(updatedFormData);
      updateState((prev) => ({
        fieldValidity: {
          ...prev.fieldValidity,
          idProofNo: true,
          address1: true,
          city: true,
          state: true,
          pincode: true,
          kycVerified: updatedFormData.kycVerified,
        },
      }));
      setErrors((prev) => ({
        ...prev,
        idProofNo: "",
        address1: "",
        city: "",
        state: "",
        pincode: "",
      }));

      // First, update local storage with all the data
      await updateUserData(updatedFormData);
      console.log("✅ Aadhaar data saved to local storage");

      // Then send to server
      try {
        const serverApiData = {
          idProofNo: actualAadhaarNumber,
          maskedAadhaar: properMaskedAadhaar,
          aadhaarVerified: true,
          kycVerified: Boolean(formData.termsAccepted),
          aadhaarVerificationId: result.aadhaarVerificationId || "",
          aadhaarVerifiedAt: result.aadhaarVerifiedAt || "",
          aadhaarStatus: result.aadhaarStatus || "VERIFIED",
          // Only send user details if they were updated from Aadhaar
          ...(aadhaarData.name && { username: aadhaarData.name }),
          ...(aadhaarData.dob && { dateOfBirth: formatDateOfBirth(aadhaarData.dob) }),
          ...(aadhaarData.gender && { gender: aadhaarData.gender.toLowerCase() }),
          ...(addressData?.address1 && { address1: addressData.address1 }),
          ...(addressData?.address2 && { address2: addressData.address2 }),
          ...(addressData?.city && { city: addressData.city }),
          ...(addressData?.state && { state: addressData.state }),
          ...(addressData?.pincode && { pincode: addressData.pincode }),
          ...(addressData?.country && { country: addressData.country }),
        };

        console.log("📤 Sending Aadhaar update to server:", serverApiData);
        const serverResult = await userService.updateUserData(state.userId, serverApiData);
        console.log("📥 Server response for Aadhaar update:", serverResult);

        // If server update was successful, wait a moment and then refresh
        if (serverResult.status === "success") {
          console.log("✅ Server update successful, refreshing data...");
          
          // Wait a moment for server to process
          setTimeout(async () => {
            try {
              await fetchUserData(state.userId);
            } catch (fetchError) {
              console.log("⚠️ Could not fetch updated data, but Aadhaar is verified");
            }
          }, 1000);
        }
      } catch (serverError) {
        console.error("⚠️ Server update failed, but local data saved:", serverError);
      }

      Alert.alert(
        "✅ Aadhaar Verified Successfully",
        `Your Aadhaar has been verified and profile has been updated.`,
        [{ text: "OK" }]
      );

      if (state.showForm) {
        closeFormAndReset();
      }
    } catch (error) {
      console.error("API update error:", error);
      Alert.alert(
        "⚠️ Network Error",
        "Your Aadhaar has been verified locally.",
        [{ text: "OK" }]
      );
    }
  } else {
    Alert.alert(
      "Verification Failed",
      result.message || "Aadhaar verification could not be completed.",
      [{ text: "OK" }]
    );

    const updatedFormData = {
      ...formData,
      aadhaarVerified: false,
      aadhaarStatus: result.aadhaarStatus || "FAILED",
      kycVerified: false,
    };

    setFormData(updatedFormData);
    updateState((prev) => ({
      fieldValidity: {
        ...prev.fieldValidity,
        idProofNo: false,
        kycVerified: false,
      },
    }));
    setErrors((prev) => ({
      ...prev,
      idProofNo: "Verification failed. Please try again.",
    }));
  }

  updateState({
    verificationInProgress: false,
    pendingAadhaarVerification: false,
  });
};

  // ===== OTP VERIFICATION =====
  const verifyOTP = async (otp) => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    updateState({ verifyingOTP: true });

    try {
      const result = await userService.verifyOTP(state.userId, otp);

      if (result) {
        await mergeUserDataToStorage(result);
      }

      updateState({ showOTPModal: false, verifyingOTP: false });
      await fetchUserData(state.userId);
      closeFormAndReset();

      Alert.alert("✅ Success", "Phone number verified successfully!");

      const token = await getAuthToken();
      console.log(
        "🔐 Final Token Status:",
        token ? "✅ PRESERVED" : "❌ MISSING"
      );
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error.message || "Invalid OTP. Please try again."
      );
      updateState({ verifyingOTP: false });
    }
  };

  // ===== FORM VALIDATION =====
  const validateForm = () => {
    const validators = {
      validateEmail,
      validateName,
      validateMobile,
      validateDOB,
      validateAddressField,
      validatePincode,
      validateAadhaar,
    };

    const validation = userService.validateFormData(formData, validators);

    setErrors(validation.errors);
    updateState({ fieldValidity: validation.fieldValidity });

    if (!validation.isValid) {
      const errorMessage = Object.entries(validation.errors)
        .filter(([_, e]) => e)
        .map(([f, e]) => {
          const names = {
            email: "Email Address",
            username: "Username",
            gender: "Gender",
            contactNumber: "Phone Number",
            dateOfBirth: "Date of Birth",
            address1: "Address Line 1",
            address2: "Address Line 2",
            city: "City",
            state: "State",
            pincode: "PIN Code",
            termsAccepted: "Terms & Conditions",
            idProofNo: "Aadhaar Number",
          };
          return `• ${names[f] || f}: ${e}`;
        })
        .join("\n\n");

      Alert.alert(
        "Validation Error ⚠️",
        `Please fix the following errors:\n\n${errorMessage}`
      );
      return false;
    }

    return true;
  };

  // ===== FORM MANAGEMENT =====
  const closeFormAndReset = () => {
    if (formClosingRef.current) return;
    formClosingRef.current = true;

    updateState({ showForm: false, isFormDirty: false, isLoading: false });

    if (state.userData) {
      setFormData(userService.getInitialFormState(state.userData));
    }

    setErrors({});
    updateState({ fieldValidity: {} });

    setTimeout(() => {
      formClosingRef.current = false;
    }, 500);
  };

const handleSubmit = async () => {
  console.log("🚀 handleSubmit triggered");
  
  if (!formData.termsAccepted) {
    Alert.alert(
      "Terms Required",
      "You must accept the Terms and Conditions before updating your profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "View Terms",
          onPress: () => updateState({ showTermsModal: true }),
        },
      ]
    );
    return;
  }

  if (!validateForm()) {
    return;
  }

  if (formData.aadhaarVerified && !formData.termsAccepted) {
    Alert.alert(
      "KYC Incomplete",
      "Your Aadhaar is verified but you need to accept the Terms and Conditions to complete KYC.",
      [{ text: "OK" }]
    );
    return;
  }

  const updatedFormData = {
    ...formData,
    kycVerified: formData.aadhaarVerified && formData.termsAccepted,
  };

  setFormData(updatedFormData);
  updateState({ isLoading: true });

  try {
    // Prepare data with correct types matching your Java model
    const apiData = {
      email: updatedFormData.email || "",
      username: updatedFormData.username || "",
      contactNumber: updatedFormData.contactNumber || "",
      gender: updatedFormData.gender || "male",
      dateOfBirth: updatedFormData.dateOfBirth || "",
      address1: updatedFormData.address1 || "",
      address2: updatedFormData.address2 || "",
      city: updatedFormData.city || "",
      state: updatedFormData.state || "",
      pincode: updatedFormData.pincode || "",
      country: updatedFormData.country || "India",
      termsAccepted: Boolean(updatedFormData.termsAccepted),
      idProofNo: updatedFormData.idProofNo || "",
      maskedAadhaar: updatedFormData.maskedAadhaar || "",
      aadhaarVerified: Boolean(updatedFormData.aadhaarVerified),
      kycVerified: Boolean(updatedFormData.aadhaarVerified && updatedFormData.termsAccepted),
      aadhaarVerificationId: updatedFormData.aadhaarVerificationId || "",
      aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt || "",
      aadhaarStatus: updatedFormData.aadhaarStatus || "pending",
    };

    console.log("📤 Preparing to send data to server:", JSON.stringify(apiData, null, 2));

    const tokenBefore = await getAuthToken();
    console.log("🔐 Token before update:", tokenBefore ? "Exists" : "Missing");

    // Call the API with properly typed data
    const result = await userService.updateUserData(state.userId, apiData);
    console.log("📥 Server response:", result);

    if (result.otpSent === true) {
      console.log("📱 OTP required for phone verification");
      updateState({
        phoneToVerify: updatedFormData.contactNumber,
        showOTPModal: true,
        isLoading: false,
      });
    } else {
      // Update local storage with what we sent
      await updateUserData(apiData);
      
      const tokenAfter = await getAuthToken();
      console.log("🔐 Token after update:", tokenAfter ? "✅ PRESERVED" : "❌ LOST");
      
      // Try to fetch updated data from server
      try {
        await fetchUserData(state.userId);
      } catch (fetchError) {
        console.log("⚠️ Could not fetch updated data, but profile was saved");
      }
      
      closeFormAndReset();
      Alert.alert("Success ✅", "Profile updated successfully!");
    }
  } catch (error) {
    console.error("❌ Submit Error:", error);
    Alert.alert("Error", error.message || "Failed to save data. Please try again.");
    updateState({ isLoading: false });
  }
};

  const resetForm = () => {
    closeFormAndReset();
    updateState({ showOTPModal: false });
  };

  const handleEdit = () => {
    updateState({ showForm: true });
  };

  return {
    // State
    ...state,
    formData,
    errors,

    // Functions
    updateField,
    handleVerifyAadhaar,
    handleConsentAccept,
    handleConsentClose,
    verifyOTP,
    handleSubmit,
    resetForm,
    handleEdit,
    fetchUserData,
    updateState,
  };
};
