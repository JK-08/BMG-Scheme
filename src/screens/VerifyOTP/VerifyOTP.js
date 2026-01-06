import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { OTPService, UserService } from "../../services/OTPService";
import { useNavigation } from "@react-navigation/native";
const { COLORS, SIZES, FONTS, SHADOWS, moderateScale } = theme;

const VerifyOtpScreen = ({ route }) => {
  const { contactNumber, mode, userId, hashKey } = route.params || {};
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const navigation = useNavigation();
  
  const timerRef = useRef(null);

  // Timer countdown effect
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timer, isTimerActive]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (resendLoading || isTimerActive) return;

    try {
      setResendLoading(true);

      if (mode === "forgot") {
        if (!hashKey) {
          throw new Error("Hash key not found. Please go back and try again.");
        }
        await OTPService.sendForgotPasswordOTP(contactNumber, hashKey);
      } else {
        if (!userId) {
          throw new Error("User ID not found. Please go back and try again.");
        }
        await OTPService.sendContactUpdateOTP(userId, contactNumber);
      }

      // Reset timer
      setTimer(60);
      setIsTimerActive(true);
      
      Alert.alert("OTP Resent", "New OTP has been sent to your mobile.");
    } catch (error) {
      const errorMessage =
        error?.message?.replace(/^Error:\s*/, "") ||
        "Failed to resend OTP. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!UserService.validateOTP(otp)) {
      return Alert.alert("Error", "Please enter a valid OTP.");
    }

    if (mode === "forgot" && !UserService.validatePassword(newPassword)) {
      return Alert.alert(
        "Error",
        "Please enter a new password with at least 6 characters."
      );
    }

    try {
      setLoading(true);

      let data;

      if (mode === "verify") {
        data = await OTPService.verifyContactOTP(contactNumber, otp);

        Alert.alert(
          "Success",
          data.errorMessage || "Contact number updated successfully!"
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "MpinScreen", params: { step: 3 } }],
        });
      } else {
        data = await OTPService.verifyForgotPasswordOTP(
          contactNumber,
          otp,
          newPassword
        );

        Alert.alert("Success", data.message || "Password reset successfully!");
        navigation.navigate("LoginPage");
      }
    } catch (error) {
      console.error("Verify OTP Error:", error);
      Alert.alert(
        "Error",
        error.message || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <CommonHeader title="Verify OTP"
       onBackPress={() => navigation.navigate('LoginPage')} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Enter the OTP sent to <Text style={styles.contact}>+91 {contactNumber}</Text>
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              textAlign="center"
              autoFocus
              selectionColor={COLORS.primary}
            />

            {mode === "forgot" && (
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                textAlign="left"
                selectionColor={COLORS.primary}
              />
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              <LinearGradient
                colors={COLORS.gradient.brand}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {mode === "forgot" ? "Reset Password" : "Verify OTP"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendPrompt}>
                Didn't receive the OTP?
              </Text>
              <TouchableOpacity
                style={[
                  styles.resendButton,
                  (isTimerActive || resendLoading) && styles.resendButtonDisabled,
                ]}
                onPress={handleResendOtp}
                disabled={isTimerActive || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.resendButtonText}>
                    {isTimerActive
                      ? `Resend OTP in ${formatTime(timer)}`
                      : "Resend OTP"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.xl,
    paddingTop: SIZES.padding.xxl,
    paddingBottom: SIZES.padding.xl,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.lg * 1.5,
    marginBottom: SIZES.xxl,
    textAlign: "center",
  },
  contact: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.xxl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: Platform.OS === "ios" ? SIZES.padding.lg : SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    fontSize: SIZES.font.md,
    marginBottom: SIZES.lg,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
    ...SHADOWS.sm,
  },
  primaryButton: {
    borderRadius: SIZES.radius.md,
    overflow: "hidden",
    ...SHADOWS.md,
    height: SIZES.button.lg,
    marginTop: SIZES.md,
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...FONTS.button,
    color: COLORS.textInverse,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendContainer: {
    marginTop: SIZES.xl,
    alignItems: "center",
  },
  resendPrompt: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  resendButton: {
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

// Platform-specific adjustments
if (Platform.OS === "web") {
  styles.input = {
    ...styles.input,
    outlineStyle: "none",
    paddingVertical: SIZES.padding.lg,
  };
  
  styles.primaryButton = {
    ...styles.primaryButton,
    cursor: "pointer",
  };
  
  styles.resendButton = {
    ...styles.resendButton,
    cursor: "pointer",
  };
  
  styles.scrollContent = {
    ...styles.scrollContent,
    minHeight: "100vh",
  };
}

// Additional responsive adjustments for small screens
if (SIZES.screen.height < 600) {
  styles.scrollContent = {
    ...styles.scrollContent,
    paddingTop: SIZES.padding.lg,
  };
  
  styles.card = {
    ...styles.card,
    paddingVertical: SIZES.padding.xl,
    paddingHorizontal: SIZES.padding.lg,
  };
}

// For large screens
if (SIZES.screen.height > 800) {
  styles.card = {
    ...styles.card,
    maxWidth: moderateScale(400),
    alignSelf: "center",
    width: "100%",
  };
}