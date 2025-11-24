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
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { OTPService, UserService } from "../../services/OTPService";

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale } = theme;

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
      const errorMessage =
        error?.message?.replace(/^Error:\s*/, "") ||
        "Failed to send OTP. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContactNumberChange = (value) => {
    // Allow only numbers and limit to 10 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setContactNumber(cleaned);
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title={mode === "forgot" ? "Forgot Password" : "Update Phone Number"}
      />
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
            {mode === "forgot"
              ? "Enter your registered mobile number to reset your password."
              : "Enter your mobile number to receive an OTP for verification."}
          </Text>

          <View style={styles.formSection}>
            {/* Phone Input with Country Code */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={10}
                value={contactNumber}
                onChangeText={handleContactNumberChange}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSendOtp}
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
                    {mode === "forgot" ? "Send OTP" : "Verify Number"}
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

export default EnterNumberScreen;

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
  formSection: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.xxl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SIZES.xl,
    overflow: "hidden",
  },
  countryCodeContainer: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.lg,
    backgroundColor: COLORS.primaryLight,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderMedium,
  },
  countryCode: {
    ...FONTS.bodyMedium,
    color: COLORS.textInverse,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.lg,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
  },
  primaryButton: {
    borderRadius: SIZES.radius.md,
    overflow: "hidden",
    ...SHADOWS.md,
    height: SIZES.button.lg,
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
});

// Platform-specific adjustments
if (Platform.OS === "web") {
  styles.phoneInput = {
    ...styles.phoneInput,
    outlineStyle: "none",
  };
  
  styles.primaryButton = {
    ...styles.primaryButton,
    cursor: "pointer",
  };
  
  styles.scrollContent = {
    ...styles.scrollContent,
    minHeight: "100vh",
  };
}