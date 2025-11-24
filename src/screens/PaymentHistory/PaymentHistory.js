import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const PaymentHistoryScreen = ({ navigation, route }) => {
  const { accountDetails, schemeName, productdata } = route.params || {};
  const [sortOrder, setSortOrder] = useState("desc");

  const schemeData = productdata || accountDetails || {};
  const paymentHistory = schemeData.paymentHistoryList || [];

  const schemeSummary = schemeData.schemeSummary || {};
  const personalInfo = schemeData.personalInfo || {};

  // Detect scheme type
  const schemeType = useMemo(() => {
    const name = schemeSummary.schemeName || "";
    const sName = schemeSummary.schemeSName || "";
    if (name.includes("DIGI SILVER") || sName === "BDS") return "DIGI_SILVER";
    if (name.includes("AMOUNT") || sName === "BAS") return "AMOUNT_SCHEME";
    if (name.includes("FIXED") || sName === "BFD") return "FIXED_DEPOSIT";
    return "OTHER";
  }, [schemeSummary]);

  // Summary stats
  const summary = useMemo(() => {
    const totalPaid = paymentHistory.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const totalWeight = paymentHistory.reduce(
      (sum, p) => sum + parseFloat(p.weight || 0),
      0
    );
    return {
      totalPaid,
      totalWeight,
      count: paymentHistory.length,
    };
  }, [paymentHistory]);

  // Date formatter
  const formatDateTime = (str) => {
    if (!str) return "N/A";
    const date = new Date(str.replace(" ", "T"));
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedPayments = [...paymentHistory].sort((a, b) => {
    const da = new Date(a.updateTime || a.date);
    const db = new Date(b.updateTime || b.date);
    return sortOrder === "desc" ? db - da : da - db;
  });


  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      activeOpacity={0.8}

    >
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.iconWrap}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="payment" size={SIZES.icon.md} color={COLORS.white} />
      </LinearGradient>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {schemeType === "DIGI_SILVER"
            ? "Silver Purchase"
            : `Installment ${item.installment || ""}`}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDateTime(item.updateTime)}
        </Text>
        {schemeType === "DIGI_SILVER" && parseFloat(item.weight) > 0 && (
          <Text style={styles.silverText}>
            {parseFloat(item.weight).toFixed(3)}g Silver
          </Text>
        )}
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountText}>
          ₹{parseFloat(item.amount || 0).toLocaleString("en-IN")}
        </Text>
        {item.receiptNo && (
          <Text style={styles.receiptText}>#{item.receiptNo}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent />

        <CommonHeader
          title="Payment History"
          showBack
          rightComponent={
            <TouchableOpacity
              onPress={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              style={styles.sortButton}
            >
              <Ionicons
                name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
                size={SIZES.icon.md}
                color={COLORS.white}
              />
            </TouchableOpacity>
          }
        />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.schemeIcon}>
              <MaterialIcons
                name={
                  schemeType === "DIGI_SILVER"
                    ? "inventory"
                    : schemeType === "AMOUNT_SCHEME"
                    ? "schedule"
                    : "account-balance"
                }
                size={SIZES.icon.md}
                color={COLORS.white}
              />
            </View>
            <View>
              <Text style={styles.customerName}>
                {personalInfo.pName || "Customer"}
              </Text>
              <Text style={styles.schemeName}>
                {schemeSummary.schemeName || "Scheme"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ₹{summary.totalPaid.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.statLabel}>Total Paid</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {summary.count}
              </Text>
              <Text style={styles.statLabel}>
                {"Payments"}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <FlatList
          data={sortedPayments}
          renderItem={renderItem}
          keyExtractor={(item, i) =>
            item.receiptNo || `payment-${i}-${item.installment}`
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={SIZES.icon.xxxl} color={COLORS.border} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Payment history will appear here
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  bg: { 
    flex: 1 
  },
  bgImage: { 
    opacity: 0.3 
  },
  sortButton: {
    padding: SIZES.padding.xs,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.sm,
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    margin: SIZES.padding.lg,
    ...SHADOWS.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.padding.md,
  },
  schemeIcon: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.md,
  },
  customerName: { 
    ...FONTS.h5, 
    color: COLORS.textPrimary, 
    fontWeight: FONTS.weight.semiBold 
  },
  schemeName: { 
    ...FONTS.caption, 
    color: COLORS.textSecondary 
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SIZES.padding.md,
  },
  stat: { 
    flex: 1, 
    alignItems: "center" 
  },
  statValue: {
    ...FONTS.h6,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
    marginBottom: SIZES.padding.xs,
  },
  statLabel: { 
    ...FONTS.caption, 
    color: COLORS.textSecondary 
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: COLORS.borderLight,
  },

  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  iconWrap: {
    width: SIZES.icon.xl,
    height: SIZES.icon.xl,
    borderRadius: SIZES.radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.md,
  },
  transactionInfo: { 
    flex: 1 
  },
  transactionTitle: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.semiBold,
  },
  transactionDate: { 
    ...FONTS.caption, 
    color: COLORS.textSecondary 
  },
  silverText: { 
    ...FONTS.caption, 
    color: COLORS.success, 
    marginTop: SIZES.padding.xs 
  },
  amountSection: { 
    alignItems: "flex-end" 
  },
  amountText: { 
    ...FONTS.body, 
    color: COLORS.primary, 
    fontWeight: FONTS.weight.bold 
  },
  receiptText: { 
    ...FONTS.caption, 
    color: COLORS.textSecondary 
  },

  listContent: {
    paddingBottom: SIZES.padding.lg,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xxxl,
  },
  emptyText: { 
    ...FONTS.h6, 
    color: COLORS.textSecondary, 
    marginTop: SIZES.padding.md 
  },
  emptySubtext: { 
    ...FONTS.caption, 
    color: COLORS.textTertiary 
  },
});

export default PaymentHistoryScreen;