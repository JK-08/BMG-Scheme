import React, { useState } from "react";
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

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale } = theme;

const VerifyOtpScreen = ({ route, navigation }) => {
  const { contactNumber, mode } = route.params || {};
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <View style={styles.container}>
      <CommonHeader title="Verify OTP" />
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
    alignSelf: "center",
    padding: SIZES.padding.sm,
  },
  resendText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: "underline",
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
  
  styles.resendContainer = {
    ...styles.resendContainer,
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