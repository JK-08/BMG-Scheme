import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextDefault } from "../../components";
import theme from "../../utils/AppTheme";
import { checkAndSendDueSMS } from "../../utils/SMSHelper";
import { API_BASE_URL } from "../../Config/API";

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale } = theme;
const { width } = Dimensions.get("window");
const CARD_WIDTH = width;

function ProductCard({
  productData,
  navigation,
  onPress,
  onPayNow,
  remainingDate,
}) {
  const item = Array.isArray(productData) ? productData[0] : productData;
  const [revealed, setRevealed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  if (!item) return null;

  const {
    groupCode,
    regNo,
    joinDate,
    maturityDate,
    bonusAmount,
    nextDueDate,
    pName,
    schemeClosedSummary,
  } = item;

  const summary = item.schemeSummary || {};
  const trans = item.schemaSummaryTransBalance || {};
  const schemeType = summary.schemeType || {};
  
  // Check if scheme is closed
  const isSchemeClosed =
    schemeClosedSummary &&
    schemeClosedSummary.doClose !== "1900-01-01 00:00:00.0" &&
    schemeClosedSummary.billNo &&
    schemeClosedSummary.billNo.trim() !== "";

  const isAmountScheme = schemeType.isAmountScheme;
  const isDigitalScheme = schemeType.isDigitalScheme;
  const isFixedDeposit = schemeType.isFixedDeposit;

  const totalInstalments = parseInt(
    summary.Instalment || summary.instalment || 0
  );
  const insPaid = parseInt(trans.insPaid || 0);

  // PAY BUTTON CONDITION - Don't show if scheme is closed
  const today = new Date();
  const maturityDt = maturityDate ? new Date(maturityDate) : null;

  const showPayButton =
    !isSchemeClosed &&
    ((isAmountScheme &&
      insPaid < totalInstalments &&
      maturityDt &&
      today <= maturityDt) ||
      (isDigitalScheme && maturityDt && today <= maturityDt) ||
      (isFixedDeposit && insPaid < 1));

  const nextDue = nextDueDate
    ? new Date(nextDueDate).toLocaleDateString("en-GB").replace(/\//g, "-")
    : "--";

  const maturity = maturityDate
    ? new Date(maturityDate).toLocaleDateString("en-GB").replace(/\//g, "-")
    : "--";

  const amountReceived = parseInt(trans.amtrecd || 0);

  // Get closed date if scheme is closed
  const closedDate =
    isSchemeClosed &&
    schemeClosedSummary.closeDate &&
    schemeClosedSummary.closeDate !== "1900-01-01 00:00:00.0"
      ? new Date(schemeClosedSummary.closeDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "--";

  // -------------------------------
  // Send due SMS if within 7 days (only for active schemes)
  // -------------------------------
  useEffect(() => {
    if (!isSchemeClosed && item && isAmountScheme && item.personalInfo) {
      const userData = {
        name: item.personalInfo.pName || item.pName || "Customer",
        mobileNumber: item.personalInfo.mobile,
      };
      checkAndSendDueSMS(item, userData);
    }
  }, [item, isSchemeClosed]);

  useEffect(() => {
    if (revealed || remainingDate <= 0) return;

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [revealed, remainingDate]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
      style={styles.cardWrapper}
    >
      <LinearGradient
        // Change gradient for closed schemes
        colors={
          isSchemeClosed
            ? ["#6B7280", "#9CA3AF", "#6B7280"]
            : ["#FF5A1F", "#FF6A2E", "#FF5A1F"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        <View style={styles.circleLarge} />
        <View style={styles.circleMedium} />

        <TextDefault
          style={styles.schemeName}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {pName.toUpperCase()}
          {isSchemeClosed && " (Closed)"}
        </TextDefault>

        <View style={styles.schemeDetails}>
          <TextDefault style={styles.policyInfo}>
            {summary.schemeName}
          </TextDefault>
          <TextDefault style={styles.policyInfo}>
            {groupCode} – {regNo}
            {isSchemeClosed &&
              schemeClosedSummary.billNo &&
              ` • Bill: ${schemeClosedSummary.billNo}`}
          </TextDefault>
        </View>

        {showPayButton && (
          <TouchableOpacity
            style={[styles.payButton, SHADOWS.md]}
            onPress={() => onPayNow?.(item)}
          >
            <TextDefault style={styles.payButtonText}>Pay Now</TextDefault>
          </TouchableOpacity>
        )}

        {/* Show closed info instead of next due for closed schemes */}
        {isSchemeClosed ? (
          <View style={styles.nextDueContainer}>
            <TextDefault style={styles.nextDueLabel}>Closed Date</TextDefault>
            <TextDefault style={styles.nextDueValue}>{closedDate}</TextDefault>
            {schemeClosedSummary.closedBy && (
              <TextDefault style={styles.closedByText}>
                Closed by:{" "}
                {schemeClosedSummary.closedBy ||
                  schemeClosedSummary.empName ||
                  "Admin"}
              </TextDefault>
            )}
          </View>
        ) : (
          isAmountScheme &&
          nextDueDate != null &&
          nextDueDate !== "" && (
            <View style={styles.nextDueContainer}>
              <TextDefault style={styles.nextDueLabel}>
                Next Due Date
              </TextDefault>
              <TextDefault style={styles.nextDueValue}>{nextDue}</TextDefault>
            </View>
          )
        )}

        <View style={styles.amountRow}>
          <View style={[styles.infoBox, SHADOWS.sm]}>
            <TextDefault style={styles.infoLabel}>
              {isSchemeClosed ? "Final Amount" : "Total Amount"}
            </TextDefault>
            <TextDefault style={styles.infoValue}>
              ₹{amountReceived.toLocaleString("en-IN")}
            </TextDefault>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (remainingDate > 0) {
                // Small tap feedback
                Animated.sequence([
                  Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 80,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: true,
                  }),
                ]).start();
                return;
              }
              setRevealed(true);
            }}
          >
            <Animated.View
              style={[
                styles.infoBox,
                SHADOWS.sm,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {!revealed ? (
                <>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      {remainingDate > 0 && (
                        <Animated.View
                          style={{
                            position: "absolute",
                            transform: [{ scale: glowScale }],
                            opacity: glowOpacity,
                          }}
                        />
                      )}
                      <MaterialIcons
                        name="card-giftcard"
                        size={34}
                        color="#F59E0B"
                      />
                    </View>
                    <View
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      {/* <TextDefault style={styles.infoLabel}>Surprise Gift 🎁</TextDefault> */}
                      <TextDefault style={styles.infoSub}>
                        {remainingDate > 0
                          ? `Unlocks in ${remainingDate} days`
                          : "Tap to reveal"}
                      </TextDefault>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <MaterialIcons
                    name="redeem"
                    size={34}
                    color={COLORS.success}
                  />
                  <TextDefault style={styles.infoValue}>
                    ₹{parseInt(bonusAmount || 0).toLocaleString("en-IN")}
                  </TextDefault>
                  
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {schemeType.isDigitalScheme ? (
          <TextDefault style={styles.installmentText}>
            Installments – {insPaid}
          </TextDefault>
        ) : (
          <TextDefault style={styles.installmentText}>
            Installments – {insPaid}/{totalInstalments}
            {isSchemeClosed && " (Completed)"}
          </TextDefault>
        )}

        <View style={styles.maturityContainer1}>
          <View style={styles.maturityContainer}>
            <TextDefault style={styles.maturityLabel}>
              {isSchemeClosed ? "Original Maturity" : "Maturity Date"}
            </TextDefault>
            <TextDefault style={styles.maturityDate}>{maturity}</TextDefault>
          </View>

          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() =>
              navigation.navigate("ProductDescription", {
                productData: item,
                isSchemeClosed: isSchemeClosed,
              })
            }
          >
            <TextDefault style={styles.showMoreText}>Show More →</TextDefault>
          </TouchableOpacity>
        </View>
        <View style={styles.activeStateContainer}>
          <TextDefault
            style={[styles.statusLive, isSchemeClosed && styles.statusClosed]}
          >
            {isSchemeClosed ? "Closed" : "Active"}
          </TextDefault>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    alignSelf: "center",
    borderRadius: SIZES.radius.xl,
    overflow: "hidden",
    width: "100%",
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
  // Closed badge styles
  closedBadge: {
    position: "absolute",
    top: SIZES.padding.lg,
    right: SIZES.padding.lg,
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    zIndex: 1,
  },
  closedBadgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: "bold",
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
  statusClosed: {
    color: COLORS.error,
  },
  statusLive1: {
    color: COLORS.textPrimary,
    ...FONTS.h6,
    alignSelf: "center",
  },
  schemeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  schemeName: {
    ...FONTS.h3,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SIZES.margin.xs,
  },
  policyInfo: {
    ...FONTS.h5,
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
    textTransform: "capitalize",
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
  closedByText: {
    ...FONTS.caption,
    color: COLORS.whiteOpacity70,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.xss,
    marginBottom: SIZES.margin.xl,
  },
  infoBox: {
    width: (width - moderateScale(110)) / 2,
    height: moderateScale(80),
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
    marginBottom: SIZES.margin.xss,
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
  activeStateContainer: {
    position: "absolute",
    bottom: 8,
    right: 5,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.lg,
    alignSelf: "center",
    marginTop: SIZES.margin.xl,
  },
  infoSub: {
    ...(FONTS.caption + 1),
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    textAlign: "center",
  },
});

export default React.memo(ProductCard);
