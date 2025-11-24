// components/Header/Styles.js
import { StyleSheet, Platform } from "react-native";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = theme;

export default StyleSheet.create({
  // ===== Container =====
  headerContainer: {
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: verticalScale(SIZES.padding.xs),
    paddingBottom: verticalScale(SIZES.padding.xxl),
    marginBottom: verticalScale(SIZES.padding.xl),
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    ...theme.SHADOWS.lg,
    position: "relative",
    minHeight: verticalScale(150),
    gap: SIZES.padding.md,
  },

  // ===== Top Section =====
  topHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(SIZES.xs),
  },

  faqIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.full,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: COLORS.whiteOpacity20,
    // borderWidth: 1,
    borderColor: COLORS.whiteOpacity50,
    // ...theme.SHADOWS.sm,
  },

  menuIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.whiteOpacity20,
    borderWidth: 1,
    borderColor: COLORS.whiteOpacity50,
    // ...theme.SHADOWS.sm,
  },

  // ===== Logo + Company =====
  mainHeaderSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZES.padding.md,
  },

  logoContainer: {
    marginRight: SIZES.padding.md,
    ...theme.SHADOWS.md,
  },

  headerLogo: {
    width: moderateScale(170),
    height: moderateScale(65),
    // borderRadius: SIZES.radius.full,
  },

  companyNameContainer: {
    alignItems: "center",
  },

  companyName: {
    ...FONTS.h4,

    color: COLORS.textInverse,
    fontSize: SIZES.font.xl,
    textShadowColor: COLORS.blackOpacity50,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  companySubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textInverse,
    fontSize: SIZES.font.sm,
    marginTop: verticalScale(-SIZES.xs),
    textShadowColor: COLORS.blackOpacity50,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // ===== Rate Cards =====
  rateCardsOverlayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: verticalScale(-SIZES.xl),
    left: SIZES.padding.lg,
    right: SIZES.padding.lg,
    gap: SIZES.padding.md,
  },

  rateCardOverlay: {
    flex: 1,
    alignContent:'center',
    justifyContent:'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: verticalScale(8),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...theme.SHADOWS.lg,
    minHeight: verticalScale(55),
  },

  rateCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding.md,
  },
rateCardContainer:{
alignItemsL:'center',
display:'flex',
justifyContent:'center'
},
  animatedCoinContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    alignItems: "center",
    justifyContent: "center",
  },

  animatedIconContainer: {
  },

  rateCoinIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
  },

  // RIGHT-ALIGNED TEXT
  rateTextRightAligned: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  rateLabelRight: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
    marginBottom: SIZES.xs,
    textAlign: "right",
    paddingRight: SIZES.padding.sm,
  },

  rateValueRight: {
    fontSize: SIZES.font.xl,
    marginBottom: SIZES.xs,
    textAlign: "right",
    paddingRight: SIZES.padding.sm,
    lineHeight: SIZES.font.xl * 1.4,
    color: COLORS.textPrimary,
  },

  rateUnitRight: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    fontSize: SIZES.font.xs,
    textAlign: "right",
    paddingRight: SIZES.padding.sm,
  },

  // DEFAULT TEXT BLOCK (LEFT)
  rateTextContainer: {
    display: "flex",
    flexDirection: "row",
    gap: SIZES.padding.sm,
    alignItems:'center',
    justifyContent:'center',
    color: COLORS.textWhite,
  },

  rateIconContainer: {
    display:'flex',
    alignContent:'center',
    justifyContent:'center',
  },

  dateUpdateText: {
    ...FONTS.bodyMedium,
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.7,
  },
  rateLabel:{
    color: COLORS.textWhite,
  },
  shopTextContainer:{
    display:'flex',
  },
  shopTitle:{
    color: COLORS.primaryDark,
  },
  shopSubtitle:{
    color: COLORS.primaryDark,
  color: COLORS.primaryDark,
  flexShrink: 1,
  width: "100%",
  }
});
