// SchemeClosingHistoryScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator
} from "react-native";
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import theme from "../../utils/AppTheme";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";

const SchemeClosingHistoryScreen = ({ route, navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [silverRate] = useState(75.5); // Hardcoded silver rate
  const [loading] = useState(false); // No loading since data is hardcoded

  const SUPPORT_NUMBER = "+917094670946";
   const calculateSilverPurchased = (totalAmount, rate) => {
    if (!rate || rate === 0) return 0;
    return (totalAmount / rate).toFixed(2);
  };

  // Hardcoded completed/closed schemes data
  const closedSchemes = [
    {
      id: "1",
      name: "BMG SMARTPAY - Completed",
      schemeId: "BDS-7",
      type: "BMG SMARTPAY",
      startDate: "2024-01-15",
      endDate: "2024-12-15",
      closedDate: "2024-12-15",
      tenure: "11 months",
      totalInvestment: 10000,
      silverPurchased: calculateSilverPurchased(10000, 75.5),
      silverRateAtPurchase: 72.3,
      silverRateAtClosure: 75.5,
      currentValue: 11000,
      profit: 1000,
      roi: 10.0,
      status: "Completed",
      closureReason: "Scheme matured successfully",
      certificateUrl: "https://certificate.bmgjewellers.com/SCHEME-7",
      paymentStatus: "Paid",
      paymentDate: "2024-12-16",
      paymentMethod: "Bank Transfer",
      withdrawalType: "Silver Delivery",
    },
    {
      id: "2",
      name: "BMG GOLD SAVER - Completed",
      schemeId: "BGS-12",
      type: "BMG GOLD SAVER",
      startDate: "2023-06-01",
      endDate: "2024-05-01",
      closedDate: "2024-05-01",
      tenure: "11 months",
      totalInvestment: 25000,
      silverPurchased: calculateSilverPurchased(25000, 75.5),
      silverRateAtPurchase: 68.5,
      silverRateAtClosure: 74.2,
      currentValue: 28750,
      profit: 3750,
      roi: 15.0,
      status: "Completed",
      closureReason: "Scheme matured successfully",
      certificateUrl: "https://certificate.bmgjewellers.com/SCHEME-12",
      paymentStatus: "Paid",
      paymentDate: "2024-05-02",
      paymentMethod: "Bank Transfer",
      withdrawalType: "Bank Transfer",
    },
    {
      id: "3",
      name: "BMG SILVER PLUS - Completed",
      schemeId: "BSP-5",
      type: "BMG SILVER PLUS",
      startDate: "2024-03-10",
      endDate: "2025-02-10",
      closedDate: "2025-02-10",
      tenure: "11 months",
      totalInvestment: 15000,
      silverPurchased: calculateSilverPurchased(15000, 75.5),
      silverRateAtPurchase: 70.8,
      silverRateAtClosure: 75.5,
      currentValue: 17250,
      profit: 2250,
      roi: 15.0,
      status: "Completed",
      closureReason: "Scheme matured successfully",
      certificateUrl: "https://certificate.bmgjewellers.com/SCHEME-5",
      paymentStatus: "Paid",
      paymentDate: "2025-02-11",
      paymentMethod: "UPI",
      withdrawalType: "Silver Delivery",
    },
    {
      id: "4",
      name: "BMG SMART INVEST - Completed",
      schemeId: "BSI-9",
      type: "BMG SMART INVEST",
      startDate: "2023-09-20",
      endDate: "2024-08-20",
      closedDate: "2024-08-20",
      tenure: "11 months",
      totalInvestment: 50000,
      silverPurchased: calculateSilverPurchased(50000, 75.5),
      silverRateAtPurchase: 65.2,
      silverRateAtClosure: 73.8,
      currentValue: 60000,
      profit: 10000,
      roi: 20.0,
      status: "Completed",
      closureReason: "Scheme matured successfully",
      certificateUrl: "https://certificate.bmgjewellers.com/SCHEME-9",
      paymentStatus: "Paid",
      paymentDate: "2024-08-21",
      paymentMethod: "Bank Transfer",
      withdrawalType: "Bank Transfer",
    },
    {
      id: "5",
      name: "BMG SILVER SAVER - Completed",
      schemeId: "BSS-3",
      type: "BMG SILVER SAVER",
      startDate: "2024-02-05",
      endDate: "2025-01-05",
      closedDate: "2025-01-05",
      tenure: "11 months",
      totalInvestment: 30000,
      silverPurchased: calculateSilverPurchased(30000, 75.5),
      silverRateAtPurchase: 71.5,
      silverRateAtClosure: 75.5,
      currentValue: 34500,
      profit: 4500,
      roi: 15.0,
      status: "Completed",
      closureReason: "Scheme matured successfully",
      certificateUrl: "https://certificate.bmgjewellers.com/SCHEME-3",
      paymentStatus: "Paid",
      paymentDate: "2025-01-06",
      paymentMethod: "Bank Transfer",
      withdrawalType: "Silver Delivery",
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
     
    }, 1000);
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return theme.COLORS.success;
      case "Premature Closure":
        return theme.COLORS.warning;
      case "Pending":
        return theme.COLORS.info;
      default:
        return theme.COLORS.textSecondary;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return theme.COLORS.success;
      case "Pending":
        return theme.COLORS.warning;
      case "Failed":
        return theme.COLORS.error;
      default:
        return theme.COLORS.primary;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderClosedSchemeCard = (scheme) => (
    <TouchableOpacity
      key={`closed-${scheme.id}`}
      style={styles.schemeCard}
      activeOpacity={0.9}
      onPress={() => Alert.alert("Scheme Details", `${scheme.name}\nID: ${scheme.schemeId}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.schemeTitleRow}>
          <View style={styles.schemeNameContainer}>
            <Text style={styles.schemeName} numberOfLines={2}>
              {scheme.name}
            </Text>
            <Text style={styles.schemeId}>{scheme.schemeId}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(scheme.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(scheme.status) },
              ]}
            >
              {scheme.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>Investment</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(scheme.totalInvestment)}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>Silver Purchased</Text>
          <Text style={styles.detailValue}>{scheme.silverPurchased}g</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>Final Value</Text>
          <Text style={[styles.detailValue, styles.profitValue]}>
            {formatCurrency(scheme.currentValue)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>Profit</Text>
          <Text
            style={[
              styles.performanceValue,
              {
                color:
                  scheme.profit >= 0
                    ? theme.COLORS.success
                    : theme.COLORS.error,
              },
            ]}
          >
            {scheme.profit >= 0 ? "+" : ""}
            {formatCurrency(scheme.profit)}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>ROI</Text>
          <Text style={[styles.performanceValue, { color: theme.COLORS.success }]}>
            {scheme.roi}%
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailColumn}>
          <Text style={styles.detailLabel}>Payment</Text>
          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor:
                  getPaymentStatusColor(scheme.paymentStatus) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.paymentText,
                { color: getPaymentStatusColor(scheme.paymentStatus) },
              ]}
            >
              {scheme.paymentStatus}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        <View style={styles.timelineItem}>
          <MaterialIcons
            name="calendar-today"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <Text style={styles.timelineText}>
            Started: {formatDate(scheme.startDate)}
          </Text>
        </View>
        <View style={styles.timelineItem}>
          <MaterialIcons
            name="event"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <Text style={styles.timelineText}>
            Closed: {formatDate(scheme.closedDate)}
          </Text>
        </View>
        <View style={styles.timelineItem}>
          <MaterialIcons
            name="trending-up"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <Text style={styles.timelineText}>
            Silver Rate at Closure: ₹{scheme.silverRateAtClosure}/g
          </Text>
        </View>
      </View>

      <View style={styles.withdrawalContainer}>
        <View style={styles.withdrawalInfo}>
          <MaterialIcons
            name="payment"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <View style={styles.withdrawalTextContainer}>
            <Text style={styles.withdrawalLabel}>Withdrawal Method</Text>
            <Text style={styles.withdrawalMethod}>{scheme.withdrawalType}</Text>
          </View>
        </View>
        <View style={styles.withdrawalInfo}>
          <MaterialIcons
            name="date-range"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <View style={styles.withdrawalTextContainer}>
            <Text style={styles.withdrawalLabel}>Payment Date</Text>
            <Text style={styles.withdrawalMethod}>{formatDate(scheme.paymentDate)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSilverRateInfo = () => (
    <View style={styles.silverRateCard}>
      <View style={styles.silverRateHeader}>
        <MaterialIcons
          name="monetization-on"
          size={theme.SIZES.icon.lg}
          color={theme.COLORS.warning}
        />
        <View style={styles.silverRateInfo}>
          <Text style={styles.silverRateLabel}>Current Silver Rate</Text>
          <Text style={styles.silverRateValue}>₹{silverRate}/gram</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshRateButton}
          onPress={() => Alert.alert("Info", "Silver rate is displayed for reference only")}
        >
          <MaterialIcons
            name="info-outline"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.silverRateNote}>
        Note: Silver value calculated based on rate at scheme closure.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.COLORS.background}
        barStyle="dark-content"
      />

      <CommonHeader title="Scheme Closing History" />

      {renderSilverRateInfo()}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons
            name="inventory"
            size={theme.SIZES.icon.lg}
            color={theme.COLORS.primary}
            style={styles.statIcon}
          />
          <Text style={styles.statValue}>{closedSchemes.length}</Text>
          <Text style={styles.statLabel}>Closed Schemes</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons
            name="payments"
            size={theme.SIZES.icon.lg}
            color={theme.COLORS.primary}
            style={styles.statIcon}
          />
          <Text style={styles.statValue}>
            {formatCurrency(
              closedSchemes.reduce((sum, scheme) => sum + scheme.totalInvestment, 0)
            )}
          </Text>
          <Text style={styles.statLabel}>Total Invested</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons
            name="trending-up"
            size={theme.SIZES.icon.lg}
            color={theme.COLORS.success}
            style={styles.statIcon}
          />
          <Text style={[styles.statValue, { color: theme.COLORS.success }]}>
            {formatCurrency(
              closedSchemes.reduce((sum, scheme) => sum + scheme.profit, 0)
            )}
          </Text>
          <Text style={styles.statLabel}>Total Profit</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {closedSchemes.length > 0 ? (
          closedSchemes.map(renderClosedSchemeCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="inventory"
              size={theme.SIZES.icon.xxxl}
              color={theme.COLORS.gray400}
            />
            <Text style={styles.emptyStateTitle}>No Closed Schemes</Text>
            <Text style={styles.emptyStateText}>
              You don't have any completed schemes yet
            </Text>
          </View>
        )}

        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <MaterialIcons
              name="help"
              size={theme.SIZES.icon.lg}
              color={theme.COLORS.info}
            />
            <Text style={styles.helpTitle}>Need Help with Schemes?</Text>
          </View>
          <Text style={styles.helpText}>
            • View your completed scheme history{"\n"}
            • Check silver value at time of closure{"\n"}
            • Review profit earned from each scheme{"\n"}
            • Contact support for certificate queries
          </Text>
          <View style={styles.helpButtonsContainer}>
            <TouchableOpacity
              style={[styles.helpButton, styles.supportButton]}
              onPress={() => {
                Linking.openURL(`tel:${SUPPORT_NUMBER}`);
              }}
            >
              <MaterialIcons
                name="support-agent"
                size={theme.SIZES.icon.sm}
                color={theme.COLORS.white}
                style={styles.helpButtonIcon}
              />
              <Text style={styles.helpButtonText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.helpButton, styles.whatsappButton]}
              onPress={() => {
                const message = "Hello, I need help with my BMG scheme history.";
                Linking.openURL(`https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`);
              }}
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={theme.SIZES.icon.sm}
                color={theme.COLORS.white}
                style={styles.helpButtonIcon}
              />
              <Text style={styles.helpButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.noteContainer}>
          <MaterialIcons
            name="info"
            size={theme.SIZES.icon.sm}
            color={theme.COLORS.textSecondary}
          />
          <Text style={styles.noteText}>
            Note: This screen displays completed schemes only. All data is for demonstration purposes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same as your original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.SIZES.padding.sm,
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
  },
  silverRateCard: {
    backgroundColor: theme.COLORS.white,
    marginHorizontal: theme.SIZES.padding.md,
    marginTop: theme.SIZES.padding.sm,
    marginBottom: theme.SIZES.padding.sm,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    ...theme.SHADOWS.small,
  },
  silverRateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.SIZES.padding.sm,
  },
  silverRateInfo: {
    flex: 1,
    marginLeft: theme.SIZES.padding.sm,
  },
  silverRateLabel: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textSecondary,
  },
  silverRateValue: {
    fontSize: theme.SIZES.font.xl,
    fontWeight: "bold",
    color: theme.COLORS.warning,
  },
  refreshRateButton: {
    padding: theme.SIZES.padding.xs,
  },
  silverRateNote: {
    fontSize: theme.SIZES.font.xs,
    color: theme.COLORS.textSecondary,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.padding.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginHorizontal: theme.SIZES.padding.xs,
    alignItems: "center",
    ...theme.SHADOWS.small,
  },
  statIcon: {
    marginBottom: theme.SIZES.padding.xs,
  },
  statValue: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
  },
  statLabel: {
    fontSize: theme.SIZES.font.xs,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.padding.xs,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: theme.SIZES.padding.md,
  },
  schemeCard: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.padding.md,
    ...theme.SHADOWS.small,
  },
  cardHeader: {
    marginBottom: theme.SIZES.padding.md,
  },
  schemeTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  schemeNameContainer: {
    flex: 1,
    marginRight: theme.SIZES.padding.sm,
  },
  schemeName: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.padding.xs,
  },
  schemeId: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.SIZES.padding.sm,
    paddingVertical: theme.SIZES.padding.xs,
    borderRadius: theme.SIZES.radius.sm,
  },
  statusText: {
    fontSize: theme.SIZES.font.xs,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.SIZES.padding.md,
  },
  detailColumn: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: theme.SIZES.font.xs,
    color: theme.COLORS.textSecondary,
    marginBottom: theme.SIZES.padding.xs,
  },
  detailValue: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
  },
  profitValue: {
    color: theme.COLORS.success,
  },
  performanceValue: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "bold",
  },
  separator: {
    width: 1,
    height: "80%",
    backgroundColor: theme.COLORS.gray200,
  },
  paymentBadge: {
    paddingHorizontal: theme.SIZES.padding.sm,
    paddingVertical: theme.SIZES.padding.xs,
    borderRadius: theme.SIZES.radius.sm,
  },
  paymentText: {
    fontSize: theme.SIZES.font.xs,
    fontWeight: "bold",
  },
  timelineContainer: {
    marginBottom: theme.SIZES.padding.md,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.SIZES.padding.xs,
  },
  timelineText: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textSecondary,
    marginLeft: theme.SIZES.padding.sm,
  },
  withdrawalContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.gray200,
    paddingTop: theme.SIZES.padding.md,
  },
  withdrawalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.SIZES.padding.sm,
  },
  withdrawalTextContainer: {
    marginLeft: theme.SIZES.padding.sm,
    flex: 1,
  },
  withdrawalLabel: {
    fontSize: theme.SIZES.font.xs,
    color: theme.COLORS.textSecondary,
  },
  withdrawalMethod: {
    fontSize: theme.SIZES.font.sm,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.SIZES.padding.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
    marginTop: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.padding.xs,
  },
  emptyStateText: {
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: theme.SIZES.padding.xl,
  },
  helpCard: {
    backgroundColor: theme.COLORS.info + "10",
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.padding.md,
    borderWidth: 1,
    borderColor: theme.COLORS.info + "30",
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.SIZES.padding.md,
  },
  helpTitle: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.info,
    marginLeft: theme.SIZES.padding.sm,
  },
  helpText: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textSecondary,
    lineHeight: theme.SIZES.font.md * 1.5,
    marginBottom: theme.SIZES.padding.md,
  },
  helpButtonsContainer: {
    flexDirection: "row",
  },
  helpButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.SIZES.padding.sm,
    borderRadius: theme.SIZES.radius.md,
    marginHorizontal: theme.SIZES.padding.xs,
  },
  supportButton: {
    backgroundColor: theme.COLORS.primary,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  helpButtonIcon: {
    marginRight: theme.SIZES.padding.xs,
  },
  helpButtonText: {
    color: theme.COLORS.white,
    fontSize: theme.SIZES.font.sm,
    fontWeight: "bold",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.gray100,
    padding: theme.SIZES.padding.sm,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.padding.xl,
  },
  noteText: {
    flex: 1,
    fontSize: theme.SIZES.font.xs,
    color: theme.COLORS.textSecondary,
    marginLeft: theme.SIZES.padding.xs,
    fontStyle: "italic",
  },
});

export default SchemeClosingHistoryScreen;