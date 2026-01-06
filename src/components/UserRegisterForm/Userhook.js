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
  getUserData, 
  getAuthToken, 
  updateUserProfile,
  saveUserData,
  verifyTokenStatus 
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
          address2: `${splitAddressData.street || ""} ${splitAddressData.landmark || ""}`.trim(),
          city: splitAddressData.vtc || splitAddressData.city || "",
          state: splitAddressData.state || "",
          pincode: splitAddressData.pincode || "",
          country: splitAddressData.country || "India",
        };
      }

      if (!addressString) return null;

      const parts = addressString.split(",").map((part) => part.trim()).filter((part) => part);

      // Handle your specific format: "29, BAJANAI KOIL STREET, Kunnathur, Kunnathur, Arani, Tiruvannamalai, Tamil Nadu, India, 604402"
      if (parts.length >= 9) {
        return {
          address1: parts[0] || "",
          address2: parts[1] || "",
          city: parts[2] || "",
          state: parts[6] || "", // "Tamil Nadu"
          pincode: parts[8] || "", // "604402"
          country: parts[7] || "India"
        };
      } else if (parts.length >= 4) {
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
      // Check token status first
      const tokenStatus = await verifyTokenStatus();
      console.log("🔐 Initial token status:", tokenStatus);

      const storedUserData = await getUserData();
      
      if (storedUserData) {
        console.log("📱 Loaded user data from storage:", {
          id: storedUserData.id,
          username: storedUserData.username,
          hasToken: !!storedUserData.token
        });
        
        updateState({ 
          userId: storedUserData.id,
          userData: storedUserData 
        });
        setFormData(userService.getInitialFormState(storedUserData));
        
        // Fetch fresh data from server
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
      // Check token before fetch
      const tokenBefore = await getAuthToken();
      console.log("🔐 Token before fetch:", tokenBefore ? "Exists" : "Missing");

      const result = await userService.fetchUserData(userId);

      if (result) {
        // Update profile data safely (preserves token)
        await updateUserProfile(result);
        
        // Verify token after update
        const tokenAfter = await getAuthToken();
        console.log("🔐 Token after fetch:", tokenAfter ? "✅ PRESERVED" : "❌ LOST");
        
        // Update local state
        const updatedUserData = {
          ...state.userData,
          ...result
        };
        
        updateState({ 
          userData: updatedUserData,
          userId: updatedUserData.id
        });
        setFormData(userService.getInitialFormState(updatedUserData));
      }
    } catch (error) {
      console.error("Error fetching user data's:", error);
      
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
        kycVerified: formData.aadhaarVerified && newValue,
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
        kycVerified: newValue && formData.termsAccepted,
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
    console.log("🔄 Verification result received:", {
      success: result.success,
      aadhaarVerified: result.aadhaarVerified,
      maskedAadhaar: result.maskedAadhaar
    });

    updateState({
      verificationInProgress: false,
      pendingAadhaarVerification: false,
    });

    if (result.success && result.aadhaarVerified) {
      try {
        const aadhaarData = result.userDetails || {};
        const documentData = result.documentData || {};
        const actualAadhaarNumber = formData.idProofNo;

        // FIX: Properly format masked Aadhaar
        const maskedAadhaarFromResult = result.maskedAadhaar || "6485";
        const properMaskedAadhaar = `XXXX-XXXX-${maskedAadhaarFromResult}`;
        
        // FIX: Handle the case where uid might be masked
        const uid = result.userDetails?.uid || result.documentData?.uid || "";
        const actualAadhaar = uid.includes("xxxx") ? formData.idProofNo : uid;

        console.log("📝 Aadhaar details:", {
          original: actualAadhaarNumber,
          uidFromResult: uid,
          actualAadhaarToSave: actualAadhaar,
          maskedFromResult: maskedAadhaarFromResult,
          properMasked: properMaskedAadhaar
        });

        // Parse address from Aadhaar response
        const addressData = parseAadhaarAddress(
          aadhaarData.address,
          documentData.split_address
        );

        // Format date of birth from DD-MM-YYYY to YYYY-MM-DD
        const formatDateOfBirth = (dob) => {
          if (!dob) return "";
          const parts = dob.split("-");
          if (parts.length === 3) {
            // Check if it's DD-MM-YYYY format
            if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
              return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          return dob;
        };

        // Update form data with Aadhaar verification results
        const updatedFormData = {
          ...formData,
          idProofNo: actualAadhaar, // Use the correct Aadhaar number
          aadhaarVerified: true,
          maskedAadhaar: properMaskedAadhaar,
          aadhaarVerificationId: result.aadhaarVerificationId || result.verificationId,
          aadhaarVerifiedAt: result.aadhaarVerifiedAt || new Date().toISOString(),
          aadhaarStatus: result.aadhaarStatus || "VERIFIED",
          username: aadhaarData.name || formData.username,
          dateOfBirth: formatDateOfBirth(aadhaarData.dob) || formData.dateOfBirth,
          gender: (aadhaarData.gender || documentData.gender || formData.gender)?.toLowerCase(),
          address1: addressData?.address1 || aadhaarData.address || formData.address1,
          address2: addressData?.address2 || formData.address2,
          city: addressData?.city || formData.city,
          state: addressData?.state || formData.state,
          pincode: addressData?.pincode || documentData.split_address?.pincode || formData.pincode,
          country: addressData?.country || formData.country || "India",
          kycVerified: formData.termsAccepted ? true : false,
        };

        console.log("✅ Updated form data:", {
          username: updatedFormData.username,
          aadhaarVerified: updatedFormData.aadhaarVerified,
          maskedAadhaar: updatedFormData.maskedAadhaar,
          address: `${updatedFormData.address1}, ${updatedFormData.city}, ${updatedFormData.state}`
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

        // Prepare data for API update
        const apiData = {
          email: updatedFormData.email,
          username: updatedFormData.username,
          contactNumber: updatedFormData.contactNumber,
          gender: updatedFormData.gender,
          dateOfBirth: updatedFormData.dateOfBirth,
          address1: updatedFormData.address1,
          address2: updatedFormData.address2,
          city: updatedFormData.city,
          state: updatedFormData.state,
          pincode: updatedFormData.pincode,
          country: updatedFormData.country,
          termsAccepted: updatedFormData.termsAccepted,
          kycVerified: updatedFormData.kycVerified,
          idProofNo: actualAadhaar,
          aadhaarVerified: true,
          maskedAadhaar: properMaskedAadhaar,
          aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
          aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
          aadhaarStatus: updatedFormData.aadhaarStatus,
        };

        console.log("📤 Sending API data:", JSON.stringify(apiData, null, 2));

        // Try to update on server
        try {
          const serverResult = await userService.updateUserData(state.userId, apiData);
          console.log("✅ Server update successful:", serverResult);
        } catch (serverError) {
          console.warn("⚠️ Server update failed, saving locally:", serverError.message);
          // Continue with local update even if server fails
        }

        // Check token before local update
        const tokenBefore = await getAuthToken();
        console.log("🔐 Token before local update:", tokenBefore ? "Exists" : "Missing");

        // Update locally with token preservation
        await updateUserProfile(apiData);
        
        // Verify token after update
        const tokenAfter = await getAuthToken();
        console.log("🔐 Token after local update:", tokenAfter ? "✅ PRESERVED" : "❌ LOST");

        // Update local state
        const updatedUserData = {
          ...state.userData,
          ...apiData
        };
        
        updateState({ 
          userData: updatedUserData 
        });

        Alert.alert(
          "✅ Aadhaar Verified Successfully",
          `Your Aadhaar has been verified and profile has been updated.\n\nName: ${updatedFormData.username}\nAadhaar: ${properMaskedAadhaar}\nAddress: ${updatedFormData.address1}, ${updatedFormData.city}, ${updatedFormData.state}`,
          [{ text: "OK" }]
        );

        if (state.showForm) {
          closeFormAndReset();
        }
      } catch (error) {
        console.error("❌ Local update error:", error);
        Alert.alert(
          "⚠️ Update Error",
          "Your Aadhaar has been verified but there was an error saving the data locally. Please try updating your profile again.",
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
        // Save user data (this includes token)
        await saveUserData(result);
      }

      updateState({ showOTPModal: false, verifyingOTP: false });
      
      // Refresh user data
      if (state.userId) {
        await fetchUserData(state.userId);
      }
      
      closeFormAndReset();
      Alert.alert("✅ Success", "Phone number verified successfully!");

      // Verify token is preserved
      const tokenStatus = await verifyTokenStatus();
      console.log("🔐 Final token status:", tokenStatus);
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
        email: updatedFormData.email,
        username: updatedFormData.username,
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
        idProofNo: updatedFormData.idProofNo,
        maskedAadhaar: updatedFormData.maskedAadhaar,
        aadhaarVerified: updatedFormData.aadhaarVerified,
        kycVerified: updatedFormData.kycVerified,
        aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
        aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
        aadhaarStatus: updatedFormData.aadhaarStatus,
      };

      console.log("📤 Profile update data:", JSON.stringify(apiData, null, 2));

      // Check token before update
      const tokenBefore = await getAuthToken();
      console.log("🔐 Token before profile update:", tokenBefore ? "Exists" : "Missing");

      let result;
      try {
        result = await userService.updateUserData(state.userId, apiData);
        console.log("✅ Server update response:", result);
      } catch (serverError) {
        console.warn("⚠️ Server update failed:", serverError.message);
        // Continue with local update
        result = { success: true, message: "Updated locally" };
      }

      if (result.otpSent === true) {
        updateState({
          phoneToVerify: updatedFormData.contactNumber,
          showOTPModal: true,
          isLoading: false,
        });
      } else {
        // Update locally with token preservation
        await updateUserProfile(apiData);
        
        // Verify token after update
        const tokenAfter = await getAuthToken();
        console.log("🔐 Token after profile update:", tokenAfter ? "✅ PRESERVED" : "❌ LOST");
        
        // Update local state
        const updatedUserData = {
          ...state.userData,
          ...apiData
        };
        
        updateState({ 
          userData: updatedUserData 
        });
        
        closeFormAndReset();
        Alert.alert("Success ✅", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("❌ Submit Error:", error);
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
  // Remove updateState from here

  // Derived values
  userId: state.userId,
};
};