import { StyleSheet, Platform } from "react-native";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = appTheme;

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
  },

  // ========== CONTENT WRAPPER ==========
  contentWrapper: {
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding.md,
    marginTop: SIZES.lg,
    borderRadius: SIZES.radius.lg,
    ...appTheme.SHADOWS.md,
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
    lineHeight: SIZES.font.md * 1.5,
    textAlign: "center",
  },

  // ========== SECTION STYLES ==========
  titleSpacer: {
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.padding.xs,
    gap: SIZES.lg,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.padding.sm,
  },
  titleText: {
    ...FONTS.h4,
    color: COLORS.secondary,
  },
  viewAllText: {
    ...FONTS.body,
    color: COLORS.secondary,
    fontWeight: "600",
  },

  // ========== SWIPEABLE CARDS ==========
  swipeableContainer: {
    marginBottom: SIZES.md,
    paddingHorizontal: 0, // remove side padding
  },

  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0, // remove spacing
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
    borderRadius: SIZES.xs / 2,
    marginHorizontal: SIZES.xs / 2,
  },

  // ========== EMPTY STATE ==========
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.padding.lg,
  },
  emptyStateText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // ========== YOUTUBE SECTION ==========
  youtubeContainer: {
    marginTop: SIZES.xss,
    paddingHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.xl,
  },
  youtubeWrapper: {
    marginBottom: SIZES.md,
  },

  // ========== ITEM CARD ==========
  itemCardContainer: {
    marginRight: SIZES.sm,
  },

  // ========== LOADING STATES ==========
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.xxl,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    marginTop: SIZES.md,
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
