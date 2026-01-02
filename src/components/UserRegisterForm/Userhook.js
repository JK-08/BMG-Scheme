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
    if (!formData.termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the Terms and Conditions before verifying Aadhaar.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Terms", onPress: () => updateState({ showTermsModal: true }) },
        ]
      );
      return;
    }

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
      const result = await digiLockerService.verifyAadhaar(
        state.userId,
        aadhaarNumber
      );

      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to start verification");
        updateState({ verificationInProgress: false, pendingAadhaarVerification: false });
        return;
      }

      navigation.navigate("DigiLockerWebViewScreen", {
        verificationUrl: result.verificationUrl,
        verificationId: result.verificationId,
        aadhaarNumber: aadhaarNumber,
        onVerificationComplete: handleVerificationComplete,
      });

      updateState({ pendingAadhaarVerification: false });
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to start verification. Please try again.");
      updateState({ verificationInProgress: false, pendingAadhaarVerification: false });
    }
  };

  const handleConsentClose = () => {
    updateState({ showConsentModal: false, pendingAadhaarVerification: false });
  };

  const handleVerificationComplete = async (result) => {
    console.log("Verification result:", result);

    if (result.success && result.aadhaarVerified) {
      try {
        const aadhaarData = result.userDetails || {};
        const documentData = result.documentData || {};
        const actualAadhaarNumber = formData.idProofNo;

        const updatedFormData = {
          ...formData,
          idProofNo: actualAadhaarNumber,
          aadhaarVerified: true,
          maskedAadhaar: `XXXX-XXXX-${actualAadhaarNumber.slice(8)}`,
          aadhaarVerificationId:
            result.aadhaarVerificationId || result.verificationId,
          aadhaarVerifiedAt:
            result.aadhaarVerifiedAt || new Date().toISOString(),
          aadhaarStatus: result.aadhaarStatus || "VERIFIED",
          username: aadhaarData.name || formData.username,
          dateOfBirth:
            userService.formatDateOfBirth(aadhaarData.dob) || formData.dateOfBirth,
          gender: aadhaarData.gender || formData.gender,
          address1: aadhaarData.address || formData.address1,
          kycVerified: formData.termsAccepted ? true : false,
        };

        setFormData(updatedFormData);
        updateState((prev) => ({
          fieldValidity: {
            ...prev.fieldValidity,
            idProofNo: true,
            kycVerified: updatedFormData.kycVerified,
          },
        }));
        setErrors((prev) => ({ ...prev, idProofNo: "" }));

        const apiData = {
          email: updatedFormData.email,
          username: updatedFormData.username,
          gender: updatedFormData.gender,
          contactNumber: updatedFormData.contactNumber,
          address1: updatedFormData.address1,
          address2: updatedFormData.address2,
          city: updatedFormData.city,
          state: updatedFormData.state,
          pincode: updatedFormData.pincode,
          country: updatedFormData.country,
          dateOfBirth: updatedFormData.dateOfBirth,
          kycVerified: updatedFormData.kycVerified,
          termsAccepted: updatedFormData.termsAccepted,
          idProofNo: actualAadhaarNumber,
          aadhaarVerified: true,
          maskedAadhaar: updatedFormData.maskedAadhaar,
          aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
          aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
          aadhaarStatus: updatedFormData.aadhaarStatus,
        };

        await userService.updateUserData(state.userId, apiData);
        await fetchUserData(state.userId);

        Alert.alert(
          "✅ Aadhaar Verified Successfully",
          `Your Aadhaar has been verified and profile has been updated.\n\nName: ${
            aadhaarData.name || "N/A"
          }\nAadhaar: ${updatedFormData.maskedAadhaar}\nKYC Status: ${
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

    updateState({ verificationInProgress: false, pendingAadhaarVerification: false });
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
      updateState({ showOTPModal: false, verifyingOTP: false });
      await fetchUserData(state.userId);
      closeFormAndReset();
      Alert.alert("✅ Success", "Phone number verified successfully!");
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
          { text: "View Terms", onPress: () => updateState({ showTermsModal: true }) },
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
        email: updatedFormData.email,
        username: updatedFormData.username,
        gender: updatedFormData.gender,
        contactNumber: updatedFormData.contactNumber,
        address1: updatedFormData.address1,
        address2: updatedFormData.address2,
        city: updatedFormData.city,
        state: updatedFormData.state,
        pincode: updatedFormData.pincode,
        country: updatedFormData.country,
        kycVerified: updatedFormData.kycVerified,
        termsAccepted: updatedFormData.termsAccepted,
        dateOfBirth: updatedFormData.dateOfBirth,
        idProofNo: updatedFormData.idProofNo,
        aadhaarVerified: updatedFormData.aadhaarVerified,
        maskedAadhaar: updatedFormData.maskedAadhaar,
        aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
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
    
    // Derived values
    userId: state.userId,
  };
};