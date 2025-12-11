import React, { useState, useEffect, useCallback } from "react";
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
import theme from "../../utils/AppTheme";
import styles from "./RegisterStyles";
import userService from "../../services/UserService";
import { saveUserData } from "../../utils/AsynchStorageHelper";

const { COLORS, SIZES } = theme;

function RegisterPage({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });
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
  const [usingDemoAccount, setUsingDemoAccount] = useState(false);

  // Validation rules
  const validationRules = {
    username: (value) => {
      if (!value.trim()) return "Please enter username";
      if (value.trim().length < 3) return "Username must be at least 3 characters";
      return "";
    },
    email: (value) => {
      if (!value.trim()) return "Please enter email address";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
      return "";
    },
    phone: (value) => {
      if (!value.trim()) return "Please enter mobile number";
      if (!/^[6-9]\d{9}$/.test(value)) return "Please enter a valid 10-digit Indian mobile number";
      return "";
    },
    password: (value) => {
      if (!value.trim()) return "Please enter password";
      if (value.length < 6) return "Password must be at least 6 characters";
      return "";
    }
  };

  // ✅ Google Sign-In Config & App Hash
  useEffect(() => {
    initializeGoogleSignIn();
    initializeAppHash();
  }, []);

  const initializeGoogleSignIn = useCallback(() => {
    GoogleSignin.configure({
      webClientId: "657047091285-hetgcscq8hvli59d0c6oqvg9aoat8850.apps.googleusercontent.com",
      iosClientId: "657047091285-57kkictc0pkfjldtf0u133m82huit6rg.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      offlineAccess: true,
    });
  }, []);

  const initializeAppHash = useCallback(async () => {
    try {
      if (Platform.OS === "android") {
        const hashCodes = await getHash();
        if (hashCodes?.[0]) {
          setAppHash(hashCodes[0]);
        }
      }
    } catch (error) {
      console.error("Error getting app hash:", error);
    }
  }, []);

  // ✅ Demo Account Function
  const handleDemoAccount = useCallback(() => {
    const demoData = {
      username: "bmg",
      email: "bmgdemo@gmail.com",
      phone: "9790429938",
      password: "123456"
    };

    // Set demo data
    setFormData(demoData);
    setUsingDemoAccount(true);

    // Mark all fields as touched
    const allTouched = Object.keys(demoData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Clear any existing errors
    setErrors({
      username: "",
      email: "",
      phone: "",
      password: "",
    });

    // Validate demo data
    Object.keys(demoData).forEach(key => {
      const error = validationRules[key](demoData[key]);
      if (error) {
        setErrors(prev => ({ ...prev, [key]: error }));
      }
    });

    showToast("Demo account loaded. Click 'Create Account' to proceed.");
  }, []);

  // Validation functions
  const validateField = useCallback((fieldName, value) => {
    const error = validationRules[fieldName](value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const handleFieldChange = useCallback((fieldName, value) => {
    let processedValue = value;
    
    if (fieldName === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [fieldName]: processedValue }));
    
    // If user starts typing, disable demo mode
    if (usingDemoAccount && value !== formData[fieldName]) {
      setUsingDemoAccount(false);
    }

    if (touched[fieldName]) {
      validateField(fieldName, processedValue);
    }
  }, [touched, validateField, formData, usingDemoAccount]);

  const handleFieldBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  }, [formData, validateField]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ✅ Handle Google Sign-In
  const handleGoogleSignIn = useCallback(async () => {
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
  }, []);

  const handleGoogleSignInError = useCallback((error) => {
    const errorMessages = {
      [statusCodes.SIGN_IN_CANCELLED]: "Google sign-in cancelled",
      [statusCodes.IN_PROGRESS]: "Google sign-in already in progress",
      [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]: "Google Play Services unavailable",
    };

    showToast(errorMessages[error.code] || `Google sign-in failed: ${error.message || "Try again"}`);
  }, []);

  // ✅ Google Auth to backend
  const handleGoogleAuthentication = useCallback(async (idToken, userInfo = null) => {
    try {
      const payload = { idToken, userInfo };
      const response = await userService.googleLogin(payload);

      if (response.success && response.data) {
        const { id, email, username, message, contactNumber } = response.data;

        await saveUserData(response.data);

        showToast(message || "Logged in successfully with Google");

        if (!contactNumber || contactNumber.trim() === "") {
          navigation.navigate("EnterNumber", {
            userId: id,
            email,
            username,
          });
        } else {
          navigation.navigate("MpinScreen", { step: 3 });
        }
      } else {
        showToast(response.error || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      showToast("Authentication failed. Please try again.");
    }
  }, [navigation]);

  const validateAllFields = useCallback(() => {
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    return Object.values(errors).every(error => error === "") && 
           Object.values(formData).every(value => value.trim() !== "");
  }, [formData, errors, validateField]);

  const handleRegister = useCallback(async () => {
    if (!validateAllFields()) {
      showToast("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      let res;
      
      // For demo account, simulate success without API call
      if (usingDemoAccount && 
          formData.username === "bmg" && 
          formData.email === "bmgdemo@gmail.com" && 
          formData.phone === "9790429938") {
        
        // Simulate API response
        res = {
          success: true,
          data: {
            id: "40111",
            username: formData.username,
            email: formData.email,
            contactNumber: formData.phone,
            isDemo: true
          }
        };
        
        showToast("Demo account created successfully!");
      } else {
        // Regular registration
        res = await userService.registerUser({
          username: formData.username,
          email: formData.email,
          contactNumber: formData.phone,
          password: formData.password,
          hashKey: appHash || "",
        });
      }

      if (res.success) {
        await AsyncStorage.setItem(
          "tempUserData",
          JSON.stringify({
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            appHash,
            isDemo: usingDemoAccount
          })
        );

        showToast(usingDemoAccount ? "Demo account created! OTP sent." : "Registration successful! OTP sent.");
        navigation.navigate("OTP", {
          phoneNumber: formData.phone,
          appHash: appHash,
          isDemo: usingDemoAccount
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
  }, [formData, appHash, navigation, validateAllFields, usingDemoAccount]);

  const handleRegistrationError = useCallback((error, details = {}) => {
    const errorMessage = error?.toString()?.toLowerCase() || "";
    const detailsMessage = details?.message?.toString()?.toLowerCase() || "";

    const errorHandlers = [
      {
        condition: () => errorMessage.includes("email already exists") || 
                      detailsMessage.includes("email already exists") ||
                      details.message === "Email already exists",
        action: () => {
          showToast("This email is already registered. Please use another email or login.");
          setFormData(prev => ({ ...prev, email: "" }));
          setErrors(prev => ({ ...prev, email: "This email is already registered" }));
          setTimeout(() => {
            Alert.alert(
              "Email Already Exists",
              "This email is already registered. Would you like to login?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Login",
                  onPress: () => navigation.navigate("LoginPage", { prefillEmail: formData.email }),
                },
              ]
            );
          }, 1500);
        }
      },
      {
        condition: () => errorMessage.includes("contact number already exists") || 
                      errorMessage.includes("phone already exists") || 
                      errorMessage.includes("number already exists") ||
                      detailsMessage.includes("contact number already exists") ||
                      detailsMessage.includes("phone already exists") ||
                      detailsMessage.includes("number already exists"),
        action: () => {
          setErrors(prev => ({ ...prev, phone: "This phone number is already registered" }));
          Alert.alert(
            "Number Already Registered",
            "This phone number is already registered. Would you like to login instead?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Login",
                onPress: () => navigation.navigate("LoginPage", { prefillPhone: formData.phone }),
              },
            ]
          );
        }
      },
      {
        condition: () => errorMessage.includes("username already exists") || 
                      detailsMessage.includes("username already exists"),
        action: () => {
          showToast("This username is already taken. Please choose another or login with existing account.");
          setFormData(prev => ({ ...prev, username: "" }));
          setErrors(prev => ({ ...prev, username: "This username is already taken" }));
          setTimeout(() => {
            Alert.alert(
              "Username Already Exists",
              "This username is already taken. Would you like to login?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => navigation.navigate("LoginPage") },
              ]
            );
          }, 1500);
        }
      }
    ];

    const handler = errorHandlers.find(h => h.condition());
    if (handler) {
      handler.action();
      return;
    }

    showToast(error || details.message || "Registration failed");
  }, [formData, navigation]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate("LoginPage");
  }, [navigation]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const RequiredLabel = useCallback(({ children }) => (
    <Text style={styles.label}>
      {children}
      <Text style={styles.requiredStar}> *</Text>
    </Text>
  ), []);

  const renderInputField = useCallback((fieldName, props = {}) => {
    const commonProps = {
      style: [styles.input, errors[fieldName] && styles.inputError],
      value: formData[fieldName],
      onChangeText: (value) => handleFieldChange(fieldName, value),
      onBlur: () => handleFieldBlur(fieldName),
      placeholderTextColor: COLORS.textTertiary,
      autoCapitalize: "none",
      autoCorrect: false,
      ...props
    };

    return (
      <>
        <TextInput {...commonProps} />
        {errors[fieldName] ? (
          <Text style={styles.errorText}>{errors[fieldName]}</Text>
        ) : null}
      </>
    );
  }, [formData, errors, handleFieldChange, handleFieldBlur]);

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
                  source={require("../../assets/image/final-logo.jpg")}
                  style={styles.logoImage}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>

                {/* Demo Account Button */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoAccount}
                  disabled={loading || googleLoading}
                >
                  <LinearGradient
                    colors={COLORS.gradient.secondary}
                    style={styles.demoButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.demoButtonText}>
                      {usingDemoAccount ? "✓ Demo Account Loaded" : "Try Demo Account"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Username Field */}
                <RequiredLabel>Username</RequiredLabel>
                {renderInputField("username", {
                  placeholder: "Enter username"
                })}

                {/* Email Field */}
                <RequiredLabel>Email</RequiredLabel>
                {renderInputField("email", {
                  placeholder: "Enter email",
                  keyboardType: "email-address"
                })}

                {/* Mobile Number Field */}
                <RequiredLabel>Mobile Number</RequiredLabel>
                <View style={[
                  styles.inputContainer,
                  (errors.phone || !/^[6-9]\d{9}$/.test(formData.phone)) &&
                    touched.phone &&
                    styles.inputError,
                ]}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={formData.phone}
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
                <View style={[
                  styles.passwordContainer,
                  errors.password && styles.inputError,
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.password}
                    onChangeText={(value) => handleFieldChange("password", value)}
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
                          ? require("../../assets/icons/eyeopen.png")
                          : require("../../assets/icons/eyeclose.png")
                      }
                      style={styles.eyeIconImage}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                {/* Demo Indicator */}
                {usingDemoAccount && (
                  <View style={styles.demoIndicator}>
                    <Text style={styles.demoIndicatorText}>
                      ✓ Using demo account: OTP will be 888888
                    </Text>
                  </View>
                )}

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={usingDemoAccount ? COLORS.gradient.secondary : COLORS.gradient.brand}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {usingDemoAccount ? "Create Demo Account" : "Create Account"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider for Google Sign-In */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View>

                {/* Google Sign-In Button */}
                {/* <TouchableOpacity
                  style={[styles.googleButton, googleLoading && styles.disabledButton]}
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
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </View>
                  )}
                </TouchableOpacity> */}

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account?</Text>
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text style={styles.loginLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Loading Overlay */}
          {/* {(loading || googleLoading) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {googleLoading ? "Signing in with Google..." : "Creating your account..."}
              </Text>
            </View>
          )} */}
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default RegisterPage;