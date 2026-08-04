import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../../utils/toast";
import theme from "../../utils/AppTheme";
import styles from "./OtpStyles.js";
import userService from "../../services/UserService";
import { saveUserData } from "../../utils/AsynchStorageHelper";

const { COLORS, SIZES, FONTS } = theme;

function OtpPage({ navigation, route }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(20);

  const inputRefs = useRef([]);
  const phoneNumber = route.params?.phoneNumber || "";

  // -------------------- TIMER --------------------
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // -------------------- AUTO VERIFY WHEN ALL DIGITS ENTERED --------------------
  useEffect(() => {
    const otpValue = otp.join("");
    if (otpValue.length === 6 && !verifying) {
      handleVerifyOtp();
    }
  }, [otp]);

  // -------------------- OTP HANDLERS --------------------
  const handleOtpChange = (val, idx) => {
    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);

    if (val && idx < otp.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      showToast("Please enter 6-digit OTP");
      return;
    }

    setVerifying(true);

    try {
      const tempUserData = await AsyncStorage.getItem("tempUserData");
      if (!tempUserData) {
        showToast("User data not found. Please try again.");
        setVerifying(false);
        return;
      }

      const { phone } = JSON.parse(tempUserData);
      const res = await userService.verifyOtp(phone, otpValue);

      if (res.success && res.data) {
        showToast("OTP verified successfully!");

        const userData = res.data;

        if (userData.used_referral_code) {
          try {
            const referralCheckResponse = await userService.checkReferralCode(
              userData.id,
              userData.used_referral_code
            );

            if (referralCheckResponse.success) {
              showToast("Referral code applied successfully!");
              await saveUserData(userData);
            } else {
              await saveUserData(userData);
              showToast("Account created, but referral code could not be applied");
            }
          } catch (referralError) {
            await saveUserData(userData);
            showToast("Account created!");
          }
        } else {
          await saveUserData(userData);
        }

        await AsyncStorage.removeItem("tempUserData");
        navigation.navigate("Drawer");
      } else {
        showToast(res.error || "OTP verification failed");
        clearOtp();
      }
    } catch (error) {
      showToast("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      const tempUserData = await AsyncStorage.getItem("tempUserData");
      if (!tempUserData) {
        showToast("User data not found. Please register again.");
        return;
      }

      const { username, email, phone, password } = JSON.parse(tempUserData);
      const res = await userService.registerUser({
        username,
        email,
        contactNumber: phone,
        password,
      });

      if (res.success) {
        showToast("OTP resent successfully!");
        setResendTimer(20);
        clearOtp();
      } else {
        showToast(res.error || "Failed to resend OTP");
      }
    } catch (error) {
      showToast("Failed to resend OTP. Try again.");
    }
  };

  // -------------------- UI --------------------
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? SIZES.xxl : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logoImage}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                  Enter the 6-digit OTP sent to {"\n"}+91 {phoneNumber}
                </Text>

                <View style={styles.otpContainerUnderline}>
                  {otp.map((digit, index) => (
                    <View key={index} style={styles.otpDigitContainer}>
                      <TextInput
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={[
                          styles.otpInputUnderline,
                          digit && styles.otpInputFilled,
                        ]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        textAlign="center"
                        selectionColor={COLORS.primary}
                      />
                      <View
                        style={[
                          styles.underline,
                          digit && styles.underlineActive,
                        ]}
                      />
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.clearOtpButton} onPress={clearOtp}>
                  <Text style={styles.clearOtpText}>Clear OTP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, verifying && styles.disabledButton]}
                  onPress={handleVerifyOtp}
                  disabled={verifying}
                >
                  <LinearGradient
                    colors={COLORS.gradient.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>
                      {verifying ? "Verifying..." : "Verify OTP"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendContainer}
                  onPress={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  <Text style={styles.resendText}>Didn't receive OTP? </Text>
                  <Text
                    style={[
                      styles.resendLink,
                      resendTimer > 0 && styles.resendDisabled,
                    ]}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("LoginPage")}
                  style={styles.linkContainer}
                >
                  <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {verifying && (
            <View style={styles.fullScreenLoader}>
              <View style={styles.loaderBackground} />
              <View style={styles.loaderContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Verifying OTP...</Text>
                <Text style={styles.loadingSubtext}>
                  Please wait while we verify your OTP
                </Text>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default OtpPage;
