import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { API_BASE_URL_OLD } from "../../Config/API";

const { width } = Dimensions.get("window");

const ReferralScreen = () => {
  const [referralData, setReferralData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await AsyncStorage.getItem("userId");
      
      if (!userId) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL_OLD}/account/referrals/${userId}`;
      console.log("Fetching data from:", url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2));

      // Handle the API response structure
      if (data && data.referrer) {
        setReferralData(data.referrer);
        setTransactions(data.transactions || []);
      } else if (Array.isArray(data)) {
        // Fallback for array format
        setReferralData(data[0] || null);
        setTransactions(data.slice(1) || []);
      } else {
        setReferralData(null);
        setTransactions([]);
      }
      
    } catch (err) {
      console.error("Error loading referral data:", err);
      setError(err.message || "An error occurred while loading data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferralData();
  };

  const shareReferralLink = async () => {
    if (!referralData?.playStoreLink) return;

    try {
      const shareMessage = `Join me on BMG Scheme! Use my referral code: ${referralData.referral_code}\n\nDownload app: ${referralData.playStoreLink}`;
      
      await Share.share({
        message: shareMessage,
        title: "Join BMG Scheme",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share referral link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return `₹${numAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Stats Data
  const stats = [
    {
      label: "Wallet Balance",
      value: formatAmount(referralData?.wallet_balance),
      icon: "account-balance-wallet",
      color: theme.COLORS.primary,
    }
  ];

  // Steps Data
  const steps = [
    { icon: "person-add", text: "Share your referral code" },
    { icon: "download", text: "Friend installs app" },
    { icon: "verified", text: "First purchase made" },
    { icon: "account-balance-wallet", text: "Earn rewards instantly" },
  ];

  // Loading State
  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="error-outline" size={theme.SIZES.icon.xxxl} color={theme.COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReferralData}>
          <Icon name="refresh" size={theme.SIZES.icon.sm} color={theme.COLORS.white} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="My Rewards" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.COLORS.primary]}
            tintColor={theme.COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={[styles.userInfoCard, theme.SHADOWS.sm]}>
            <View style={styles.userAvatarLarge}>
              <IconFA name="user" size={theme.SIZES.icon.md} color={theme.COLORS.white} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {referralData?.username || "User"}
              </Text>
              <Text style={styles.userPhone}>
                {referralData?.contact_number || "N/A"}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, theme.SHADOWS.xs]}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={theme.SIZES.icon.md} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Referral Code Card */}
          <View style={[styles.referralCard, theme.SHADOWS.md]}>
            <LinearGradient
              colors={theme.COLORS.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.referralGradient}
            >
              <Text style={styles.referralTitle}>Your Referral Code</Text>
              
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>
                  {referralData?.referral_code || "N/A"}
                </Text>
              </View>
              
             

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareReferralLink}
                activeOpacity={0.7}
              >
                <Icon name="share" size={theme.SIZES.icon.sm} color={theme.COLORS.primary} />
                <Text style={styles.shareButtonText}>Share Referral Link</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Transactions History */}
          <View style={[styles.historyCard, theme.SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <Text style={styles.sectionSubtitle}>
                  {transactions.length} {transactions.length === 1 ? 'Transaction' : 'Transactions'}
                </Text>
              </View>
              <View style={styles.totalEarned}>
                <Text style={styles.totalLabel}>Total Earned</Text>
                <Text style={styles.totalAmount}>
                  {formatAmount(referralData?.totalCreditedAmount)}
                </Text>
              </View>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="receipt-long" size={theme.SIZES.icon.xxxl} color={theme.COLORS.gray400} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Share your referral code to start earning</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {transactions.map((item, index) => (
                  <View key={index} style={[styles.historyItem, theme.SHADOWS.xs]}>
                    <View style={styles.itemHeader}>
                      <View style={styles.userAvatar}>
                        <IconFA name="user" size={theme.SIZES.font.xs} color={theme.COLORS.primary} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {item.new_member_personal_name || "New Member"}
                        </Text>
                        <Text style={styles.userPhone}>
                          {item.new_member_mobile || "N/A"}
                        </Text>
                      </View>
                      <Text style={styles.earnedAmount}>
                        +{formatAmount(item.credited_amount)}
                      </Text>
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Icon name="business-center" size={theme.SIZES.font.xs} color={theme.COLORS.gray500} />
                          <Text style={styles.detailText} numberOfLines={1}>
                            {item.schemeName || "N/A"}
                          </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          <Icon name="card-giftcard" size={theme.SIZES.font.xs} color={theme.COLORS.gray500} />
                          <Text style={styles.detailText}>
                            Member: {formatAmount(item.new_member_reward)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Icon name="calendar-today" size={theme.SIZES.font.xs} color={theme.COLORS.gray500} />
                          <Text style={styles.detailText}>
                            {formatDate(item.created_at)}
                          </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          <Icon name="access-time" size={theme.SIZES.font.xs} color={theme.COLORS.gray500} />
                          <Text style={styles.detailText}>
                            {formatTime(item.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* How It Works */}
          <View style={[styles.howItWorksCard, theme.SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Icon name="help-outline" size={theme.SIZES.icon.lg} color={theme.COLORS.primary} />
              <Text style={styles.sectionTitle}>How It Works</Text>
            </View>
            
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Icon name={step.icon} size={theme.SIZES.icon.md} color={theme.COLORS.primary} />
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.COLORS.background,
    paddingHorizontal: theme.SIZES.padding.lg,
  },
  loadingText: {
    marginTop: theme.SIZES.margin.md,
    fontSize: theme.SIZES.font.md,
    color: theme.COLORS.textSecondary,
    fontFamily: theme.FONTS.family.regular,
  },
  errorText: {
    fontSize: theme.SIZES.font.lg,
    color: theme.COLORS.textPrimary,
    textAlign: "center",
    marginTop: theme.SIZES.margin.md,
    marginBottom: theme.SIZES.margin.xl,
    lineHeight: theme.SIZES.font.lg * 1.5,
    fontFamily: theme.FONTS.family.regular,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.primary,
    paddingVertical: theme.SIZES.padding.md,
    paddingHorizontal: theme.SIZES.padding.xxl,
    borderRadius: theme.SIZES.radius.md,
    gap: theme.SIZES.margin.sm,
  },
  retryButtonText: {
    color: theme.COLORS.white,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.SIZES.padding.lg,
    paddingTop: theme.SIZES.padding.md,
  },
  bottomSpace: {
    height: theme.SIZES.margin.xxl,
  },

  // User Info Card
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.card,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.lg,
    marginBottom: theme.SIZES.margin.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  userAvatarLarge: {
    width: theme.SIZES.icon.xxxl,
    height: theme.SIZES.icon.xxxl,
    borderRadius: theme.SIZES.icon.xxxl / 2,
    backgroundColor: theme.COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.SIZES.margin.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.SIZES.font.xl,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.margin.xs,
  },
  userPhone: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.SIZES.margin.lg,
    gap: theme.SIZES.margin.md,
  },
  statCard: {
    width: (width - theme.SIZES.padding.lg * 2 - theme.SIZES.margin.md) / 2,
    backgroundColor: theme.COLORS.card,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  statIcon: {
    width: theme.SIZES.icon.xxl,
    height: theme.SIZES.icon.xxl,
    borderRadius: theme.SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.SIZES.margin.sm,
  },
  statValue: {
    fontSize: theme.SIZES.font.lg,
    fontFamily: theme.FONTS.family.bold,
    marginBottom: theme.SIZES.margin.xs,
  },
  statLabel: {
    fontSize: theme.SIZES.font.xs,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textTertiary,
    textAlign: "center",
  },

  // Referral Card
  referralCard: {
    marginBottom: theme.SIZES.margin.xl,
    borderRadius: theme.SIZES.radius.xl,
    overflow: "hidden",
  },
  referralGradient: {
    paddingVertical: theme.SIZES.padding.xxl,
    paddingHorizontal: theme.SIZES.padding.xl,
    alignItems: "center",
  },
  referralTitle: {
    fontSize: theme.SIZES.font.xxl,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.white,
    marginBottom: theme.SIZES.margin.lg,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.white,
    paddingVertical: theme.SIZES.padding.lg,
    paddingHorizontal: theme.SIZES.padding.xl,
    borderRadius: theme.SIZES.radius.lg,
    marginBottom: theme.SIZES.margin.sm,
    width: "100%",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: theme.SIZES.font.xxxl,
    fontFamily: theme.FONTS.family.extraBold,
    color: theme.COLORS.primary,
    letterSpacing: 2,
    alignSelf:"center"
  },
  tapToCopy: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.medium,
    color: theme.COLORS.whiteOpacity50,
    marginBottom: theme.SIZES.margin.lg,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.md,
    paddingVertical: theme.SIZES.padding.md,
    paddingHorizontal: theme.SIZES.padding.xl,
    gap: theme.SIZES.margin.sm,
  },
  shareButtonText: {
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.primary,
  },

  // History Card
  historyCard: {
    backgroundColor: theme.COLORS.card,
    borderRadius: theme.SIZES.radius.xl,
    padding: theme.SIZES.padding.lg,
    marginBottom: theme.SIZES.margin.xl,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.SIZES.margin.lg,
    paddingBottom: theme.SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: theme.SIZES.font.lg,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.margin.xs,
  },
  totalEarned: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textSecondary,
    marginBottom: theme.SIZES.margin.xs,
  },
  totalAmount: {
    fontSize: theme.SIZES.font.lg,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.primary,
  },

  // History List
  historyList: {
    gap: theme.SIZES.margin.md,
  },
  historyItem: {
    backgroundColor: theme.COLORS.backgroundSecondary,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.SIZES.margin.sm,
  },
  userAvatar: {
    width: theme.SIZES.icon.lg,
    height: theme.SIZES.icon.lg,
    borderRadius: theme.SIZES.radius.sm,
    backgroundColor: theme.COLORS.primaryOpacity10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.SIZES.margin.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.margin.xs,
  },
  userPhone: {
    fontSize: theme.SIZES.font.xs,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textSecondary,
  },
  earnedAmount: {
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.success,
  },
  itemDetails: {
    gap: theme.SIZES.margin.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.SIZES.margin.xs,
    flex: 1,
  },
  detailText: {
    fontSize: theme.SIZES.font.xs,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.SIZES.padding.xxl,
  },
  emptyText: {
    fontSize: theme.SIZES.font.lg,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.margin.md,
    marginBottom: theme.SIZES.margin.xs,
  },
  emptySubtext: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textTertiary,
    textAlign: "center",
  },

  // How It Works
  howItWorksCard: {
    backgroundColor: theme.COLORS.card,
    borderRadius: theme.SIZES.radius.xl,
    padding: theme.SIZES.padding.lg,
    marginBottom: theme.SIZES.margin.xl,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  stepsContainer: {
    gap: theme.SIZES.margin.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.SIZES.padding.xs,
  },
  stepNumber: {
    width: theme.SIZES.icon.md,
    height: theme.SIZES.icon.md,
    borderRadius: theme.SIZES.icon.md / 2,
    backgroundColor: theme.COLORS.primaryOpacity20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.SIZES.margin.md,
  },
  stepNumberText: {
    fontSize: theme.SIZES.font.sm,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.primary,
  },
  stepText: {
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.medium,
    color: theme.COLORS.textPrimary,
    flex: 1,
    marginLeft: theme.SIZES.margin.md,
  },
});

export default ReferralScreen;