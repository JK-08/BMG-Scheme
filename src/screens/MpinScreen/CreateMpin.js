import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { mpinStyles as styles } from "./MpinStyles";
import { createMpinApi } from "../../services/MpinService";
import theme from "../../utils/AppTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { COLORS } = theme;

// Constants
const MPIN_LENGTH = 4;
const WEAK_PATTERNS = {
  REPEATED: /^(\d)\1{3}$/,
  SEQUENTIAL: "0123456789"
};

const MpinScreen = ({ navigation }) => {
  const [mpin, setMpin] = useState(Array(MPIN_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isWeakMpin, setIsWeakMpin] = useState(false);
  const [mpinExists, setMpinExists] = useState(false);

  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animation
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

  // Weak MPIN detection
  const isWeak = useCallback((pin) => {
    return (
      WEAK_PATTERNS.REPEATED.test(pin) ||
      WEAK_PATTERNS.SEQUENTIAL.includes(pin) ||
      WEAK_PATTERNS.SEQUENTIAL.split("").reverse().join("").includes(pin)
    );
  }, []);

  // Toast utility
  const showToast = useCallback((msg) => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }, []);

  // MPIN input handlers
  const handleMpinChange = useCallback((value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    // Auto-focus next/previous input
    if (value && index < MPIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Check for weak MPIN when all digits are entered
    if (newMpin.every(digit => digit !== "")) {
      const enteredMpin = newMpin.join("");
      setIsWeakMpin(isWeak(enteredMpin));
    } else {
      setIsWeakMpin(false);
    }
  }, [mpin, isWeak]);

  const handleKeyPress = useCallback((event, index) => {
    if (event.nativeEvent.key === "Backspace" && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [mpin]);

  // MPIN creation
  const handleCreateMpin = useCallback(async () => {
    const enteredMpin = mpin.join("");

    if (enteredMpin.length !== MPIN_LENGTH) {
      return showToast("Please enter a valid 4-digit MPIN.");
    }

    if (isWeak(enteredMpin)) {
      Alert.alert(
        "Weak MPIN",
        "This MPIN is too easy to guess. Please choose a more secure one.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await createMpinApi(enteredMpin);

      if (response?.alreadyExists) {
        await AsyncStorage.setItem("isMpinCreated", "true");
        navigation.replace("VerifyMpinScreen");
        return;
      }

      await AsyncStorage.setItem("isMpinCreated", "true");
      showToast("MPIN created successfully!");
      setTimeout(() => {
        navigation.replace("Drawer");
      }, 1000);
    } catch (error) {
      console.error("MPIN creation error:", error);
      showToast(error?.message || "Failed to create MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mpin, isWeak, showToast, navigation]);

  // Navigation handlers
  const navigateToVerifyMpin = useCallback(() => {
    navigation.navigate("VerifyMpinScreen");
  }, [navigation]);

  // Check if create button should be enabled
  const isCreateButtonEnabled = useCallback(() => {
    const enteredMpin = mpin.join("");
    return enteredMpin.length === MPIN_LENGTH && !isLoading && !isWeakMpin;
  }, [mpin, isLoading, isWeakMpin]);

  // Render MPIN inputs
  const renderMpinInputs = useCallback(() => {
    return mpin.map((digit, index) => (
      <View key={`mpin-input-${index}`} style={styles.mpinInputWrapper}>
        <TextInput
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.mpinInput,
            digit ? styles.mpinInputFilled : {},
            isWeakMpin ? styles.errorState : {},
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
    ));
  }, [mpin, isWeakMpin, handleMpinChange, handleKeyPress]);

  // Render create button
  const renderCreateButton = useCallback(() => {
    const isEnabled = isCreateButtonEnabled();

    if (isEnabled) {
      return (
        <TouchableOpacity
          onPress={handleCreateMpin}
          activeOpacity={0.9}
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
              {isLoading ? "Creating..." : "Create MPIN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.createButton, styles.disabledButton]}>
        <Text style={styles.createButtonText}>
          {isLoading ? "Creating..." : "Create MPIN"}
        </Text>
      </View>
    );
  }, [isCreateButtonEnabled, handleCreateMpin, isLoading]);

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoRow}>
                  <Image
                    source={require("../../assets/icon.png")}
                    style={styles.logoImage}
                  />
                </View>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.headerSection}>
                  <Text style={styles.title}>Create MPIN</Text>
                  <Text style={styles.description}>
                    Set up a secure 4-digit PIN for quick access
                  </Text>
                </View>

                <View style={styles.mpinSection}>
                  <Text style={styles.mpinLabel}>Enter 4-Digit MPIN</Text>
                  <View style={styles.mpinContainer}>
                    {renderMpinInputs()}
                  </View>

                  {isWeakMpin && (
                    <Text style={styles.weakMpinWarning}>
                      This MPIN is too easy to guess. Please choose a stronger one.
                    </Text>
                  )}

                  <Text style={styles.securityNote}>
                    Avoid simple sequences like 1234 or repeated digits
                  </Text>
                </View>

                <View style={styles.actionSection}>
                  {renderCreateButton()}

                  <TouchableOpacity
                    style={styles.existingMpinLink}
                    onPress={navigateToVerifyMpin}
                  >
                    <Text style={styles.existingMpinText}>
                      Already have an MPIN?
                    </Text>
                    <Text style={styles.existingMpinLinkText}>
                      Verify MPIN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default MpinScreen;