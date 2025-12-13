import { StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "../../utils/AppTheme";

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SIZES.padding.sm,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerBtnContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },
  activeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 4,
  },
  inactiveText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Notification icon container
  notificationIconContainer: {
    position: "relative",
  },
  
  // Simple dot badge style
  dotBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: COLORS.error || "#FF3B30",
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: COLORS.white || "#FFFFFF",

  },
});

export default styles;