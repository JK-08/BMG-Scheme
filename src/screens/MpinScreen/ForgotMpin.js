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
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { mpinStyles as styles } from "./MpinStyles";
import { showToast, checkWeakMpin } from "../../utils/MpinHelper";
import { resetMpinApi } from "../../services/MpinService";
import theme from "../../utils/AppTheme";

const { COLORS } = theme;

function ResetMpinScreen({ navigation }) {
  const [mpin, setMpin] = useState(Array(4).fill(""));
  const [confirmMpin, setConfirmMpin] = useState(Array(4).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isWeakMpin, setIsWeakMpin] = useState(false);
  const [mpinMatch, setMpinMatch] = useState(true);
  
  const inputRefs = useRef([]);
  const confirmInputRefs = useRef([]);
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

  // MPIN validation
  const validateMpin = useCallback((newMpinArr, isConfirm = false, otherArr = null) => {
    const mpinValue = newMpinArr.join("");

    if (!isConfirm && mpinValue.length === 4) {
      setIsWeakMpin(checkWeakMpin(mpinValue));
    } else if (!isConfirm) {
      setIsWeakMpin(false);
    }

    const currentMpin = isConfirm ? (otherArr || mpin) : newMpinArr;
    const currentConfirm = isConfirm ? newMpinArr : (otherArr || confirmMpin);

    if (currentMpin.join("").length === 4 && currentConfirm.join("").length === 4) {
      setMpinMatch(currentMpin.join("") === currentConfirm.join(""));
    }
  }, [mpin, confirmMpin]);

  // MPIN change handler
  const handleMpinChange = useCallback((value, index, isConfirm = false) => {
    if (value && !/^\d$/.test(value)) return;

    const setTargetMpin = isConfirm ? setConfirmMpin : setMpin;
    const targetRefs = isConfirm ? confirmInputRefs : inputRefs;

    setTargetMpin(prev => {
      const newMpin = [...prev];
      newMpin[index] = value;

      // Validate after state update using the freshly computed array
      const otherArr = isConfirm ? mpin : confirmMpin;
      setTimeout(() => validateMpin(newMpin, isConfirm, otherArr), 0);

      return newMpin;
    });

    // Auto-focus logic
    if (value && index < 3) {
      targetRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      targetRefs.current[index - 1]?.focus();
    }
  }, [validateMpin]);

  // Key press handler
  const handleKeyPress = useCallback((event, index, isConfirm = false) => {
    const targetMpin = isConfirm ? confirmMpin : mpin;
    const targetRefs = isConfirm ? confirmInputRefs : inputRefs;

    if (event.nativeEvent.key === "Backspace" && !targetMpin[index] && index > 0) {
      targetRefs.current[index - 1]?.focus();
    }
  }, [mpin, confirmMpin]);

  // Reset MPIN function
  const handleResetMpin = useCallback(async () => {
    const newMpin = mpin.join("");
    const confirmMpinValue = confirmMpin.join("");

    if (newMpin.length !== 4 || confirmMpinValue.length !== 4) {
      showToast("Please enter valid 4-digit MPINs.");
      return;
    }

    if (newMpin !== confirmMpinValue) {
      setMpinMatch(false);
      showToast("MPINs do not match. Please try again.");
      return;
    }

    if (checkWeakMpin(newMpin)) {
      Alert.alert(
        "Weak MPIN",
        "This MPIN is too easy to guess. Please choose a more secure combination.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await resetMpinApi(newMpin);
      await AsyncStorage.setItem("isMpinCreated", "true");
      showToast("MPIN reset successfully!");
      setTimeout(() => navigation.replace("Drawer"), 1000);
    } catch (error) {
      console.error("MPIN reset error:", error);
      showToast("Failed to reset MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mpin, confirmMpin, navigation]);

  // Check if button should be enabled
  const isButtonEnabled = useCallback(() => {
    return mpin.join("").length === 4 && 
           confirmMpin.join("").length === 4 && 
           !isLoading && 
           !isWeakMpin && 
           mpinMatch;
  }, [mpin, confirmMpin, isLoading, isWeakMpin, mpinMatch]);

  // Render MPIN input fields
  const renderMpinInputs = useCallback((isConfirm = false) => {
    const data = isConfirm ? confirmMpin : mpin;
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    const hasError = isConfirm ? !mpinMatch : isWeakMpin;

    return (
      <View style={styles.mpinContainer}>
        {data.map((digit, index) => (
          <View key={`${isConfirm ? 'confirm' : 'mpin'}-${index}`} style={styles.mpinInputWrapper}>
            <TextInput
              ref={(ref) => (refs.current[index] = ref)}
              style={[
                styles.mpinInput,
                digit ? styles.mpinInputFilled : {},
                hasError ? styles.errorState : {},
              ]}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(value) => handleMpinChange(value, index, isConfirm)}
              onKeyPress={(event) => handleKeyPress(event, index, isConfirm)}
              secureTextEntry={true}
              textAlign="center"
              selectTextOnFocus={true}
            />
            {digit ? <View style={styles.filledIndicator} /> : null}
          </View>
        ))}
      </View>
    );
  }, [mpin, confirmMpin, mpinMatch, isWeakMpin, handleMpinChange, handleKeyPress]);

  // Render button
  const renderButton = useCallback(() => {
    const enabled = isButtonEnabled();
    
    if (enabled) {
      return (
        <TouchableOpacity
          onPress={handleResetMpin}
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
              {isLoading ? "Resetting..." : "Reset MPIN"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.createButton, styles.disabledButton]}>
        <Text style={styles.createButtonText}>
          {isLoading ? "Resetting..." : "Reset MPIN"}
        </Text>
      </View>
    );
  }, [isButtonEnabled, handleResetMpin, isLoading]);

  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                  <Text style={styles.title}>Reset MPIN</Text>
                  <Text style={styles.description}>
                    Create a new secure 4-digit PIN
                  </Text>
                </View>

                <View style={styles.mpinSection}>
                  <Text style={styles.mpinLabel}>Enter New MPIN</Text>
                  {renderMpinInputs(false)}

                  <Text style={styles.mpinLabel}>Confirm New MPIN</Text>
                  {renderMpinInputs(true)}

                  {isWeakMpin && (
                    <Text style={styles.weakMpinWarning}>
                      This MPIN is too easy to guess. Please choose a stronger one.
                    </Text>
                  )}

                  {!mpinMatch && (
                    <Text style={styles.errorText}>
                      MPINs do not match. Please try again.
                    </Text>
                  )}

                  <Text style={styles.securityNote}>
                    Avoid simple sequences like 1234 or repeated digits
                  </Text>
                </View>

                <View style={styles.actionSection}>
                  {renderButton()}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

export default ResetMpinScreen;