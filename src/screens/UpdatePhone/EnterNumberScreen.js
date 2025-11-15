import React, { useState, useEffect } from "react";
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

const EnterNumberScreen = ({ navigation, route }) => {
  const mode = route.params?.mode || "verify";
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await UserService.loadUserData(mode, route.params);
        setUserId(userData);
      } catch (error) {
        console.warn("Error loading user:", error);
      }
    };
    loadUser();
  }, [route.params, mode]);

  const handleSendOtp = async () => {
    if (!UserService.validateContactNumber(contactNumber)) {
      return Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit number."
      );
    }

    try {
      setLoading(true);

      if (mode === "forgot") {
        const hashKey = await OTPService.getHashKey();
        await OTPService.sendForgotPasswordOTP(contactNumber, hashKey);

        Alert.alert("OTP Sent", "Check your mobile for OTP.");
        navigation.navigate("VerifyOtp", {
          mode: "forgot",
          contactNumber,
          hashKey,
        });
      } else {
        if (!userId) {
          throw new Error("User ID not found. Please try again.");
        }

        await OTPService.sendContactUpdateOTP(userId, contactNumber);

        Alert.alert("OTP Sent", "Please check your mobile for the OTP.");
        navigation.navigate("VerifyOtp", {
          mode: "verify",
          contactNumber,
          userId,
        });
      }
    } catch (error) {
      // ✅ Clean alert without console logs
      const errorMessage =
        error?.message?.replace(/^Error:\s*/, "") ||
        "Failed to send OTP. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <CommonHeader
        title={mode === "forgot" ? "Forgot Password" : "Update Phone Number"}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.subtitle}>
            {mode === "forgot"
              ? "Enter your registered mobile number to reset your password."
              : "Enter your mobile number to receive an OTP for verification."}
          </Text>

          <View style={styles.formSection}>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="number-pad"
              maxLength={10}
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === "forgot" ? "Send OTP" : "Verify Number"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EnterNumberScreen;

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
  formSection: {
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
    textAlign: "center",
    fontSize: SIZES.font.md,
    marginBottom: SIZES.md,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
  },
  buttonText: { color: COLORS.white, ...FONTS.h5, textAlign: "center" },
});
