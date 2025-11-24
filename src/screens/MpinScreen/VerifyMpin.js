import React, { useState, useRef, useEffect } from "react";
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
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  const triggerShake = () => {
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
  };

  const handleMpinChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (showError) setShowError(false);
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMpin = async () => {
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
          setMpin(["", "", "", ""]);
          navigation.replace("MpinScreen");
        }, 800);

        return;
      }

      showToast("MPIN verified successfully!");

      await AsyncStorage.setItem("isMpinCreated", "true");

      setTimeout(() => {
        navigation.replace("Drawer");
      }, 800);
    } catch (error) {
      console.error("MPIN verification error:", error);

      setShowError(true);
      triggerShake();
      setMpin(["", "", "", ""]);
      inputRefs.current[0]?.focus();

      showToast("Incorrect MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPress = () => {
    navigation.navigate("ForgotMpin");
  };

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                    source={require("../../assets/image/final-logo.jpg")}
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
                    {mpin.map((digit, index) => (
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
                          onChangeText={(value) =>
                            handleMpinChange(value, index)
                          }
                          onKeyPress={(event) => handleKeyPress(event, index)}
                          secureTextEntry
                          textAlign="center"
                          selectTextOnFocus
                        />
                        {digit ? <View style={styles.filledIndicator} /> : null}
                      </View>
                    ))}
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

                  {mpin.join("").length === 4 && !isLoading ? (
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
                  ) : (
                    <TouchableOpacity
                      style={[styles.createButton, styles.disabledButton]}
                      disabled
                    >
                      <Text style={styles.createButtonText}>
                        {isLoading ? "Verifying..." : "Verify MPIN"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

export default VerifyMpinScreen;