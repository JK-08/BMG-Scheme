// screens/Login/LoginStyles.js
import { StyleSheet, Platform } from "react-native";
import theme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  keyboardAvoidingView: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: verticalScale(SIZES.xs),
    paddingBottom: verticalScale(SIZES.xl + 14),
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
    paddingBottom: SIZES.xl + 14,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xs,
    marginTop: -10,
  },
  logoImage: {
    width: moderateScale(SIZES.icon.xl * 40),
    height: moderateScale(SIZES.icon.xl * 3.5),
    resizeMode: "contain",
    borderRadius: SIZES.radius.md,
  },

  // Card
  card: {
    width: "100%",
    maxWidth: moderateScale(400),
    // backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.xs,
  },

  // Texts
  title: {
    ...FONTS.h3,
    textAlign: "center",
    color: COLORS.secondaryDark,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...FONTS.body,
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  label: {
    ...FONTS.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },

  // Inputs
  input: {
    // backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.sm,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical:
      Platform.OS === "ios" ? verticalScale(SIZES.md) : verticalScale(SIZES.sm),
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    color: COLORS.textPrimary,
    fontSize: SIZES.font.md,
    fontFamily: FONTS.family.body,
    // ...SHADOWS.sm,
  },
forgotPasswordContainer: {
  alignSelf: "flex-end",
  marginTop: 10,
  marginBottom: 6,
},

forgotPasswordText: {
  color: theme.COLORS.error,
  fontSize: 14,
  fontWeight: "500",
},

  // Buttons
  primaryButton: {
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.lg,
    overflow: "hidden",
    ...SHADOWS.md,
    height: SIZES.button.lg,
    width: "70%",
    alignSelf: "center",
  },
  buttonGradient: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  primaryButtonText: {
    ...FONTS.h5,
    color: COLORS.white,
    fontWeight: "600",
  },
  disabledButton: { opacity: 0.7 },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.md,
  },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  dividerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    paddingHorizontal: SIZES.padding.sm,
  },

  // Google Button
  googleButton: {
    backgroundColor: COLORS.white,
    padding: SIZES.sm,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    width: "100%",
    marginBottom: SIZES.lg,
    ...SHADOWS.sm,
    alignSelf: "center",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    marginRight: SIZES.sm,
  },
  googleButtonText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  // Register
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...FONTS.body,
    color: COLORS.secondaryDark,
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  // Loader
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.white,
    marginTop: SIZES.lg,
  },
  // Password Container
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === "ios" ? SIZES.sm : SIZES.xss,
    // ...SHADOWS.sm,
    minHeight: SIZES.input.height,
  },
  passwordInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.body,
  },
  eyeIconContainer: {
    padding: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  eyeIcon: {
    width: SIZES.icon.sm,
    height: SIZES.icon.sm,
    tintColor: COLORS.textTertiary,
  },
  requiredStar: {
  color: COLORS.error,
  fontSize: SIZES.font.md,
},

// Error text
errorText: {
  ...FONTS.caption,
  color: COLORS.error,
  marginTop: SIZES.xs,
  marginLeft: SIZES.xs,
},

// Input error state
inputError: {
  borderColor: COLORS.error,
  borderWidth: 1.5,
},
});

// ✅ Web Adjustments
if (Platform.OS === "web") {
  Object.assign(styles.card, { cursor: "default" });
  Object.assign(styles.input, { outlineStyle: "none" });
  Object.assign(styles.primaryButton, { cursor: "pointer" });
  Object.assign(styles.googleButton, { cursor: "pointer" });
  Object.assign(styles.registerLink, { cursor: "pointer" });

  styles.scrollContainer = {
    ...styles.scrollContainer,
    paddingTop: verticalScale(SIZES.xxl * 2),
  };
}

export default styles;
