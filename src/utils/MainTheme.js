// theme.js
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// ============================================
// 📏 RESPONSIVE SCALING SYSTEM
// ============================================
const guidelineBaseWidth = 375;  // iPhone 11 Pro base
const guidelineBaseHeight = 812;

// Scale based on device width
const scale = (size) => (width / guidelineBaseWidth) * size;

// Scale based on device height
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Moderate scale with configurable factor (prevents extreme scaling)
const moderateScale = (size, factor = 0.25) => {
  return size + (scale(size) - size) * factor;
};

// Font scale with pixel ratio consideration
const fontScale = (size) => {
  const scaled = moderateScale(size, 0.2);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// 🎨 COLOR PALETTE
// ============================================
export const COLORS = {
  // ===== PRIMARY BRAND COLORS =====
  primary: '#D245B6',           // Vibrant Magenta/Pink
  primaryLight: '#E573C8',      // Light magenta
  primaryDark: '#B82D98',       // Darker magenta
  
  secondary: '#F39C42',         // Warm Orange
  secondaryLight: '#F6B570',    // Light orange
  secondaryDark: '#E07D1A',     // Dark orange
  
  accent: '#FFD93D',            // Bright Yellow/Gold accent
  accentLight: '#FFE573',       // Light yellow
  accentLight1: '#fff0afff',       // Light yellow
  
  // ===== NEUTRAL COLORS =====
  white: '#ffffffff',
  black: '#000000',
  background: '#FFFFFF',
  surface: '#F9F9F9',
  card: '#F5F5F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // ===== TEXT COLORS =====
  textPrimary: '#222222',       // Main text
  textSecondary: '#666666',     // Secondary text
  textTertiary: '#999999',      // Tertiary text
  textDisabled: '#CCCCCC',      // Disabled text
  textInverse: '#FFFFFF',       // Text on dark backgrounds
  
  // ===== BORDER & DIVIDER =====
  border: 'rgba(0, 0, 0, 0.1)',
  borderLight: '#EEEEEE',
  borderMedium: '#DDDDDD',
  divider: '#E0E0E0',
  
  // ===== INPUT COLORS =====
  inputBackground: '#F0F0F0',
  inputBorder: '#E0E0E0',
  inputPlaceholder: 'rgba(0, 0, 0, 0.4)',
  inputFocused: '#D245B6',      // Primary color for focus
  
  // ===== STATUS COLORS =====
  success: '#2E7D32',
  successLight: '#81C784',
  error: '#C62828',
  errorLight: '#EF5350',
  warning: '#F39C42',           // Using secondary for warning
  warningLight: '#F6B570',
  info: '#6B4FCF',              // Purple complement
  infoLight: '#9B7FDB',
  goldPrimary: '#ffffffff',
  goldSecondary: '#ffffffff',
  disabled: "#f2f2f2",

 
  
  // ===== SHADOW & EFFECTS =====
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowStrong: 'rgba(0, 0, 0, 0.25)',
  
  // ===== GRADIENT COLORS =====
  gradient: {
    primary: ['#D245B6', '#E573C8'],           // Primary gradient
    secondary: ['#F39C42', '#F6B570'],         // Secondary gradient
    brand: ['#F39C42', '#F39C42'],             // Primary to Secondary
    brand1: ['#92207bf5', '#b46010ff'],             // Primary to Secondary
    vibrant: ['#E573C8', '#FFD93D'],           // Light pink to yellow
    warm: ['#F39C42', '#FFD93D'],              // Orange to yellow
    cool: ['#B82D98', '#D245B6'],              // Dark to light magenta
    surface: ['#F9F9F9', '#FFFFFF'], 
    success: ['#2E7D32', '#66BB6A'],   // green gradient
          // Neutral surface
  },
};

// ============================================
// 📐 SIZING SYSTEM
// ============================================
export const SIZES = {
  // ===== SPACING SCALE =====
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
  
  // ===== PADDING & MARGIN =====
  padding: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(16),
    lg: moderateScale(24),
    xl: moderateScale(32),
  },
  
  // ===== BORDER RADIUS =====
  radius: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
    full: 9999,
  },
  
  // ===== FONT SIZES =====
  font: {
    xss: fontScale(8),
    xs: fontScale(10),
    sm: fontScale(12),
    md: fontScale(14),
    lg: fontScale(16),
    xl: fontScale(18),
    xxl: fontScale(20),
  },
  
  // ===== HEADING SIZES =====
  heading: {
    h1: fontScale(32),
    h2: fontScale(28),
    h3: fontScale(24),
    h4: fontScale(20),
    h5: fontScale(18),
    h6: fontScale(16),
  },
  
  // ===== ICON SIZES =====
  icon: {
    xs: moderateScale(16),
    sm: moderateScale(20),
    md: moderateScale(24),
    lg: moderateScale(32),
    xl: moderateScale(48),
  },
  
  // ===== DIMENSIONS =====
  screen: {
    width,
    height,
  },
  
  // ===== COMPONENT SIZES =====
  button: {
    sm: moderateScale(32),
    md: moderateScale(44),
    lg: moderateScale(52),
  },
  
  input: {
    height: moderateScale(48),
  },
  
  card: {
    padding: moderateScale(16),
  },
};

// ============================================
// 🔤 TYPOGRAPHY SYSTEM
// ============================================
export const FONTS = {
  // ===== FONT FAMILIES =====
  family: {
    // Display fonts
    heading: 'PoppinsBold',
    headingRegular: 'PoppinsBold',
    display: 'PlayfairDisplayMedium',
    
    // Body fonts
    body: 'PoppinsRegular',
    bodyBold: 'PoppinsBold',
    serif: 'DMSerif',
    
    // Special fonts
    script: 'DancingScript',
    fancy: 'Fancy',
    inter: 'InterDisplayMedium',
    lato: 'Lato',
  },
  
  // ===== HEADING STYLES =====
  h1: {
    fontFamily: 'TrajanProBold',
    fontSize: SIZES.heading.h1,
    lineHeight: SIZES.heading.h1 * 1.2,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: 'TrajanProBold',
    fontSize: SIZES.heading.h2,
    lineHeight: SIZES.heading.h2 * 1.3,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  h3: {
    fontFamily: 'DMSerif',
    fontSize: SIZES.heading.h3,
    lineHeight: SIZES.heading.h3 * 1.3,
    color: COLORS.textPrimary,
  },
  h4: {
    fontFamily: 'DMSerif',
    fontSize: SIZES.heading.h4,
    lineHeight: SIZES.heading.h4 * 1.4,
    color: COLORS.textPrimary,
  },
  h5: {
    fontFamily: 'PoppinsBold',
    fontSize: SIZES.heading.h6,
    lineHeight: SIZES.heading.h5 * 1.4,
    color: COLORS.textPrimary,
    // opacity: 0.8,
  },
  h6: {
    fontFamily: 'PoppinsRegular',
    fontSize: SIZES.heading.h6,
    lineHeight: SIZES.heading.h6 * 1.5,
    color: COLORS.textPrimary,
    // opacity: 0.8,
  },
  
  // ===== BODY TEXT STYLES =====
  bodyLarge: {
    fontFamily: 'PoppinsRegular',
    fontSize: SIZES.font.lg,
    lineHeight: SIZES.font.lg * 1.5,
    color: COLORS.textPrimary,
  },
  body: {
    fontFamily: 'PoppinsRegular',
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontFamily: 'PoppinsRegular',
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.5,
    color: COLORS.textSecondary,
  },
  
  // ===== LABEL & CAPTION =====
  label: {
    fontFamily: 'PoppinsBold',
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.5,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
      opacity: 0.8,
  },
  caption: {
    fontFamily: 'PoppinsRegular',
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textSecondary,
  },
  
  // ===== SPECIAL TEXT STYLES =====
  serif: {
    fontFamily: 'DMSerif',
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.6,
    color: COLORS.textPrimary,
  },
  script: {
    fontFamily: 'DancingScript',
    fontSize: SIZES.font.xl,
    lineHeight: SIZES.font.xl * 1.4,
    color: COLORS.textPrimary,
  },
  fancy: {
    fontFamily: 'Fancy',
    fontSize: SIZES.font.lg,
    lineHeight: SIZES.font.lg * 1.4,
    color: COLORS.textPrimary,
  },
};

// ============================================
// 🎭 SHADOWS
// ============================================
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================
// 📱 DEVICE BREAKPOINTS
// ============================================
export const BREAKPOINTS = {
  small: width < 375,
  medium: width >= 375 && width < 768,
  large: width >= 768,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
};

// ============================================
// 🎯 EXPORT DEFAULT THEME
// ============================================
const theme = {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  BREAKPOINTS,
  // Utility functions
  scale,
  verticalScale,
  moderateScale,
  fontScale,
};

export default theme;

// Export individual utilities
export { scale, verticalScale, moderateScale, fontScale };