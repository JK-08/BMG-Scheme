import React, { useMemo, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextDefault } from "../../components";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS, moderateScale } = appTheme;

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.96;
const CARD_HEIGHT = CARD_WIDTH / 1.6;

/* ------------------ Small Reusable Stat Component ------------------ */
const StatBox = React.memo(({ label, value, isActive }) => {
  const textColor = isActive ? COLORS.textInverse : COLORS.textTertiary;

  return (
    <View style={styles.statBox}>
      <TextDefault style={[styles.statLabel, { color: textColor }]}>
        {label}
      </TextDefault>
      <TextDefault style={[styles.statValue, { color: textColor }]}>
        {value}
      </TextDefault>
    </View>
  );
});

/* ------------------ Date Formatter ------------------ */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

/* ------------------ Empty State ------------------ */
const EmptyProductCard = React.memo(() => (
  <View
    style={[styles.emptyContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
  >
    <MaterialIcons
      name="inbox"
      size={moderateScale(32)}
      color={COLORS.textTertiary}
    />
    <TextDefault style={styles.emptyText}>No product data</TextDefault>
  </View>
));

/* ------------------ Main Component ------------------ */
function ProductCard({ productData, navigation }) {
  const item = Array.isArray(productData) ? productData[0] : productData;
  if (!item) return <EmptyProductCard />;

  const { pname, regNo, groupCode, maturityDate, schemeSummary, status } = item;

  /* ------------------ Dynamic Scheme Logic ------------------ */
  const {
    isActive,
    isWeightScheme,
    isAmountScheme,
    isFixedDeposit,
    isInstallmentCompleted,
    statValue1,
    statLabel1,
    totalAmount,
    formattedMaturityDate,
    bonusEarned,
  } = useMemo(() => {
    const summary = schemeSummary || {};
    const trans = summary.schemaSummaryTransBalance || {};

    const isActive = status === "Active";

    // Backend flags
    const weightFlag =
      summary.WeightLedger === "Y" || summary.weightLedger === "Y";
    const fixedInsFlag = summary.FixedIns === "Y" || summary.fixedIns === "Y";

    // Meaningful names (no BMG)
    const isWeightScheme = weightFlag; // (Y, N)
    const isAmountScheme = !weightFlag && fixedInsFlag; // (N, Y)
    const isFixedDeposit = !weightFlag && !fixedInsFlag; // (N, N)

    // Installments
    const paid = parseInt(trans.insPaid) || 0;
    const total = parseInt(summary.Instalment || summary.instalment) || 0;
    const isInstallmentCompleted = paid >= total;

    // Bonus
    const bonusEarned = item.bonusAmount
      ? `₹ ${parseFloat(item.bonusAmount).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`
      : "₹ 0";

    // STAT BOX 1
    let statLabel1 = "";
    let statValue1 = "";

    if (isWeightScheme) {
      statLabel1 = "Weight Saved";
      statValue1 = `${summary.totalWeight || 0}g`;
    } else if (isAmountScheme) {
      statLabel1 = "Installments";
      statValue1 = `${paid}/${total}`;
    } else {
      statLabel1 = "Amount Saved";
      statValue1 = `₹${parseFloat(trans.amtrecd || 0).toLocaleString("en-IN")}`;
    }

    const totalAmount = `₹${parseFloat(trans.amtrecd || 0).toLocaleString(
      "en-IN"
    )}`;

    return {
      isActive,
      isWeightScheme,
      isAmountScheme,
      isFixedDeposit,
      isInstallmentCompleted,
      statValue1,
      statLabel1,
      totalAmount,
      formattedMaturityDate: formatDate(maturityDate),
      bonusEarned,
    };
  }, [schemeSummary, status, maturityDate, item]);

  /* ------------------ Navigation ------------------ */
  const handleViewDetails = useCallback(() => {
    navigation.navigate("ProductDescription", { productData: item });
  }, [navigation, item]);

  const handlePayNow = useCallback(() => {
    navigation.navigate("Buy", { productData: item });
  }, [navigation, item]);

  /* ------------------ Pay Now Button Visibility ------------------ */
  const shouldShowPayNow = useMemo(
    () =>
      isActive &&
      !isFixedDeposit &&
      !(isAmountScheme && isInstallmentCompleted),
    [isActive, isFixedDeposit, isAmountScheme, isInstallmentCompleted]
  );

  /* ------------------ Gradient ------------------ */
  const gradientColors = isActive
    ? COLORS.gradient.brand1
    : [COLORS.textDisabled, COLORS.textTertiary];

  /* ------------------ UI ------------------ */
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleViewDetails}
      style={[styles.cardContainer, !isActive && styles.inactiveCard]}
    >
      <LinearGradient colors={gradientColors} style={styles.gradientBackground}>
        {/* -------- Header -------- */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerText}>
              <TextDefault style={styles.schemeCode}>
                {groupCode} - {regNo}
              </TextDefault>
              <TextDefault style={styles.schemeName}>
                {pname || "Customer"}
              </TextDefault>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TextDefault style={styles.schemeTitle}>
              {schemeSummary?.schemeName || pname}
            </TextDefault>
            <View style={styles.statusContainer}>
              <TextDefault style={styles.statusLabel}>Status: </TextDefault>
              <TextDefault style={styles.statusValue}>{status}</TextDefault>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? COLORS.success : COLORS.error },
                ]}
              />
            </View>
          </View>
        </View>

        {/* -------- Stats Section -------- */}
        <View style={styles.statsContainer}>
          <StatBox label={statLabel1} value={statValue1} isActive={isActive} />
          <View style={styles.statDivider} />
          <StatBox
            label={isWeightScheme ? "Silver Value" : "Total Amount"}
            value={totalAmount}
            isActive={isActive}
          />
          <View style={styles.statDivider} />
          <StatBox
            label="Bonus Earned"
            value={bonusEarned}
            isActive={isActive}
          />
        </View>

        <LinearGradient
          colors={["#FFD700", "#FFB700", "#FFD700"]}
          style={styles.goldDivider}
        />

        {/* -------- Bottom Section -------- */}
        <View style={styles.bottomRow}>
          {/* Left Gold Circle */}
          <ImageBackground
            source={require("../../assets/gold.png")}
            style={styles.circle}
          >
            <TextDefault style={styles.circleLabel}>
              {isWeightScheme ? "Weight" : "Amount"}
            </TextDefault>
            <TextDefault style={styles.circleValue}>
              {isWeightScheme ? statValue1 : totalAmount}
            </TextDefault>
          </ImageBackground>

          {/* Maturity */}
          <View style={styles.maturitySection}>
            <TextDefault style={styles.maturityLabel}>Maturity</TextDefault>
            <View style={styles.maturityRow}>
              <MaterialIcons name="event" size={14} color={COLORS.white} />
              <TextDefault style={styles.maturityValue}>
                {formattedMaturityDate}
              </TextDefault>
            </View>
          </View>

          {/* Pay / View Button */}
          <TouchableOpacity
            onPress={shouldShowPayNow ? handlePayNow : handleViewDetails}
            style={styles.actionButton}
          >
            <TextDefault style={styles.actionText}>
              {shouldShowPayNow ? "Pay" : "View"}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: SIZES.radius.lg,
    overflow: "hidden",
    alignSelf: "center",
  },
  inactiveCard: { opacity: 0.85 },

  gradientBackground: {
    flex: 1,
    padding: SIZES.sm,
    justifyContent: "space-between",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headerLeft: { flexDirection: "row", flex: 1 },
  headerText: { flex: 1 },

  schemeCode: { ...FONTS.body, color: COLORS.white, fontWeight: "600" },
  schemeName: { ...FONTS.caption, color: COLORS.white, opacity: 0.9 },
  headerRight: { alignItems: "flex-end" },

  schemeTitle: { ...FONTS.body, color: COLORS.white, fontWeight: "600" },

  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusLabel: { ...FONTS.caption, color: COLORS.white, opacity: 0.8 },
  statusValue: { ...FONTS.caption, color: COLORS.white },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SIZES.xs,
  },

  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },

  statLabel: { ...FONTS.caption, fontSize: SIZES.font.xs },
  statValue: { ...FONTS.bodySmall, fontWeight: "600" },

  goldDivider: { width: "100%", height: 1.2, marginVertical: SIZES.xs },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  circle: {
    width: moderateScale(80),
    height: moderateScale(80),
    justifyContent: "center",
    alignItems: "center",
  },

  circleLabel: { ...FONTS.caption, color: COLORS.textPrimary },
  circleValue: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: "700" },

  maturitySection: { alignItems: "center", flex: 1 },
  maturityLabel: { ...FONTS.caption, color: COLORS.white },
  maturityRow: { flexDirection: "row", alignItems: "center" },

  maturityValue: { ...FONTS.body, color: COLORS.white, marginLeft: 4 },

  actionButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius.md,
  },

  actionText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  emptyText: { ...FONTS.caption, color: COLORS.textTertiary },
});

export default React.memo(ProductCard);
