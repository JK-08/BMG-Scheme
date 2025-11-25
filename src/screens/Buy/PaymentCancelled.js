// screens/PaymentCancelled.js
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

const PaymentCancelled = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderDetails, productData } = route.params || {};

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      // Scale and rotate animation for the X mark
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
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
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-90deg", "0deg"],
  });

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { rotate: rotateInterpolate },
    ],
  };

  const contentStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideUpAnim }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Animated X Mark Icon */}
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <View style={styles.circle}>
            <View style={styles.xMark}>
              <View style={[styles.xLine, styles.xLine1]} />
              <View style={[styles.xLine, styles.xLine2]} />
            </View>
          </View>
        </Animated.View>

        {/* Animated Content */}
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.title}>Payment Cancelled</Text>

          <Text style={styles.subtitle}>
            You cancelled the payment process. No amount was deducted from your account.
          </Text>

          <Text style={styles.infoText}>
            If you want to complete the payment, you can try again.
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
    backgroundColor: COLORS.warningLight,
    borderWidth: 4,
    borderColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  xMark: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    position: "relative",
  },
  xLine: {
    position: "absolute",
    backgroundColor: COLORS.warning,
    borderRadius: 2,
  },
  xLine1: {
    width: "100%",
    height: 6,
    top: "50%",
    marginTop: -3,
    transform: [{ rotate: "45deg" }],
  },
  xLine2: {
    width: "100%",
    height: 6,
    top: "50%",
    marginTop: -3,
    transform: [{ rotate: "-45deg" }],
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    ...FONTS.h3,
    color: COLORS.warning,
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

export default PaymentCancelled;