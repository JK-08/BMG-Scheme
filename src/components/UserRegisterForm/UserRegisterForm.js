import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import CommonHeader from "../CommonHeader/CommonHeader";
import theme from "../../utils/AppTheme";
import {
  validateMobile,
  validateEmail,
  validatePincode,
  validateName,
  validateDOB,
  validateAddressField,
  validateAadhaar,
} from "../../screens/AddNewMember/Validations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { digiLockerService } from "../../services/DigiLockerService";

// Destructure theme
const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

// OTP Input Modal Component
const OTPModal = ({ visible, phoneNumber, onVerify, onClose, loading }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = [];

  useEffect(() => {
    if (visible) {
      setOtp(["", "", "", "", "", ""]);
    }
  }, [visible]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.split("").slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);

      // Focus last input
      if (pastedOtp.length === 6) {
        otpInputRefs[5]?.focus();
      } else if (pastedOtp.length > 0) {
        otpInputRefs[pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      onVerify(otpString);
    } else {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.otpModalOverlay}>
        <View style={styles.otpModalContainer}>
          <View style={styles.otpModalHeader}>
            <Text style={styles.otpModalTitle}>Phone Verification</Text>
            <Text style={styles.otpModalSubtitle}>
              Enter the 6-digit OTP sent to {phoneNumber}
            </Text>
          </View>

          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputRefs[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  index === 0 && styles.otpInputFirst,
                  index === 5 && styles.otpInputLast,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textContentType="oneTimeCode"
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.otpModalActions}>
            <TouchableOpacity
              style={[styles.otpButton, styles.otpButtonPrimary]}
              onPress={handleVerify}
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.otpButtonTextPrimary}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.otpCloseButton} onPress={onClose}>
            <Text style={styles.otpCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Terms and Conditions Modal Component
const TermsModal = ({ visible, onClose, onAccept }) => {
  const termsData = [
    {
      title: "1. Product Representation",
      content: [
        "Images are for reference only. Minor variations in color or finish may occur.",
        "All products are handcrafted, so slight irregularities are natural.",
        "For exact details, contact us before ordering.",
      ],
    },
    {
      title: "2. Pricing",
      subtitle: "Currency & Taxes",
      content: ["All prices are in INR and inclusive of GST"],
      subsections: [
        {
          title: "Price Changes",
          content: [
            "Prices may change without prior notice",
            "Final amount charged will be as displayed at checkout.",
          ],
        },
      ],
    },
    {
      title: "3. Payments",
      content: [
        "We accept the following payment methods:",
        "Online Payments",
        "UPI",
        "Debit/Credit Cards",
        "Net Banking",
        "Cash on Delivery (Selected PIN codes only)",
        "₹50 COD fee may apply",
      ],
    },
    {
      title: "4. Product Use & Care",
      content: [
        "Handle gold-polished jewellery with care. Avoid water & chemicals.",
        "Store in a dry pouch when not in use.",
        "No guarantee for polish durability; depends on usage.",
        "Ask us for maintenance tips to extend product life.",
      ],
    },
    {
      title: "5. Limitation of Liability",
      content: [
        "We are not liable for:",
        "Shipping delays or damage",
        "Force majeure events",
        "Improper use or care",
      ],
    },
    {
      title: "6. Intellectual Property",
      content: [
        "All content is © and the property of our brand. No part may be:",
        "Copied or redistributed without permission",
        "Used commercially",
        "Altered or modified",
      ],
    },
    {
      title: "7. Governing Law",
      content: [
        "These terms are governed by Indian law.",
        "Disputes will be settled in Madurai, Tamil Nadu.",
        "Contact us before placing orders if you have any questions.",
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.termsModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.termsModalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.termsModalHeader}>
            <Text style={styles.termsModalTitle}>Terms & Conditions</Text>
            <Text style={styles.termsModalSubtitle}>
              Please read and accept our terms to proceed
            </Text>
          </View>

          <ScrollView
            style={styles.termsContent}
            showsVerticalScrollIndicator={false}
          >
            {termsData.map((term, index) => (
              <View key={index} style={styles.termSection}>
                <Text style={styles.termTitle}>{term.title}</Text>
                {term.subtitle && (
                  <Text style={styles.termSubtitle}>{term.subtitle}</Text>
                )}
                {term.content.map((item, idx) => (
                  <View key={idx} style={styles.termItem}>
                    <Text style={styles.termBullet}>•</Text>
                    <Text style={styles.termText}>{item}</Text>
                  </View>
                ))}
                {term.subsections &&
                  term.subsections.map((subsection, subIdx) => (
                    <View key={subIdx} style={styles.subsection}>
                      <Text style={styles.subsectionTitle}>
                        {subsection.title}
                      </Text>
                      {subsection.content.map((item, itemIdx) => (
                        <View key={itemIdx} style={styles.termItem}>
                          <Text style={styles.termBullet}>◦</Text>
                          <Text style={styles.termText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Enhanced CustomInput Component with better verification statu
const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType,
  required = false,
  editable = true,
  loading = false,
  showValidationIcon = false,
  isValid = null,
  secureTextEntry = false,
  maxLength,
  // New props for Aadhaar verification
  isAadhaarField = false,
  aadhaarVerified = false,
  verificationStatus = null, // 'pending', 'verified', 'failed'
  onVerifyPress = null, // New: callback for verify button
  isVerifying = false, // New: if verification is in progress
}) => {
  const getVerificationStatusIcon = () => {
    if (!isAadhaarField || !value || value.length < 12) return null;

    if (verificationStatus === "verified" || aadhaarVerified) {
      return {
        icon: "✅",
        color: COLORS.success,
        message: "Verified",
      };
    } else if (verificationStatus === "failed") {
      return {
        icon: "❌",
        color: COLORS.error,
        message: "Verification failed",
      };
    } else if (verificationStatus === "pending") {
      return {
        icon: "⏳",
        color: COLORS.warning,
        message: "Verification pending",
      };
    } else if (value.length === 12 && !error) {
      return {
        icon: "ℹ️",
        color: COLORS.info,
        message: "Ready for verification",
      };
    }
    return null;
  };

  const status = getVerificationStatusIcon();

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}> *</Text>}
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.loadingIndicator}
          />
        )}
        {showValidationIcon && value && !error && isValid !== null && (
          <View style={styles.validationIconContainer}>
            <Text style={isValid ? styles.validIcon : styles.invalidIcon}>
              {isValid ? "✓" : "✗"}
            </Text>
          </View>
        )}
        {/* Aadhaar verification status */}
        {status && (
          <View
            style={[
              styles.verificationStatus,
              { backgroundColor: status.color + "20" },
            ]}
          >
            <Text
              style={[styles.verificationStatusIcon, { color: status.color }]}
            >
              {status.icon}
            </Text>
            <Text
              style={[styles.verificationStatusText, { color: status.color }]}
            >
              {status.message}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.inputWithButtonContainer}>
        <TextInput
  style={[
    styles.input,
    multiline && styles.inputMultiline,
    error && styles.inputError,
    !error && value && isValid && styles.inputValid,
    status && status.icon === '✅' && styles.inputVerified,
    status && status.icon === '❌' && styles.inputFailed,
    !editable && styles.inputDisabled,
    isAadhaarField && styles.inputWithButton,
    isAadhaarField && value.length === 12 && !error && styles.inputAadhaarReady,
  ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.inputPlaceholder}
          multiline={multiline}
          keyboardType={keyboardType || "default"}
          editable={editable}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
        />
        {/* Verify Button inside input for Aadhaar */}
        {isAadhaarField &&
          value &&
          value.length === 12 &&
          !error &&
          !aadhaarVerified &&
          onVerifyPress && (
            <TouchableOpacity
              style={styles.verifyButtonInline}
              onPress={onVerifyPress}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.verifyButtonTextInline}>Verify</Text>
              )}
            </TouchableOpacity>
          )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {status && status.message && !error && (
        <View
          style={[
            styles.verificationMessage,
            { backgroundColor: status.color + "10" },
          ]}
        >
          <Text
            style={[styles.verificationMessageText, { color: status.color }]}
          >
            {status.message}
          </Text>
        </View>
      )}
    </View>
  );
};

// Custom Button Component
const CustomButton = ({
  title,
  onPress,
  variant = "primary",
  style,
  disabled = false,
  loading = false,
  small = false,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      small && styles.buttonSmall,
      variant === "primary" && styles.buttonPrimary,
      variant === "secondary" && styles.buttonSecondary,
      variant === "danger" && styles.buttonDanger,
      variant === "gold" && styles.buttonGold,
      variant === "info" && styles.buttonInfo,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator size="small" color={COLORS.white} />
    ) : (
      <Text
        style={[
          styles.buttonText,
          small && styles.buttonTextSmall,
          variant === "secondary" && styles.buttonTextSecondary,
          variant === "gold" && styles.buttonTextGold,
          variant === "info" && styles.buttonTextInfo,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

// Data Row Component
const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}:</Text>
    <Text style={styles.dataValue}>{value || "N/A"}</Text>
  </View>
);

// Use Aadhaar Data Modal Component
const UseAadhaarDataModal = ({
  visible,
  onUseAadhaar,
  onManualEntry,
  onCancel,
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.useAadhaarModalOverlay}>
      <View style={styles.useAadhaarModalContainer}>
        <View style={styles.useAadhaarModalHeader}>
          <Text style={styles.useAadhaarModalIcon}>🔍</Text>
          <Text style={styles.useAadhaarModalTitle}>
            Aadhaar Data Available
          </Text>
          <Text style={styles.useAadhaarModalSubtitle}>
            We found verified Aadhaar data. Would you like to auto-fill your
            profile?
          </Text>
        </View>

        <View style={styles.useAadhaarModalContent}>
          <Text style={styles.useAadhaarModalInfo}>
            Your Aadhaar contains verified information that can be used to
            pre-fill:
          </Text>

          <View style={styles.aadhaarBenefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Full Name</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Date of Birth</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Gender</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Address</Text>
            </View>
          </View>

          <View style={styles.useAadhaarModalNote}>
            <Text style={styles.useAadhaarModalNoteIcon}>ℹ️</Text>
            <Text style={styles.useAadhaarModalNoteText}>
              You can always edit any field after auto-fill. Manual entry is
              also available.
            </Text>
          </View>
        </View>

        <View style={styles.useAadhaarModalActions}>
          <TouchableOpacity
            style={[styles.useAadhaarModalButton, styles.useAadhaarButton]}
            onPress={onUseAadhaar}
          >
            <Text style={styles.useAadhaarButtonText}>
              Yes, Use Aadhaar Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.useAadhaarModalButton, styles.manualEntryButton]}
            onPress={onManualEntry}
          >
            <Text style={styles.manualEntryButtonText}>Enter Manually</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.useAadhaarModalCancel}
            onPress={onCancel}
          >
            <Text style={styles.useAadhaarModalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// Data Card Component
const DataCard = ({ data, onEdit, onVerifyAadhaar }) => {
  const getMaskedAadhaar = (aadhaar) => {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar || "Not provided";
    return `XXXX XXXX ${aadhaar.substring(8)}`;
  };

  const getVerificationBadge = (verified, status) => {
    if (verified) {
      return {
        text: "✅ Verified",
        color: COLORS.success,
        bgColor: COLORS.successLight + "20",
        icon: "✅",
      };
    } else if (status === "pending") {
      return {
        text: "⏳ Pending",
        color: COLORS.warning,
        bgColor: COLORS.warningLight + "20",
        icon: "⏳",
      };
    } else if (status === "failed" || status === "rejected") {
      return {
        text: "❌ Failed",
        color: COLORS.error,
        bgColor: COLORS.errorLight + "20",
        icon: "❌",
      };
    } else {
      return {
        text: "❌ Not Verified",
        color: COLORS.error,
        bgColor: COLORS.errorLight + "20",
        icon: "❌",
      };
    }
  };

  const badge = getVerificationBadge(data.aadhaarVerified, data.aadhaarStatus);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{data.username}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}
          >
            <Text style={[styles.statusText, { color: badge.color }]}>
              {data.gender === "female"
                ? "👩 Female"
                : data.gender === "male"
                ? "👨 Male"
                : "Other"}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={onEdit}
          >
            <Text style={styles.actionButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContent}>
        <DataRow label="Username" value={data.username} />
        <DataRow label="Email" value={data.email} />
        <DataRow label="Phone" value={data.contactNumber || "Not provided"} />
        <DataRow label="Gender" value={data.gender} />
        <DataRow
          label="Date of Birth"
          value={data.dateOfBirth || "Not provided"}
        />
        <DataRow
          label="Address"
          value={`${data?.address1 || ""}, ${data?.address2 || ""}, ${
            data?.city || ""
          }, ${data?.state || ""}, ${data?.pincode || ""}, ${
            data?.country || ""
          }`}
        />
        <DataRow
          label="Wallet Balance"
          value={`₹${data.walletBalance?.toFixed(2) || "0.00"}`}
        />
        <DataRow label="Referral Code" value={data.referralCode || "N/A"} />
        <DataRow label="Masked Aadhaar" value={data.maskedAadhaar || "N/A"} />

        {/* Enhanced Aadhaar Section */}
        <View style={styles.aadhaarSection}>
          <View style={styles.aadhaarHeader}>
            <Text style={styles.dataLabel}>Aadhaar:</Text>
            <View
              style={[
                styles.verificationBadge,
                { backgroundColor: badge.bgColor },
              ]}
            >
              <Text
                style={[styles.verificationBadgeText, { color: badge.color }]}
              >
                {badge.icon} {badge.text}
              </Text>
            </View>
          </View>

          <View style={styles.aadhaarDetails}>
            <Text style={styles.aadhaarValue}>
              {getMaskedAadhaar(data.idProofNo)}
            </Text>
            {!data.aadhaarVerified && data.idProofNo && (
              <TouchableOpacity
                style={styles.verifyAadhaarButton}
                onPress={() => onVerifyAadhaar(data.idProofNo)}
              >
                <Text style={styles.verifyAadhaarButtonText}>
                  Verify Aadhaar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Show verification prompt if not verified */}
          {!data.aadhaarVerified && data.idProofNo && (
            <View style={styles.verificationPrompt}>
              <View style={styles.promptHeader}>
                <Text style={styles.promptIcon}>⚠️</Text>
                <Text style={styles.promptTitle}>Verification Required</Text>
              </View>
              <Text style={styles.promptText}>
                Your Aadhaar number is entered but not verified. Verify now to
                complete your KYC and unlock all features.
              </Text>
              <View style={styles.benefitsList}>
                <Text style={styles.benefitItem}>✅ Instant verification</Text>
                <Text style={styles.benefitItem}>
                  ✅ Auto-fill your details
                </Text>
                <Text style={styles.benefitItem}>✅ Secure & encrypted</Text>
              </View>
            </View>
          )}
        </View>

        <DataRow
          label="KYC Verified"
          value={data.kycVerified ? "✅ Yes" : "❌ No"}
        />
        <DataRow
          label="Terms Accepted"
          value={data.termsAccepted ? "✅ Yes" : "❌ No"}
        />
      </View>
    </View>
  );
};

// Main App Component
export default function App() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fieldValidity, setFieldValidity] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [showUseAadhaarModal, setShowUseAadhaarModal] = useState(false);
  const [useAadhaarData, setUseAadhaarData] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Track form visibility to prevent flickering
  const formClosingRef = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    gender: "male",
    contactNumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    dateOfBirth: "",
    phoneVerified: false,
    kycVerified: false,
    termsAccepted: false,
    idProofNo: "",
    aadhaarVerified: false,
    maskedAadhaar: "",
    aadhaarVerificationId: "",
    aadhaarVerifiedAt: "",
    aadhaarStatus: "pending",
  });

  const [errors, setErrors] = useState({});

  // Helper function to format verification date
  const formatVerificationDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format DOB from DD-MM-YYYY to YYYY-MM-DD
  const formatDateOfBirth = (dobString) => {
    if (!dobString) return "";

    // Handle DD-MM-YYYY format
    if (dobString.includes("-")) {
      const parts = dobString.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
          2,
          "0"
        )}`;
      }
    }

    return dobString;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("User ID:", storedUserId);
        setUserId(storedUserId);

        if (storedUserId) {
          await fetchUserData(storedUserId);
        }
      } catch (error) {
        console.error("Failed to load userId", error);
      }
    };

    loadUserData();
  }, []);

  const fetchUserData = async (userId) => {
    if (!userId) return;

    setIsFetchingData(true);
    try {
      const response = await fetch(
        `https://scheme.bmgjewellers.com/api/v1/user/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched user data:", result);

      setUserData(result);

      // Compute KYC status: Both Aadhaar verified AND terms accepted
      const computedKYC =
        (result.aadhaarVerified && result.termsAccepted) || false;

      // Initialize form data with fetched data
      setFormData({
        email: result.email || "",
        username: result.username || "",
        gender: result.gender || "female",
        contactNumber: result.contactNumber || "",
        address1: result.address1 || "",
        address2: result.address2 || "",
        city: result.city || "",
        state: result.state || "",
        pincode: result.pincode || "",
        country: result.country || "India",
        dateOfBirth: result.dateOfBirth || "",
        phoneVerified: result.phoneVerified || false,
        kycVerified: computedKYC, // Use computed KYC status
        termsAccepted: result.termsAccepted || false,
        idProofNo: result.idProofNo || "",
        aadhaarVerified: result.aadhaarVerified || false,
        maskedAadhaar: result.maskedAadhaar || "",
        aadhaarVerificationId: result.aadhaarVerificationId || "",
        aadhaarVerifiedAt: result.aadhaarVerifiedAt || "",
        aadhaarStatus: result.aadhaarStatus || "pending",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        "Failed to fetch user data. Please check your internet connection and try again."
      );
    } finally {
      setIsFetchingData(false);
    }
  };

  // Update field function with improved Aadhaar handling
  const updateField = (field, value) => {
    // Mark form as dirty
    if (!isFormDirty) {
      setIsFormDirty(true);
    }

    // Handle termsAccepted with KYC logic
    if (field === "termsAccepted") {
      const newValue = value;
      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
        // Set KYC to true only if Aadhaar is verified AND terms are accepted
        kycVerified: prev.aadhaarVerified && newValue ? true : false,
      }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      setFieldValidity((prev) => ({
        ...prev,
        [field]: true,
        kycVerified: prev.aadhaarVerified && newValue,
      }));
      return;
    }

    // Handle aadhaarVerified with KYC logic
    if (field === "aadhaarVerified") {
      const newValue = value;
      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
        // Set KYC to true only if Aadhaar is verified AND terms are accepted
        kycVerified: newValue && prev.termsAccepted ? true : false,
      }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      setFieldValidity((prev) => ({
        ...prev,
        [field]: true,
        kycVerified: newValue && prev.termsAccepted,
      }));
      return;
    }

    // Handle Aadhaar number input
    if (field === "idProofNo") {
      // Format Aadhaar number
      const processedValue = value.replace(/[^0-9]/g, "").slice(0, 12);

      // Check if Aadhaar number has changed
      const previousAadhaar = formData.idProofNo || "";
      const newAadhaar = processedValue;

      // If Aadhaar number is completely different (different last 4 digits)
      const isSameAadhaar =
        previousAadhaar &&
        newAadhaar &&
        previousAadhaar.substring(8) === newAadhaar.substring(8);

      // Only reset verification if Aadhaar has changed significantly
      if (formData.aadhaarVerified && field === "idProofNo" && !isSameAadhaar) {
        setFormData((prev) => ({
          ...prev,
          [field]: processedValue,
          aadhaarVerified: false,
          maskedAadhaar: "",
          aadhaarVerificationId: "",
          aadhaarVerifiedAt: "",
          aadhaarStatus: "pending",
          kycVerified: false, // Reset KYC if Aadhaar changes
        }));
      } else {
        // Just update the Aadhaar number
        setFormData((prev) => ({ ...prev, [field]: processedValue }));
      }

      // Validate Aadhaar
      if (processedValue && processedValue.length === 12) {
        const aadhaarError = validateAadhaar(processedValue);
        if (aadhaarError) {
          setErrors((prev) => ({ ...prev, [field]: aadhaarError }));
          setFieldValidity((prev) => ({ ...prev, [field]: false }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: "" }));
          setFieldValidity((prev) => ({ ...prev, [field]: true }));
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
    } else if (field === "contactNumber") {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);

      // Reset phone verification if phone number is changed
      if (formData.phoneVerified && field === "contactNumber") {
        setFormData((prev) => ({
          ...prev,
          phoneVerified: false,
        }));
      }
    }

    // Update form data
    setFormData({ ...formData, [field]: processedValue });

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Real-time validation for specific fields
    const isString = typeof processedValue === "string";

    if (
      (isString && processedValue.trim()) ||
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
          if (processedValue.length === 6 && isValid) {
            fetchCityStateFromPincode(processedValue);
          }
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

      // Update field validity
      setFieldValidity((prev) => ({ ...prev, [field]: isValid }));

      // Update errors if invalid
      if (!isValid && errorMsg) {
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
      }
    }
  };

  // Function to fetch city/state from PIN code
  const fetchCityStateFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    setIsFetchingPincode(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        const po = data[0].PostOffice[0];

        setFormData((prev) => ({
          ...prev,
          city: po.District || "",
          state: po.State || "",
          country: po.Country || "India",
        }));

        setErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
          pincode: "",
        }));

        setFieldValidity((prev) => ({
          ...prev,
          city: true,
          state: true,
          pincode: true,
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
      setIsFetchingPincode(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    // Check if terms are accepted before verification
    if (!formData.termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the Terms and Conditions before verifying Aadhaar.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Terms", onPress: () => setShowTermsModal(true) },
        ]
      );
      return;
    }

    const aadhaarNumber = formData.idProofNo;
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      Alert.alert("Error", "Please enter a valid 12-digit Aadhaar number");
      return;
    }

    // Validate Aadhaar format
    const aadhaarError = validateAadhaar(aadhaarNumber);
    if (aadhaarError) {
      Alert.alert("Invalid Aadhaar", aadhaarError);
      return;
    }

    setVerificationInProgress(true);

    try {
      // Step 1: Get verification URL from backend
      const result = await digiLockerService.verifyAadhaar(
        userId,
        aadhaarNumber
      );

      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to start verification");
        setVerificationInProgress(false);
        return;
      }

      // Step 2: Navigate to WebView
      navigation.navigate("DigiLockerWebViewScreen", {
        verificationUrl: result.verificationUrl,
        verificationId: result.verificationId,
        aadhaarNumber: aadhaarNumber,
        onVerificationComplete: handleVerificationComplete,
      });
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to start verification. Please try again.");
      setVerificationInProgress(false);
    }
  };

  const handleVerificationComplete = async (result) => {
    console.log("Verification result:", result);

    if (result.success && result.aadhaarVerified) {
      try {
        // Extract data from verification result
        const aadhaarData = result.userDetails || {};
        const documentData = result.documentData || {};

        // Update form data with verification results
        const updatedFormData = {
          ...formData,
          idProofNo: result.idProofNo || documentData.uid || formData.idProofNo,
          aadhaarVerified: true,
          maskedAadhaar:
            result.maskedAadhaar ||
            digiLockerService.formatAadhaarNumber(result.idProofNo, true),
          aadhaarVerificationId: result.aadhaarVerificationId,
          aadhaarVerifiedAt: result.aadhaarVerifiedAt,
          aadhaarStatus: result.aadhaarStatus || "VERIFIED",

          // Auto-fill user details from Aadhaar
          username: aadhaarData.name || formData.username,
          dateOfBirth:
            formatDateOfBirth(aadhaarData.dob) || formData.dateOfBirth,
          gender: aadhaarData.gender || formData.gender,
          address1: aadhaarData.address || formData.address1,

          // IMPORTANT: Set KYC to true since Aadhaar is verified AND terms are accepted
          kycVerified: formData.termsAccepted ? true : false, // Only set to true if terms are also accepted
        };

        console.log(
          "Updated form data with Aadhaar verification:",
          updatedFormData
        );

        // Update local state
        setFormData(updatedFormData);
        setFieldValidity((prev) => ({
          ...prev,
          idProofNo: true,
          kycVerified: updatedFormData.kycVerified,
        }));
        setErrors((prev) => ({ ...prev, idProofNo: "" }));

        // Prepare data for API update
        const apiData = {
          // Include all existing form data
          email: formData.email,
          username: updatedFormData.username, // Use name from Aadhaar
          gender: updatedFormData.gender, // Use gender from Aadhaar
          contactNumber: formData.contactNumber,
          address1: updatedFormData.address1, // Use address from Aadhaar
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          dateOfBirth: updatedFormData.dateOfBirth, // Use DOB from Aadhaar
          kycVerified: updatedFormData.kycVerified, // Use the computed KYC status
          termsAccepted: formData.termsAccepted,

          // Aadhaar verification fields
          idProofNo: updatedFormData.idProofNo,
          aadhaarVerified: true,
          maskedAadhaar: updatedFormData.maskedAadhaar,
          aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
          aadhaarVerifiedAt: updatedFormData.aadhaarVerifiedAt,
          aadhaarStatus: updatedFormData.aadhaarStatus,
        };

        console.log("Sending to API:", apiData);

        // Send to API
        const response = await fetch(
          `https://scheme.bmgjewellers.com/api/v1/${userId}/update`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log("Profile update successful:", responseData);

          // Refresh user data to sync with server
          await fetchUserData(userId);

          // Show success message
          Alert.alert(
            "✅ Aadhaar Verified Successfully",
            `Your Aadhaar has been verified and profile has been updated.\n\nName: ${
              aadhaarData.name || "N/A"
            }\nAadhaar: ${updatedFormData.maskedAadhaar}\nKYC Status: ${
              updatedFormData.kycVerified ? "✅ Verified" : "❌ Pending Terms"
            }`,
            [{ text: "OK" }]
          );

          // Close the form if it's open
          if (showForm) {
            closeFormAndReset();
          }
        } else {
          const errorText = await response.text();
          console.error("API error response:", errorText);

          // Show success but warn about server update
          Alert.alert(
            "✅ Aadhaar Verified",
            `Your Aadhaar has been verified locally.\n\nName: ${
              aadhaarData.name || "N/A"
            }\nAadhaar: ${updatedFormData.maskedAadhaar}\nKYC Status: ${
              updatedFormData.kycVerified ? "✅ Verified" : "❌ Pending Terms"
            }\n\nPlease save your profile to update server.`,
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("API update error:", error);
        Alert.alert(
          "✅ Aadhaar Verified",
          "Your Aadhaar has been verified locally. Please save your profile to update server.",
          [{ text: "OK" }]
        );
      }
    } else {
      // Failed case
      Alert.alert(
        "Verification Failed",
        result.message || "Aadhaar verification could not be completed.",
        [{ text: "OK" }]
      );

      // Update local state to show failure
      const updatedFormData = {
        ...formData,
        aadhaarVerified: false,
        aadhaarStatus: result.aadhaarStatus || "FAILED",
        kycVerified: false, // Reset KYC if verification failed
      };

      setFormData(updatedFormData);
      setFieldValidity((prev) => ({
        ...prev,
        idProofNo: false,
        kycVerified: false,
      }));
      setErrors((prev) => ({
        ...prev,
        idProofNo: "Verification failed. Please try again.",
      }));
    }

    setVerificationInProgress(false);
  };

  // Function to verify Phone Number via OTP
  const verifyOTP = async (otp) => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOTP(true);

    try {
      const response = await fetch(
        `https://scheme.bmgjewellers.com/api/v1/${userId}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp: otp }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Close OTP modal first
        setShowOTPModal(false);
        setVerifyingOTP(false);

        // Refresh profile
        await fetchUserData(userId);

        // Close form and show success message
        closeFormAndReset();

        Alert.alert("✅ Success", "Phone number verified successfully!");
      } else {
        Alert.alert(
          "Verification Failed",
          result.message || "Invalid OTP. Please try again."
        );
        setVerifyingOTP(false);
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again."
      );
      setVerifyingOTP(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newFieldValidity = {};

    // ===== CORE REQUIRED FIELDS =====
    const coreRequiredFields = [
      {
        field: "email",
        validator: (v) => {
          if (!v || v.trim() === "") return "Email address is required";
          return validateEmail(v);
        },
        label: "Email Address",
      },
      {
        field: "username",
        validator: (v) => validateName(v),
        label: "Username",
      },
      {
        field: "contactNumber",
        validator: (v) => {
          if (!v || v.trim() === "") return "Phone number is required";
          return validateMobile(v);
        },
        label: "Phone Number",
      },
      {
        field: "dateOfBirth",
        validator: (v) => validateDOB(v),
        label: "Date of Birth",
      },
      {
        field: "address1",
        validator: (v) => validateAddressField(v, "Address Line 1"),
        label: "Address Line 1",
      },
      {
        field: "address2",
        validator: (v) => validateAddressField(v, "Address Line 2"),
        label: "Address Line 2",
      },
      {
        field: "city",
        validator: (v) => validateAddressField(v, "City"),
        label: "City",
      },
      {
        field: "state",
        validator: (v) => validateAddressField(v, "State"),
        label: "State",
      },
      {
        field: "pincode",
        validator: (v) => validatePincode(v),
        label: "PIN Code",
      },
    ];

    // Validate core fields
    coreRequiredFields.forEach(({ field, validator }) => {
      const value = formData[field] || "";
      const error = validator(value);
      if (error) {
        newErrors[field] = error;
        newFieldValidity[field] = false;
      } else {
        newFieldValidity[field] = true;
      }
    });

    // Gender validation
    if (
      !formData.gender ||
      !["male", "female", "other"].includes(formData.gender)
    ) {
      newErrors.gender = "Please select a valid gender";
      newFieldValidity.gender = false;
    }

    // Terms accepted validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
      newFieldValidity.termsAccepted = false;
    }

    // Aadhaar validation (only if provided and not already verified)
    if (
      formData.idProofNo &&
      formData.idProofNo.trim() !== "" &&
      !formData.aadhaarVerified
    ) {
      const aadhaarError = validateAadhaar(formData.idProofNo);
      if (aadhaarError) {
        newErrors.idProofNo = aadhaarError;
        newFieldValidity.idProofNo = false;
      } else {
        newFieldValidity.idProofNo = true;
      }
    }

    setErrors(newErrors);
    setFieldValidity(newFieldValidity);

    // Show alert if any errors
    const hasErrors = Object.keys(newErrors).some((k) => newErrors[k]);
    if (hasErrors) {
      const errorMessage = Object.entries(newErrors)
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

  // Helper function to close form and reset state
  const closeFormAndReset = () => {
    // Prevent multiple calls
    if (formClosingRef.current) return;
    formClosingRef.current = true;

    // Reset all form-related states
    setShowForm(false);
    setIsFormDirty(false);
    setUseAadhaarData(false);

    // Reset form data to current user data
    if (userData) {
      setFormData({
        email: userData.email || "",
        username: userData.username || "",
        gender: userData.gender || "female",
        contactNumber: userData.contactNumber || "",
        address1: userData.address1 || "",
        address2: userData.address2 || "",
        city: userData.city || "",
        state: userData.state || "",
        pincode: userData.pincode || "",
        country: userData.country || "India",
        dateOfBirth: userData.dateOfBirth || "",
        phoneVerified: userData.phoneVerified || false,
        kycVerified: userData.kycVerified || false,
        termsAccepted: userData.termsAccepted || false,
        idProofNo: userData.idProofNo || "",
        aadhaarVerified: userData.aadhaarVerified || false,
        maskedAadhaar: userData.maskedAadhaar || "",
        aadhaarVerificationId: userData.aadhaarVerificationId || "",
        aadhaarVerifiedAt: userData.aadhaarVerifiedAt || "",
        aadhaarStatus: userData.aadhaarStatus || "pending",
      });
    }

    setErrors({});
    setFieldValidity({});
    setIsLoading(false);

    // Reset ref after a delay
    setTimeout(() => {
      formClosingRef.current = false;
    }, 500);
  };

  const handleSubmit = async () => {
    console.log("=== SUBMIT CLICKED ===");
    console.log("Current form data:", formData);

    // First check if terms are accepted
    if (!formData.termsAccepted) {
      Alert.alert(
        "Terms Required",
        "You must accept the Terms and Conditions before updating your profile.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Terms", onPress: () => setShowTermsModal(true) },
        ]
      );
      return;
    }

    // Validate the form
    const isValid = validateForm();

    console.log("Form validation result:", isValid);

    if (!isValid) {
      console.log("❌ Form validation FAILED - NOT saving data");
      return; // Stop here if validation fails
    }

    // Check KYC logic: Both Aadhaar verified AND terms accepted
    if (formData.aadhaarVerified && !formData.termsAccepted) {
      Alert.alert(
        "KYC Incomplete",
        "Your Aadhaar is verified but you need to accept the Terms and Conditions to complete KYC.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log("✅ Form validation PASSED - Saving data...");

    // Update KYC status before sending to API
    const updatedFormData = {
      ...formData,
      kycVerified: formData.aadhaarVerified && formData.termsAccepted,
    };

    setFormData(updatedFormData);

    setIsLoading(true);

    try {
      // Prepare API request data
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
        kycVerified: updatedFormData.kycVerified, // Include computed KYC status
        termsAccepted: updatedFormData.termsAccepted,
        dateOfBirth: updatedFormData.dateOfBirth,
        idProofNo: updatedFormData.idProofNo,
        aadhaarVerified: updatedFormData.aadhaarVerified,
        maskedAadhaar: updatedFormData.maskedAadhaar,
        aadhaarVerificationId: updatedFormData.aadhaarVerificationId,
        aadhaarStatus: updatedFormData.aadhaarStatus,
      };

      console.log("Sending data to API:", apiData);
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        setIsLoading(false);
        return;
      }

      // Make PATCH request to your API
      const response = await fetch(
        `https://scheme.bmgjewellers.com/api/v1/${userId}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("API Response:", result);

        // Check if OTP is sent
        if (result.otpSent === true) {
          console.log("OTP sent to phone number");

          // Save the phone number to verify and user ID
          setPhoneToVerify(updatedFormData.contactNumber);

          // Show OTP modal
          setShowOTPModal(true);

          // Keep the form open until OTP verification
          setIsLoading(false); // Stop loading since we're waiting for OTP
        } else {
          // No OTP required - direct update success
          // Refresh user data after successful update
          await fetchUserData(userId);

          // Close form and show success
          closeFormAndReset();

          Alert.alert(
            "Success ✅",
            updatedFormData.kycVerified
              ? "Profile updated successfully! KYC is now verified."
              : "Profile updated successfully!"
          );
        }
      } else {
        console.error("API Error:", result);
        Alert.alert(
          "API Error",
          result.message || "Failed to save data. Please try again."
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again."
      );
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    closeFormAndReset();
    setShowOTPModal(false);
  };

  const handleEdit = () => {
    if (userData && userData.aadhaarVerified && userData.idProofNo) {
      // Show modal asking if user wants to use Aadhaar data
      setShowUseAadhaarModal(true);
    } else {
      // No verified Aadhaar, proceed with normal edit
      openEditForm(false);
    }
  };

  const openEditForm = (useAadhaarDataFlag) => {
    setUseAadhaarData(useAadhaarDataFlag);

    // Reset form data to current user data before opening
    if (userData) {
      const initialFormData = {
        email: userData.email || "",
        username: userData.username || "",
        gender: userData.gender || "female",
        contactNumber: userData.contactNumber || "",
        address1: userData.address1 || "",
        address2: userData.address2 || "",
        city: userData.city || "",
        state: userData.state || "",
        pincode: userData.pincode || "",
        country: userData.country || "India",
        dateOfBirth: userData.dateOfBirth || "",
        phoneVerified: userData.phoneVerified || false,
        kycVerified: userData.kycVerified || false,
        termsAccepted: userData.termsAccepted || false,
        idProofNo: userData.idProofNo || "",
        aadhaarVerified: userData.aadhaarVerified || false,
        maskedAadhaar: userData.maskedAadhaar || "",
        aadhaarVerificationId: userData.aadhaarVerificationId || "",
        aadhaarVerifiedAt: userData.aadhaarVerifiedAt || "",
        aadhaarStatus: userData.aadhaarStatus || "pending",
      };

      // If user wants to use Aadhaar data, fetch and populate from Aadhaar
      if (useAadhaarDataFlag && userData.aadhaarVerified) {
        Alert.alert(
          "Using Aadhaar Data",
          "Your verified Aadhaar data will be used to pre-fill the form. You can still edit any field."
        );
      }

      setFormData(initialFormData);

      // Set field validity based on verification status
      setFieldValidity((prev) => ({
        ...prev,
        idProofNo: userData.aadhaarVerified || false,
      }));
    }

    setErrors({});
    setIsFormDirty(false);
    setShowUseAadhaarModal(false);
    setShowForm(true);
  };

  // Updated renderAadhaarField function - Hide input if Aadhaar is verified
  const renderAadhaarField = () => {
    if (formData.aadhaarVerified && formData.idProofNo) {
      // Show verified Aadhaar information only (no input)
      return (
        <View style={styles.verifiedAadhaarContainer}>
          <View style={styles.verifiedAadhaarHeader}>
            <Text style={styles.verifiedAadhaarLabel}>Aadhaar Number</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✅ Verified</Text>
            </View>
          </View>

          <View style={styles.verifiedAadhaarContent}>
            <Text style={styles.verifiedAadhaarNumber}>
              {formData.maskedAadhaar ||
                `XXXX XXXX ${formData.idProofNo.slice(8)}`}
            </Text>

            <View style={styles.verificationDetails}>
              {formData.aadhaarVerificationId && (
                <Text style={styles.verificationId}>
                  Verification ID: {formData.aadhaarVerificationId}
                </Text>
              )}
              {formData.aadhaarVerifiedAt && (
                <Text style={styles.verificationDate}>
                  Verified on:{" "}
                  {formatVerificationDate(formData.aadhaarVerifiedAt)}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.changeAadhaarButton}
            onPress={() => {
              Alert.alert(
                "Change Aadhaar?",
                "If you change your Aadhaar number, the current verification will be reset and you'll need to verify again.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Change",
                    onPress: () => {
                      setFormData((prev) => ({
                        ...prev,
                        aadhaarVerified: false,
                        idProofNo: "",
                        maskedAadhaar: "",
                        aadhaarVerificationId: "",
                        aadhaarVerifiedAt: "",
                        aadhaarStatus: "pending",
                        kycVerified: false,
                      }));
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.changeAadhaarButtonText}>Change Aadhaar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show Aadhaar input field if not verified
    return (
      <View style={styles.aadhaarFieldContainer}>
        <View style={styles.aadhaarInputHeader}>
          <Text style={styles.inputLabel}>Aadhaar Number</Text>
          <Text style={styles.requiredIndicator}> *</Text>
          <Text style={styles.aadhaarNote}>Enter 12-digit Aadhaar number</Text>
        </View>

        <View style={styles.aadhaarInputContainer}>
          <TextInput
            style={[
              styles.input,
              styles.aadhaarInput,
              formData.idProofNo &&
                formData.idProofNo.length === 12 &&
                !errors.idProofNo &&
                styles.inputAadhaarReady,
              errors.idProofNo && styles.inputError,
            ]}
            value={formData.idProofNo}
            onChangeText={(v) => updateField("idProofNo", v)}
            placeholder="12-digit Aadhaar number"
            keyboardType="number-pad"
            maxLength={12}
            editable={!formData.aadhaarVerified}
          />

          {formData.idProofNo &&
  formData.idProofNo.length === 12 &&
  !errors.idProofNo &&
  !formData.aadhaarVerified && (
    <View style={styles.aadhaarActions}>
      {formData.termsAccepted ? (
        <TouchableOpacity
          style={styles.verifyButtonFull}
          onPress={handleVerifyAadhaar}
          disabled={verificationInProgress}
        >
          {verificationInProgress ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>🔐 Verify via DigiLocker</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.termsRequiredContainer}>
          <Text style={styles.termsRequiredIcon}>⚠️</Text>
          <Text style={styles.termsRequiredText}>
            Accept terms above to verify Aadhaar
          </Text>
          <TouchableOpacity
            style={styles.termsRequiredButton}
            onPress={() => setShowTermsModal(true)}
          >
            <Text style={styles.termsRequiredButtonText}>VIEW</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )}
        </View>

        {errors.idProofNo && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errors.idProofNo}</Text>
          </View>
        )}
{formData.idProofNo && formData.idProofNo.length === 12 && !errors.idProofNo && (
  <View style={[
    styles.kycStatusContainer,
    formData.aadhaarVerified && formData.termsAccepted 
      ? styles.kycStatusComplete 
      : styles.kycStatusPending
  ]}>
    <Text style={[
      styles.kycStatusIcon,
      formData.aadhaarVerified && formData.termsAccepted 
        ? { color: COLORS.success } 
        : { color: COLORS.warning }
    ]}>
      {formData.aadhaarVerified && formData.termsAccepted ? '✅' : '⚠️'}
    </Text>
    <Text style={[
      styles.kycStatusText,
      formData.aadhaarVerified && formData.termsAccepted 
        ? styles.kycStatusTextComplete 
        : styles.kycStatusTextPending
    ]}>
      {formData.aadhaarVerified && formData.termsAccepted
        ? 'KYC Complete - Aadhaar & Terms Verified'
        : formData.aadhaarVerified
        ? 'Aadhaar Verified- Accept Terms for KYC'
        : 'Aadhaar Ready - Verify & Accept Terms for KYC'}
    </Text>
  </View>
)}
      </View>
    );
  };

  // Gender selection component
  const GenderSelector = () => (
    <View style={styles.genderContainer}>
      <Text style={styles.genderLabel}>Gender *</Text>
      <View style={styles.genderOptions}>
        {["female", "male", "other"].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderOption,
              formData.gender === gender && styles.genderOptionSelected,
            ]}
            onPress={() => updateField("gender", gender)}
          >
            <Text
              style={[
                styles.genderOptionText,
                formData.gender === gender && styles.genderOptionTextSelected,
              ]}
            >
              {gender === "female"
                ? "👩 Female"
                : gender === "male"
                ? "👨 Male"
                : "Other"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.gender && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errors.gender}</Text>
        </View>
      )}
    </View>
  );

  // Terms and conditions checkbox with question mark
  const TermsCheckbox = () => (
    <View style={styles.termsContainer}>
      <View style={styles.termsHeader}>
        <Text style={styles.termsLabel}>Terms and Conditions *</Text>
        <TouchableOpacity
          style={styles.termsHelpButton}
          onPress={() => setShowTermsModal(true)}
        >
          <Text style={styles.termsHelpText}>❓</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.termsCheckboxRow}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            formData.termsAccepted && styles.checkboxChecked,
          ]}
          onPress={() => updateField("termsAccepted", !formData.termsAccepted)}
        >
          {formData.termsAccepted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            I agree to the Terms and Conditions and Privacy Policy
          </Text>
          {formData.aadhaarVerified && !formData.termsAccepted && (
            <Text style={styles.kycWarningText}>
              ⚠️ Accept terms to complete KYC verification
            </Text>
          )}
          {formData.aadhaarVerified && formData.termsAccepted && (
            <Text style={styles.kycSuccessText}>
              ✅ KYC verification complete
            </Text>
          )}
        </View>
      </View>
      {errors.termsAccepted && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errors.termsAccepted}</Text>
        </View>
      )}
    </View>
  );

  // Loading state
  if (isFetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Terms and Conditions Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          updateField("termsAccepted", true);
          setShowTermsModal(false);
        }}
      />

      {/* Use Aadhaar Data Modal */}
      <UseAadhaarDataModal
        visible={showUseAadhaarModal}
        onUseAadhaar={() => openEditForm(true)}
        onManualEntry={() => openEditForm(false)}
        onCancel={() => setShowUseAadhaarModal(false)}
      />

      {/* OTP Modal */}
      <OTPModal
        visible={showOTPModal}
        phoneNumber={phoneToVerify}
        onVerify={verifyOTP}
        onClose={() => {
          setShowOTPModal(false);
          // If OTP modal is closed without verification, keep form open
        }}
        loading={verifyingOTP}
      />

      {/* Header */}
      <CommonHeader
        title="User Profile Management"
        subtitle={userData ? `Welcome, ${userData.username}` : "Loading..."}
      />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <CommonHeader
            title="Edit Your Profile"
            subtitle={
              useAadhaarData
                ? "Using verified Aadhaar data. You can edit any field."
                : "Update your information below. Fields marked with * are required."
            }
            showBackButton={true}
            onBackPress={resetForm}
          />

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Show message if using Aadhaar data */}
            {useAadhaarData && (
              <View style={styles.aadhaarDataNotice}>
                <Text style={styles.aadhaarDataNoticeIcon}>✅</Text>
                <Text style={styles.aadhaarDataNoticeText}>
                  Using verified Aadhaar data. All fields are editable.
                </Text>
              </View>
            )}

            {/* Personal Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👤 Personal Information</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Email Address"
                value={formData.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="Enter email address"
                keyboardType="email-address"
                error={errors.email}
                required
                showValidationIcon={true}
                isValid={fieldValidity.email}
              />

              <CustomInput
                label="Username"
                value={formData.username}
                onChangeText={(v) => updateField("username", v)}
                placeholder="Enter username"
                error={errors.username}
                required
                showValidationIcon={true}
                isValid={fieldValidity.username}
              />

              <GenderSelector />

              <CustomInput
                label="Phone Number"
                value={formData.contactNumber}
                onChangeText={(v) =>
                  updateField(
                    "contactNumber",
                    v.replace(/[^0-9]/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                error={errors.contactNumber}
                required
                showValidationIcon={true}
                isValid={fieldValidity.contactNumber}
                maxLength={10}
              />

              <CustomInput
                label="Date of Birth (YYYY-MM-DD)"
                value={formData.dateOfBirth}
                onChangeText={(v) => updateField("dateOfBirth", v)}
                placeholder="1992-08-25"
                error={errors.dateOfBirth}
                required
                showValidationIcon={true}
                isValid={fieldValidity.dateOfBirth}
              />

              {/* Aadhaar Field - Conditional rendering */}
              {renderAadhaarField()}
            </View>

            {/* Address Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏠 Address Details</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Address Line 1"
                value={formData.address1}
                onChangeText={(v) => updateField("address1", v)}
                placeholder="Street 12"
                error={errors.address1}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address1}
              />

              <CustomInput
                label="Address Line 2"
                value={formData.address2}
                onChangeText={(v) => updateField("address2", v)}
                placeholder="Apartment 101"
                error={errors.address2}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address2}
              />

              {/* City/State Row */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="PIN Code"
                    value={formData.pincode}
                    onChangeText={(v) => updateField("pincode", v)}
                    placeholder="6-digit PIN code"
                    keyboardType="number-pad"
                    error={errors.pincode}
                    required
                    loading={isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.pincode}
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="City"
                    value={formData.city}
                    onChangeText={(v) => updateField("city", v)}
                    placeholder="Enter city"
                    error={errors.city}
                    required
                    editable={!isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.city}
                  />
                </View>
              </View>

              {/* State/Country Row */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="State"
                    value={formData.state}
                    onChangeText={(v) => updateField("state", v)}
                    placeholder="Enter state"
                    error={errors.state}
                    required
                    editable={!isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.state}
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="Country"
                    value={formData.country}
                    onChangeText={(v) => updateField("country", v)}
                    placeholder="India"
                    editable={!isFetchingPincode}
                  />
                </View>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 Terms & Conditions</Text>
                <View style={styles.sectionDivider} />
              </View>

              <TermsCheckbox />
            </View>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <CustomButton
                title="Cancel"
                onPress={resetForm}
                variant="secondary"
                style={styles.cancelButton}
              />
              <CustomButton
                title="Update Profile"
                onPress={handleSubmit}
                variant="primary"
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading || !formData.termsAccepted} // Disable if terms not accepted
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* User Profile Card */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {!userData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👤</Text>
            <Text style={styles.emptyStateTitle}>No User Data Found</Text>
            <Text style={styles.emptyStateText}>
              Please check your internet connection and try again
            </Text>
            <CustomButton
              title="Refresh Data"
              onPress={() => fetchUserData(userId)}
              variant="primary"
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          <DataCard
            data={userData}
            onEdit={handleEdit}
            onVerifyAadhaar={handleVerifyAadhaar}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },

  // Terms Modal Styles
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  termsModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...SHADOWS.xl,
  },
  termsModalHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  termsModalTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.margin.xs,
    textAlign: "center",
  },
  termsModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  termsContent: {
    maxHeight: 400,
    marginBottom: SIZES.margin.lg,
  },
  termSection: {
    marginBottom: SIZES.margin.lg,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  termTitle: {
    ...FONTS.h6,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
    fontWeight: FONTS.weight.bold,
  },
  termSubtitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    fontStyle: "italic",
  },
  termItem: {
    flexDirection: "row",
    marginBottom: SIZES.margin.xs,
    paddingLeft: SIZES.padding.sm,
  },
  termBullet: {
    marginRight: SIZES.margin.sm,
    color: COLORS.textSecondary,
  },
  termText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  subsection: {
    marginLeft: SIZES.margin.md,
    marginTop: SIZES.margin.sm,
  },
  subsectionTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
    fontWeight: FONTS.weight.medium,
  },
  termsModalActions: {
    gap: SIZES.margin.md,
  },
  termsButton: {
    paddingVertical: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  acceptButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  declineButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },

  // OTP Modal Styles
  otpModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  otpModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  otpModalHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  otpModalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  otpModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.margin.xl,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.sm,
    textAlign: "center",
    ...FONTS.h4,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  otpInputFirst: {
    marginLeft: 0,
  },
  otpInputLast: {
    marginRight: 0,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  otpModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.margin.lg,
  },
  otpButton: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZES.margin.xs,
  },
  otpButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  otpButtonTextPrimary: {
    ...FONTS.button,
    color: COLORS.white,
  },
  otpCloseButton: {
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
  },
  otpCloseText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: SIZES.padding.lg,
    paddingBottom: SIZES.padding.xxxl,
  },

  // Section
  section: {
    marginBottom: SIZES.margin.xl,
  },
  sectionHeader: {
    marginBottom: SIZES.margin.lg,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
  },
  sectionDivider: {
    height: 2,
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.full,
  },

  // Aadhaar Field Styles
  aadhaarFieldContainer: {
    marginBottom: SIZES.margin.lg,
  },
  aadhaarInputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
    flexWrap: "wrap",
  },
  aadhaarNote: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginLeft: SIZES.margin.sm,
    flex: 1,
  },
  aadhaarInputContainer: {
    position: "relative",
  },
  aadhaarInput: {
    paddingRight: 120, // Space for verify button
  },
  aadhaarActions: {
    position: "absolute",
    right: SIZES.padding.sm,
    top: 10,
  },
  verifyButtonFull: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    minWidth: 120,
    alignItems: "center",
  },
  termsRequiredText: {
    ...FONTS.caption,
    color: COLORS.warning,
    backgroundColor: COLORS.warning + "10",
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    textAlign: "center",
  },
  aadhaarStatusContainer: {
    marginTop: SIZES.margin.xs,
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.primary + "10",
  },
  aadhaarStatusText: {
    ...FONTS.caption,
    color: COLORS.primary,
    textAlign: "center",
  },

  // Use Aadhaar Data Modal Styles
  useAadhaarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  useAadhaarModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 400,
    ...SHADOWS.xl,
  },
  useAadhaarModalHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  useAadhaarModalIcon: {
    fontSize: SIZES.font.xxxl,
    marginBottom: SIZES.margin.md,
  },
  useAadhaarModalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
    textAlign: "center",
  },
  useAadhaarModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  useAadhaarModalContent: {
    marginBottom: SIZES.margin.xl,
  },
  useAadhaarModalInfo: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
    textAlign: "center",
  },
  aadhaarBenefitsList: {
    backgroundColor: COLORS.successLight + "10",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.lg,
    borderWidth: 1,
    borderColor: COLORS.success + "20",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  benefitIcon: {
    color: COLORS.success,
    marginRight: SIZES.margin.sm,
    fontSize: SIZES.font.md,
  },
  benefitText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  useAadhaarModalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.infoLight + "10",
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
  },
  useAadhaarModalNoteIcon: {
    marginRight: SIZES.margin.sm,
    marginTop: 2,
  },
  useAadhaarModalNoteText: {
    ...FONTS.caption,
    color: COLORS.info,
    flex: 1,
    lineHeight: 16,
  },
  useAadhaarModalActions: {
    gap: SIZES.margin.md,
  },
  useAadhaarModalButton: {
    paddingVertical: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  useAadhaarButton: {
    backgroundColor: COLORS.primary,
  },
  manualEntryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  useAadhaarButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  manualEntryButtonText: {
    ...FONTS.button,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  useAadhaarModalCancel: {
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
  },
  useAadhaarModalCancelText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },

  // Verified Aadhaar Container (when Aadhaar is verified)
  verifiedAadhaarContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.successLight + "10",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    borderWidth: 2,
    borderColor: COLORS.success + "20",
  },
  verifiedAadhaarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.md,
  },
  verifiedAadhaarLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
  },
  verifiedBadgeText: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: FONTS.weight.bold,
  },
  verifiedAadhaarContent: {
    marginBottom: SIZES.margin.md,
  },
  verifiedAadhaarNumber: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: SIZES.margin.md,
    fontWeight: FONTS.weight.bold,
  },
  verificationDetails: {
    alignItems: "center",
    gap: SIZES.margin.xs,
  },
  changeAadhaarButton: {
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAadhaarButtonText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
  },

  // Aadhaar Data Notice
  aadhaarDataNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight + "20",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.lg,
  },
  aadhaarDataNoticeIcon: {
    marginRight: SIZES.margin.sm,
    fontSize: SIZES.font.md,
  },
  aadhaarDataNoticeText: {
    ...FONTS.body,
    color: COLORS.success,
    flex: 1,
    fontWeight: FONTS.weight.medium,
  },

  // Inputs
  inputContainer: {
    marginBottom: SIZES.margin.lg,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  inputLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  requiredIndicator: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
  },
  loadingIndicator: {
    marginLeft: SIZES.margin.xs,
  },
  validationIconContainer: {
    marginLeft: SIZES.margin.xs,
  },
  validIcon: {
    color: COLORS.success,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.margin.sm,
  },
  verificationStatusIcon: {
    marginRight: 4,
    fontSize: SIZES.font.xs,
  },
  verificationStatusText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: FONTS.weight.medium,
  },
  inputVerified: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
    borderWidth: 2,
  },
  inputFailed: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "10",
    borderWidth: 2,
  },
  verificationMessage: {
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    marginTop: SIZES.margin.xs,
    alignItems: "center",
  },
  verificationMessageText: {
    ...FONTS.caption,
    fontSize: 11,
    textAlign: "center",
  },
  invalidIcon: {
    color: COLORS.error,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },
  input: {
    ...COMMON_STYLES.input.default,
    paddingVertical: SIZES.padding.md,
  },
  inputError: {
    ...COMMON_STYLES.input.error,
  },
  inputValid: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    color: COLORS.textDisabled,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: "top",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  errorIcon: {
    marginRight: SIZES.margin.xs,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    flex: 1,
  },

  // Terms Container
  termsContainer: {
    marginBottom: SIZES.margin.lg,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.sm,
  },
  termsLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  termsHelpButton: {
    marginLeft: SIZES.margin.xs,
    padding: 2,
  },
  termsHelpText: {
    fontSize: SIZES.font.md,
    color: COLORS.primary,
  },
  termsCheckboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: SIZES.radius.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SIZES.margin.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  kycWarningText: {
    ...FONTS.caption,
    color: COLORS.warning,
    marginTop: SIZES.margin.xs,
    fontSize: 12,
  },
  kycSuccessText: {
    ...FONTS.caption,
    color: COLORS.success,
    marginTop: SIZES.margin.xs,
    fontSize: 12,
    fontWeight: FONTS.weight.medium,
  },

  // Gender Selector
  genderContainer: {
    marginBottom: SIZES.margin.lg,
  },
  genderLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    marginHorizontal: SIZES.margin.xs,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  genderOptionTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },

  // Row Layout
  row: {
    flexDirection: "row",
    marginHorizontal: -SIZES.margin.xs,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },

  // Buttons
  button: {
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  buttonSmall: {
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    minHeight: 40,
  },
  buttonPrimary: {
    ...COMMON_STYLES.button.primary,
  },
  buttonSecondary: {
    ...COMMON_STYLES.button.secondary,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonGold: {
    ...COMMON_STYLES.button.gold,
  },
  buttonInfo: {
    backgroundColor: COLORS.info,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.button,
  },
  buttonTextSmall: {
    ...FONTS.caption,
    fontWeight: FONTS.weight.medium,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  buttonTextGold: {
    color: COLORS.textPrimary,
  },
  buttonTextInfo: {
    color: COLORS.white,
  },
  buttonTextDisabled: {
    color: COLORS.textDisabled,
  },
  verifyButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },

  // Form Actions
  formActions: {
    flexDirection: "row",
    marginTop: SIZES.margin.xxl,
    marginBottom: SIZES.margin.xxxl,
    paddingHorizontal: SIZES.padding.sm,
  },
  cancelButton: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  saveButton: {
    flex: 2,
    marginLeft: SIZES.margin.sm,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding.lg,
  },

  // Card
  card: {
    ...COMMON_STYLES.card.elevated,
    marginBottom: SIZES.margin.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.margin.md,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  cardTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  statusBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
    alignSelf: "flex-start",
  },
  statusText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  cardActions: {
    flexDirection: "row",
    gap: SIZES.margin.xs,
  },
  actionButton: {
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  editButton: {
    backgroundColor: COLORS.infoLight + "20",
  },
  actionButtonText: {
    ...FONTS.caption,
    color: COLORS.info,
    fontWeight: FONTS.weight.medium,
  },
  cardContent: {
    gap: SIZES.margin.sm,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: SIZES.padding.xs,
  },
  dataLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    width: 120,
  },
  dataValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Aadhaar Section in Card
  aadhaarSection: {
    marginVertical: SIZES.margin.sm,
    paddingVertical: SIZES.padding.sm,
  },
  aadhaarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  verificationBadge: {
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.margin.sm,
  },
  verificationBadgeText: {
    ...FONTS.caption,
    fontWeight: FONTS.weight.medium,
  },
  aadhaarDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SIZES.margin.xs,
  },
  aadhaarValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  verifyAadhaarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    marginLeft: SIZES.margin.sm,
  },
  verifyAadhaarButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
  },

  // Verification Prompt in Card
  verificationPrompt: {
    backgroundColor: COLORS.warningLight + "10",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginTop: SIZES.margin.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + "30",
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  promptIcon: {
    marginRight: SIZES.margin.xs,
  },
  promptTitle: {
    ...FONTS.caption,
    color: COLORS.warning,
    fontWeight: FONTS.weight.bold,
  },
  promptText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    lineHeight: 16,
  },
  benefitsList: {
    marginLeft: SIZES.margin.md,
  },
  benefitItem: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xxxl,
    paddingHorizontal: SIZES.padding.xl,
  },
  emptyStateIcon: {
    fontSize: SIZES.font.xxxl * 2,
    marginBottom: SIZES.margin.lg,
  },
  emptyStateTitle: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    textAlign: "center",
  },
  emptyStateText: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
  },
  emptyStateButton: {
    minWidth: 200,
  },

  // Input with button container
  inputWithButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWithButton: {
    flex: 1,
  },
  verifyButtonInline: {
    position: "absolute",
    right: SIZES.padding.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  verifyButtonTextInline: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
  },
  inputAadhaarReady: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  termsModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...SHADOWS.xl,
  },
  // Input Container
inputContainer: {
  marginBottom: SIZES.margin.lg,
  position: 'relative',
},
labelContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SIZES.margin.xs,
  flexWrap: 'wrap',
},
inputLabel: {
  ...FONTS.bodyMedium,
  color: COLORS.textPrimary,
  fontSize: 14,
  fontWeight: FONTS.weight.medium,
},
requiredIndicator: {
  ...FONTS.bodyMedium,
  color: COLORS.error,
  fontSize: 14,
  fontWeight: FONTS.weight.bold,
},

// Main Input Styling
input: {
  backgroundColor: COLORS.white,
  borderWidth: 1.5,
  borderColor: COLORS.border,
  borderRadius: SIZES.radius.md,
  paddingHorizontal: SIZES.padding.md,
  paddingVertical: SIZES.padding.md,
  fontSize: 15,
  color: COLORS.textPrimary,
  minHeight: 48,
  ...SHADOWS.xs,
},
inputError: {
  borderColor: COLORS.error,
  backgroundColor: COLORS.error + '08',
  borderWidth: 1.5,
},
inputValid: {
  borderColor: COLORS.success,
  backgroundColor: COLORS.success + '05',
},
inputVerified: {
  borderColor: COLORS.success,
  backgroundColor: COLORS.success + '08',
  borderWidth: 2,
},
inputFailed: {
  borderColor: COLORS.error,
  backgroundColor: COLORS.error + '08',
  borderWidth: 2,
},
inputDisabled: {
  backgroundColor: COLORS.disabled,
  borderColor: COLORS.border,
  color: COLORS.textDisabled,
  opacity: 0.7,
},
inputMultiline: {
  minHeight: 100,
  paddingTop: SIZES.padding.md,
  textAlignVertical: 'top',
  lineHeight: 20,
},

// Input with button (for Aadhaar)
inputWithButtonContainer: {
  position: 'relative',
},
inputWithButton: {
  paddingRight: 100, // Space for inline verify button
},
verifyButtonInline: {
  position: 'absolute',
  right: 8,
  top: 8,
  backgroundColor: COLORS.primary,
  paddingHorizontal: SIZES.padding.md,
  paddingVertical: SIZES.padding.sm,
  borderRadius: SIZES.radius.sm,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 70,
  ...SHADOWS.sm,
},
verifyButtonTextInline: {
  ...FONTS.caption,
  color: COLORS.white,
  fontWeight: FONTS.weight.bold,
  fontSize: 12,
},

// Aadhaar specific styles
inputAadhaarReady: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primary + '08',
  borderWidth: 1.5,
},
aadhaarInput: {
  paddingRight: 120,
},

// Error and Validation Styles
errorContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: SIZES.margin.xs,
  paddingHorizontal: 2,
},
errorIcon: {
  marginRight: SIZES.margin.xs,
  fontSize: 12,
},
errorText: {
  ...FONTS.caption,
  color: COLORS.error,
  fontSize: 12,
  flex: 1,
},
validationIconContainer: {
  marginLeft: SIZES.margin.sm,
  backgroundColor: COLORS.success + '20',
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
validIcon: {
  color: COLORS.success,
  fontSize: 12,
  fontWeight: 'bold',
},
invalidIcon: {
  color: COLORS.error,
  fontSize: 12,
  fontWeight: 'bold',
},

// Loading Indicator
loadingIndicator: {
  marginLeft: SIZES.margin.sm,
},

// Verification Status
verificationStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: SIZES.padding.sm,
  paddingVertical: 2,
  borderRadius: SIZES.radius.xs,
  marginLeft: SIZES.margin.sm,
  backgroundColor: 'transparent',
},
verificationStatusIcon: {
  marginRight: 4,
  fontSize: 10,
},
verificationStatusText: {
  ...FONTS.caption,
  fontSize: 10,
  fontWeight: FONTS.weight.medium,
},
verificationMessage: {
  padding: SIZES.padding.xs,
  borderRadius: SIZES.radius.sm,
  marginTop: SIZES.margin.xs,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'transparent',
},
verificationMessageText: {
  ...FONTS.caption,
  fontSize: 11,
  textAlign: 'center',
},

// Placeholder color
inputPlaceholder: {
  color: COLORS.inputPlaceholder || '#999',
},

// Focus state (you can add this dynamically)
inputFocus: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.white,
  ...SHADOWS.sm,
},
// Add to your existing styles:

// Section spacing
section: {
  marginBottom: SIZES.margin.xl,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.lg,
  padding: SIZES.padding.lg,
  ...SHADOWS.sm,
},

// Form content spacing
formContent: {
  padding: SIZES.padding.lg,
  paddingBottom: SIZES.padding.xxxl,
  gap: SIZES.margin.lg,
},

// Row layout for city/state inputs
row: {
  flexDirection: 'row',
  marginHorizontal: -SIZES.margin.xs,
  marginBottom: SIZES.margin.md,
},
halfInput: {
  flex: 1,
  marginHorizontal: SIZES.margin.xs,
},

// Gender selector improvements
genderContainer: {
  marginBottom: SIZES.margin.lg,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.md,
  padding: SIZES.padding.md,
  borderWidth: 1,
  borderColor: COLORS.borderLight,
},
genderLabel: {
  ...FONTS.bodyMedium,
  color: COLORS.textPrimary,
  marginBottom: SIZES.margin.sm,
  fontSize: 14,
  fontWeight: FONTS.weight.medium,
},
genderOptions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: SIZES.margin.xs,
},
genderOption: {
  flex: 1,
  paddingVertical: SIZES.padding.sm,
  paddingHorizontal: SIZES.padding.xs,
  borderRadius: SIZES.radius.sm,
  borderWidth: 1.5,
  borderColor: COLORS.border,
  alignItems: 'center',
  backgroundColor: COLORS.white,
},
genderOptionSelected: {
  backgroundColor: COLORS.primary + '10',
  borderColor: COLORS.primary,
},
genderOptionText: {
  ...FONTS.caption,
  color: COLORS.textSecondary,
  fontSize: 13,
},
genderOptionTextSelected: {
  color: COLORS.primary,
  fontWeight: FONTS.weight.bold,
},

// Terms checkbox improvements
termsContainer: {
  marginBottom: SIZES.margin.lg,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.md,
  padding: SIZES.padding.md,
  borderWidth: 1,
  borderColor: COLORS.borderLight,
},
termsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SIZES.margin.sm,
},
termsLabel: {
  ...FONTS.bodyMedium,
  color: COLORS.textPrimary,
  fontSize: 14,
  fontWeight: FONTS.weight.medium,
},
termsCheckboxRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},
checkbox: {
  width: 22,
  height: 22,
  borderRadius: SIZES.radius.xs,
  borderWidth: 2,
  borderColor: COLORS.border,
  marginRight: SIZES.margin.sm,
  marginTop: 2,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.white,
},
checkboxChecked: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
},
checkmark: {
  color: COLORS.white,
  fontSize: SIZES.font.sm,
  fontWeight: 'bold',
},
// In your styles object:
input: {
  backgroundColor: COLORS.white,
  borderWidth: 1.5,
  borderColor: COLORS.border,
  borderRadius: SIZES.radius.md,
  paddingHorizontal: SIZES.padding.md,
  paddingVertical: SIZES.padding.md,
  fontSize: 15,
  color: COLORS.textPrimary,
  minHeight: 48,
  ...SHADOWS.xs,
},
inputMultiline: {
  minHeight: 100,
  paddingTop: SIZES.padding.md,
  textAlignVertical: 'top',
  lineHeight: 20,
},
inputError: {
  borderColor: COLORS.error,
  backgroundColor: COLORS.error + '08',
  borderWidth: 1.5,
},
inputValid: {
  borderColor: COLORS.success,
  backgroundColor: COLORS.success + '05',
},
inputVerified: {
  borderColor: COLORS.success,
  backgroundColor: COLORS.success + '08',
  borderWidth: 2,
},
inputFailed: {
  borderColor: COLORS.error,
  backgroundColor: COLORS.error + '08',
  borderWidth: 2,
},
inputDisabled: {
  backgroundColor: COLORS.disabled,
  borderColor: COLORS.border,
  color: COLORS.textDisabled,
  opacity: 0.7,
},
inputWithButton: {
  paddingRight: 100, // Make room for verify button
},
inputAadhaarReady: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primary + '08',
  borderWidth: 1.5,
},
// Add these styles to your existing styles object:

// Aadhaar field specific styles
aadhaarFieldContainer: {
  marginBottom: SIZES.margin.lg,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.md,
  padding: SIZES.padding.md,
  borderWidth: 1,
  borderColor: COLORS.borderLight,
  ...SHADOWS.xs,
},
aadhaarInputHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SIZES.margin.sm,
  flexWrap: 'wrap',
},
aadhaarNote: {
  ...FONTS.caption,
  color: COLORS.textTertiary,
  marginLeft: SIZES.margin.sm,
  fontSize: 12,
  flex: 1,
},
aadhaarInputContainer: {
  position: 'relative',
  marginBottom: SIZES.margin.xs,
},
aadhaarInput: {
  paddingRight: 140, // Extra space for verify button
  fontSize: 16,
  letterSpacing: 1,
  fontWeight: FONTS.weight.medium,
},
aadhaarActions: {
  position: 'absolute',
  right: 0,
  top: 0,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
verifyButtonFull: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: SIZES.padding.md,
  paddingVertical: SIZES.padding.sm + 2,
  borderRadius: SIZES.radius.sm,
  minWidth: 140,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: SIZES.margin.xs,
  ...SHADOWS.sm,
},
verifyButtonText: {
  ...FONTS.caption,
  color: COLORS.white,
  fontWeight: FONTS.weight.bold,
  fontSize: 12,
},
termsRequiredContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.warning + '15',
  borderRadius: SIZES.radius.sm,
  padding: SIZES.padding.sm,
  borderWidth: 1,
  borderColor: COLORS.warning + '30',
},
termsRequiredIcon: {
  marginRight: SIZES.margin.xs,
  color: COLORS.warning,
  fontSize: 12,
},
termsRequiredText: {
  ...FONTS.caption,
  color: COLORS.warning,
  fontSize: 12,
  fontWeight: FONTS.weight.medium,
  flex: 1,
},
termsRequiredButton: {
  marginLeft: SIZES.margin.xs,
  backgroundColor: COLORS.warning,
  paddingHorizontal: SIZES.padding.sm,
  paddingVertical: 4,
  borderRadius: SIZES.radius.xs,
},
termsRequiredButtonText: {
  ...FONTS.caption,
  color: COLORS.white,
  fontSize: 10,
  fontWeight: FONTS.weight.bold,
},
aadhaarStatusContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: SIZES.margin.sm,
  padding: SIZES.padding.sm,
  borderRadius: SIZES.radius.sm,
  backgroundColor: COLORS.primary + '08',
  borderWidth: 1,
  borderColor: COLORS.primary + '20',
},
aadhaarStatusText: {
  ...FONTS.caption,
  color: COLORS.primary,
  fontSize: 12,
  fontWeight: FONTS.weight.medium,
},
aadhaarStatusIcon: {
  marginRight: SIZES.margin.xs,
  fontSize: 12,
},

// Enhanced verification status styles
verificationPrompt: {
  backgroundColor: COLORS.info + '10',
  borderRadius: SIZES.radius.md,
  padding: SIZES.padding.md,
  marginTop: SIZES.margin.md,
  borderWidth: 1,
  borderColor: COLORS.info + '30',
},
verificationPromptHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SIZES.margin.xs,
},
verificationPromptIcon: {
  marginRight: SIZES.margin.xs,
  color: COLORS.info,
  fontSize: 14,
},
verificationPromptTitle: {
  ...FONTS.caption,
  color: COLORS.info,
  fontWeight: FONTS.weight.bold,
  fontSize: 13,
},
verificationPromptText: {
  ...FONTS.caption,
  color: COLORS.textSecondary,
  fontSize: 12,
  lineHeight: 16,
  marginBottom: SIZES.margin.xs,
},
verificationBenefitsList: {
  marginLeft: SIZES.margin.sm,
},
verificationBenefitItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 2,
},
verificationBenefitIcon: {
  marginRight: SIZES.margin.xs,
  color: COLORS.success,
  fontSize: 10,
},
verificationBenefitText: {
  ...FONTS.caption,
  color: COLORS.textSecondary,
  fontSize: 11,
},

// Verified Aadhaar display styles
verifiedAadhaarContainer: {
  marginBottom: SIZES.margin.lg,
  backgroundColor: COLORS.success + '08',
  borderRadius: SIZES.radius.md,
  padding: SIZES.padding.lg,
  borderWidth: 2,
  borderColor: COLORS.success + '20',
  ...SHADOWS.sm,
},
verifiedAadhaarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SIZES.margin.md,
},
verifiedAadhaarLabel: {
  ...FONTS.bodyMedium,
  color: COLORS.textPrimary,
  fontWeight: FONTS.weight.bold,
  fontSize: 15,
},
verifiedBadge: {
  backgroundColor: COLORS.success + '20',
  paddingHorizontal: SIZES.padding.md,
  paddingVertical: SIZES.padding.xs,
  borderRadius: SIZES.radius.sm,
  flexDirection: 'row',
  alignItems: 'center',
  gap: SIZES.margin.xs,
},
verifiedBadgeText: {
  ...FONTS.caption,
  color: COLORS.success,
  fontWeight: FONTS.weight.bold,
  fontSize: 12,
},
verifiedAadhaarContent: {
  marginBottom: SIZES.margin.md,
  alignItems: 'center',
},
verifiedAadhaarNumber: {
  ...FONTS.h4,
  color: COLORS.textPrimary,
  textAlign: 'center',
  letterSpacing: 2,
  marginBottom: SIZES.margin.md,
  fontWeight: FONTS.weight.bold,
  fontSize: 20,
},
verificationDetails: {
  alignItems: 'center',
  gap: SIZES.margin.xs,
  marginTop: SIZES.margin.sm,
},
verificationId: {
  ...FONTS.caption,
  color: COLORS.textSecondary,
  fontSize: 11,
  backgroundColor: COLORS.gray100,
  paddingHorizontal: SIZES.padding.sm,
  paddingVertical: 2,
  borderRadius: SIZES.radius.xs,
},
verificationDate: {
  ...FONTS.caption,
  color: COLORS.success,
  fontSize: 12,
  fontWeight: FONTS.weight.medium,
},
changeAadhaarButton: {
  paddingVertical: SIZES.padding.sm,
  paddingHorizontal: SIZES.padding.lg,
  backgroundColor: COLORS.white,
  borderWidth: 1.5,
  borderColor: COLORS.border,
  borderRadius: SIZES.radius.md,
  alignItems: 'center',
  justifyContent: 'center',
  ...SHADOWS.xs,
},
changeAadhaarButtonText: {
  ...FONTS.caption,
  color: COLORS.textSecondary,
  fontWeight: FONTS.weight.medium,
  fontSize: 13,
},

// KYC status indicator
kycStatusContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: SIZES.margin.sm,
  padding: SIZES.padding.sm,
  borderRadius: SIZES.radius.sm,
},
kycStatusComplete: {
  backgroundColor: COLORS.success + '10',
  borderWidth: 1,
  borderColor: COLORS.success + '20',
},
kycStatusPending: {
  backgroundColor: COLORS.warning + '10',
  borderWidth: 1,
  borderColor: COLORS.warning + '20',
},
kycStatusIcon: {
  marginRight: SIZES.margin.xs,
  fontSize: 12,
},
kycStatusText: {
  ...FONTS.caption,
  fontSize: 12,
  fontWeight: FONTS.weight.medium,
},
kycStatusTextComplete: {
  color: COLORS.success,
},
kycStatusTextPending: {
  color: COLORS.warning,
},

// Add these to enhance existing styles
termsHelpButton: {
  marginLeft: SIZES.margin.xs,
  backgroundColor: COLORS.primary + '10',
  width: 22,
  height: 22,
  borderRadius: 11,
  justifyContent: 'center',
  alignItems: 'center',
},
termsHelpText: {
  fontSize: SIZES.font.sm,
  color: COLORS.primary,
  fontWeight: 'bold',
},
});
