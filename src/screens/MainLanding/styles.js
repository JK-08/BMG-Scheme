import { StyleSheet, Platform, Dimensions } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS, moderateScale } from "../../utils/AppTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Container Styles
  flex: {
    flex: 1,
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.05,
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: SIZES.xl,
    flexGrow: 1,
  },
  footerSpacer: {
    height: SIZES.xs,
  },

  // ========== CONTENT WRAPPER ==========
  contentWrapper: {
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding.md,
    marginTop: SIZES.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  
  },
  contentText: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  contentText1: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.lg * 1.5,
    textAlign: "center",
  },

  // ========== SECTION STYLES ==========
  titleSpacer: {
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.padding.md,
    gap: SIZES.md,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.padding.xs,
  },
  titleText: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontSize: SIZES.font.xl,
  },
  viewAllText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: FONTS.weight.semiBold,
  },

  // ========== SWIPEABLE CARDS ==========
  swipeableContainer: {
    marginBottom: SIZES.xs,
  },
  flatListContent: {
    alignItems: 'center',
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  productCardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  
  },
  goldPlanContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.padding.md,
  },
  paginationDot: {
    width: SIZES.xs,
    height: SIZES.xs,
    borderRadius: SIZES.radius.full,
    marginHorizontal: SIZES.xs / 2,
    
  },

  // ========== EMPTY STATE ==========
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.padding.lg,
    width: SCREEN_WIDTH - 40,
  },
  emptyStateText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // ========== YOUTUBE SECTION ==========
  youtubeContainer: {
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.padding.lg,
    // marginBottom: SIZES.xxl,
  },
  youtubeWrapper: {
    marginBottom: SIZES.md,
  },


  // ========== ERROR STATES ==========
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.padding.lg,
  },
  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: "center",
    marginTop: SIZES.md,
  },
});

export default styles;