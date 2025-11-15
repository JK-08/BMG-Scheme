import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHash } from "react-native-otp-verify";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { showToast } from "../../utils/toast";
import appTheme from "../../utils/MainTheme";
import styles from "./RegisterStyles";
import userService from "../../services/UserService";
import {
  registerForPushNotificationsAsync,
  sendPushTokenToServer,
} from "../../utils/Notification";
import { saveUserData } from "../../utils/AsynchStorageHelper";

const { COLORS, SIZES, FONTS } = appTheme;

function RegisterPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phone: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appHash, setAppHash] = useState("");

  // ✅ Google Sign-In Config & App Hash
  useEffect(() => {
    initializeGoogleSignIn();
    initializeAppHash();
  }, []);

  const initializeGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        "657047091285-hetgcscq8hvli59d0c6oqvg9aoat8850.apps.googleusercontent.com",
      iosClientId:
        "657047091285-57kkictc0pkfjldtf0u133m82huit6rg.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      offlineAccess: true,
    });
  };

  const initializeAppHash = async () => {
    try {
      if (Platform.OS === "android") {
        const hashCodes = await getHash();
        console.log("App Hash Codes:", hashCodes);
        if (hashCodes && hashCodes.length > 0) {
          setAppHash(hashCodes[0]);
          console.log("Using App Hash:", hashCodes[0]);
        }
      }
    } catch (error) {
      console.error("Error getting app hash:", error);
    }
  };

  // Validation functions (keep your existing validation logic)
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "username":
        if (!value.trim()) {
          newErrors.username = "Please enter username";
        } else if (value.trim().length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else {
          newErrors.username = "";
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Please enter email address";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          newErrors.email = "";
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Please enter mobile number";
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          newErrors.phone =
            "Please enter a valid 10-digit Indian mobile number";
        } else {
          newErrors.phone = "";
        }
        break;

      case "password":
        if (!value.trim()) {
          newErrors.password = "Please enter password";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          newErrors.password = "";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (fieldName, value) => {
    // Update field value
    switch (fieldName) {
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 10) {
          setPhone(cleaned);
        }
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }

    // Validate field if it's been touched
    if (touched[fieldName]) {
      validateField(
        fieldName,
        fieldName === "phone" ? value.replace(/\D/g, "") : value
      );
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(
      fieldName,
      fieldName === "phone"
        ? phone
        : fieldName === "username"
        ? username
        : fieldName === "email"
        ? email
        : password
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ✅ Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      if (!hasPlayServices) throw new Error("Google Play Services unavailable");

      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens?.idToken || userInfo?.idToken;

      if (!idToken) throw new Error("No ID token from Google");
      await handleGoogleAuthentication(idToken, userInfo.user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      handleGoogleSignInError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignInError = (error) => {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        showToast("Google sign-in cancelled");
        break;
      case statusCodes.IN_PROGRESS:
        showToast("Google sign-in already in progress");
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        showToast("Google Play Services unavailable");
        break;
      default:
        showToast(`Google sign-in failed: ${error.message || "Try again"}`);
    }
  };

  // ✅ Google Auth to backend
const handleGoogleAuthentication = async (idToken, userInfo = null) => {
  try {
    const payload = { idToken, userInfo };
    const response = await userService.googleLogin(payload);

    if (response.success && response.data) {
      const {
        id,
        email,
        username,
        message,
        status,
        contactNumber,
      } = response.data;

      console.log("Google Login Response:", response.data);

      // ✅ Save using helper
      await saveUserData(response.data);

      // ✅ Register for push notifications
      const expoToken = await registerForPushNotificationsAsync();
      if (expoToken) await sendPushTokenToServer(expoToken, id);

      showToast(message || "Logged in successfully with Google");

      // ✅ Navigate based on contact number
      if (!contactNumber || contactNumber.trim() === "") {
        console.log("⚠️ No contact number found. Navigating to EnterNumber...");
        navigation.navigate("EnterNumber", {
          userId: id,
          email,
          username,
        });
      } else {
        console.log("✅ Contact number found. Navigating to MpinScreen...");
        navigation.navigate("MpinScreen", { step: 3 });
      }
    } else {
      showToast(response.error || "Google authentication failed");
    }
  } catch (error) {
    console.error("Google authentication error:", error);
    showToast("Authentication failed. Please try again.");
  }
};
  // Your existing handleRegister function
  const handleRegister = async () => {
    // Mark all fields as touched to show all errors
    const allTouched = {
      username: true,
      email: true,
      phone: true,
      password: true,
    };
    setTouched(allTouched);

    // Validate all fields
    validateField("username", username);
    validateField("email", email);
    validateField("phone", phone);
    validateField("password", password);

    // Check if any errors exist
    const hasErrors =
      Object.values(errors).some((error) => error !== "") ||
      !username ||
      !email ||
      !phone ||
      !password;

    if (hasErrors) {
      showToast("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const res = await userService.registerUser({
        username,
        email,
        contactNumber: phone,
        password,
        hashKey: appHash || "",
      });

      console.log("Registration response:", res);

      if (res.success) {
        // Save full user data for resend OTP and OTP verification
        await AsyncStorage.setItem(
          "tempUserData",
          JSON.stringify({
            username,
            email,
            phone,
            password,
            appHash,
          })
        );

        showToast("Registration successful! OTP sent.");

        // Navigate to OTP page with phone number and hash
        navigation.navigate("OTP", {
          phoneNumber: phone,
          appHash: appHash,
        });
      } else {
        handleRegistrationError(res.error, res.details);
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Your existing handleRegistrationError function
  const handleRegistrationError = (error, details = {}) => {
    console.log("Registration Error Details:", details);

    const errorMessage = error?.toString() || "";
    const errorLower = errorMessage.toLowerCase();
    const detailsMessage = details?.message?.toString() || "";
    const detailsLower = detailsMessage.toLowerCase();

    console.log("Error analysis:", {
      errorMessage,
      errorLower,
      detailsMessage,
      detailsLower,
    });

    // Check for email already exists
    if (
      errorLower.includes("email already exists") ||
      detailsLower.includes("email already exists") ||
      detailsMessage === "Email already exists"
    ) {
      showToast(
        "This email is already registered. Please use another email or login."
      );
      setEmail("");
      setErrors((prev) => ({
        ...prev,
        email: "This email is already registered",
      }));
      // Auto-navigate to login after a brief delay
      setTimeout(() => {
        Alert.alert(
          "Email Already Exists",
          "This email is already registered. Would you like to login?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () =>
                navigation.navigate("LoginPage", { prefillEmail: email }),
            },
          ]
        );
      }, 1500);
      return;
    }

    // Check for phone number already exists
    if (
      errorLower.includes("contact number already exists") ||
      errorLower.includes("phone already exists") ||
      errorLower.includes("number already exists") ||
      detailsLower.includes("contact number already exists") ||
      detailsLower.includes("phone already exists") ||
      detailsLower.includes("number already exists")
    ) {
      setErrors((prev) => ({
        ...prev,
        phone: "This phone number is already registered",
      }));
      Alert.alert(
        "Number Already Registered",
        "This phone number is already registered. Would you like to login instead?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () =>
              navigation.navigate("LoginPage", { prefillPhone: phone }),
          },
        ]
      );
      return;
    }

    // Check for username already exists
    if (
      errorLower.includes("username already exists") ||
      detailsLower.includes("username already exists")
    ) {
      showToast(
        "This username is already taken. Please choose another or login with existing account."
      );
      setUsername("");
      setErrors((prev) => ({
        ...prev,
        username: "This username is already taken",
      }));
      // Auto-navigate to login after a brief delay
      setTimeout(() => {
        Alert.alert(
          "Username Already Exists",
          "This username is already taken. Would you like to login?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => navigation.navigate("LoginPage"),
            },
          ]
        );
      }, 1500);
      return;
    }

    // Check for generic "already exists" messages
    if (
      errorLower.includes("already exists") ||
      detailsLower.includes("already exists")
    ) {
      // Try to extract which field already exists
      if (errorLower.includes("email") || detailsLower.includes("email")) {
        showToast(
          "This email is already registered. Please use another email or login."
        );
        setEmail("");
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered",
        }));
        setTimeout(() => {
          Alert.alert(
            "Email Already Exists",
            "This email is already registered. Would you like to login?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Login",
                onPress: () =>
                  navigation.navigate("LoginPage", { prefillEmail: email }),
              },
            ]
          );
        }, 1500);
      } else if (
        errorLower.includes("phone") ||
        errorLower.includes("contact") ||
        errorLower.includes("number")
      ) {
        setErrors((prev) => ({
          ...prev,
          phone: "This phone number is already registered",
        }));
        Alert.alert(
          "Number Already Registered",
          "This phone number is already registered. Would you like to login instead?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () =>
                navigation.navigate("LoginPage", { prefillPhone: phone }),
            },
          ]
        );
      } else if (
        errorLower.includes("username") ||
        detailsLower.includes("username")
      ) {
        showToast(
          "This username is already taken. Please choose another or login with existing account."
        );
        setUsername("");
        setErrors((prev) => ({
          ...prev,
          username: "This username is already taken",
        }));
        setTimeout(() => {
          Alert.alert(
            "Username Already Exists",
            "This username is already taken. Would you like to login?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Login",
                onPress: () => navigation.navigate("LoginPage"),
              },
            ]
          );
        }, 1500);
      } else {
        // Generic already exists message
        showToast("This user already exists. Redirecting to login...");
        setTimeout(() => {
          navigation.navigate("LoginPage");
        }, 2000);
      }
      return;
    }

    // Default error handling
    showToast(error || detailsMessage || "Registration failed");
  };

  const navigateToLogin = () => {
    navigation.navigate("LoginPage");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Helper component for required field label with asterisk
  const RequiredLabel = ({ children }) => (
    <Text style={styles.label}>
      {children}
      <Text style={styles.requiredStar}> *</Text>
    </Text>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/image/logo2.png")}
                  style={styles.logoImage}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join us today</Text>

                {/* Username Field */}
                <RequiredLabel>Username</RequiredLabel>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={username}
                  onChangeText={(value) => handleFieldChange("username", value)}
                  onBlur={() => handleFieldBlur("username")}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username ? (
                  <Text style={styles.errorText}>{errors.username}</Text>
                ) : null}

                {/* Email Field */}
                <RequiredLabel>Email</RequiredLabel>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={(value) => handleFieldChange("email", value)}
                  onBlur={() => handleFieldBlur("email")}
                  placeholder="Enter email"
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}

                {/* Mobile Number Field */}
                <RequiredLabel>Mobile Number</RequiredLabel>
                <View
                  style={[
                    styles.inputContainer,
                    (errors.phone || !/^[6-9]\d{9}$/.test(phone)) &&
                      touched.phone &&
                      styles.inputError,
                  ]}
                >
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={(value) => handleFieldChange("phone", value)}
                    onBlur={() => handleFieldBlur("phone")}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={COLORS.textTertiary}
                    maxLength={10}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone ? (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                ) : null}

                {/* Password Field */}
                <RequiredLabel>Password</RequiredLabel>
                <View
                  style={[
                    styles.passwordContainer,
                    errors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(value) =>
                      handleFieldChange("password", value)
                    }
                    onBlur={() => handleFieldBlur("password")}
                    placeholder="Enter password"
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                  >
                    <Image
                      source={
                        showPassword
                          ? require("../../assets/icons/eyeopen.png") // Eye open icon
                          : require("../../assets/icons/eyeclose.png") // Eye closed icon
                      }
                      style={styles.eyeIconImage}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                {/* ✅ Register Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={COLORS.gradient.brand}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        Create Account
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* ✅ Divider for Google Sign-In */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                {/* ✅ Google Sign-In Button */}
                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    googleLoading && styles.disabledButton,
                  ]}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : (
                    <View style={styles.googleButtonContent}>
                      <Image
                        source={require("../../assets/icons/google.png")}
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account?</Text>
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text style={styles.loginLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ✅ Loading Overlay */}
          {(loading || googleLoading) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {googleLoading
                  ? "Signing in with Google..."
                  : "Creating your account..."}
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default RegisterPage;
