// PaymentHistoryScreen.js - Main History Screen
import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
} from "react-native";
import { COLORS, SIZES, FONTS, moderateScale } from "../../utils/Theme";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { Ionicons } from "@expo/vector-icons";
import { verticalScale } from "../../utils";

const PaymentHistoryScreen = ({ navigation, route }) => {
  const { accountDetails, schemeName, productdata } = route.params;

  console.log("Payment History Screen Data:", {
    accountDetails,
    schemeName,
    productdata
  });

  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Get payment history from productdata (new API structure)
  const paymentHistory = productdata?.paymentHistoryList || accountDetails?.paymentHistoryList || [];

  // Format date and time
  const formatDateTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      // Handle both date formats: "2025-10-11 10:52:00.0" and ISO format
      const dateString = dateTimeString.includes(' ') 
        ? dateTimeString.replace(' ', 'T').replace(/\.\d+$/, '')
        : dateTimeString;
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  }, []);

  // Format date only
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Calculate summary statistics using useMemo for better performance
  const summaryStats = useMemo(() => {
    const totalAmountPaid = paymentHistory.reduce((total, payment) => {
      return total + parseFloat(payment.amount || 0);
    }, 0);

    const lastPaymentDate = paymentHistory.length > 0
      ? paymentHistory[paymentHistory.length - 1].updateTime
      : null;

    const averagePaymentAmount = paymentHistory.length > 0 
      ? totalAmountPaid / paymentHistory.length 
      : 0;

    // For silver schemes, calculate total silver weight
    const totalSilverWeight = paymentHistory.reduce((total, payment) => {
      return total + parseFloat(payment.weight || 0);
    }, 0);

    return {
      totalAmountPaid,
      lastPaymentDate,
      averagePaymentAmount,
      totalSilverWeight
    };
  }, [paymentHistory]);

  // Determine scheme type for display
  const schemeType = useMemo(() => {
    const schemeData = productdata || accountDetails;
    const schemeName = schemeData?.schemeSummary?.schemeName?.trim();
    const schemeSName = schemeData?.schemeSummary?.schemeSName?.trim();
    
    if (schemeName === "BMG AMOUNT SCHEME" || schemeSName === "BAS") {
      return "AMOUNT_SCHEME";
    } else if (schemeName === "BMG DIGI SILVER" || schemeSName === "BDS") {
      return "DIGI_SILVER";
    } else if (schemeName === "BMG FIXED DEPOSIT" || schemeSName === "BFD") {
      return "FIXED_DEPOSIT";
    } else {
      return "OTHER";
    }
  }, [productdata, accountDetails]);

  // Sort payment history
  const sortedHistory = [...paymentHistory].sort((a, b) => {
    const dateA = new Date(a.updateTime || a.date);
    const dateB = new Date(b.updateTime || b.date);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Filter payment history
  const filteredHistory = sortedHistory.filter((item) => {
    if (selectedFilter === "all") return true;
    const status = item.status?.toLowerCase() || "paid";
    return selectedFilter === status;
  });

  // Handle payment item press - Navigate to details screen
  const handlePaymentPress = (item) => {
    navigation.navigate("PaymentDetailScreen", {
      payment: item,
      accountDetails: productdata || accountDetails,
      schemeName: schemeName || productdata?.schemeSummary?.schemeName,
      productdata: productdata,
      schemeType: schemeType
    });

    console.log("Navigated to Payment Details:", {
      payment: item,
      schemeType: schemeType
    });
  };

  // Render payment history item
  const renderPaymentHistory = useCallback(
    ({ item, index }) => {
      const isLastItem = index === filteredHistory.length - 1;
      const status = item.status?.toLowerCase() || "paid";
      const isPaid = status === "paid";
      const isSilverScheme = schemeType === "DIGI_SILVER";
      const hasSilverWeight = isSilverScheme && parseFloat(item.weight) > 0;

      return (
        <TouchableOpacity
          style={[styles.transactionCard, isLastItem && styles.lastCard]}
          activeOpacity={0.7}
          onPress={() => handlePaymentPress(item)}
        >
          <View style={styles.transactionIconContainer}>
            <LinearGradient
              colors={
                isPaid ? COLORS.gradientPrimary : [COLORS.warning, "#FFB300"]
              }
              style={styles.transactionIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons
                name={isPaid ? "check-circle" : "schedule"}
                size={22}
                color={COLORS.white}
              />
            </LinearGradient>
          </View>

          <View style={styles.transactionContent}>
            <Text style={styles.transactionInstallment}>
              {schemeType === "AMOUNT_SCHEME" 
                ? `Installment ${item.installment}`
                : schemeType === "DIGI_SILVER"
                ? "Silver Purchase"
                : "Payment"}
            </Text>

            <Text style={styles.transactionDate}>
              {formatDateTime(item.updateTime)}
            </Text>

            {item.receiptNo && (
              <View style={styles.receiptContainer}>
                <MaterialIcons
                  name="receipt-long"
                  size={12}
                  color={COLORS.textLight}
                />
                <Text style={styles.receiptNo}>Receipt: {item.receiptNo}</Text>
              </View>
            )}

            {/* Show silver weight for DIGI_SILVER schemes */}
            {hasSilverWeight && (
              <View style={styles.silverWeightContainer}>
                <MaterialIcons
                  name="scale"
                  size={12}
                  color={COLORS.success}
                />
                <Text style={styles.silverWeightText}>
                  {parseFloat(item.weight).toFixed(3)}g Silver
                </Text>
              </View>
            )}
          </View>

          <View style={styles.transactionRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isPaid ? COLORS.success : COLORS.warning },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isPaid ? "Paid" : "Pending"}
              </Text>
            </View>

            <Text style={styles.transactionAmount}>
              ₹{parseFloat(item.amount).toLocaleString('en-IN')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [formatDateTime, filteredHistory.length, schemeType]
  );

  // Render filter chip
  const FilterChip = ({ label, value, count }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === value && styles.filterChipActive,
      ]}
      onPress={() => setSelectedFilter(value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedFilter === value && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.filterChipBadge,
            selectedFilter === value && styles.filterChipBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipBadgeText,
              selectedFilter === value && styles.filterChipBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const paidCount = paymentHistory.filter(
      (p) => (p.status?.toLowerCase() || "paid") === "paid"
    ).length;
    const pendingCount = paymentHistory.filter(
      (p) => (p.status?.toLowerCase() || "paid") === "pending"
    ).length;

    return { paidCount, pendingCount };
  }, [paymentHistory]);

  // Get scheme display name
  const getSchemeDisplayName = () => {
    const schemeData = productdata || accountDetails;
    return schemeName || 
           schemeData?.schemeSummary?.schemeName || 
           "BMG Scheme";
  };

  // Get customer name
  const getCustomerName = () => {
    const schemeData = productdata || accountDetails;
    return schemeData?.personalInfo?.pName || 
           schemeData?.pname || 
           "Customer";
  };

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.mainBackground}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* CommonHeader Component */}
        <CommonHeader
          title="Payment History"
          showBack={true}
          backIconName="arrow-back"
          backIconColor={COLORS.white}
          backgroundColor="transparent"
          textColor={COLORS.black}
          transparent={true}
          centerTitle={true}
          rightComponent={
            <TouchableOpacity
              onPress={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              activeOpacity={0.7}
              style={styles.sortButtonWrapper}
            >
              <Ionicons
                name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
                size={22}
                color={COLORS.white}
              />
              {/* <Text style={styles.sortButtonText}>
                {sortOrder === "desc" ? "Latest" : "Oldest"}
              </Text> */}
            </TouchableOpacity>
          }
        />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollContent}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIconWrapper}>
                  <MaterialIcons
                    name={
                      schemeType === "DIGI_SILVER" ? "attach-money" : 
                      schemeType === "AMOUNT_SCHEME" ? "schedule" :
                      schemeType === "FIXED_DEPOSIT" ? "account-balance" : "stars"
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.schemeInfo}>
                  <Text style={styles.schemeName} numberOfLines={1}>
                    {getCustomerName()}
                  </Text>
                  <Text style={styles.schemeType} numberOfLines={1}>
                    {getSchemeDisplayName()} • {productdata?.groupCode || accountDetails?.groupCode}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <View style={styles.statIconContainer}>
                    <MaterialIcons
                      name="payments"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.summaryStatContent}>
                    <Text style={styles.summaryStatLabel}>Total Paid</Text>
                    <Text style={styles.summaryStatValue}>
                      ₹ {summaryStats.totalAmountPaid.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryStatItem}>
                  <View style={styles.statIconContainer}>
                    <MaterialIcons
                      name="event"
                      size={20}
                      color={COLORS.secondary}
                    />
                  </View>
                  <View style={styles.summaryStatContent}>
                    <Text style={styles.summaryStatLabel}>Last Payment</Text>
                    <Text style={styles.summaryStatValue}>
                      {formatDate(summaryStats.lastPaymentDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryStatItem}>
                  <View style={styles.statIconContainer}>
                    <MaterialIcons
                      name={schemeType === "DIGI_SILVER" ? "scale" : "trending-up"}
                      size={20}
                      color={COLORS.success}
                    />
                  </View>
                  <View style={styles.summaryStatContent}>
                    <Text style={styles.summaryStatLabel}>
                      {schemeType === "DIGI_SILVER" ? "Total Silver" : "Avg Payment"}
                    </Text>
                    <Text style={styles.summaryStatValue}>
                      {schemeType === "DIGI_SILVER" 
                        ? `${summaryStats.totalSilverWeight.toFixed(3)}g`
                        : `₹ ${summaryStats.averagePaymentAmount.toFixed(0)}`
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Filter Chips */}
            {/* <View style={styles.filterContainer}>
              <FilterChip
                label="All"
                value="all"
                count={paymentHistory.length}
              />
              <FilterChip label="Paid" value="paid" count={filterCounts.paidCount} /> */}
              {/* <FilterChip
                label="Pending"
                value="pending"
                count={filterCounts.pendingCount}
              /> */}
            {/* </View> */}

            {/* Payment List */}
            <View style={styles.historySection}>
              <View style={styles.historySectionHeader}>
                <Text style={styles.historyTitle}>Transaction Details</Text>
                <Text style={styles.historyCount}>
                  {filteredHistory.length}{" "}
                  {filteredHistory.length === 1
                    ? "transaction"
                    : "transactions"}
                </Text>
              </View>

              {filteredHistory.length > 0 ? (
                <FlatList
                  data={filteredHistory}
                  renderItem={renderPaymentHistory}
                  keyExtractor={(item, index) =>
                    item.receiptNo || `payment-${item.installment}-${index}`
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialIcons
                      name="inbox"
                      size={48}
                      color={COLORS.borderColor}
                    />
                  </View>
                  <Text style={styles.emptyStateText}>
                    No {selectedFilter !== "all" ? selectedFilter : ""}{" "}
                    transactions
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {selectedFilter !== "all"
                      ? `No ${selectedFilter} payments found`
                      : "Your payment history will appear here"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  sortButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary,
    gap: moderateScale(4),
  },
  sortButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(24),
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(20),
    marginBottom: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(18),
    gap: moderateScale(12),
  },
  summaryIconWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    ...FONTS.heading,
    color: COLORS.title,
    fontSize: SIZES.h6,
    marginBottom: moderateScale(2),
  },
  schemeType: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    fontSize: SIZES.fontSm,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: "center",
    gap: moderateScale(10),
  },
  statIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryStatContent: {
    alignItems: "center",
  },
  summaryStatLabel: {
    color: COLORS.textLight,
    marginBottom: moderateScale(4),
    fontSize: SIZES.h6 - 3,
    ...FONTS.body1,
    textAlign: 'center',
  },
  summaryStatValue: {
    fontSize: SIZES.h6 - 3,
    ...FONTS.body1,
    color: COLORS.title,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
    marginHorizontal: moderateScale(8),
  },
  filterContainer: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginBottom: moderateScale(16),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    gap: moderateScale(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  filterChipText: {
    ...FONTS.body1,
    color: COLORS.text,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  filterChipBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(12),
    minWidth: moderateScale(24),
    alignItems: "center",
  },
  filterChipBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterChipBadgeText: {
    ...FONTS.fontXs,
    color: COLORS.text,
    fontWeight: "700",
  },
  filterChipBadgeTextActive: {
    color: COLORS.white,
  },
  historySection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginBottom: moderateScale(20),
  },
  historySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  historyTitle: {
    ...FONTS.h6,
    color: COLORS.title,
    fontWeight: "700",
  },
  historyCount: {
    ...FONTS.body1,
    color: COLORS.textLight,
    backgroundColor: COLORS.surface,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(14),
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: moderateScale(10),
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: moderateScale(16),
    borderRadius: SIZES.radius,
    marginBottom: moderateScale(12),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 0,
  },
  transactionIconContainer: {
    marginRight: moderateScale(14),
  },
  transactionIconGradient: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(14),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  transactionContent: {
    flex: 1,
  },
  transactionInstallment: {
    ...FONTS.body1,
    color: COLORS.title,
    fontSize: moderateScale(15),
    marginBottom: moderateScale(6),
    fontWeight: '600',
  },
  transactionDate: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    marginBottom: moderateScale(6),
    lineHeight: moderateScale(16),
  },
  receiptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    marginTop: moderateScale(2),
  },
  receiptNo: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    fontSize: moderateScale(12),
  },
  silverWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    marginTop: moderateScale(4),
  },
  silverWeightText: {
    ...FONTS.subheading,
    color: COLORS.success,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  statusBadgeText: {
    ...FONTS.heading,
    color: COLORS.white,
    letterSpacing: 0.5,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  transactionAmount: {
    ...FONTS.h6,
    fontWeight: "800",
    color: COLORS.primary,
    marginRight: verticalScale(4),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: moderateScale(60),
  },
  emptyIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  emptyStateText: {
    ...FONTS.font,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: moderateScale(6),
  },
  emptyStateSubtext: {
    ...FONTS.fontSm,
    color: COLORS.textLight,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default PaymentHistoryScreen;