import { StyleSheet, Platform } from "react-native";
import theme from "../../utils/AppTheme"; // Changed from appTheme to theme

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;

const styles = StyleSheet.create({
  // Background & Container
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: verticalScale(SIZES.xl),
    paddingBottom: SIZES.xl,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.padding.lg,
  },

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  logoImage: {
    width: moderateScale(220),
    height: moderateScale(94),
    resizeMode: "contain",
    borderRadius: SIZES.radius.full,
  },

  // Card Container
  card: {
    width: "100%",
    maxWidth: moderateScale(400),
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.xxl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Typography
  title: {
    ...FONTS.h3,
    textAlign: "center",
    marginBottom: SIZES.sm,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...FONTS.body,
    textAlign: "center",
    marginBottom: SIZES.xl,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.lg * 1.4,
  },

  // OTP Container
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.lg,
    marginTop: SIZES.md,
    gap: SIZES.xs,
  },
  otpInputWrapper: {
    width: moderateScale(50),
    height: moderateScale(60),
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  otpInput: {
    width: "100%",
    height: "100%",
    fontSize: SIZES.font.xl,
    color: COLORS.textInverse,
    fontFamily: FONTS.family.bold,
    textAlign: "center",
    borderRadius: SIZES.radius.md,
  },

  // Clear OTP Button
  clearOtpButton: {
    alignSelf: "center",
    marginBottom: SIZES.lg,
    padding: SIZES.padding.sm,
  },
  clearOtpText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
  },

  // Buttons
  primaryButton: {
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.md,
    overflow: "hidden",
    ...SHADOWS.md,
    height: SIZES.button.lg,
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...FONTS.button,
    color: COLORS.textInverse,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Resend OTP
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.xl,
    paddingVertical: SIZES.padding.sm,
  },
  resendText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  resendLink: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textDisabled,
    fontStyle: "italic",
  },

  // Link Container
  linkContainer: {
    borderRadius: SIZES.radius.sm,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    marginTop: SIZES.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    ...FONTS.bodyMedium,
    textAlign: "center",
    color: COLORS.primary,
  },

  // Full Screen Loader
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loaderBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
  },
  loaderContent: {
    backgroundColor: COLORS.card,
    padding: SIZES.padding.xl,
    borderRadius: SIZES.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: moderateScale(280),
    minHeight: moderateScale(200),
    margin: SIZES.lg,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  loadingText: {
    ...FONTS.h5,
    marginTop: SIZES.lg,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  loadingSubtext: {
    ...FONTS.body,
    marginTop: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.4,
  },
  loadingTimer: {
    ...FONTS.caption,
    marginTop: SIZES.xs,
    color: COLORS.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  disabledText: {
    opacity: 0.5,
  },
});

// Platform-specific adjustments
if (Platform.OS === "web") {
  styles.scrollContainer = {
    ...styles.scrollContainer,
    paddingTop: verticalScale(SIZES.xxl * 1.5),
    minHeight: "100vh",
  };

  styles.card = {
    ...styles.card,
    cursor: "default",
    maxWidth: moderateScale(420),
  };

  styles.primaryButton = {
    ...styles.primaryButton,
    cursor: "pointer",
  };

  styles.resendContainer = {
    ...styles.resendContainer,
    cursor: "pointer",
  };

  styles.linkContainer = {
    ...styles.linkContainer,
    cursor: "pointer",
  };

  styles.clearOtpButton = {
    ...styles.clearOtpButton,
    cursor: "pointer",
  };
}

// Additional responsive adjustments for small screens
if (SIZES.screen.height < 600) {
  styles.scrollContainer = {
    ...styles.scrollContainer,
    paddingTop: verticalScale(SIZES.lg),
  };

  styles.container = {
    ...styles.container,
    paddingVertical: SIZES.sm,
  };

  styles.card = {
    ...styles.card,
    paddingVertical: SIZES.padding.xl,
    paddingHorizontal: SIZES.padding.lg,
  };

  styles.logoImage = {
    ...styles.logoImage,
    width: moderateScale(100),
    height: moderateScale(100),
  };

  styles.otpInputWrapper = {
    ...styles.otpInputWrapper,
    width: moderateScale(45),
    height: moderateScale(55),
  };
}

// For large screens
if (SIZES.screen.height > 800) {
  styles.card = {
    ...styles.card,
    maxWidth: moderateScale(420),
    paddingVertical: SIZES.padding.xxl,
  };
}

export default styles;
