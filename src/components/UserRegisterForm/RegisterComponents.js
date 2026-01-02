import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { styles } from "./UserStyles";

export const CustomButton = ({
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
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#FFF" />
    ) : (
      <Text
        style={[
          styles.buttonText,
          small && styles.buttonTextSmall,
          variant === "secondary" && styles.buttonTextSecondary,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    )}
  </TouchableOpacity>
);



export const ConsentModal = ({ visible, onAccept, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.consentModalOverlay}>
        <View style={styles.consentModalContainer}>
          <View style={styles.consentModalHeader}>
            <Text style={styles.consentModalIcon}>🔐</Text>
            <Text style={styles.consentModalTitle}>
              Consent for Identity Verification & Data Processing
            </Text>
          </View>

          <ScrollView
            style={styles.consentModalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.consentModalText}>
              I voluntarily consent to the collection and use of my personal
              information for the limited purpose of customer identification,
              verification, and transaction processing in relation to
              gold/silver purchase or related services. I understand that
              Aadhaar, if used, is utilised strictly for verification purposes
              only and is not stored by the Company. I confirm that I have been
              informed of my right to provide alternative government-issued
              identity documents such as PAN, Voter ID, or Driving Licence. I
              have read and understood the Privacy Policy and agree to the
              processing, storage, and protection of my personal data in
              accordance with applicable laws including the Digital Personal
              Data Protection Act, 2023, the Aadhaar Act, 2016, and the
              Information Technology Act, 2000.
            </Text>

            <View style={styles.consentDisclaimer}>
              <Text style={styles.consentDisclaimerIcon}>ℹ️</Text>
              <Text style={styles.consentDisclaimerText}>
                Your information is securely encrypted and processed in
                compliance with government regulations.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.consentModalActions}>
            <TouchableOpacity
              style={styles.consentAcceptButton}
              onPress={onAccept}
            >
              <Text style={styles.consentAcceptButtonText}>
                ☑ I Agree & Continue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.consentDeclineButton}
              onPress={onClose}
            >
              <Text style={styles.consentDeclineButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};



export const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}:</Text>
    <Text style={styles.dataValue}>{value || "N/A"}</Text>
  </View>
);



export const OTPModal = ({ visible, phoneNumber, onVerify, onClose, loading }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = [];

  useEffect(() => {
    if (visible) setOtp(["", "", "", "", "", ""]);
  }, [visible]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      const pastedOtp = value.split("").slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
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
                style={[styles.otpInput, digit && styles.otpInputFilled]}
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
                <ActivityIndicator size="small" color="#FFF" />
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




export const CustomInput = ({
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
  isAadhaarField = false,
  aadhaarVerified = false,
  verificationStatus = null,
  onVerifyPress = null,
  isVerifying = false,
}) => {
  const getVerificationStatusIcon = () => {
    if (!isAadhaarField || !value || value.length < 12) return null;
    if (verificationStatus === "verified" || aadhaarVerified) {
      return { icon: "✅", color: "#10B981", message: "Verified" };
    } else if (verificationStatus === "failed") {
      return { icon: "❌", color: "#EF4444", message: "Verification failed" };
    } else if (verificationStatus === "pending") {
      return { icon: "⏳", color: "#F59E0B", message: "Verification pending" };
    } else if (value.length === 12 && !error) {
      return {
        icon: "ℹ️",
        color: "#3B82F6",
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
            color="#3B82F6"
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
        {status && (
          <View
            style={[
              styles.verificationStatus,
              { backgroundColor: `${status.color}20` },
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
            status && status.icon === "✅" && styles.inputVerified,
            status && status.icon === "❌" && styles.inputFailed,
            !editable && styles.inputDisabled,
            isAadhaarField && styles.inputWithButton,
            isAadhaarField &&
              value.length === 12 &&
              !error &&
              styles.inputAadhaarReady,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          keyboardType={keyboardType || "default"}
          editable={editable}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
        />
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
                <ActivityIndicator size="small" color="#FFF" />
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
            { backgroundColor: `${status.color}10` },
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

