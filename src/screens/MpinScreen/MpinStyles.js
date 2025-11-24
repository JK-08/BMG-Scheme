import { StyleSheet, Dimensions, Platform } from "react-native";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;
const { width, height } = Dimensions.get("window");

export const mpinStyles = StyleSheet.create({
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: SIZES.xl,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(SIZES.xl),
  },

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  logoImage: {
    width: moderateScale(220),
    height: moderateScale(94),
    resizeMode: "contain",
    borderRadius: SIZES.radius.full,
  },

  // Content Section
  contentContainer: {
    paddingHorizontal: SIZES.padding.xl,
    paddingTop: SIZES.lg,
    alignItems: "center",
    width: "100%",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  description: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.lg * 1.4,
  },

  // MPIN Section
  mpinSection: {
    alignItems: "center",
    marginBottom: SIZES.md,
    width: "100%",
  },
  mpinLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: SIZES.lg,
    textAlign: "center",
    width: "100%",
  },
  mpinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
    width: "100%",
    maxWidth: moderateScale(280),
  },
  mpinInputWrapper: {
    marginHorizontal: SIZES.sm,
    position: "relative",
  },
  mpinInput: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderWidth: 2,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radius.lg,
    fontSize: SIZES.font.xxl,
    fontWeight: "bold",
    backgroundColor: COLORS.inputBackground,
    ...SHADOWS.sm,
    textAlign: "center",
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.bold,
  },
  mpinInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  filledIndicator: {
    position: "absolute",
    bottom: -SIZES.sm,
    left: "50%",
    marginLeft: -SIZES.xs / 2,
    width: SIZES.xs,
    height: SIZES.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
  },

  // Text States
  attemptsText: {
    ...FONTS.caption,
    color: COLORS.error,
    fontWeight: "500",
    marginTop: SIZES.sm,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    fontWeight: "500",
    marginTop: SIZES.sm,
    textAlign: "center",
  },
  weakMpinWarning: {
    ...FONTS.caption,
    color: COLORS.warning,
    fontWeight: "500",
    marginTop: SIZES.sm,
    textAlign: "center",
  },
  securityNote: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginTop: SIZES.sm,
    fontStyle: "italic",
  },

  // Action Section
  actionSection: {
    paddingBottom: SIZES.xl,
    alignItems: "center",
    width: "100%",
  },
  forgotButton: {
    paddingVertical: SIZES.padding.sm,
    marginBottom: SIZES.sm,
  },
  forgotText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: "600",
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: moderateScale(300),
  },
  createButton: {
    width: "100%",
    maxWidth: moderateScale(300),
    height: SIZES.button.lg,
    borderRadius: SIZES.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  gradientButton: {
    backgroundColor: "transparent",
  },
  disabledButton: {
    backgroundColor: COLORS.textDisabled,
    opacity: 0.6,
  },
  createButtonText: {
    ...FONTS.button,
    color: COLORS.textInverse,
  },

  // Error State
  errorState: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + "20",
  },
  // Add to your existing MpinStyles.js
  existingMpinLink: {
    marginTop: SIZES.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs,
    padding: SIZES.padding.sm,
  },
  existingMpinText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  existingMpinLinkText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationColor: COLORS.primary,
  },
});

// Platform-specific adjustments
if (Platform.OS === "web") {
  mpinStyles.scrollViewContent = {
    ...mpinStyles.scrollViewContent,
    minHeight: "100vh",
  };

  mpinStyles.mpinInput = {
    ...mpinStyles.mpinInput,
    outlineStyle: "none",
  };

  mpinStyles.createButton = {
    ...mpinStyles.createButton,
    cursor: "pointer",
  };

  mpinStyles.forgotButton = {
    ...mpinStyles.forgotButton,
    cursor: "pointer",
  };
}

// Additional responsive adjustments for small screens
if (SIZES.screen.height < 600) {
  mpinStyles.container = {
    ...mpinStyles.container,
    paddingTop: verticalScale(SIZES.lg),
  };

  mpinStyles.contentContainer = {
    ...mpinStyles.contentContainer,
    paddingTop: SIZES.lg,
  };

  mpinStyles.logoImage = {
    ...mpinStyles.logoImage,
    width: moderateScale(300),
    height: moderateScale(120),
  };

  mpinStyles.mpinInput = {
    ...mpinStyles.mpinInput,
    width: moderateScale(50),
    height: moderateScale(50),
  };
}

// For large screens
if (SIZES.screen.height > 800) {
  mpinStyles.contentContainer = {
    ...mpinStyles.contentContainer,
    maxWidth: moderateScale(400),
    alignSelf: "center",
  };
}
