import React, { useState } from 'react';
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
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../utils/AppTheme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';

const ReferralScreen = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [referralCode] = useState('ABC123'); // User's referral code
  const [enteredCode, setEnteredCode] = useState('');
  const [totalBonus] = useState(1500); // Total bonus earned
  const [totalReferrals] = useState(8); // Total referrals count

  // Dummy referral earnings history
  const [referralHistory] = useState([
    { id: 1, name: 'John Doe', amount: 200, date: '2025-01-10' },
    { id: 2, name: 'Jane Smith', amount: 150, date: '2025-01-08' },
    { id: 3, name: 'Mike Johnson', amount: 200, date: '2025-01-05' },
    { id: 4, name: 'Sarah Wilson', amount: 300, date: '2024-12-28' },
    { id: 5, name: 'David Brown', amount: 250, date: '2024-12-20' },
    { id: 6, name: 'Emily Davis', amount: 200, date: '2024-12-15' },
    { id: 7, name: 'Chris Taylor', amount: 100, date: '2024-12-10' },
    { id: 8, name: 'Lisa Anderson', amount: 100, date: '2024-12-05' },
  ]);

  const referralLink = `https://myapp.com/ref?code=${referralCode}`;

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  
  // Share referral link using native share
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join me on this amazing app! Use my referral code: ${referralCode}\n\n${referralLink}`,
        title: 'Refer a Friend',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Referral link shared successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link');
    }
  };

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  // Submit referral code
  const handleSubmitCode = () => {
    if (!enteredCode.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }

    // Simulate API call
    // In real app, you would validate this with your backend
    if (enteredCode.toUpperCase() === 'VALID123') {
      Alert.alert('Success', 'Referral code applied successfully!');
      setEnteredCode('');
    } else {
      Alert.alert('Error', 'Invalid referral code. Please try again.');
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  // Render referral history item
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyName}>{item.name}</Text>
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>₹{item.amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <CommonHeader title="Refer & Earn" subtitle="Share your referral code and earn rewards" />

        {/* ==================== SECTION 1: MY REFERRAL CODE ==================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Referral Code</Text>
          
          {/* Referral Code Card */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Code</Text>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Share Referral Link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{totalBonus}</Text>
              <Text style={styles.statLabel}>Total Bonus Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
          </View>
        </View>

        {/* ==================== SECTION 2: ENTER REFERRAL CODE ==================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Referral Code?</Text>
          <Text style={styles.sectionSubtitle}>
            Enter a referral code to get started with bonus
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Referral Code"
              placeholderTextColor={COLORS.inputPlaceholder}
              value={enteredCode}
              onChangeText={setEnteredCode}
              autoCapitalize="characters"
              maxLength={20}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitCode}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Code</Text>
          </TouchableOpacity>
        </View>

        {/* ==================== SECTION 3: REFERRAL EARNINGS HISTORY ==================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings History</Text>
          <Text style={styles.sectionSubtitle}>
            Track your referral rewards
          </Text>

          {referralHistory.length > 0 ? (
            <View style={styles.historyContainer}>
              <FlatList
                data={referralHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id.toString()}
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
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SIZES.padding.xxl,
  },
  
  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.padding.xl,
    paddingBottom: SIZES.padding.xxl,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    marginBottom: SIZES.margin.xs,
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.whiteOpacity50,
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
    alignItems: 'center',
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
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: SIZES.margin.sm,
    marginBottom: SIZES.margin.lg,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  secondaryButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontFamily: FONTS.family.semiBold,
  },

  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.margin.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    alignItems: 'center',
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
    textAlign: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  submitButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.bold,
  },

  // History
  historyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.md,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryOpacity20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    ...FONTS.bodyLarge,
    color: COLORS.success,
    fontFamily: FONTS.family.bold,
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
});

export default ReferralScreen;