// theme.js
import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

// Scaling functions
const guidelineBaseWidth = 350
const guidelineBaseHeight = 680
const scale = size => (width / guidelineBaseWidth) * size
const verticalScale = size => (height / guidelineBaseHeight) * size
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor

export const COLORS = {
  // Base
  background: "rgba(255, 255, 255, 1)",
  card: "rgba(245, 245, 245, 1)",
  card1: "rgba(255, 255, 255, 0.65)",
  surface: "rgba(245, 245, 245, 1)",
  surfaceVariant: "rgba(238, 238, 238, 1)",
  transparent: "rgba(255, 255, 255, 0)",

  // Core Brand (updated)
  primary: "rgba(74, 144, 226, 1)",         // main blue
  primaryLight: "rgba(74, 144, 226, 0.15)",
  secondary: "rgba(225, 100, 250, 1)",      // main magenta/pink
  notification: "rgba(201, 137, 0, 1)",

  // Status
  success: "rgba(46, 125, 50, 1)",
  danger: "rgba(198, 40, 40, 1)",
  warning: "rgba(255, 160, 0, 1)",
  info: "rgba(21, 101, 192, 1)",

  // Text
  title: "rgba(51, 51, 51, 1)",
  text: "rgba(34, 34, 34, 1)",
  textLight: "rgba(102, 102, 102, 1)",
  label: "rgba(117, 117, 117, 1)",
  label1: "rgba(233, 219, 219, 1)",   // ⚠ alpha >1 fixed to 1
  placeholder: "rgba(0, 0, 0, 0.4)",
  white: "rgba(255, 255, 255, 1)",
  black: "rgba(0, 0, 0, 1)",

  // Borders & Shadows
  borderColor: "rgba(0, 0, 0, 0.1)",
  outline: "rgba(221, 221, 221, 1)",
  shadow: "rgba(0, 0, 0, 0.08)",
  overlay: "rgba(0, 0, 0, 0.3)",

  // Inputs
  input: "rgba(240, 240, 240, 1)",
  darkInput: "rgba(232, 232, 232, 1)",

  // Icons
  iconPrimary: "rgba(74, 144, 226, 1)",
  iconSecondary: "rgba(136, 136, 136, 1)",

  // Gradients (rgba arrays)
  gradientPrimary: ["rgba(16, 87, 168, 1)", "rgba(183, 38, 212, 1)"],
  gradientSecondary: ["rgba(74, 144, 226, 0.15)", "rgba(225, 100, 250, 1)"],
  gradientText: ["rgba(74, 144, 226, 1)", "rgba(225, 100, 250, 1)"],
  gradientBackground: "linear-gradient(135deg, rgba(249, 249, 249, 1), rgba(255, 255, 255, 1))",
  gradientPrimary1: ["rgba(74, 144, 226, 1)", "rgba(225, 100, 250, 1)"],
  gradientPrimary2: ["rgba(74, 144, 226, 1)", "rgba(225, 100, 250, 1)"],
  gradientPrimary3: ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"],
  gradientPrimary4: ["rgba(221, 221, 221, 1)", "rgba(221, 221, 221, 1)"],
  gradientPrimary5: ["rgba(74, 144, 226, 1)", "rgba(225, 100, 250, 1)"],

  // Product card
  gradientcolor1: "rgba(74, 144, 226, 1)",
  gradientcolor2: "rgba(225, 100, 250, 1)",

  // Gold plan (now themed with blue/pink)
  gradientcolor3: "rgba(74, 144, 226, 1)",
  gradientcolor4: "rgba(225, 100, 250, 1)",

  gradientcolor5: "rgba(74, 144, 226, 1)",
  gradientcolor6: "rgba(225, 100, 250, 1)",

  gradientcolor7: "rgba(74, 144, 226, 1)",
  gradientcolor8: "rgba(225, 100, 250, 1)",
};

export const DIGIGOLD_COLORS = {
  primary: "rgba(74, 144, 226, 1)",
  primaryDark: "rgba(59, 120, 194, 1)",  // slightly darker blue
  accent: "rgba(225, 100, 250, 1)",
  background: "rgba(255, 255, 255, 1)",
  surface: "rgba(249, 249, 249, 1)",
  border: "rgba(230, 230, 230, 1)",
  textPrimary: "rgba(28, 28, 28, 1)",
  textSecondary: "rgba(85, 85, 85, 1)",
  success: "rgba(46, 125, 50, 1)",
  error: "rgba(198, 40, 40, 1)",
};



export const SIZES = {
  // Scalable font sizes
  fontLg: moderateScale(16),
  font: moderateScale(14),
  fontSm: moderateScale(13),
  fontXs: moderateScale(12),

  // Scalable radii
  radius_sm: moderateScale(8),
  radius: moderateScale(12),
  radius_lg: moderateScale(16),

  // Scalable spacing
  padding: moderateScale(16),
  margin: moderateScale(16),

  // Scalable headings
  h1: moderateScale(32),
  h2: moderateScale(28),
  h3: moderateScale(24),
  h4: moderateScale(20),
  h5: moderateScale(18),
  h6: moderateScale(16),

  // App dimensions
  width,
  height,
  container: moderateScale(800),
};

export const FONTS = {
  // Paragraph styles with scaling
  fontLg: {
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    lineHeight: moderateScale(24),
    fontFamily: "Domine",
  },
  font: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: moderateScale(20),
    fontFamily: "Domine",
  },
  fontSm: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    lineHeight: moderateScale(18),
    fontFamily: "Domine",
  },
  fontXs: {
    fontSize: SIZES.fontXs,
    color: COLORS.text,
    lineHeight: moderateScale(16),
    fontFamily: "Domine",
  },

  // Scalable headings
  h1: {
    fontSize: SIZES.h1,
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: moderateScale(40),
  },
  h2: {
    fontSize: SIZES.h2,
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: moderateScale(36),
  },
  h3: {
    fontSize: SIZES.h3,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(32),
  },
  h4: {
    fontSize: SIZES.h4,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(28),
  },
  h5: {
    fontSize: SIZES.h5,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(26),
    color: COLORS.title,
  },
  h6: {
    fontSize: SIZES.h6,
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: moderateScale(24),
  },

  // Custom semantic roles
  heading: {
    fontFamily: "TrajanProBold",
    // lineHeight: moderateScale(25),
  },
  subheading: {
    fontFamily: "DMSerif",
    fontWeight: "500",
  },
  body: {
    fontFamily: "DancingScript",
    fontWeight: "600",
  },
  body1: {
    fontFamily: "Domine",
    fontWeight: "500",
  },
  fancy: {  
    fontFamily: "Fancy",
    // fontWeight: "700",
  },
};

// Export scaling functions
export { scale, verticalScale, moderateScale }

const appTheme = { COLORS, SIZES, FONTS, DIGIGOLD_COLORS, scale, verticalScale, moderateScale }

export default appTheme;