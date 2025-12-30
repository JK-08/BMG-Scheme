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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPhoneDetails } from "../../services/SchemeDetailsService";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const SchemeListPage = ({ route, navigation }) => {
  const routePhoneNumber = route?.params?.phoneNumber || null;

  const [phoneNumber, setPhoneNumber] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* ----------------------------------
     Load phone number (route / storage)
  -----------------------------------*/
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

  /* -----------------------------
     Fetch schemes
  ------------------------------*/
  const fetchSchemes = useCallback(async (phone) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPhoneDetails(phone);

      if (data && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes([]);
        setError("No schemes found for this phone number");
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      const errorMessage =
        err.message || "Failed to load schemes. Please try again.";
      setError(errorMessage);

      Alert.alert("Error Loading Schemes", errorMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: () => fetchSchemes(phone) },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* -----------------------------
     Initial load
  ------------------------------*/
  useEffect(() => {
    loadPhoneNumber();
  }, [loadPhoneNumber]);

  /* -----------------------------
     Fetch when phone ready
  ------------------------------*/
  useEffect(() => {
    if (phoneNumber) {
      fetchSchemes(phoneNumber);
    }
  }, [phoneNumber, fetchSchemes]);

  /* -----------------------------
     Pull to refresh
  ------------------------------*/
  const onRefresh = useCallback(() => {
    if (phoneNumber) {
      setRefreshing(true);
      fetchSchemes(phoneNumber);
    }
  }, [phoneNumber, fetchSchemes]);

  /* -----------------------------
     Format currency
  ------------------------------*/
  const formatCurrency = useCallback((amount) => {
    try {
      const num = Number(amount);
      if (isNaN(num)) return "₹0";

      return `₹${num.toLocaleString("en-IN", {
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (err) {
      return "₹0";
    }
  }, []);

  /* -----------------------------
     Render scheme item
  ------------------------------*/
  const renderSchemeItem = useCallback(
    ({ item }) => {
      const schemeName = item.schemeSummary?.schemeName || "N/A";
      const remainingDays = item.remainingDays ?? 0;
      const amount =
        item.schemeSummary?.schemaSummaryTransBalance?.totalAmount || 0;

      const canRedeem = remainingDays === 0;

      // Determine status color
      let statusColor = theme.COLORS.warning;
      if (remainingDays === 0) {
        statusColor = theme.COLORS.success;
      } else if (remainingDays < 0) {
        statusColor = theme.COLORS.error;
      }

      return (
        <View style={styles.tableRow}>
          {/* Scheme Name */}
          <Text style={[styles.cell, styles.schemeCell]} numberOfLines={2}>
            {schemeName}
          </Text>

          {/* Remaining Days */}
          <Text style={[styles.cell, { color: statusColor }]}>
            {remainingDays}
          </Text>

          {/* Amount */}
          <Text style={[styles.cell, styles.amountCell]}>
            {formatCurrency(amount)}
          </Text>

          {/* Redeem Button */}
          <TouchableOpacity
            disabled={!canRedeem}
            style={[
              styles.redeemButton,
              !canRedeem && styles.redeemButtonDisabled,
            ]}
            onPress={() => {
              navigation.navigate("RedeemScreen", {
                scheme: item,
              });
            }}
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
      );
    },
    [formatCurrency, navigation]
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.schemeCell]}>Scheme</Text>
      <Text style={styles.headerCell}>Days</Text>
      <Text style={styles.headerCell}>Amount</Text>
      <Text style={styles.headerCell}>Action</Text>
    </View>
  );

  /* -----------------------------
     Render header
  ------------------------------*/
  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        <CommonHeader
          title="My Redeemption"
          rightComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("GoldPlanScreen")}
              style={{ padding: 4,borderWidth:1,borderRadius:10,width:55,height:32,backgroundColor:'#FF5724',alignSelf:"center",borderColor:"transparent" }}
            >
              <Text style={{ color: "#ffffffff", fontWeight: "600",alignSelf:"center" }}>Plans</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }, [navigation]);

  /* -----------------------------
     Render empty state
  ------------------------------*/
  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>📋</Text>
        </View>
        <Text style={styles.emptyTitle}>{"No Schemes Found"}</Text>
        <Text style={styles.emptyMessage}>
          
            "You don't have any schemes registered with this phone number."
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

  /* -----------------------------
     Key extractor
  ------------------------------*/
  const keyExtractor = useCallback((item, index) => {
    return `${item.regNo}-${
      item.schemeSummary?.schemeName || "scheme"
    }-${index}`;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.COLORS.primary}
        barStyle="light-content"
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading schemes...</Text>
        </View>
      ) : (
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
          contentContainerStyle={[
            styles.listContainer,
            schemes.length === 0 && styles.emptyListContainer,
          ]}
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
          windowSize={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    marginTop: theme.SIZES.md,
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: theme.SIZES.xl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingTop: theme.SIZES.md,
  },

  // Table Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.gray200,
    paddingVertical: theme.SIZES.md,
    paddingHorizontal: theme.SIZES.md,
    marginHorizontal: theme.SIZES.xs,
    marginTop: theme.SIZES.lg,
    marginBottom: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.md,
  },
  headerCell: {
    flex: 1,
    ...theme.FONTS.h6,
    fontWeight: "bold",
    color: theme.COLORS.textPrimary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: theme.COLORS.white,
    marginHorizontal: theme.SIZES.xs,
    marginBottom: theme.SIZES.xs,
    paddingVertical: theme.SIZES.lg,
    paddingHorizontal: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  cell: {
    flex: 1,
    ...(theme.FONTS.h6 - 3),
    textAlign: "center",
    color: theme.COLORS.textPrimary,
  },
  schemeCell: {
    flex: 1.5,
    textAlign: "left",
  },
  amountCell: {
    color: theme.COLORS.success,
    fontWeight: "600",
  },

  // Redeem Button Styles
  redeemButton: {
    backgroundColor: theme.COLORS.primary,
    paddingVertical: theme.SIZES.xs,
    paddingHorizontal: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.sm,
    minWidth: 70,
  },
  redeemButtonDisabled: {
    backgroundColor: theme.COLORS.gray300,
  },
  redeemButtonText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
  redeemButtonTextDisabled: {
    color: theme.COLORS.gray600,
  },

  // Empty State Styles
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
    ...theme.FONTS.h4,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.sm,
    textAlign: "center",
  },
  emptyMessage: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    marginBottom: theme.SIZES.xl,
    lineHeight: theme.SIZES.font.lg * 1.5,
  },
  emptyButton: {
    backgroundColor: theme.COLORS.primary,
    paddingHorizontal: theme.SIZES.xl,
    paddingVertical: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
  },
  emptyButtonText: {
    ...theme.FONTS.button,
    color: theme.COLORS.white,
  },
});

export default SchemeListPage;
