// components/Header/Styles.js
import { StyleSheet } from "react-native";
import {
  COLORS,
  SIZES,
  FONTS,
  moderateScale,
  verticalScale,
  scale,
} from "../../utils/Theme";

export default StyleSheet.create({
  // ===== Container =====
  headerContainer1: {
    paddingHorizontal: SIZES.padding,
    paddingTop: verticalScale(12),
    marginBottom: verticalScale(35),
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    height: verticalScale(130),
    position: "relative",
  },

  // ===== Top Section =====
  topHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },

  faqIconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: scale(21),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },

  menuIconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: scale(21),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },

  // ===== Logo + Company =====
  mainHeaderSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZES.margin,
  },

  logoContainer: {
    marginRight: moderateScale(10),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  headerLogo: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: scale(25),
  },

  companyNameContainer: {
    alignItems: "center",
  },

  companyName: {
    ...FONTS.h5,
    color: COLORS.primary,
    fontSize: moderateScale(18),
  },

  companySubtitle: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontSize: moderateScale(13),
    marginTop: verticalScale(-2),
  },

  // ===== Rate Update Timestamp =====
  rateUpdateContainer: {
    alignItems: "center",
    marginTop: verticalScale(8),
  },

  updateText: {
    ...FONTS.fontXs,
    color: COLORS.text,
    fontSize: moderateScale(12),
    // fontStyle: "italic",
    textAlign: "center",
    // color: "#555",
    // fontSize: 13,
    marginTop: 10,
    // fontWeight: "500",
  },

  // ===== Rate Cards =====
  rateCardsOverlayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: verticalScale(-25),
    left: SIZES.padding,
    right: SIZES.padding,
    gap: moderateScale(12),
  },

  rateCardOverlay: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  rateCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  rateIconContainer: {
    marginRight: moderateScale(10),
  },

  animatedCoinContainer: {
    width: moderateScale(46),
    height: moderateScale(46),
    alignItems: "center",
    justifyContent: "center",
  },

  rateCoinIcon: {
    width: moderateScale(38),
    height: moderateScale(38),
  },

  rateTextContainer: {
    flex: 1,
  },

  rateLabel: {
    ...FONTS.body1,
    color: COLORS.black,
    fontSize: moderateScale(14),
  },

  rateValue: {
    ...FONTS.heading,
    color: COLORS.primary,
    fontSize: moderateScale(18),
    marginTop: verticalScale(2),
  },

  goldText: {
    color: "#000000ff",
  },

  silverText: {
    color: "#000000ff",
  },
});
