import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Share,
  Clipboard,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";

import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import {
  getReferralDetails,
  applyReferralCode,
  validateReferralCode,
  getAppliedReferralStatus,
} from "../../services/ReferalService";

const ReferralScreen = () => {
  // =======================
  // STATE
  // =======================
  const [referralCode, setReferralCode] = useState("");
  const [totalBonus, setTotalBonus] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [referralHistory, setReferralHistory] = useState([]);
  const [enteredCode, setEnteredCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for applied referral
  const [hasAppliedReferral, setHasAppliedReferral] = useState(false);
  const [appliedReferralData, setAppliedReferralData] = useState(null);
  const [isCheckingReferralStatus, setIsCheckingReferralStatus] =
    useState(false);

  // New state for redeem functionality
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Sample data for redeemable schemes
  const [redeemableSchemes] = useState([
    {
      id: 1,
      name: "Gold Savings Plan",
      amount: 2500.00,
      maturityDate: "2024-03-15",
      isMatured: true,
      closingDate: "2024-03-16",
      status: "matured",
    },
    {
      id: 2,
      name: "Silver Investment",
      amount: 1800.50,
      maturityDate: "2024-04-01",
      isMatured: false,
      closingDate: null,
      status: "active",
    },
    {
      id: 3,
      name: "Platinum Scheme",
      amount: 3500.00,
      maturityDate: "2024-02-28",
      isMatured: true,
      closingDate: "2024-02-29",
      status: "matured",
    },
    {
      id: 4,
      name: "Basic Savings",
      amount: 1200.00,
      maturityDate: "2024-05-20",
      isMatured: false,
      closingDate: null,
      status: "active",
    },
  ]);

  const totalRedeemableAmount = redeemableSchemes
    .filter(scheme => scheme.isMatured)
    .reduce((total, scheme) => total + scheme.amount, 0);

  // ===============================
  // LOAD DATA FROM API
  // ===============================
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setIsCheckingReferralStatus(true);

    try {
      // Load referral details
      const referralResult = await getReferralDetails();

      if (referralResult.success) {
        const data = referralResult.data;

        if (Array.isArray(data) && data.length > 0) {
          // ---- FIRST OBJECT = USER INFO ----
          const userInfo = data[0];
          setReferralCode(userInfo.referral_code || "");
          console.log("User Info:", userInfo);
          setTotalBonus(userInfo.wallet_balance || 0);
          setUsername(userInfo.username || "");

          // Set referral link from API response if available, otherwise generate dynamically
          setReferralLink(
            userInfo.referralLink ||
              `https://bmgscheme.com/signup?ref=${userInfo.referral_code}`
          );

          // Set Play Store link if available
          setPlayStoreLink(
            userInfo.playStoreLink || "https://play.google.com/store/apps"
          );

          // ---- REMAINING OBJECTS = REFERRAL HISTORY ----
          const history = data.slice(1).map((item) => ({
            id: item.new_member_personal_id || "0",
            name: item.new_member_personal_name || "Unknown User",
            amount: item.credited_amount || 0,
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A",
            schemeId: item.scheme_id || 0,
          }));

          setReferralHistory(history);
          setTotalReferrals(history.length);

          // Calculate total bonus from history if needed (in case wallet_balance is not provided)
          if (!userInfo.wallet_balance && history.length > 0) {
            const totalFromHistory = history.reduce(
              (sum, item) => sum + (item.amount || 0),
              0
            );
            setTotalBonus(totalFromHistory);
          }
        }
      }

      // Check applied referral status
      const statusResult = await getAppliedReferralStatus();
      if (statusResult.success) {
        setHasAppliedReferral(statusResult.hasAppliedReferral);
        setAppliedReferralData(statusResult.appliedReferralData);
      }
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Error", "Something went wrong while loading data");
    } finally {
      setIsLoading(false);
      setIsCheckingReferralStatus(false);
    }
  };

  // ===============================
  // REDEEM FUNCTIONALITY
  // ===============================
  const handleRedeemPress = () => {
    // Show modal with sample data
    setRedeemModalVisible(true);
  };

  const handleRedeemScheme = (schemeId) => {
    setIsRedeeming(true);
    
    // Simulate API call delay
    setTimeout(() => {
      Alert.alert(
        "Success!",
        `Amount has been successfully redeemed and will be transferred to your wallet within 24-48 hours.`,
        [{
          text: "OK",
          onPress: () => {
            setIsRedeeming(false);
            // In real app, you would update the schemes list
            // For demo, we'll just close the modal
            // setRedeemModalVisible(false);
          }
        }]
      );
      setIsRedeeming(false);
    }, 1500);
  };

  const handleRedeemAll = () => {
    const maturedSchemes = redeemableSchemes.filter(scheme => scheme.isMatured);
    
    if (maturedSchemes.length === 0) {
      Alert.alert("No Mature Schemes", "You don't have any mature schemes to redeem.");
      return;
    }

    Alert.alert(
      "Redeem All",
      `Are you sure you want to redeem ₹${totalRedeemableAmount.toFixed(2)} from ${maturedSchemes.length} mature scheme(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem All",
          onPress: () => {
            setIsRedeeming(true);
            
            // Simulate API call delay
            setTimeout(() => {
              Alert.alert(
                "Success!",
                `₹${totalRedeemableAmount.toFixed(2)} has been successfully redeemed from all mature schemes and will be transferred to your wallet within 24-48 hours.`,
                [{
                  text: "OK",
                  onPress: () => {
                    setIsRedeeming(false);
                    setRedeemModalVisible(false);
                  }
                }]
              );
              setIsRedeeming(false);
            }, 1500);
          }
        }
      ]
    );
  };

  // Render scheme item in modal
  const renderSchemeItem = ({ item }) => (
    <View style={styles.schemeItem}>
      <View style={styles.schemeInfo}>
        <Text style={styles.schemeName}>{item.name}</Text>
        <Text style={styles.schemeDate}>
          Maturity Date: {new Date(item.maturityDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        {item.closingDate && (
          <Text style={styles.schemeClosingDate}>
            Closed on: {new Date(item.closingDate).toLocaleDateString('en-IN')}
          </Text>
        )}
      </View>
      <View style={styles.schemeAmountContainer}>
        <Text style={styles.schemeAmount}>₹{item.amount.toFixed(2)}</Text>
        <TouchableOpacity
          style={[
            styles.redeemButton,
            !item.isMatured && styles.redeemButtonDisabled
          ]}
          onPress={() => handleRedeemScheme(item.id)}
          disabled={!item.isMatured || isRedeeming}
        >
          <Text style={styles.redeemButtonText}>
            {item.isMatured ? 'Redeem' : 'Not Matured'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ===============================
  // SHARE LINK
  // ===============================
  const handleShare = async () => {
    if (!referralCode) {
      Alert.alert("Error", "Referral code not available");
      return;
    }

    try {
      const shareMessage = playStoreLink
        ? `Join me on BMG Scheme! Use my referral code: ${referralCode} to get bonus.\n\nDownload the app: ${playStoreLink}\n\nSign up with my referral link: ${referralLink}`
        : `Join me on BMG Scheme! Use my referral code: ${referralCode} to get bonus.\n\nSign up here: ${referralLink}`;

      await Share.share({
        message: shareMessage,
        title: "Refer & Earn with BMG Scheme",
      });

      Alert.alert("Success", "Referral link shared successfully!");
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share referral link");
    }
  };

  // ===============================
  // COPY LINK
  // ===============================
  const handleCopyLink = () => {
    if (!referralCode) {
      Alert.alert("Error", "Referral code not available");
      return;
    }

    const textToCopy =
      referralLink || `https://bmgscheme.com/signup?ref=${referralCode}`;
    Clipboard.setString(textToCopy);
    Alert.alert("Copied!", "Referral link copied to clipboard");
  };

  // ===============================
  // RENDER APPLIED REFERRAL SECTION
  // ===============================
  const renderAppliedReferralSection = () => {
    if (isCheckingReferralStatus) {
      return (
        <View style={styles.appliedReferralCard}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.checkingText}>Checking referral status...</Text>
        </View>
      );
    }

    if (hasAppliedReferral && appliedReferralData) {
      return (
        <View style={styles.appliedReferralCard}>
          <View style={styles.appliedHeader}>
            <Text style={styles.appliedTitle}>Applied Referral</Text>
            <View style={styles.appliedBadge}>
              <Text style={styles.appliedBadgeText}>Applied</Text>
            </View>
          </View>

          <View style={styles.appliedContent}>
            <Text style={styles.appliedLabel}>Friend's Referral Code:</Text>
            <Text style={styles.appliedCode}>
              {appliedReferralData.referral_code || "N/A"}
            </Text>

            <Text style={styles.appliedLabel}>Applied On:</Text>
            <Text style={styles.appliedDate}>
              {appliedReferralData.created_at
                ? new Date(appliedReferralData.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A"}
            </Text>
          </View>

          <View style={styles.appliedNote}>
            <Text style={styles.appliedNoteText}>
              ✓ You have already applied a friend's referral code
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Have a Referral Code?</Text>
        <Text style={styles.sectionSubtitle}>
          Enter a friend's referral code to get started with bonus
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Friend's Referral Code"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={enteredCode}
            onChangeText={setEnteredCode}
            autoCapitalize="characters"
            maxLength={20}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!enteredCode.trim() || isSubmitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitCode}
          disabled={!enteredCode.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Apply Referral Code</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ===============================
  // SUBMIT REFERRAL CODE
  // ===============================
  const handleSubmitCode = async () => {
    if (!enteredCode.trim()) {
      Alert.alert("Error", "Please enter a referral code");
      return;
    }

    if (isSubmitting) {
      return;
    }

    // Prevent user from applying their own referral code
    if (enteredCode.trim().toUpperCase() === referralCode?.toUpperCase()) {
      Alert.alert("Invalid Code", "You cannot use your own referral code!");
      return;
    }

    // Validate format before making API call
    const validation = validateReferralCode(enteredCode);
    if (!validation.valid) {
      Alert.alert("Invalid Code", validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await applyReferralCode(enteredCode);

      if (result.success) {
        Alert.alert(
          "Success",
          result.message || "Referral code applied successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear input
                setEnteredCode("");
                // Refresh all data to update UI
                loadAllData();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to apply referral code",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Submit referral code error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ===============================
  // RENDER HISTORY ITEM
  // ===============================
  const renderHistoryItem = ({ item, index }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.name
              .split(" ")
              .map((n) => n[0]?.toUpperCase() || "")
              .join("")
              .slice(0, 2)}
          </Text>
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.historyDate}>{item.date}</Text>
          {item.schemeId > 0 && (
            <Text style={styles.schemeText}>Scheme #{item.schemeId}</Text>
          )}
        </View>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>₹{item.amount.toFixed(2)}</Text>
        <Text style={styles.creditedText}>Credited</Text>
      </View>
    </View>
  );

  // ===============================
  // LOADING STATE
  // ===============================
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CommonHeader
          title="Refer & Earn"
          subtitle="Share your referral code and earn rewards"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading referral data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CommonHeader
          title="Refer & Earn"
          subtitle="Share your referral code and earn rewards"
        />

        {/* ===== MY REFERRAL CODE ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Referral Code</Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <Text style={styles.codeText}>{referralCode || "---"}</Text>
            {username && (
              <Text style={styles.usernameText}>@{username.trim()}</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !referralCode && styles.buttonDisabled,
              ]}
              onPress={handleShare}
              disabled={!referralCode}
            >
              <Text style={styles.primaryButtonText}>Share Referral Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                !referralCode && styles.buttonDisabled,
              ]}
              onPress={handleCopyLink}
              disabled={!referralCode}
            >
              <Text style={styles.secondaryButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          {/* Stats with Redeem Button */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{totalBonus.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Bonus Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
          </View>

          {/* Redeem Button */}
          <TouchableOpacity
            style={styles.redeemButtonMain}
            onPress={handleRedeemPress}
          >
            <Text style={styles.redeemButtonMainText}>Redeem Amount</Text>
          </TouchableOpacity>
        </View>

        {/* ===== HOW IT WORKS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Share your referral code or link with friends
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Ask them to sign up using your code/link
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Earn ₹200 bonus for each successful referral
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Redeem your earnings when schemes reach maturity date
              </Text>
            </View>
          </View>
        </View>

        {/* ===== APPLIED REFERRAL / INPUT SECTION ===== */}
        {renderAppliedReferralSection()}

        {/* ===== REFERRAL HISTORY ===== */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Earnings History</Text>
            {referralHistory.length > 0 && (
              <Text style={styles.historyCount}>
                {totalReferrals} referrals
              </Text>
            )}
          </View>

          {referralHistory.length > 0 ? (
            <View style={styles.historyContainer}>
              <FlatList
                data={referralHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No referral earnings yet</Text>
              <Text style={styles.emptySubtext}>
                Start referring friends to earn rewards!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Redeem Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={redeemModalVisible}
        onRequestClose={() => setRedeemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redeem Amount</Text>
              <TouchableOpacity
                onPress={() => setRedeemModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Total Redeemable Amount */}
            <View style={styles.totalRedeemableCard}>
              <Text style={styles.totalRedeemableLabel}>Total Redeemable</Text>
              <Text style={styles.totalRedeemableAmount}>
                ₹{totalBonus.toFixed(2)}
              </Text>
            </View>

            {/* Schemes List */}
            {/* <View style={styles.schemesListContainer}>
              <Text style={styles.schemesListTitle}>Your Schemes</Text>
              <FlatList
                data={redeemableSchemes}
                renderItem={renderSchemeItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.schemesListContent}
              />
            </View> */}

            {/* Important Note */}
            <View style={styles.redeemNoteContainer}>
              <Text style={styles.redeemNoteTitle}>Important:</Text>
              <Text style={styles.redeemNoteText}>
                • Amount can only be redeemed when scheme reaches maturity date{'\n'}
                • Redeemed amount will be transferred to your wallet{'\n'}
                • Processing may take 24-48 hours{'\n'}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SIZES.padding.xxl,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },

  // Section
  section: {
    marginTop: SIZES.margin.lg,
    paddingHorizontal: SIZES.padding.lg,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  sectionSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.md,
  },

  // Code Card
  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.xl,
    alignItems: "center",
    ...SHADOWS.sm,
    marginBottom: SIZES.margin.md,
  },
  codeLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
  },
  codeText: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontFamily: FONTS.family.bold,
    letterSpacing: 4,
    marginBottom: SIZES.margin.xs,
  },
  usernameText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.medium,
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    gap: SIZES.margin.sm,
    marginBottom: SIZES.margin.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  primaryButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  secondaryButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontFamily: FONTS.family.semiBold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Redeem Button (Main)
  redeemButtonMain: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.margin.md,
    ...SHADOWS.sm,
  },
  redeemButtonMainText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.bold,
  },

  // Stats Cards
  statsRow: {
    flexDirection: "row",
    gap: SIZES.margin.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  statValue: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontFamily: FONTS.family.bold,
    marginBottom: SIZES.margin.xs,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Steps
  stepsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    ...SHADOWS.sm,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryOpacity20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.margin.md,
  },
  stepNumberText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    fontFamily: FONTS.family.bold,
  },
  stepText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Input Container
  inputContainer: {
    marginBottom: SIZES.margin.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.md,
    fontSize: SIZES.font.md,
    fontFamily: FONTS.family.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    ...SHADOWS.xs,
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.bold,
  },

  // History Header
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.sm,
  },
  historyCount: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },

  // History
  historyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryOpacity20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.margin.md,
  },
  avatarText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontFamily: FONTS.family.bold,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.medium,
    marginBottom: 2,
  },
  historyDate: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  schemeText: {
    ...FONTS.captionSmall,
    color: COLORS.textTertiary,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    ...FONTS.bodyLarge,
    color: COLORS.success,
    fontFamily: FONTS.family.bold,
    marginBottom: 2,
  },
  creditedText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },

  // Empty State
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.xxl,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
  },
  emptySubtext: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: "center",
  },

  // Applied Referral Styles
  appliedReferralCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    marginTop: SIZES.margin.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  appliedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.md,
  },
  appliedTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
  },
  appliedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.xs,
  },
  appliedBadgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  appliedContent: {
    marginBottom: SIZES.margin.md,
  },
  appliedLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
  },
  appliedCode: {
    ...FONTS.bodyLarge,
    color: COLORS.primary,
    fontFamily: FONTS.family.bold,
    marginTop: 2,
  },
  appliedDate: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  appliedNote: {
    backgroundColor: COLORS.successOpacity20,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  appliedNoteText: {
    ...FONTS.body,
    color: COLORS.successDark,
    fontFamily: FONTS.family.medium,
  },
  checkingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.sm,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius.xl,
    borderRadius: SIZES.radius.xl,
    maxHeight: height * 0.85,
    paddingBottom: SIZES.padding.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.bold,
  },
  closeButton: {
    padding: SIZES.padding.xs,
  },
  closeButtonText: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
  },
  totalRedeemableCard: {
    backgroundColor: COLORS.successOpacity10,
    marginHorizontal: SIZES.padding.lg,
    marginVertical: SIZES.margin.lg,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.successOpacity30,
  },
  totalRedeemableLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
  },
  totalRedeemableAmount: {
    // ...FONTS.h2,
    color: COLORS.success,
    // fontFamily: FONTS.family.bold,
    marginBottom: SIZES.margin.xs,
     fontSize: SIZES.heading.h2,
    lineHeight: SIZES.heading.h2 * 1.3,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  schemesListContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
  },
  schemesListTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.semiBold,
    marginBottom: SIZES.margin.md,
  },
  schemesListContent: {
    paddingBottom: SIZES.padding.sm,
  },
  schemeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  schemeInfo: {
    flex: 1,
    marginRight: SIZES.margin.md,
  },
  schemeName: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.medium,
    marginBottom: 4,
  },
  schemeDate: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  schemeClosingDate: {
    ...FONTS.captionSmall,
    color: COLORS.textTertiary,
  },
  schemeAmountContainer: {
    alignItems: 'flex-end',
  },
  schemeAmount: {
    ...FONTS.bodyLarge,
    color: COLORS.success,
    fontFamily: FONTS.family.bold,
    marginBottom: SIZES.margin.xs,
  },
  redeemButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  redeemButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZES.margin.sm,
    paddingHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  modalCancelButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
    fontFamily: FONTS.family.semiBold,
  },
  modalRedeemAllButton: {
    flex: 2,
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRedeemAllButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.bold,
  },
  redeemNoteContainer: {
    backgroundColor: COLORS.warningOpacity10,
    marginHorizontal: SIZES.padding.lg,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  redeemNoteTitle: {
    ...FONTS.bodySmall,
    color: COLORS.warning,
    fontFamily: FONTS.family.semiBold,
    marginBottom: SIZES.margin.xs,
  },
  redeemNoteText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontSize:14
  },
});

export default ReferralScreen;