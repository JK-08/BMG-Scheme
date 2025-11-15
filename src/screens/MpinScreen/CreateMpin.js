import React, { useState, useRef, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { mpinStyles as styles } from "./MpinStyles";
import { createMpinApi } from "../../services/MpinService";
import { COLORS } from "../../utils/MainTheme";

const MpinScreen = ({ navigation }) => {
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeakMpin, setIsWeakMpin] = useState(false);

  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animate + Check if MPIN already exists
  useEffect(() => {
    const initialize = async () => {
      await checkIfMpinCreated();
      animateIn();
    };
    initialize();
  }, []);

  const animateIn = () => {
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
  };

const checkIfMpinCreated = async () => {
  try {
    const isMpinCreated = await AsyncStorage.getItem("isMpinCreated");

    if (JSON.parse(isMpinCreated) === true) {
      navigation.replace("VerifyMpinScreen");
    }
  } catch (error) {
    console.error("Error checking MPIN creation:", error);
  }
};


  // Local helper: simple MPIN validation (e.g. 1111, 1234)
  const isWeak = (pin) => {
    const sequential = "0123456789";
    return (
      /^(\d)\1{3}$/.test(pin) || // repeated digits
      sequential.includes(pin) || // sequential
      sequential
        .split("")
        .reverse()
        .join("")
        .includes(pin)
    );
  };

  const showToast = (msg) => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
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

    if (newMpin.every((digit) => digit !== "")) {
      const entered = newMpin.join("");
      setIsWeakMpin(isWeak(entered));
    } else {
      setIsWeakMpin(false);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCreateMpin = async () => {
    const enteredMpin = mpin.join("");

    if (enteredMpin.length !== 4) {
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
      await createMpinApi(enteredMpin);

      await AsyncStorage.setItem("mpin", enteredMpin);
      await AsyncStorage.setItem("isMpinCreated", JSON.stringify(true));


      showToast("MPIN created successfully!");
      setTimeout(() => {
        navigation.replace("Drawer"); // ✅ Navigate directly to Drawer
      }, 1000);
    } catch (error) {
      console.error("MPIN creation error:", error);
      showToast("Failed to create MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotMpin = () => {
    Alert.alert(
      "Forgot MPIN?",
      "You will need to reset your MPIN using your registered mobile number.",
      [{ text: "OK" }]
    );
  };

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
              {/* Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logoRow}>
                  <Image
                    source={require("../../assets/image/logo2.png")}
                    style={styles.logoImage}
                  />
                </View>
              </View>

              {/* Content */}
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
                    {mpin.map((digit, index) => (
                      <View key={index} style={styles.mpinInputWrapper}>
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

                  {isWeakMpin && (
                    <Text style={styles.weakMpinWarning}>
                      This MPIN is too easy to guess. Please choose a stronger
                      one.
                    </Text>
                  )}

                  <Text style={styles.securityNote}>
                    Avoid simple sequences like 1234 or repeated digits
                  </Text>
                </View>

                <View style={styles.actionSection}>
                  {/* <TouchableOpacity
                    onPress={handleForgotMpin}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>Forgot MPIN?</Text>
                  </TouchableOpacity> */}

                  {mpin.join("").length === 4 && !isLoading && !isWeakMpin ? (
                    <TouchableOpacity
                      onPress={handleCreateMpin}
                      activeOpacity={0.9}
                      disabled={isLoading}
                      style={styles.buttonWrapper}
                    >
                      <LinearGradient
                        colors={[COLORS.secondary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.createButton, styles.gradientButton]}
                      >
                        <Text style={styles.createButtonText}>
                          {isLoading ? "Creating..." : "Create MPIN"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.createButton, styles.disabledButton]}>
                      <Text style={styles.createButtonText}>
                        {isLoading ? "Creating..." : "Create MPIN"}
                      </Text>
                    </View>
                  )}
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
