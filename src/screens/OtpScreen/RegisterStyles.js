import { StyleSheet, Platform } from 'react-native';
import appTheme from '../../utils/MainTheme';

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = appTheme;

const styles = StyleSheet.create({
  // Background & Container
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: verticalScale(SIZES.xss),
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
    marginBottom: SIZES.xss,
  },
  logoImage: {
    width: moderateScale(420),
    height: moderateScale(150),
    resizeMode: 'contain',
    borderRadius: SIZES.radius.full,
  },

  // Card Container
  card: {
    width: '100%',
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.xs,
  },

  // Typography
  title: {
    ...FONTS.h3,
    textAlign: 'center',
    marginBottom: SIZES.xs,
    color: COLORS.secondaryDark,
  },
  subtitle: {
    ...FONTS.body,
    textAlign: 'center',
    marginBottom: SIZES.xs,
    color: COLORS.textSecondary,
  },
  label: {
    ...FONTS.body,
    marginBottom: SIZES.xs,
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },

  // Input Fields
  input: {
    // backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.md : SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.body,
    // ...appTheme.SHADOWS.sm,
    minHeight: SIZES.input.height,
  },

  // Phone Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.sm : SIZES.xs,
    // ...appTheme.SHADOWS.sm,
    minHeight: SIZES.input.height,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  countryCode: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    marginRight: SIZES.sm,
    fontWeight: '600',
    paddingRight: SIZES.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderMedium,
  },
  phoneInput: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.body,
    paddingLeft: SIZES.sm,
    paddingVertical: Platform.OS === 'ios' ? SIZES.sm : 0,
  },

  // Buttons
  primaryButton: {
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.xl,
    overflow: 'hidden',
    ...appTheme.SHADOWS.md,
    height: SIZES.button.lg,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...FONTS.h6,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xl,
  },
  loginText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...FONTS.body,
    color: COLORS.secondaryDark,
    fontWeight: '600',
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
  // Add to your existing StyleSheet.create({
requiredStar: {
  color: COLORS.error,
  fontSize: SIZES.font.md,
},

// Update the existing errorText style if needed:
errorText: {
  ...FONTS.caption,
  color: COLORS.error,
  marginTop: SIZES.xs,
  marginLeft: SIZES.xs,
},

// Ensure inputError style exists:
inputError: {
  borderColor: COLORS.error,
  borderWidth: 1.5,
},
// Add to your existing StyleSheet.create({

// Password Container with Eye Icon
passwordContainer: {
 flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.sm : SIZES.xs,
    // ...appTheme.SHADOWS.sm,
    minHeight: SIZES.input.height,
},
passwordInput: {
  flex: 1,
  fontSize: SIZES.font.md,
  color: COLORS.textPrimary,
  fontFamily: FONTS.family.body,
  paddingVertical: 0,
},
eyeIcon: {
  padding: SIZES.xs,
  marginLeft: SIZES.xs,
},
eyeIconImage: {
  width: SIZES.icon.sm,
  height: SIZES.icon.sm,
  tintColor: COLORS.textTertiary,
},

// Required field star
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
// Add these styles to your RegisterStyles.js
dividerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: SIZES.md,
},
divider: {
  flex: 1,
  height: 1,
  backgroundColor: COLORS.border,
},
dividerText: {
  marginHorizontal: SIZES.md,
  color: COLORS.textSecondary,
  ...FONTS.bodySmall,
},
googleButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: SIZES.md,
  paddingVertical: SIZES.md,
  paddingHorizontal: SIZES.lg,
  marginBottom: SIZES.xss,
},
googleButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
googleIcon: {
  width: 20,
  height: 20,
  marginRight: SIZES.md,
},
googleButtonText: {
  color: COLORS.textPrimary,
  ...FONTS.bodyMedium,
  fontWeight: '500',
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
    paddingVertical: SIZES.md,
  };
  
  styles.phoneInput = {
    ...styles.phoneInput,
    outlineStyle: 'none',
  };
  
  styles.primaryButton = {
    ...styles.primaryButton,
    cursor: 'pointer',
  };
  
  styles.loginLink = {
    ...styles.loginLink,
    cursor: 'pointer',
  };
  
}

export default styles;