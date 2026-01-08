// SchemeListPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPhoneDetails } from "../../services/SchemeDetailsService";
import { getRemainingDaysData } from "../../services/Remainingdays";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const SchemeListPage = ({ route, navigation }) => {
  const routePhoneNumber = route?.params?.phoneNumber || null;

  const [phoneNumber, setPhoneNumber] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [schemeApiData, setSchemeApiData] = useState({});
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Memoized formatCurrency function
  const formatCurrency = useCallback((amount) => {
    try {
      const num = Number(amount);
      if (isNaN(num)) return "₹0";

      return `₹${num.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } catch {
      return "₹0";
    }
  }, []);

  // Load phone number
  const loadPhoneNumber = useCallback(async () => {
    try {
      if (routePhoneNumber) {
        setPhoneNumber(routePhoneNumber);
        await AsyncStorage.setItem("PHONE_NUMBER", routePhoneNumber);
      } else {
        const storedPhone = await AsyncStorage.getItem("userPhoneNumber");
        if (storedPhone) {
          setPhoneNumber(storedPhone);
        } else {
          setError("No phone number found. Please login again.");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Phone load error:", err);
      setError("Failed to load phone number");
      setLoading(false);
    }
  }, [routePhoneNumber]);

  // Fetch API data for schemes
  const fetchApiDataForSchemes = useCallback(async (schemesData) => {
    const apiDataMap = {};

    const promises = schemesData.map(async (scheme) => {
      const schemeId = scheme.schemeSummary?.schemeId;
      const joinDate = scheme.joinDate
        ? new Date(scheme.joinDate).toISOString().split("T")[0]
        : null;

      if (schemeId && joinDate) {
        try {
          const apiData = await getRemainingDaysData(schemeId, joinDate);
          apiDataMap[`${schemeId}_${joinDate}`] = apiData;
        } catch (apiError) {
          console.warn(
            `Failed to fetch API data for scheme ${schemeId}:`,
            apiError
          );
          apiDataMap[`${schemeId}_${joinDate}`] = {
            remainingDays: scheme.remainingDays,
            allDays: [],
            totalDays: scheme.fulldays,
          };
        }
      }
    });

    await Promise.allSettled(promises);
    return apiDataMap;
  }, []);

  // Fetch schemes
  const fetchSchemes = useCallback(
    async (phone) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPhoneDetails(phone);

        if (data?.length > 0) {
          setSchemes(data);
          const apiData = await fetchApiDataForSchemes(data);
          setSchemeApiData(apiData);
        } else {
          setSchemes([]);
          setError("No schemes found for this phone number");
        }
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setError("Failed to load schemes. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchApiDataForSchemes]
  );

  // Handle redeem button press
  const handleRedeemPress = useCallback(
    (scheme, remainingBonusDays, displayAmount) => {
      setSelectedScheme({
        scheme,
        remainingBonusDays,
        displayAmount,
      });
      setModalVisible(true);
    },
    []
  );

  // Handle confirm redemption
  const handleConfirmRedeem = useCallback(() => {
    // Add your redemption logic here
    console.log("Confirming redemption for:", selectedScheme);

    // Close modal
    setModalVisible(false);

    // Show success message or navigate to success screen
    alert("Redemption request submitted successfully!");

    // Optionally refresh the schemes list
    if (phoneNumber) {
      fetchSchemes(phoneNumber);
    }
  }, [selectedScheme, phoneNumber, fetchSchemes]);

  // Effects
  useEffect(() => {
    loadPhoneNumber();
  }, [loadPhoneNumber]);

  useEffect(() => {
    if (phoneNumber) {
      fetchSchemes(phoneNumber);
    }
  }, [phoneNumber, fetchSchemes]);

  // Refresh
  const onRefresh = useCallback(() => {
    if (phoneNumber) {
      setRefreshing(true);
      fetchSchemes(phoneNumber);
    }
  }, [phoneNumber, fetchSchemes]);

  // Render scheme item with memoization
  const renderSchemeItem = useCallback(
    ({ item }) => {

        const schemeCloseDays = item.remainingDays ?? 0;
    


      // 2️⃣ Bonus unlock days (FROM BONUS API ONLY)
    
      const remainingSchemeDays = item.remainingDays ?? 0;

      // Get API data
      const joinDate = item.joinDate
        ? new Date(item.joinDate).toISOString().split("T")[0]
        : null;
      const schemeId = item.schemeSummary?.schemeId;
      const apiDataKey = `${schemeId}_${joinDate}`;
      const apiData = schemeApiData[apiDataKey];
  const bonusUnlockDays = schemeApiData[apiDataKey]?.remainingDays ?? null;
      const schemeName = item.schemeSummary?.schemeName || "N/A";
      console.log("Scheme Close Days:", schemeCloseDays);
console.log("Bonus Unlock Days:", bonusUnlockDays);

      // Calculate display values
      const remainingBonusDays = apiData?.remainingDays ?? remainingSchemeDays;
      const baseAmount = item.totalAmount || 0;
      const bonusAmount = item.totalAmountWithBonus || 0;
      const displayAmount = remainingBonusDays > 0 ? baseAmount : bonusAmount;
      const canRedeem = schemeCloseDays <= 0;

      // Status color based on remainingSchemeDays
      let statusColor = theme.COLORS.warning;
      if (remainingSchemeDays === 0) {
        statusColor = theme.COLORS.success;
      } else if (remainingSchemeDays < 0) {
        statusColor = theme.COLORS.error;
      }

      // Amount display logic
      const showGiftIcon = bonusUnlockDays !== null && bonusUnlockDays > 0;
      const isBonusUnlocked = bonusUnlockDays !== null && bonusUnlockDays <= 0;

      const amountTextColor = isBonusUnlocked
        ? theme.COLORS.success
        : theme.COLORS.textSecondary;

      // 1️⃣ Scheme close days (FOR REDEEM)
    

        

      return (
        <View style={styles.tableRow}>
          {/* Scheme Name */}
          <View style={styles.schemeNameContainer}>
            <Text style={styles.schemeName} numberOfLines={2}>
              {schemeName}
            </Text>
          </View>

          {/* Remaining Days */}
          <View style={styles.daysContainer}>
            <Text style={[styles.daysText, { color: statusColor }]}>
              {schemeCloseDays}
            </Text>
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.amountMainRow}>
              <Text style={[styles.amountText, { color: amountTextColor }]}>
                {formatCurrency(displayAmount)}
              </Text>
            </View>
            {showGiftIcon && <Text style={styles.giftIcon}>🎁</Text>}
            {showGiftIcon && (
              <Text style={styles.unlockText}>
                Unlock in {bonusUnlockDays} days
              </Text>
            )}

            {isBonusUnlocked && (
              <Text style={styles.bonusUnlockedText}>Bonus Unlocked!</Text>
            )}
          </View>

          {/* Redeem Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              disabled={!canRedeem}
              style={[
                styles.redeemButton,
                !canRedeem && styles.redeemButtonDisabled,
              ]}
              onPress={() =>
                handleRedeemPress(item, remainingBonusDays, displayAmount)
              }
            >
              <Text
                style={[
                  styles.redeemButtonText,
                  !canRedeem && styles.redeemButtonTextDisabled,
                ]}
              >
                Redeem
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [formatCurrency, schemeApiData, handleRedeemPress]
  );

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.headerCell, styles.schemeHeader]}>
        <Text style={styles.headerText}>Scheme</Text>
      </View>
      <View style={[styles.headerCell, styles.daysHeader]}>
        <Text style={styles.headerText}>Days</Text>
      </View>
      <View style={[styles.headerCell, styles.amountHeader]}>
        <Text style={styles.headerText}>Amount</Text>
      </View>
      <View style={[styles.headerCell, styles.actionHeader]}>
        <Text style={styles.headerText}>Action</Text>
      </View>
    </View>
  );

  // Render header
  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        <CommonHeader
          title="My Redemption"
          rightComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("GoldPlanScreen")}
              style={styles.plansButton}
            >
              <Text style={styles.plansButtonText}>Join Now</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }, [navigation]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>📋</Text>
        </View>
        <Text style={styles.emptyTitle}>
          {error ? "Error Loading Schemes" : "No Schemes Found"}
        </Text>
        <Text style={styles.emptyMessage}>
          {error ||
            "You don't have any schemes registered with this phone number."}
        </Text>
        {phoneNumber && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => fetchSchemes(phoneNumber)}
          >
            <Text style={styles.emptyButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [error, phoneNumber, fetchSchemes]);

  // Fixed key extractor with guaranteed uniqueness
  const keyExtractor = useCallback((item, index) => {
    // Create a composite key with multiple identifiers
    const schemeId = item.schemeSummary?.schemeId || `scheme_${index}`;
    const regNo = item.regNo || `reg_${index}`;
    const joinDate = item.joinDate
      ? new Date(item.joinDate).getTime()
      : Date.now();
    const uniqueId = `${schemeId}_${regNo}_${joinDate}_${index}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return uniqueId;
  }, []);

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.COLORS.primary}
          barStyle="light-content"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading schemes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.COLORS.primary}
        barStyle="light-content"
      />

      <FlatList
        data={schemes}
        renderItem={renderSchemeItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {schemes.length > 0 && renderTableHeader()}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.COLORS.primary]}
            tintColor={theme.COLORS.primary}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      />

      {/* Redemption Terms Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Redemption Terms & Conditions
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.schemeInfoContainer}>
                <Text style={styles.schemeInfoLabel}>Scheme:</Text>
                <Text style={styles.schemeInfoValue}>
                  {selectedScheme?.scheme?.schemeSummary?.schemeName || "N/A"}
                </Text>
              </View>

              <View style={styles.schemeInfoContainer}>
                <Text style={styles.schemeInfoLabel}>
                  Remaining Bonus Days:
                </Text>
                <Text style={styles.schemeInfoValue}>
                  {selectedScheme?.remainingBonusDays || 0} days
                </Text>
              </View>

              <View style={styles.schemeInfoContainer}>
                <Text style={styles.schemeInfoLabel}>Amount to Redeem:</Text>
                <Text style={[styles.schemeInfoValue, styles.amountValue]}>
                  {selectedScheme
                    ? formatCurrency(selectedScheme.displayAmount)
                    : "₹0"}
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>Please read carefully:</Text>
                <Text style={styles.redeemNoteText}>
                  • Reward money is applicable only for purchases of ₹10,000 and
                  above.{"\n\n"}• Redemption is subject to eligibility, validity
                  period, and the company's reward policy.{"\n\n"}• The company
                  reserves the right to modify or withdraw the reward scheme
                  without prior notice.{"\n\n"}• Amount can only be redeemed
                  when scheme reaches maturity date.{"\n\n"}• Processing may
                  take 24-48 hours.{"\n\n"}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.SIZES.md,
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: theme.SIZES.xl,
  },
  headerContainer: {
    paddingTop: theme.SIZES.md,
  },

  // Table Header
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.gray200,
    paddingVertical: theme.SIZES.md,
    paddingHorizontal: theme.SIZES.sm,
    marginHorizontal: theme.SIZES.xs,
    marginTop: theme.SIZES.lg,
    marginBottom: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.md,
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
  },
  schemeHeader: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: theme.SIZES.sm,
  },
  daysHeader: {
    flex: 0.8,
  },
  amountHeader: {
    flex: 1.2,
  },
  actionHeader: {
    flex: 1,
  },
  headerText: {
    fontSize: theme.SIZES.font.sm,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
  },

  // Table Row
  tableRow: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.white,
    marginHorizontal: theme.SIZES.xs,
    marginBottom: theme.SIZES.xs,
    paddingVertical: theme.SIZES.lg,
    paddingHorizontal: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    minHeight: 80,
    alignItems: "center",
  },

  // Scheme Column
  schemeNameContainer: {
    flex: 1,
    paddingLeft: theme.SIZES.sm,
    justifyContent: "center",
  },
  schemeName: {
    fontSize: theme.SIZES.font.sm,
    fontWeight: "500",
    color: theme.COLORS.textPrimary,
    lineHeight: 18,
  },

  // Days Column
  daysContainer: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  daysText: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "600",
  },

  // Amount Column
  amountSection: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  amountMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  amountText: {
    fontSize: theme.SIZES.font.sm,
    fontWeight: "600",
  },
  giftIcon: {
    fontSize: theme.SIZES.font.sm,
    marginLeft: 4,
  },
  unlockText: {
    fontSize: 10,
    color: theme.COLORS.warning,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  bonusUnlockedText: {
    fontSize: 10,
    color: theme.COLORS.success,
    fontWeight: "600",
    marginTop: 2,
  },

  // Action Column
  actionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  redeemButton: {
    backgroundColor: theme.COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: theme.SIZES.xs,
    borderRadius: theme.SIZES.radius.sm,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  redeemButtonDisabled: {
    backgroundColor: theme.COLORS.gray300,
  },
  redeemButtonText: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.white,
    fontWeight: "600",
    alignSelf: "center",
  },
  redeemButtonTextDisabled: {
    color: theme.COLORS.gray600,
  },

  // Plans Button
  plansButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FF5724",
    borderWidth: 1,
    borderColor: "transparent",
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  plansButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: theme.SIZES.font.sm,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.SIZES.xl,
    paddingTop: theme.SIZES.xxl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.SIZES.lg,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: theme.SIZES.font.lg,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.sm,
    fontWeight: "bold",
  },
  emptyMessage: {
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    marginBottom: theme.SIZES.xl,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: theme.COLORS.primary,
    paddingHorizontal: theme.SIZES.xl,
    paddingVertical: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
  },
  emptyButtonText: {
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.white,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.borderLight,
  },
  modalTitle: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: theme.COLORS.textSecondary,
    lineHeight: 28,
  },
  modalContent: {
    padding: theme.SIZES.lg,
  },
  schemeInfoContainer: {
    flexDirection: "row",
    marginBottom: theme.SIZES.md,
    alignItems: "center",
  },
  schemeInfoLabel: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "600",
    color: theme.COLORS.textPrimary,
    marginRight: theme.SIZES.sm,
  },
  schemeInfoValue: {
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
    flex: 1,
  },
  amountValue: {
    fontSize: theme.SIZES.font.lg,
    fontWeight: "bold",
    color: theme.COLORS.primary,
  },
  termsSection: {
    marginTop: theme.SIZES.lg,
  },
  termsTitle: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.md,
  },
  redeemNoteText: {
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textSecondary,
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: "row",
    padding: theme.SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.borderLight,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
    alignItems: "center",
    marginHorizontal: theme.SIZES.xs,
  },
  cancelButton: {
    backgroundColor: theme.COLORS.gray200,
  },
  cancelButtonText: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "600",
    color: theme.COLORS.textSecondary,
  },
  confirmButton: {
    backgroundColor: theme.COLORS.primary,
  },
  confirmButtonText: {
    fontSize: theme.SIZES.font.md,
    fontWeight: "600",
    color: theme.COLORS.white,
  },
});

export default SchemeListPage;
