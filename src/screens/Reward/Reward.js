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
import Icon from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { getReferralDetails } from "../../services/ReferralAmount";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const { width } = Dimensions.get("window");

const ReferralScreen = () => {
  const [referralData, setReferralData] = useState(null);
  const [earnedHistory, setEarnedHistory] = useState([]);
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
      const result = await getReferralDetails();

      if (result.success) {
        setReferralData(result.userReferralData);
        setEarnedHistory(result.earnedHistory || []);
      } else {
        setError(result.message || "Failed to load referral data");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
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
      await Share.share({
        message: `Join me on Digi Gold! Use my code: ${referralData.referral_code}\n${referralData.playStoreLink}`,
        title: "Join Digi Gold",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share referral link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatAmount = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Stats Data
  const stats = [
    {
      label: "Total Earnings",
      value: formatAmount(referralData?.totalCreditedAmount),
      icon: "trending-up",
      color: "#10B981",
    },
    {
      label: "Wallet Balance",
      value: formatAmount(referralData?.wallet_balance),
      icon: "account-balance-wallet",
      color: theme.COLORS.primary || "#0F766E",
    },
    {
      label: "Total Referrals",
      value: earnedHistory.length.toString(),
      icon: "people",
      color: "#3B82F6",
    },
    {
      label: "Total Rewards",
      value: formatAmount(referralData?.totalNewMemberReward),
      icon: "card-giftcard",
      color: "#8B5CF6",
    },
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
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReferralData}>
          <Icon name="refresh" size={18} color="#FFFFFF" />
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
            colors={["#0F766E"]}
            tintColor="#0F766E"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Referral Code Card - Reduced Height */}
          <View style={styles.referralCard}>
            <LinearGradient
              colors={["#FF7A4D", "#E64310"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.referralGradient}
            >
              <Text style={styles.referralTitle}>Your Referral Code</Text>
              
              <TouchableOpacity
                style={styles.codeContainer}
               
                activeOpacity={0.8}
              >
                <Text style={styles.codeText}>
                  {referralData?.referral_code || "N/A"}
                </Text>
                
              </TouchableOpacity>
              
              <Text style={styles.tapToCopy}>Tap to copy</Text>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareReferralLink}
                activeOpacity={0.8}
              >
                <Icon name="share" size={18} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Link</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Earned History */}
          <View style={styles.historyCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Earned History</Text>
                <Text style={styles.sectionSubtitle}>{earnedHistory.length} Referrals</Text>
              </View>
              <View style={styles.totalEarned}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  {formatAmount(referralData?.totalCreditedAmount)}
                </Text>
              </View>
            </View>

            {earnedHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="people-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyText}>No earnings yet</Text>
                <Text style={styles.emptySubtext}>Share your code to start earning</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {earnedHistory.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.itemHeader}>
                      <View style={styles.userAvatar}>
                        <IconFA name="user" size={14} color="#0F766E" />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {item.new_member_personal_name}
                        </Text>
                        <Text style={styles.userPhone}>{item.new_member_mobile}</Text>
                      </View>
                      <Text style={styles.earnedAmount}>
                        {formatAmount(item.credited_amount)}
                      </Text>
                    </View>
                    <View style={styles.itemDetails}>
                      <View style={styles.detailItem}>
                        <Icon name="business-center" size={12} color="#64748B" />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {item.schemeName}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="calendar-today" size={12} color="#64748B" />
                        <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* How It Works */}
          <View style={styles.howItWorksCard}>
            <View style={styles.sectionHeader}>
              <Icon name="help-outline" size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>How It Works</Text>
            </View>
            
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Icon name={step.icon} size={18} color="#0F766E" />
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
    backgroundColor: "#F8FAFC",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F766E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bottomSpace: {
    height: 20,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },

  // Referral Card (Reduced Height)
  referralCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  referralGradient: {
    paddingVertical: 20, // Reduced from 32
    paddingHorizontal: 20,
    alignItems: "center",
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12, // Reduced from 18
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: 22, // Reduced from 26
    fontWeight: "800",
    color: "#0F766E",
    letterSpacing: 2,
  },
  tapToCopy: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 16,
    fontWeight: "500",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // History Card
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  totalEarned: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F766E",
  },

  // History List
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: "#FAFCFD",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F0FCFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#64748B",
  },
  earnedAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F766E",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },

  // How It Works
  howItWorksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0F766E15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F766E",
  },
  stepText: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
    marginLeft: 12,
    fontWeight: "500",
  },
});

export default ReferralScreen;