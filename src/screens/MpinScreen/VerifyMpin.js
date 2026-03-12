import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { mpinStyles as styles } from "./MpinStyles";
import { showToast } from "../../utils/MpinHelper";
import { verifyMpinApi } from "../../services/MpinService";
import theme from "../../utils/AppTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { COLORS } = theme;

function VerifyMpinScreen({ navigation }) {
  const [mpin, setMpin] = useState(Array(4).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const completeVerification = useCallback(async () => {
    await AsyncStorage.setItem("isMpinCreated", "true");
    
    const userId = await AsyncStorage.getItem("userId");
    console.log("📌 Logged-in User ID:", userId);

    showToast("MPIN verified successfully!");
    
    setTimeout(() => {
      navigation.replace("Drawer");
    }, 800);
  }, [navigation]);

  // MPIN input handlers
  const handleMpinChange = useCallback((value, index) => {
    if (value && !/^\d$/.test(value)) return;

    setMpin(prev => {
      const newMpin = [...prev];
      newMpin[index] = value;
      return newMpin;
    });

    // Auto-focus logic
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (showError) setShowError(false);
  }, [showError]);

  const handleKeyPress = useCallback((event, index) => {
    if (event.nativeEvent.key === "Backspace" && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [mpin]);

  // MPIN verification
  const handleVerifyMpin = useCallback(async () => {
    const enteredMpin = mpin.join("");

    if (enteredMpin.length !== 4) {
      showToast("Please enter a valid 4-digit MPIN.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyMpinApi(enteredMpin);
      console.log("📩 Verify MPIN Response:", response);

      const isNotFoundString =
        typeof response === "string" &&
        response.toLowerCase().includes("mpin not found");

      const isNotFoundObject =
        typeof response === "object" &&
        response?.code === "NOT_FOUND" &&
        response?.message?.toLowerCase().includes("mpin not found");

      if (isNotFoundString || isNotFoundObject) {
        showToast("No MPIN found. Please create a new one.");

        await AsyncStorage.setItem("isMpinCreated", "false");

        setTimeout(() => {
          setMpin(Array(4).fill(""));
          navigation.replace("MpinScreen");
        }, 800);

        return;
      }

      // MPIN verified successfully
      await completeVerification();

    } catch (error) {
      console.error("MPIN verification error:", error);

      setShowError(true);
      triggerShake();
      setMpin(Array(4).fill(""));
      inputRefs.current[0]?.focus();

      showToast("Incorrect MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mpin, navigation, triggerShake, completeVerification]);

  const handleForgotPress = useCallback(() => {
    navigation.navigate("ForgotMpin");
  }, [navigation]);

  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  // Render helpers
  const renderMpinInputs = useCallback(() => 
    mpin.map((digit, index) => (
      <View key={index} style={styles.mpinInputWrapper}>
        <TextInput
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.mpinInput,
            digit ? styles.mpinInputFilled : {},
            showError ? styles.errorState : {},
          ]}
          maxLength={1}
          keyboardType="numeric"
          value={digit}
          onChangeText={(value) => handleMpinChange(value, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          secureTextEntry
          textAlign="center"
          selectTextOnFocus
        />
        {digit ? <View style={styles.filledIndicator} /> : null}
      </View>
    )), [mpin, showError, handleMpinChange, handleKeyPress]
  );

  const renderButton = useCallback(() => {
    const isComplete = mpin.join("").length === 4 && !isLoading;
    
    if (isComplete) {
      return (
        <TouchableOpacity
          onPress={handleVerifyMpin}
          disabled={isLoading}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={COLORS.gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.createButton, styles.gradientButton]}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Verifying..." : "Verify MPIN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.createButton, styles.disabledButton]}
        disabled
      >
        <Text style={styles.createButtonText}>
          {isLoading ? "Verifying..." : "Verify MPIN"}
        </Text>
      </TouchableOpacity>
    );
  }, [mpin, isLoading, handleVerifyMpin]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.container,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { translateX: shakeAnim },
                  ],
                },
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <View style={styles.logoRow}>
                  <Image
                    source={require("../../assets/icon.png")}
                    style={styles.logoImage}
                  />
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.contentContainer}>
                <View style={styles.headerSection}>
                  <Text style={styles.title}>Enter Your MPIN</Text>
                  <Text style={styles.description}>
                    Enter your 4-digit PIN to continue
                  </Text>
                </View>

                <View style={styles.mpinSection}>
                  <Text style={styles.mpinLabel}>Enter 4-Digit MPIN</Text>

                  <View style={styles.mpinContainer}>
                    {renderMpinInputs()}
                  </View>

                  {showError && (
                    <Text style={styles.errorText}>
                      Incorrect MPIN. Please try again.
                    </Text>
                  )}
                </View>

                <View style={styles.actionSection}>
                  <TouchableOpacity
                    onPress={handleForgotPress}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>Forgot MPIN?</Text>
                  </TouchableOpacity>

                  {renderButton()}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

export default VerifyMpinScreen;