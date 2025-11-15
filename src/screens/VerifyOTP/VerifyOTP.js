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
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/MainTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { OTPService, UserService } from "../../services/OTPService";

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
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <CommonHeader title="Verify OTP" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.subtitle}>
            Enter the OTP sent to <Text style={styles.contact}>{contactNumber}</Text>
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              textAlign="left"
              autoFocus
            />

            {mode === "forgot" && (
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                textAlign="left"
              />
            )}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === "forgot" ? "Reset Password" : "Verify OTP"}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.padding.xl,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.md * 1.6,
    marginBottom: SIZES.xl,
  },
  contact: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    ...SHADOWS.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    fontSize: SIZES.font.md,
    marginBottom: SIZES.md,
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", // OTP clarity
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    marginTop: SIZES.sm,
  },
  buttonText: {
    color: COLORS.white,
    ...FONTS.h5,
    textAlign: "center",
  },
  resendContainer: {
    marginTop: SIZES.md,
    alignSelf: "center",
  },
  resendText: {
    color: COLORS.primary,
    ...FONTS.body,
    textDecorationLine: "underline",
  },
});
