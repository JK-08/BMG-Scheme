import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../Config/API";
import { COLORS, SIZES, FONTS, moderateScale } from "../../utils/Theme";

const { width, height } = Dimensions.get("window");

const OtpModal = ({ visible, onClose, onVerified, showToast }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const SMS_CONFIG = {
    url: "https://sms.textspeed.in/vb/apikey.php",
    authKey: "2J8jg3HoFzNpJKhR",
    senderId: "BMGGOL",
    templateId: "1707175886625084866",
  };

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const sendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setOtpMessage("Enter valid 10-digit phone number");
      shakeAnimation();
      return;
    }

    setLoading(true);
    setOtpMessage("");

    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem("pendingPhone", phoneNumber);
      await AsyncStorage.setItem("otp", newOtp);

      const smsMessage = `BMG JEWELLERS PRIVATE LIMITED: Your OTP for login is ${newOtp}. Please enter this code in the app to continue. This OTP is valid for 10 minutes. Do not share it with anyone.`;

      const params = {
        apikey: SMS_CONFIG.authKey,
        senderid: SMS_CONFIG.senderId,
        templateid: SMS_CONFIG.templateId,
        number: `91${phoneNumber}`,
        message: smsMessage,
      };

      const formBody = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const response = await fetch(SMS_CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });

      if (response.ok) {
        showToast("OTP sent successfully ✓");
        setShowOtpInput(true);
        setResendTimer(60);
      } else {
        setOtpMessage("Failed to send OTP. Please try again.");
        shakeAnimation();
        showToast("Failed to send OTP");
      }
    } catch (err) {
      setOtpMessage("Network error. Please check your connection.");
      shakeAnimation();
      showToast("Network error while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem("otp", newOtp);

      const storedPhone = await AsyncStorage.getItem("pendingPhone");
      if (!storedPhone) {
        showToast("No phone number found");
        return;
      }

      const smsMessage = `BMG JEWELLERS PRIVATE LIMITED: Your OTP for login is ${newOtp}. Please enter this code in the app to continue. This OTP is valid for 10 minutes. Do not share it with anyone.`;

      const params = {
        apikey: SMS_CONFIG.authKey,
        senderid: SMS_CONFIG.senderId,
        templateid: SMS_CONFIG.templateId,
        number: `91${storedPhone}`,
        message: smsMessage,
      };

      const formBody = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const response = await fetch(SMS_CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });

      if (response.ok) {
        showToast("OTP resent successfully ✓");
        setResendTimer(60);
        setEnteredOtp("");
        setOtpMessage("");
      } else {
        showToast("Failed to resend OTP");
      }
    } catch (error) {
      showToast("Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length !== 6) {
      setOtpMessage("Enter valid 6-digit OTP");
      shakeAnimation();
      return;
    }

    setLoading(true);
    setOtpMessage("Verifying OTP...");

    try {
      const storedPhone = await AsyncStorage.getItem("pendingPhone");
      const storedOtp = await AsyncStorage.getItem("otp");

      if (!storedPhone || !storedOtp) {
        showToast("No OTP found. Please request a new one.");
        return;
      }

      if (enteredOtp === storedOtp) {
        showToast("OTP verified successfully ✓");
        await AsyncStorage.setItem("verifiedPhone", storedPhone);
        await AsyncStorage.removeItem("otp");
        onVerified();
        onClose();
      } else {
        setOtpMessage("Invalid OTP. Please try again.");
        shakeAnimation();
      }
    } catch (err) {
      setOtpMessage("Verification failed. Please try again.");
      shakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setPhoneNumber("");
    setEnteredOtp("");
    setOtpMessage("");
    setResendTimer(0);
    setShowOtpInput(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.headerGradient} />
                <Text style={styles.title}>
                  {showOtpInput ? "🔐 Verify OTP" : "📱 Phone Verification"}
                </Text>
                <Text style={styles.subtitle}>
                  {showOtpInput
                    ? "Enter the 6-digit code sent to your phone"
                    : "We'll send you a verification code"}
                </Text>
              </View>

              <View style={styles.content}>
                {!showOtpInput ? (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <View style={styles.phoneInputWrapper}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="Enter 10-digit number"
                          placeholderTextColor={COLORS.placeholder}
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={phoneNumber}
                          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                        />
                      </View>
                    </View>

                    {otpMessage !== "" && (
                      <View style={styles.messageContainer}>
                        <Text style={styles.errorText}>⚠️ {otpMessage}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        (!phoneNumber || phoneNumber.length !== 10) && styles.buttonDisabled,
                      ]}
                      onPress={sendOtp}
                      disabled={loading || !phoneNumber || phoneNumber.length !== 10}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>
                        OTP sent to{" "}
                        <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
                      </Text>
                      <Text style={styles.validityText}>Valid for 10 minutes</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Enter OTP</Text>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="● ● ● ● ● ●"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="numeric"
                        maxLength={6}
                        value={enteredOtp}
                        onChangeText={(text) => setEnteredOtp(text.replace(/[^0-9]/g, ""))}
                      />
                    </View>

                    {otpMessage !== "" && (
                      <View style={styles.messageContainer}>
                        <Text style={styles.errorText}>⚠️ {otpMessage}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        enteredOtp.length !== 6 && styles.buttonDisabled,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={loading || enteredOtp.length !== 6}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Verify OTP</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.actionsContainer}>
                      {resendTimer > 0 ? (
                        <View style={styles.timerContainer}>
                          <Text style={styles.timerText}>
                            Resend OTP in{" "}
                            <Text style={styles.timerNumber}>{resendTimer}s</Text>
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={resendOtp} style={styles.linkButton} activeOpacity={0.7}>
                          <Text style={styles.linkText}>🔄 Resend OTP</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={resetModal}
                        style={styles.linkButton}
                        activeOpacity={0.7}
                        disabled={loading}
                      >
                        <Text style={styles.linkText}>✏️ Change Number</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={resetModal}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    width: width * 0.9,
    maxWidth: 420,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 15 },
    }),
  },
  header: {
    paddingTop: moderateScale(32),
    paddingBottom: moderateScale(24),
    paddingHorizontal: moderateScale(24),
    backgroundColor: COLORS.surface,
    position: "relative",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.title,
    textAlign: "center",
    marginBottom: moderateScale(8),
  },
  subtitle: {
    ...FONTS.fontSm,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
  content: { padding: moderateScale(24) },
  inputContainer: { marginBottom: moderateScale(20) },
  inputLabel: {
    ...FONTS.body1,
    fontSize: moderateScale(13),
    color: COLORS.label,
    marginBottom: moderateScale(8),
    fontWeight: "600",
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    overflow: "hidden",
  },
  countryCode: {
    ...FONTS.body1,
    fontSize: moderateScale(16),
    color: COLORS.text,
    paddingHorizontal: moderateScale(16),
    fontWeight: "600",
    backgroundColor: COLORS.surface,
    paddingVertical: moderateScale(16),
  },
  phoneInput: {
    ...FONTS.body1,
    flex: 1,
    fontSize: moderateScale(16),
    color: COLORS.text,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
  },
  otpInput: {
    ...FONTS.body1,
    fontSize: moderateScale(24),
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: moderateScale(8),
    backgroundColor: COLORS.input,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    paddingVertical: moderateScale(18),
    color: COLORS.text,
  },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(20),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: { ...FONTS.font, color: COLORS.text, textAlign: "center" },
  phoneHighlight: { ...FONTS.body1, fontWeight: "700", color: COLORS.primary },
  validityText: {
    ...FONTS.fontSm,
    color: COLORS.success,
    textAlign: "center",
    marginTop: moderateScale(4),
    fontWeight: "600",
  },
  messageContainer: {
    backgroundColor: COLORS.danger + "15",
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: moderateScale(16),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  errorText: {
    ...FONTS.fontSm,
    color: COLORS.danger,
    textAlign: "center",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(8),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  primaryButtonText: {
    ...FONTS.body1,
    fontSize: moderateScale(16),
    color: COLORS.white,
    fontWeight: "700",
  },
  actionsContainer: { marginTop: moderateScale(24), gap: moderateScale(12) },
  timerContainer: { alignItems: "center", padding: moderateScale(12) },
  timerText: { ...FONTS.fontSm, color: COLORS.textLight },
  timerNumber: { ...FONTS.body1, fontWeight: "700", color: COLORS.primary },
  linkButton: { padding: moderateScale(12), alignItems: "center" },
  linkText: { ...FONTS.font, color: COLORS.primary, fontWeight: "600" },
  closeButton: {
    position: "absolute",
    top: moderateScale(16),
    right: moderateScale(16),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: moderateScale(18),
    color: COLORS.textLight,
    fontWeight: "600",
  },
});

export default OtpModal;
