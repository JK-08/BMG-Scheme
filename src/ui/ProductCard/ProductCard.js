import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextDefault } from "../../components";
import theme from "../../utils/AppTheme";
import { checkAndSendDueSMS } from "../../utils/SMSHelper";

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale } = theme;
const { width } = Dimensions.get("window");
const CARD_WIDTH = width;

function ProductCard({ productData, navigation, onPress, onPayNow }) {
  const item = Array.isArray(productData) ? productData[0] : productData;
  if (!item) return null;

  const { groupCode, regNo, joinDate, maturityDate, bonusAmount, nextDueDate,pName } =
    item;
  const summary = item.schemeSummary || {};
  const trans = item.schemaSummaryTransBalance || {};
  const schemeType = summary.schemeType || {};

  const isAmountScheme = schemeType.isAmountScheme;
  const isDigitalScheme = schemeType.isDigitalScheme;
  const isFixedDeposit = schemeType.isFixedDeposit;

  const totalInstalments = parseInt(
    summary.Instalment || summary.instalment || 0
  );
  const insPaid = parseInt(trans.insPaid || 0);

  // PAY BUTTON CONDITION
  const showPayButton =
    ((isAmountScheme || isDigitalScheme) && insPaid < totalInstalments) ||
    (isFixedDeposit && insPaid < 1);

  const nextDue = nextDueDate
    ? new Date(nextDueDate).toLocaleDateString("en-GB").replace(/\//g, "-")
    : "--";

  const maturity = maturityDate
    ? new Date(maturityDate).toLocaleDateString("en-GB").replace(/\//g, "-")
    : "--";

  const amountReceived = parseInt(trans.amtrecd || 0);

  // -------------------------------
  // Send due SMS if within 7 days
  // -------------------------------
  useEffect(() => {
    if (item && isAmountScheme && item.personalInfo) {
      const userData = {
        name: item.personalInfo.pName || item.pName || "Customer",
        mobileNumber: item.personalInfo.mobile,
      };
      checkAndSendDueSMS(item, userData);
    }
  }, [item]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={["#FF5A1F", "#FF6A2E", "#FF5A1F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        <View style={styles.circleLarge} />
        <View style={styles.circleMedium} />

        <View style={styles.topStatusBar}>
          <TextDefault style={styles.statusText}>
            <TextDefault style={styles.statusLive}>{pName}</TextDefault>
          </TextDefault>
        </View>

        <TextDefault style={styles.schemeName}>
          {summary.schemeName}
        </TextDefault>

        <TextDefault style={styles.policyInfo}>
          {groupCode} – {regNo}
        </TextDefault>

        {showPayButton && (
          <TouchableOpacity
            style={[styles.payButton, SHADOWS.md]}
            onPress={() => onPayNow?.(item)}
          >
            <TextDefault style={styles.payButtonText}>PAY</TextDefault>
          </TouchableOpacity>
        )}

        {isAmountScheme && (
          <View style={styles.nextDueContainer}>
            <TextDefault style={styles.nextDueLabel}>Next Due Date</TextDefault>
            <TextDefault style={styles.nextDueValue}>{nextDue}</TextDefault>
          </View>
        )}

        <View style={styles.amountRow}>
          <View style={[styles.infoBox, SHADOWS.sm]}>
            <TextDefault style={styles.infoLabel}>Total Amount</TextDefault>
            <TextDefault style={styles.infoValue}>
              ₹{amountReceived.toLocaleString("en-IN")}
            </TextDefault>
          </View>

          <View style={[styles.infoBox, SHADOWS.sm]}>
            <TextDefault style={styles.infoLabel}>Benefits</TextDefault>
            <TextDefault style={styles.infoValue}>
              ₹{parseInt(bonusAmount || 0).toLocaleString("en-IN")}
            </TextDefault>
          </View>
        </View>
        {schemeType.isDigitalScheme ? (
          <TextDefault style={styles.installmentText}>
            Installments – {insPaid}
          </TextDefault>
        ) : (
          <TextDefault style={styles.installmentText}>
            Installments – {insPaid}/{totalInstalments}
          </TextDefault>
        )}

        <View style={styles.maturityContainer1}>
          <View style={styles.maturityContainer}>
            <TextDefault style={styles.maturityLabel}>
              Maturity Date
            </TextDefault>
            <TextDefault style={styles.maturityDate}>{maturity}</TextDefault>
          </View>

          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() =>
              navigation.navigate("ProductDescription", { productData: item })
            }
          >
            <TextDefault style={styles.showMoreText}>Show More →</TextDefault>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* --- ALL YOUR ORIGINAL STYLES BELOW (UNCHANGED) --- */
  cardWrapper: {
    width: CARD_WIDTH,
    alignSelf: "center",
    marginVertical: SIZES.margin.md,
    borderRadius: SIZES.radius.xl,
    overflow: "hidden",
    ...SHADOWS.lg,
    width: "100%",
    marginVertical: SIZES.margin.xs,
    // minHeight: moderateScale(500),
  },
  cardContainer: {
    paddingVertical: SIZES.padding.xl,
    paddingHorizontal: SIZES.padding.xl,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    height: moderateScale(500),
  },
  circleLarge: {
    position: "absolute",
    width: moderateScale(350),
    height: moderateScale(350),
    borderRadius: moderateScale(175),
    backgroundColor: COLORS.whiteOpacity10,
    top: moderateScale(-100),
    left: moderateScale(-60),
  },
  circleMedium: {
    position: "absolute",
    width: moderateScale(280),
    height: moderateScale(280),
    borderRadius: moderateScale(140),
    backgroundColor: COLORS.whiteOpacity20,
    bottom: moderateScale(-50),
    right: moderateScale(-40),
  },
  topStatusBar: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.lg,
    // width: "60%",
  },
  statusText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  statusLive: {
    color: COLORS.success,
    fontFamily: FONTS.family.semiBold,
    alignSelf: "center",
  },
  schemeName: {
    ...FONTS.h3,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SIZES.margin.xs,
  },
  policyInfo: {
    ...FONTS.bodyLarge,
    color: COLORS.white,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: SIZES.margin.xl,
  },
  payButton: {
    alignSelf: "center",
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xxl,
    borderRadius: SIZES.radius.xl,
    marginBottom: SIZES.margin.xl,
  },
  payButtonText: {
    ...FONTS.button,
    fontSize: SIZES.font.xxl,
  },
  nextDueContainer: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  nextDueLabel: {
    ...FONTS.body,
    color: COLORS.whiteOpacity50,
  },
  nextDueValue: {
    ...FONTS.h5,
    color: COLORS.white,
    marginTop: SIZES.margin.xs,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.xss,
    marginBottom: SIZES.margin.xl,
  },
  infoBox: {
    width: (width - moderateScale(110)) / 2, // perfect responsive width
    height: moderateScale(80), // fixed height
    backgroundColor: COLORS.white,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZES.margin.sm,
  },

  infoLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoValue: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginTop: SIZES.margin.xs,
  },
  installmentText: {
    ...FONTS.bodyLarge,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
  },
  maturityContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  maturityContainer: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  maturityLabel: {
    ...FONTS.body,
    color: COLORS.whiteOpacity50,
  },
  maturityDate: {
    ...FONTS.h5,
    color: COLORS.white,
    marginTop: SIZES.margin.xs,
  },
  showMoreButton: {
    alignSelf: "center",
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.lg,
  },
  showMoreText: {
    ...FONTS.button,
    fontSize: SIZES.font.lg,
  },
});

export default React.memo(ProductCard);
