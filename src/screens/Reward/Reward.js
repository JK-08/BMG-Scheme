import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme, { COLORS, SIZES, FONTS, SHADOWS } from '../../utils/AppTheme';
import { BottomTab } from '../../components';
import CommonHeader from '../../components/CommonHeader/CommonHeader';


const { width } = Dimensions.get('window');

const RewardsPage = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [refreshing, setRefreshing] = useState(false);
  const userPoints = 2450;

  // Memoized rewards data
  const rewardsData = useMemo(() => ({
    available: [
      { 
        id: 1, 
        title: '0.5g Gold', 
        points: 2500, 
        icon: 'gold', 
        iconFamily: 'MaterialCommunityIcons',
        type: 'gold', 
        discount: '10% OFF',
        colors: COLORS.gradient.gold
      },
      { 
        id: 2, 
        title: '₹500 Cashback', 
        points: 2000, 
        icon: 'gift', 
        iconFamily: 'Ionicons',
        type: 'cash', 
        discount: 'Popular',
        colors: COLORS.gradient.success
      },
      { 
        id: 3, 
        title: '1g Gold', 
        points: 5000, 
        icon: 'trophy', 
        iconFamily: 'Ionicons',
        type: 'gold', 
        discount: '15% OFF',
        colors: COLORS.gradient.gold
      },
      { 
        id: 4, 
        title: 'Premium Member', 
        points: 3000, 
        icon: 'crown', 
        iconFamily: 'MaterialCommunityIcons',
        type: 'premium', 
        discount: 'New',
        colors: ['#9C27B0', '#7B1FA2']
      },
      { 
        id: 5, 
        title: '₹1000 Voucher', 
        points: 3500, 
        icon: 'ticket', 
        iconFamily: 'Ionicons',
        type: 'voucher', 
        discount: '',
        colors: COLORS.gradient.primary
      },
      { 
        id: 6, 
        title: 'Double Points', 
        points: 1500, 
        icon: 'flash', 
        iconFamily: 'Ionicons',
        type: 'boost', 
        discount: 'Limited',
        colors: COLORS.gradient.warm
      },
    ],
    redeemed: [
      { id: 7, title: '₹200 Cashback', points: 1000, date: '15 Nov 2024', status: 'Completed' },
      { id: 8, title: '0.5g Gold', points: 2500, date: '10 Nov 2024', status: 'Processing' },
    ]
  }), []);

  // Memoized icon renderer
  const renderIcon = useCallback((iconFamily, iconName, size = SIZES.icon.lg, color = COLORS.white) => {
    const iconProps = { name: iconName, size, color };
    
    switch(iconFamily) {
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} />;
      default:
        return <Ionicons {...iconProps} />;
    }
  }, []);

  // Memoized progress calculation
  const progressPercentage = useMemo(() => 
    Math.min((userPoints / 5000) * 100, 100), [userPoints]
  );

  const pointsToNextTier = useMemo(() => 
    5000 - userPoints, [userPoints]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleRedeem = useCallback((reward) => {
    console.log('Redeeming reward:', reward.title);
    // Add redemption logic here
  }, []);

  const handleEarnPoints = useCallback(() => {
    console.log('Navigate to earn points screen');
    // Navigation logic here
  }, []);

  // Render reward card for available tab
  const renderRewardCard = useCallback((reward) => (
    <View key={reward.id} style={styles.rewardCard}>
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={reward.colors}
          style={styles.iconContainer}
        >
          {renderIcon(reward.iconFamily, reward.icon)}
        </LinearGradient>
        {reward.discount && (
          <LinearGradient
            colors={COLORS.gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{reward.discount}</Text>
          </LinearGradient>
        )}
      </View>
      
      <Text style={styles.rewardTitle}>{reward.title}</Text>
      
      <View style={styles.pointsInfo}>
        <Ionicons name="star" size={SIZES.icon.sm} color={COLORS.secondary} />
        <Text style={styles.pointsText}>{reward.points.toLocaleString()} points</Text>
      </View>
      
      <View style={styles.cardFooter}>
        {reward.points <= userPoints ? (
          <Text style={styles.availableText}>✓ Available</Text>
        ) : (
          <Text style={styles.needMoreText}>
            Need {(reward.points - userPoints).toLocaleString()} more
          </Text>
        )}
        
        <TouchableOpacity
          disabled={reward.points > userPoints}
          onPress={() => handleRedeem(reward)}
          style={[
            styles.redeemButton,
            reward.points > userPoints && styles.redeemButtonDisabled
          ]}
        >
          <LinearGradient
            colors={reward.points <= userPoints ? COLORS.gradient.brand : [COLORS.gray300, COLORS.gray400]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.redeemGradient}
          >
            <Text style={[
              styles.redeemText,
              reward.points > userPoints && styles.redeemTextDisabled
            ]}>
              Redeem
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={SIZES.icon.sm} 
              color={reward.points <= userPoints ? COLORS.white : COLORS.gray600} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  ), [userPoints, renderIcon, handleRedeem]);

  // Render redeemed card for redeemed tab
  const renderRedeemedCard = useCallback((reward) => (
    <View key={reward.id} style={styles.redeemedCard}>
      <View style={styles.redeemedContent}>
        <Text style={styles.redeemedTitle}>{reward.title}</Text>
        <Text style={styles.redeemedDate}>{reward.date}</Text>
        <View style={styles.pointsInfo}>
          <Ionicons name="star" size={SIZES.icon.sm} color={COLORS.gray400} />
          <Text style={styles.redeemedPoints}>{reward.points.toLocaleString()} points</Text>
        </View>
      </View>
      <View style={[
        styles.statusBadge,
        reward.status === 'Completed' ? styles.statusCompleted : styles.statusProcessing
      ]}>
        <Text style={[
          styles.statusText,
          reward.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextProcessing
        ]}>
          {reward.status}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <CommonHeader title="My Rewards" />
          
          {/* Header with Gradient */}
          <LinearGradient
            colors={COLORS.gradient.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>My Rewards</Text>
            <Text style={styles.headerSubtitle}>Redeem your points for exciting rewards</Text>
            
            {/* Points Card */}
            <View style={styles.pointsCard}>
              <View style={styles.pointsContent}>
                <View style={styles.pointsLeft}>
                  <Text style={styles.pointsLabel}>Available Points</Text>
                  <View style={styles.pointsRow}>
                    <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
                    <Ionicons name="star" size={SIZES.icon.lg} color={COLORS.secondary} />
                  </View>
                </View>
                <View style={styles.trophyContainer}>
                  <Ionicons name="trophy" size={SIZES.icon.xxxl} color={COLORS.white} />
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {pointsToNextTier > 0 ? `${pointsToNextTier} points to next tier` : 'Max tier reached!'}
              </Text>
            </View>
          </LinearGradient>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsWrapper}>
              {['available', 'redeemed'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={activeTab === tab ? COLORS.gradient.brand : [COLORS.transparent, COLORS.transparent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.tabGradient, activeTab !== tab && styles.tabInactive]}
                  >
                    <Text style={[
                      styles.tabText, 
                      activeTab !== tab && styles.tabTextInactive
                    ]}>
                      {tab === 'available' ? 'Available Rewards' : 'Redeemed'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {activeTab === 'available' ? (
              <View style={styles.rewardsGrid}>
                {rewardsData.available.map(renderRewardCard)}
              </View>
            ) : (
              <View style={styles.redeemedList}>
                {rewardsData.redeemed.map(renderRedeemedCard)}
              </View>
            )}
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Floating Action Bar */}
        <View style={styles.floatingBar}>
          <View style={styles.floatingContent}>
            <View>
              <Text style={styles.floatingLabel}>Your Balance</Text>
              <Text style={styles.floatingPoints}>{userPoints.toLocaleString()} Points</Text>
            </View>
            <TouchableOpacity onPress={handleEarnPoints} activeOpacity={0.8}>
              <LinearGradient
                colors={COLORS.gradient.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.earnButton}
              >
                <Ionicons name="flash" size={SIZES.icon.md} color={COLORS.white} />
                <Text style={styles.earnButtonText}>Earn More Points</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
     <BottomTab screen="Rewards" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.padding.xxl + SIZES.padding.md,
    paddingBottom: SIZES.padding.xl,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
  },
  headerTitle: {
    ...FONTS.h1,
    color: COLORS.textInverse,
    marginBottom: SIZES.margin.xs,
  },
  headerSubtitle: {
    ...FONTS.body,
    color: COLORS.whiteOpacity50,
    marginBottom: SIZES.margin.lg,
  },
  pointsCard: {
    backgroundColor: COLORS.whiteOpacity20,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    borderWidth: 1,
    borderColor: COLORS.whiteOpacity30,
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin.md,
  },
  pointsLeft: {
    flex: 1,
  },
  pointsLabel: {
    ...FONTS.bodySmall,
    color: COLORS.whiteOpacity50,
    marginBottom: SIZES.margin.xs,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.sm,
  },
  pointsValue: {
    fontSize: SIZES.heading.h1,
    fontFamily: FONTS.family.bold,
    color: COLORS.white,
  },
  trophyContainer: {
    backgroundColor: COLORS.whiteOpacity30,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
  },
  progressBarContainer: {
    backgroundColor: COLORS.whiteOpacity20,
    height: SIZES.xs,
    borderRadius: SIZES.radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: COLORS.white,
    height: '100%',
    borderRadius: SIZES.radius.full,
  },
  progressText: {
    ...FONTS.caption,
    color: COLORS.whiteOpacity50,
    marginTop: SIZES.margin.sm,
  },
  tabsContainer: {
    paddingHorizontal: SIZES.padding.lg,
    marginTop: -SIZES.margin.lg,
  },
  tabsWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xs,
    flexDirection: 'row',
    gap: SIZES.margin.sm,
    ...SHADOWS.sm,
  },
  tabButton: {
    flex: 1,
  },
  tabGradient: {
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  tabInactive: {
    backgroundColor: COLORS.transparent,
  },
  tabText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  tabTextInactive: {
    color: COLORS.textSecondary,
  },
  content: {
    padding: SIZES.padding.lg,
  },
  rewardsGrid: {
    gap: SIZES.margin.md,
  },
  rewardCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.margin.md,
  },
  iconContainer: {
    width: SIZES.xxxl,
    height: SIZES.xxxl,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
  },
  badgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  rewardTitle: {
    ...FONTS.h4,
    marginBottom: SIZES.margin.sm,
    color: COLORS.textPrimary,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.xs,
    marginBottom: SIZES.margin.md,
  },
  pointsText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableText: {
    ...FONTS.bodySmall,
    color: COLORS.success,
    fontFamily: FONTS.family.semiBold,
  },
  needMoreText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    fontFamily: FONTS.family.semiBold,
  },
  redeemButton: {
    borderRadius: SIZES.radius.full,
    overflow: 'hidden',
  },
  redeemButtonDisabled: {
    opacity: 1,
  },
  redeemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.xs,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
  },
  redeemText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  redeemTextDisabled: {
    color: COLORS.gray600,
  },
  redeemedList: {
    gap: SIZES.margin.md,
  },
  redeemedCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  redeemedContent: {
    flex: 1,
  },
  redeemedTitle: {
    ...FONTS.h5,
    marginBottom: SIZES.margin.xs,
    color: COLORS.textPrimary,
  },
  redeemedDate: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
  },
  redeemedPoints: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.semiBold,
  },
  statusBadge: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight + '20',
  },
  statusProcessing: {
    backgroundColor: COLORS.warningLight + '20',
  },
  statusText: {
    ...FONTS.bodySmall,
    fontFamily: FONTS.family.semiBold,
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  statusTextProcessing: {
    color: COLORS.warning,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.padding.md,
    ...SHADOWS.lg,
  },
  floatingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  floatingPoints: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
  },
  earnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.xs,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.full,
  },
  earnButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  bottomSpacer: {
    height: SIZES.xxxl,
  },
});

export default RewardsPage;