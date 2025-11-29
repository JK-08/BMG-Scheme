// components/Header/Styles.js
import { StyleSheet } from "react-native";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = theme;

export default StyleSheet.create({

  /* -----------------------------------------------
     HEADER CONTAINER (iOS FIX APPLIED)
  -------------------------------------------------*/
  headerContainer: {
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(35),
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    minHeight: verticalScale(160),
    ...theme.SHADOWS.lg,

    // ⭐ Required for iOS to show absolute children
    overflow: "visible",
    zIndex: 10,
  },

  /* -----------------------------------------------
     TOP BAR
  -------------------------------------------------*/
  topHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(5),
  },

  faqIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.whiteOpacity20,
    borderWidth: 1,
    borderColor: COLORS.whiteOpacity50,
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
  },

  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  /* -----------------------------------------------
     MAIN HEADER (LOGO)
  -------------------------------------------------*/
  mainHeaderSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(5),
  },

  logoContainer: {
    ...theme.SHADOWS.md,
  },

  headerLogo: {
    width: moderateScale(170),
    height: moderateScale(65),
    resizeMode: "contain",
  },

  /* -----------------------------------------------
     RATE TEXT ABOVE CARDS
  -------------------------------------------------*/
  rateCardContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(8),
  },

  rateTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.padding.sm,
  },

  rateLabel: {
    color: COLORS.textWhite,
    ...FONTS.bodySmall,
  },

  /* -----------------------------------------------
     FLOATING RATE CARDS (absolute)
     ⭐ FULLY FIXED FOR iOS CLIPPING
  -------------------------------------------------*/
  rateCardsOverlayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: -verticalScale(40),
    left: SIZES.padding.lg,
    right: SIZES.padding.lg,
    gap: SIZES.padding.md,
    zIndex: 20,          // ⭐ Important for iOS layering
  },

  rateCardOverlay: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: verticalScale(8),
    minHeight: verticalScale(60),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...theme.SHADOWS.lg,
  },

  rateCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.padding.md,
  },

  /* -----------------------------------------------
     COIN / ICON
  -------------------------------------------------*/
  animatedCoinContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    alignItems: "center",
    justifyContent: "center",
  },

  rateCoinIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    resizeMode: "contain",
  },

  /* -----------------------------------------------
     RATE TEXT RIGHT SIDE
  -------------------------------------------------*/
  rateTextRightAligned: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  rateLabelRight: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },

  rateValueRight: {
    fontSize: SIZES.font.xl,
    color: COLORS.textPrimary,
    marginVertical: 2,
    fontWeight: "700",
  },

  rateUnitRight: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    fontSize: SIZES.font.xs,
  },

  /* -----------------------------------------------
     OTHER UI ELEMENTS
  -------------------------------------------------*/
  rateIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  shopTitle: {
    color: COLORS.primaryDark,
    fontSize: SIZES.font.xxl,
    fontWeight: "700",
  },

});
