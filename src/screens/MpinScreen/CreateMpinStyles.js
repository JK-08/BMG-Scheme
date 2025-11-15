import { StyleSheet, Dimensions } from "react-native";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = appTheme;
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
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(SIZES.xs),
    paddingBottom: SIZES.xl,
  },

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xss,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.xs,
  },
  logoImage: {
    width: moderateScale(360),
    height: moderateScale(150),
    marginRight: SIZES.sm,
    borderRadius: SIZES.radius.sm,
  },

  // Content Section
  contentContainer: {
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.xl,
    alignItems: "center",
    width: "100%",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.secondaryDark,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  description: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.4,
  },

  // MPIN Section
  mpinSection: {
    alignItems: "center",
    marginBottom: SIZES.xl,
    width: "100%",
  },
  mpinLabel: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    marginBottom: SIZES.lg,
    alignSelf: "flex-start",
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
    marginHorizontal: SIZES.xs,
    position: "relative",
  },
  mpinInput: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderWidth: 2,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radius.md,
    fontSize: SIZES.font.xl,
    fontWeight: "bold",
    backgroundColor: COLORS.inputBackground,
    ...SHADOWS.sm,
    textAlign: "center",
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.bodyBold,
  },
  mpinInputFilled: {
    borderColor: COLORS.secondaryDark,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  filledIndicator: {
    position: "absolute",
    bottom: -SIZES.xs,
    left: "50%",
    marginLeft: -SIZES.xs / 2,
    width: SIZES.xs,
    height: SIZES.xs,
    borderRadius: SIZES.xs / 2,
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
  },
  weakMpinWarning: {
    ...FONTS.caption,
    color: COLORS.error,
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
    paddingVertical: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  forgotText: {
    ...FONTS.body,
    color: COLORS.error,
    fontWeight: "600",
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: moderateScale(300),
  },
  createButton: {
    width: "100%",
    maxWidth: moderateScale(300),
    height: moderateScale(55),
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
    ...FONTS.h6,
    color: COLORS.textInverse,
    fontWeight: "600",
  },

  // Error State
  errorState: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + "20",
  },
});