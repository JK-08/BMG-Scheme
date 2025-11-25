// screens/PaymentFailure.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";

const PaymentFailure = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderDetails, productData, paymentStatus } = route.params || {};

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      // Scale and shake animation for the error mark
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
      ]),
      // Start pulse animation
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      // Fade in text and buttons
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRetry = () => {
    navigation.goBack(); // Go back to BuyPage to retry payment
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainLanding" }],
    });
  };

  // Interpolated values for animations
  const shakeInterpolate = shakeAnim.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -10, 10, -10, 10, -10, 10, -5, 5, -2, 0],
  });

  const pulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateX: shakeInterpolate },
    ],
  };

  const contentStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideUpAnim }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Animated Error Mark Icon */}
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <Animated.View style={[styles.circle, pulseStyle]}>
            <View style={styles.errorMark}>
              <View style={[styles.errorLine, styles.errorLine1]} />
              <View style={[styles.errorLine, styles.errorLine2]} />
              <View style={styles.exclamationDot} />
              <View style={styles.exclamationStem} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Animated Content */}
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.title}>Payment Failed</Text>

          <Text style={styles.subtitle}>
            We couldn't process your payment. Please try again.
          </Text>

          {paymentStatus?.message && (
            <Text style={styles.errorText}>
              Reason: {paymentStatus.message}
            </Text>
          )}

          <Text style={styles.infoText}>
            If money was deducted from your account, it will be refunded within 3-5 working days.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  iconContainer: {
    marginBottom: SIZES.padding.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: SIZES.icon.xxxl * 2,
    height: SIZES.icon.xxxl * 2,
    borderRadius: SIZES.icon.xxxl,
    backgroundColor: COLORS.errorLight,
    borderWidth: 4,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  errorMark: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  errorLine: {
    position: "absolute",
    backgroundColor: COLORS.error,
    borderRadius: 2,
  },
  errorLine1: {
    width: "100%",
    height: 6,
    top: "30%",
    transform: [{ rotate: "45deg" }],
  },
  errorLine2: {
    width: "100%",
    height: 6,
    top: "30%",
    transform: [{ rotate: "-45deg" }],
  },
  exclamationDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
    position: "absolute",
    top: "55%",
  },
  exclamationStem: {
    width: 6,
    height: 20,
    backgroundColor: COLORS.error,
    borderRadius: 2,
    position: "absolute",
    top: "65%",
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    ...FONTS.h3,
    color: COLORS.error,
    marginBottom: SIZES.padding.sm,
    textAlign: "center",
    fontWeight: FONTS.weight.bold,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.padding.md,
    lineHeight: SIZES.font.md * 1.5,
  },
  errorText: {
    ...FONTS.bodySmall,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SIZES.padding.md,
    fontStyle: "italic",
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    overflow: "hidden",
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.sm * 1.5,
    marginBottom: SIZES.padding.lg,
  },
  buttonContainer: {
    width: "100%",
    marginTop: SIZES.padding.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.button.lg,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  secondaryButton: {
    height: SIZES.button.lg,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.semiBold,
  },
  secondaryButtonText: {
    ...FONTS.button,
    color: COLORS.primary,
    fontWeight: FONTS.weight.semiBold,
  },
});

export default PaymentFailure;