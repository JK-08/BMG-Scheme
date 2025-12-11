import { StyleSheet, Platform } from 'react-native';
import theme from '../../utils/AppTheme';

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;

const styles = StyleSheet.create({
  // Background & Container
  backgroundImage: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: verticalScale(SIZES.xs),
    paddingBottom: SIZES.xxl,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.lg,
  },

  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  logoImage: {
    width: moderateScale(220),
    height: moderateScale(94),
    resizeMode: "contain",
    borderRadius: SIZES.radius.full,
  },

  // Card Container
  card: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Typography
  title: {
    ...FONTS.h3,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...FONTS.body,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    color: COLORS.textSecondary,
  },
  label: {
    ...FONTS.bodyMedium,
    marginBottom: SIZES.xs,
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },

  // Input Fields
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.padding.md : SIZES.padding.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
    minHeight: SIZES.input.sm,
  },

  // Phone Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.padding.sm : SIZES.padding.xs,
    minHeight: SIZES.input.height,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  countryCode: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginRight: SIZES.sm,
    paddingRight: SIZES.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderMedium,
  },
  phoneInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
    paddingLeft: SIZES.sm,
    paddingVertical: Platform.OS === 'ios' ? SIZES.padding.sm : 0,
  },

  // Password Container
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.padding.sm : SIZES.padding.xs,
    minHeight: SIZES.input.height,
  },
  passwordInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.regular,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  eyeIconImage: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    tintColor: COLORS.textTertiary,
  },

  // Required field star
  requiredStar: {
    color: COLORS.error,
    fontSize: SIZES.font.md,
  },

  // Buttons
  primaryButton: {
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
    height: SIZES.button.lg,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...FONTS.button,
    color: COLORS.textInverse,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Divider & Google Button
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...FONTS.bodySmall,
    marginHorizontal: SIZES.md,
    color: COLORS.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    marginBottom: SIZES.md,
    ...SHADOWS.sm,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    marginRight: SIZES.md,
  },
  googleButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  loginText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginLeft: SIZES.xs,
  },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.white,
    marginTop: SIZES.md,
  },
  
});

// Platform-specific adjustments
if (Platform.OS === 'web') {
  styles.scrollContainer = {
    ...styles.scrollContainer,
    paddingTop: verticalScale(SIZES.xxl * 1.5),
    minHeight: '100vh',
  };
  
  styles.card = {
    ...styles.card,
    cursor: 'default',
    maxWidth: moderateScale(420),
  };
  
  styles.input = {
    ...styles.input,
    outlineStyle: 'none',
    paddingVertical: SIZES.padding.md,
  };
  
  styles.phoneInput = {
    ...styles.phoneInput,
    outlineStyle: 'none',
  };
  
  styles.primaryButton = {
    ...styles.primaryButton,
    cursor: 'pointer',
  };
  
  styles.googleButton = {
    ...styles.googleButton,
    cursor: 'pointer',
  };
  
  styles.loginLink = {
    ...styles.loginLink,
    cursor: 'pointer',
  };
}

export default styles;