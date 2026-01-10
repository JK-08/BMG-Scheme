import { StyleSheet, Platform, Dimensions } from "react-native";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;
const { width, height } = Dimensions.get("window");

const isSmallDevice = width < 375;
const isTablet = width >= 768;

// Create the base styles
const baseStyles = {
  // ===== BACKGROUND & CONTAINERS =====
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
    paddingTop: verticalScale(isTablet ? SIZES.xxl * 2 : SIZES.xxl),
    paddingBottom: isTablet ? SIZES.xxl * 2 : SIZES.xxl,
    minHeight: height,
  },
  
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isTablet ? SIZES.padding.xxl : SIZES.padding.lg,
    paddingVertical: isTablet ? SIZES.padding.xl : 0,
  },

  // ===== LOGO SECTION =====
  logoContainer: {
    alignItems: "center",
    marginBottom: isTablet ? SIZES.xl * 2 : SIZES.lg,
    paddingHorizontal: SIZES.sm,
  },
  
  logoImage: {
    width: isTablet ? moderateScale(300) : moderateScale(220),
    height: isTablet ? moderateScale(128) : moderateScale(94),
    resizeMode: "contain",
    borderRadius: SIZES.radius.full,
  },

  // ===== CARD CONTAINER =====
  card: {
    width: isTablet ? "80%" : "95%",
    maxWidth: moderateScale(500),
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    paddingHorizontal: isTablet ? SIZES.padding.xxl : SIZES.padding.xl,
    paddingVertical: isTablet ? SIZES.padding.xxl : SIZES.padding.xl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // ===== TYPOGRAPHY =====
  title: {
    ...FONTS.h2,
    textAlign: "center",
    marginBottom: SIZES.xs,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  
  subtitle: {
    ...FONTS.bodyLarge,
    textAlign: "center",
    marginBottom: SIZES.xl,
    color: COLORS.textSecondary,
  },
  
  label: {
    ...FONTS.bodyMedium,
    marginBottom: SIZES.xs,
    color: COLORS.textPrimary,
    marginTop: isSmallDevice ? SIZES.sm : SIZES.md,
    fontWeight: "500",
  },
  
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.xxs,
    marginLeft: SIZES.xs,
    fontWeight: "500",
  },
  
  requiredStar: {
    color: COLORS.error,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },

  // ===== DEMO INDICATOR =====
  demoIndicator: {
    backgroundColor: COLORS.secondary + "15",
    borderWidth: 1,
    borderColor: COLORS.secondary + "30",
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.lg,
    alignItems: "center",
  },
  
  demoIndicatorText: {
    ...FONTS.bodySmall,
    color: COLORS.secondary,
    fontWeight: "600",
  },

  // ===== QUICK LOGIN SECTION =====
  quickLoginContainer: {
    marginBottom: SIZES.xl,
  },
  
  quickLoginTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    fontWeight: "500",
  },
  
  quickLoginButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
  },
  
  quickLoginButton: {
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius.sm,
    minWidth: moderateScale(100),
    alignItems: "center",
    ...SHADOWS.xs,
  },
  
  quickLoginButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: "600",
    fontSize: SIZES.font.sm,
  },

  // ===== INPUT FIELDS =====
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
    minHeight: isTablet ? SIZES.input.height * 1.2 : SIZES.input.height,
  },
  
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
    backgroundColor: COLORS.error + "08",
  },

  // ===== PASSWORD FIELD =====
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    minHeight: isTablet ? SIZES.input.height * 1.2 : SIZES.input.height,
  },
  
  passwordInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
  },
  
  eyeIconContainer: {
    padding: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  
  eyeIcon: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    tintColor: COLORS.textTertiary,
  },

  // ===== FORGOT PASSWORD =====
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  
  forgotPasswordText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // ===== BUTTONS =====
  primaryButton: {
    borderRadius: SIZES.radius.lg,
    marginTop: SIZES.xl,
    overflow: "hidden",
    ...SHADOWS.md,
    height: isTablet ? SIZES.button.xl : SIZES.button.lg,
  },
  
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  
  primaryButtonText: {
    ...FONTS.button,
    color: COLORS.textInverse,
    fontWeight: "700",
    fontSize: SIZES.font.lg,
  },
  
  disabledButton: {
    opacity: 0.6,
  },

  // ===== DIVIDER =====
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.lg,
  },
  
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  
  dividerText: {
    ...FONTS.bodySmall,
    marginHorizontal: SIZES.md,
    color: COLORS.textTertiary,
    fontWeight: "500",
  },

  // ===== GOOGLE BUTTON =====
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    paddingVertical: isTablet ? SIZES.padding.xl : SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    marginBottom: SIZES.md,
    ...SHADOWS.sm,
  },
  
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  googleIcon: {
    width: SIZES.icon.lg,
    height: SIZES.icon.lg,
    marginRight: SIZES.md,
  },
  
  googleButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  // ===== REGISTER SECTION =====
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.lg,
    flexWrap: "wrap",
  },
  
  registerText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  
  registerLink: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginLeft: SIZES.xs,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // ===== LOADING OVERLAY =====
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  
  loadingText: {
    ...FONTS.bodyLarge,
    color: COLORS.white,
    marginTop: SIZES.md,
    fontWeight: "600",
  },
};

// Apply platform-specific adjustments
const applyPlatformStyles = () => {
  const styles = { ...baseStyles };
  
  // iOS specific adjustments
  if (Platform.OS === "ios") {
    styles.input = {
      ...styles.input,
      paddingVertical: SIZES.padding.lg,
    };
    
    styles.passwordInput = {
      ...styles.passwordInput,
      paddingVertical: SIZES.padding.md,
    };
  } else {
    // Android and other platforms
    styles.input = {
      ...styles.input,
      paddingVertical: SIZES.padding.sm,
    };
    
    styles.passwordInput = {
      ...styles.passwordInput,
      paddingVertical: SIZES.padding.xs,
    };
  }
  
  // Tablet specific adjustments
  if (isTablet) {
    styles.title = {
      ...styles.title,
      fontSize: SIZES.font.xxl,
      marginBottom: SIZES.sm,
    };
    
    styles.subtitle = {
      ...styles.subtitle,
      fontSize: SIZES.font.xl,
      marginBottom: SIZES.xxl,
    };
    
    styles.input = {
      ...styles.input,
      fontSize: SIZES.font.lg,
    };
    
    styles.passwordInput = {
      ...styles.passwordInput,
      fontSize: SIZES.font.lg,
    };
    
    styles.primaryButtonText = {
      ...styles.primaryButtonText,
      fontSize: SIZES.font.xl,
    };
  }
  
  // Web specific adjustments
  if (Platform.OS === "web") {
    styles.scrollContainer = {
      ...styles.scrollContainer,
      paddingTop: verticalScale(isTablet ? SIZES.xxl * 3 : SIZES.xxl * 2),
      minHeight: "100vh",
      alignItems: "center",
    };
    
    styles.card = {
      ...styles.card,
      maxWidth: moderateScale(480),
      width: "100%",
      marginHorizontal: "auto",
    };
    
    styles.input = {
      ...styles.input,
      outlineStyle: "none",
      transition: "border-color 0.2s ease",
    };
    
    styles.passwordInput = {
      ...styles.passwordInput,
      outlineStyle: "none",
    };
    
    // Add cursor styles for web
    styles.primaryButton = {
      ...styles.primaryButton,
      cursor: "pointer",
    };
    
    styles.googleButton = {
      ...styles.googleButton,
      cursor: "pointer",
    };
    
    styles.registerLink = {
      ...styles.registerLink,
      cursor: "pointer",
    };
    
    styles.forgotPasswordText = {
      ...styles.forgotPasswordText,
      cursor: "pointer",
    };
    
    styles.quickLoginButton = {
      ...styles.quickLoginButton,
      cursor: "pointer",
    };
  }
  
  return styles;
};

// Create the final stylesheet
const dynamicStyles = applyPlatformStyles();
const styles = StyleSheet.create(dynamicStyles);

export default styles;