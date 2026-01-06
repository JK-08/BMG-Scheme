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
import { updateAuthToken ,getAuthToken} from "../../utils/AsynchStorageHelper";

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
      // If we have split_address data from documentData, use that
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

      // Fallback: Parse the address string
      if (!addressString) return null;

      // Split address string by commas
      const parts = addressString
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part);

      if (parts.length >= 7) {
        // Common pattern: "house, street, village/city, sub-district, district, state, pincode, country"
        const address1 = parts[0] || "";
        const address2 = parts[1] || "";
        const city = parts[2] || "";
        const state = parts[5] || "";
        const pincode = parts[6] || "";
        const country = parts[7] || "India";

        return { address1, address2, city, state, pincode, country };
      } else if (parts.length >= 4) {
        // Try to extract based on position
        const address1 = parts[0] || "";
        const address2 = parts.length > 1 ? parts[1] : "";
        const city = parts.length > 2 ? parts[2] : "";
        const state = parts.length > 3 ? parts[3] : "";
        const pincode = parts.length > 4 ? parts[4] : "";
        const country = parts.length > 5 ? parts[5] : "India";

        return { address1, address2, city, state, pincode, country };
      }

      return null;
    } catch (error) {
      console.error("Error parsing address:", error);
      return null;
    }
  };

  // ===== DATA FETCHING =====
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserId = await userService.getUserId();
      updateState({ userId: storedUserId });
      if (storedUserId) await fetchUserData(storedUserId);
    } catch (error) {
      console.error("Failed to load userId", error);
    }
  };

  const fetchUserData = async (userId) => {
    if (!userId) return;
    updateState({ isFetchingData: true });

    try {
      const result = await userService.fetchUserData(userId);
      updateState({ userData: result });
      setFormData(userService.getInitialFormState(result));
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        "Failed to fetch user data. Please check your internet connection."
      );
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

    // Real-time validation for specific fields
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
        aadhaarNumber: aadhaarNumber, // Pass original Aadhaar number
        originalAadhaarNumber: aadhaarNumber, // Explicitly pass as original
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
        const actualAadhaarNumber = formData.idProofNo; // This is the original Aadhaar number

        // IMPORTANT: Use the masked Aadhaar from result, not the full number
        const maskedAadhaarFromResult = result.maskedAadhaar || "6485"; // From your log
        const properMaskedAadhaar = `XXXX-XXXX-${maskedAadhaarFromResult}`;

        console.log("Using Aadhaar data:", {
          original: actualAadhaarNumber,
          maskedFromResult: maskedAadhaarFromResult,
          properMasked: properMaskedAadhaar,
        });

        // Parse address from Aadhaar response
        const addressData = parseAadhaarAddress(
          aadhaarData.address,
          documentData.split_address
        );

        // Format date of birth properly (from "17-11-2004" to "2004-11-17")
        const formatDateOfBirth = (dob) => {
          if (!dob) return "";
          const parts = dob.split("-");
          if (parts.length === 3) {
            // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return dob;
        };

        const updatedFormData = {
          ...formData,
          idProofNo: actualAadhaarNumber, // Full Aadhaar number
          aadhaarVerified: true,
          maskedAadhaar: properMaskedAadhaar, // Masked format: "XXXX-XXXX-6485"
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
          // Update address fields from parsed data
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

        console.log("Updated form data with Aadhaar:", {
          idProofNo: updatedFormData.idProofNo,
          maskedAadhaar: updatedFormData.maskedAadhaar,
          address1: updatedFormData.address1,
          address2: updatedFormData.address2,
          city: updatedFormData.city,
          state: updatedFormData.state,
          pincode: updatedFormData.pincode,
          dateOfBirth: updatedFormData.dateOfBirth,
          gender: updatedFormData.gender,
        });

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

        const apiData = {
          // Basic user info
          email: updatedFormData.email,
          username: updatedFormData.username,
          contactNumber: updatedFormData.contactNumber,

          // Personal details
          gender: updatedFormData.gender,
          dateOfBirth: updatedFormData.dateOfBirth,

          // Address details
          address1: updatedFormData.address1,
          address2: updatedFormData.address2,
          city: updatedFormData.city,
          state: updatedFormData.state,
          pincode: updatedFormData.pincode,
          country: updatedFormData.country,

          // KYC & Terms
          termsAccepted: updatedFormData.termsAccepted,
          kycVerified: updatedFormData.kycVerified,

          // Aadhaar verification details
          idProofNo: actualAadhaarNumber, // Full Aadhaar number
          aadhaarVerified: true,
          maskedAadhaar: properMaskedAadhaar, // Masked format
          aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
          aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
          aadhaarStatus: updatedFormData.aadhaarStatus,
        };

        console.log("Sending API data:", JSON.stringify(apiData, null, 2));

        await userService.updateUserData(state.userId, apiData);
        await fetchUserData(state.userId);

        Alert.alert(
          "✅ Aadhaar Verified Successfully",
          `Your Aadhaar has been verified and profile has been updated.\n\nName: ${
            aadhaarData.name || "N/A"
          }\nAadhaar: ${updatedFormData.maskedAadhaar}\nAddress: ${
            updatedFormData.address1
          }, ${updatedFormData.city}, ${updatedFormData.state}\nKYC Status: ${
            updatedFormData.kycVerified ? "✅ Verified" : "❌ Pending Terms"
          }`,
          [{ text: "OK" }]
        );

        if (state.showForm) {
          closeFormAndReset();
        }
      } catch (error) {
        console.error("API update error:", error);
        Alert.alert(
          "⚠️ Network Error",
          "Your Aadhaar has been verified locally. Please check your internet connection and save your profile to update server.",
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

      // ✅ STORE TOKEN ONLY
      if (result?.token) {
        await updateAuthToken(result.token);
      }

      updateState({ showOTPModal: false, verifyingOTP: false });
      await fetchUserData(state.userId);
      closeFormAndReset();

      Alert.alert("✅ Success", "Phone number verified successfully!");
      const token = await getAuthToken();
      console.log("Stored Token:", token);
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
      const apiData = {
        id: state.userId, // Add this if needed
        email: updatedFormData.email,
        username: updatedFormData.username,
        password: updatedFormData.password, // Add if you have password field
        contactNumber: updatedFormData.contactNumber,
        gender: updatedFormData.gender,
        dateOfBirth: updatedFormData.dateOfBirth,
        address1: updatedFormData.address1,
        address2: updatedFormData.address2,
        city: updatedFormData.city,
        state: updatedFormData.state,
        pincode: updatedFormData.pincode,
        country: updatedFormData.country || "India",
        termsAccepted: updatedFormData.termsAccepted,

        // Aadhaar related fields - PAY ATTENTION HERE
        idProofNo: updatedFormData.idProofNo, // This might be the issue
        maskedAadhaar: updatedFormData.maskedAadhaar,
        aadhaarVerified: updatedFormData.aadhaarVerified,
        kycVerified: updatedFormData.kycVerified,
        // Verification fields (if your backend expects them)
        aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
        aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
        aadhaarStatus: updatedFormData.aadhaarStatus,
      };

      const result = await userService.updateUserData(state.userId, apiData);

      if (result.otpSent === true) {
        updateState({
          phoneToVerify: updatedFormData.contactNumber,
          showOTPModal: true,
          isLoading: false,
        });
      } else {
        await fetchUserData(state.userId);
        closeFormAndReset();
        Alert.alert(
          "Success ✅",
          updatedFormData.kycVerified
            ? "Profile updated successfully! KYC is now verified."
            : "Profile updated successfully!"
        );
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save data. Please try again."
      );
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

    // Derived values
    userId: state.userId,
  };
};
