import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Share,
  Animated,
  SafeAreaView,
  Clipboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../utils/AppTheme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_OLD, API_BASE_URL } from '../../Config/API';

const { width } = Dimensions.get('window');

const ReferralPending = () => {
  const [userData, setUserData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    earned: 0,
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [showHelpTip, setShowHelpTip] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadData();
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenTip = await AsyncStorage.getItem('hasSeenReferralTip');
      setShowHelpTip(!hasSeenTip);
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        await fetchAllReferrals(userId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAllReferrals = async (userId) => {
    try {
      // Fetch both APIs in parallel
      const [completedResponse, pendingResponse] = await Promise.all([
        fetch(`${API_BASE_URL_OLD}/account/referrals/${userId}`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE_URL}/referral/by-user/${userId}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      if (!completedResponse.ok) {
        throw new Error(`Completed API failed: ${completedResponse.status}`);
      }
      
      if (!pendingResponse.ok) {
        throw new Error(`Pending API failed: ${pendingResponse.status}`);
      }

      const completedData = await completedResponse.json();
      const pendingData = await pendingResponse.json();

      console.log('Completed API data:', completedData);
      console.log('Pending API data:', pendingData);

      // Process completed referrals from first API
      let userInfo = null;
      const completedReferrals = [];

      if (Array.isArray(completedData) && completedData.length > 0) {
        // First item is user data
        userInfo = completedData[0];
        setUserData(userInfo);
        
        // Process completed referrals (items after the first one)
        for (let i = 1; i < completedData.length; i++) {
          const item = completedData[i];
          if (item.new_member_personal_id) {
            completedReferrals.push({
              id: `${item.new_member_personal_id}_${item.scheme_id}_${i}`,
              userId: item.new_member_personal_id,
              name: item.new_member_personal_name?.trim() || 'Unknown User',
              phone: item.new_member_mobile || '',
              email: '', // Email not available in completed API
              referralCode: userInfo.referral_code,
              date: item.created_at,
              status: 'completed',
              amount: item.credited_amount || 0,
              schemeName: item.schemeName || 'BMG Scheme',
              schemeId: item.scheme_id,
              type: 'completed'
            });
          }
        }
      }

      console.log('Processed completed referrals:', completedReferrals);

      // Create a map of completed phone numbers for quick lookup
      const completedPhoneNumbers = new Set();
      completedReferrals.forEach(ref => {
        if (ref.phone) {
          // Clean phone number (remove spaces, special characters)
          const cleanPhone = ref.phone.replace(/\D/g, '');
          if (cleanPhone.length >= 10) {
            completedPhoneNumbers.add(cleanPhone);
          }
        }
      });

      console.log('Completed phone numbers:', Array.from(completedPhoneNumbers));

      // Process pending referrals from second API
      const pendingReferrals = [];
      if (Array.isArray(pendingData)) {
        pendingData.forEach((item, index) => {
          if (item.user_id) {
            const phoneNumber = item.referredContactNumber || item.contact_number || '';
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            
            // Check if this phone number is already in completed referrals
            if (cleanPhone && cleanPhone.length >= 10 && completedPhoneNumbers.has(cleanPhone)) {
              console.log(`Skipping duplicate phone number: ${phoneNumber} (already completed)`);
              return; // Skip this entry
            }
            
            pendingReferrals.push({
              id: `${item.user_id}_${index}`,
              name: item.referredUserName?.trim() || item.referred_user_name?.trim() || 'Unknown User',
              userId: item.user_id,
              phone: phoneNumber,
              email: item.referredEmail || item.email || '',
              referralCode: item.referral_code || userInfo?.referral_code || '',
              date: item.created_at,
              status: 'pending',
              amount: 0,
              schemeName: 'Not Enrolled',
              type: 'pending'
            });
          }
        });
      }

      console.log('Processed pending referrals:', pendingReferrals);

      // Combine all referrals
      const allReferrals = [...completedReferrals, ...pendingReferrals];
      
      // Sort by date (newest first)
      allReferrals.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('Total referrals after merge:', allReferrals.length);
      
      setReferrals(allReferrals);
      calculateStats(allReferrals);
      filterReferrals(allReferrals, activeFilter);

      // Cache data
      await AsyncStorage.setItem('referralData', JSON.stringify({
        userData: userInfo,
        referrals: allReferrals,
        timestamp: Date.now(),
      }));

    } catch (error) {
      console.error('Error fetching all referrals:', error);
      // Try to load cached data
      await loadCachedData();
    }
  };

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem('referralData');
      if (cached) {
        const { userData, referrals, timestamp } = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setUserData(userData);
          setReferrals(referrals);
          calculateStats(referrals);
          filterReferrals(referrals, activeFilter);
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const calculateStats = useCallback((referralsData) => {
    const total = referralsData.length;
    const pending = referralsData.filter(item => item.status === 'pending').length;
    const completed = referralsData.filter(item => item.status === 'completed').length;
    const earned = referralsData.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    setStats({ total, pending, completed, earned });
  }, []);

  const filterReferrals = useCallback((data, filter) => {
    let filtered = [...data]; // Create a copy
    if (filter === 'pending') {
      filtered = data.filter(item => item.status === 'pending');
    } else if (filter === 'completed') {
      filtered = data.filter(item => item.status === 'completed');
    }
    // Sort filtered results by date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredReferrals(filtered);
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterReferrals(referrals, filter);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const shareReferralLink = async () => {
    if (!userData?.referral_code) {
      Alert.alert('Error', 'Referral code not available');
      return;
    }
    
    const referralLink = userData.referralLink || 
      `https://bmgscheme.com/signup?ref=${userData.referral_code}`;
    
    const message = `Join me on BMG Scheme! Use my referral code: ${userData.referral_code}\n\n` +
      `Download app: ${userData.playStoreLink || 'https://play.google.com/store/apps/details?id=com.bmg.bmgscheme'}\n\n` +
      `Or sign up directly: ${referralLink}`;
    
    try {
      await Share.share({
        message,
        title: 'BMG Scheme Referral',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share referral link');
    }
  };

  const copyReferralCode = async () => {
    if (userData?.referral_code) {
      await Clipboard.setString(userData.referral_code);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } else {
      Alert.alert('Error', 'Referral code not available');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '--';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '--';
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Phone number is not available or invalid');
      return;
    }
    
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length >= 10) {
      Alert.alert(
        'Call Referral',
        `Do you want to call ${phoneNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
        ]
      );
    }
  };

  const renderStats = () => (
    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.COLORS.primary + '15' }]}>
            <Icon name="groups" size={20} color={theme.COLORS.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.COLORS.warning + '15' }]}>
            <Icon name="pending" size={20} color={theme.COLORS.warning} />
          </View>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.COLORS.success + '15' }]}>
            <Icon name="check-circle" size={20} color={theme.COLORS.success} />
          </View>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.COLORS.info + '15' }]}>
            <Icon name="currency-rupee" size={20} color={theme.COLORS.info} />
          </View>
          <Text style={styles.statNumber}>₹{stats.earned.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderFilterButtons = () => (
    <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
      {['all', 'pending', 'completed'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            activeFilter === filter && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange(filter)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === filter && styles.filterButtonTextActive,
            ]}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderUserCard = () => {
    if (!userData) return null;

    return (
      <Animated.View style={[styles.userCard, { opacity: fadeAnim }]}>
        <View style={styles.userCardHeader}>
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {userData.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.username || 'User'}</Text>
            <Text style={styles.userBalance}>
              Wallet: ₹{(userData.wallet_balance || 0).toFixed(2)}
            </Text>
            <TouchableOpacity 
              onPress={copyReferralCode}
              style={styles.referralCodeContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.referralCodeText}>
                Code: {userData.referral_code || 'N/A'}
              </Text>
              <Icon name="content-copy" size={14} color={theme.COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareReferralLink}
            activeOpacity={0.7}
          >
            <Icon name="share" size={18} color={theme.COLORS.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderReferralCard = (item, index) => {
    const isPending = item.status === 'pending';
    
    return (
      <Animated.View 
        key={item.id}
        style={[
          styles.referralCard,
          isPending && styles.pendingCard,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfoRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {item.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.userId}>
                ID: {item.userId}
              </Text>
              <Text style={[
                styles.schemeName,
                isPending && styles.pendingSchemeName
              ]}>
                {item.schemeName}
              </Text>
            </View>
          </View>
          
          <View style={[
            styles.statusBadge,
            isPending ? styles.pendingBadge : styles.completedBadge
          ]}>
            <View style={[
              styles.statusDot,
              isPending ? { backgroundColor: theme.COLORS.warning } : { backgroundColor: theme.COLORS.success }
            ]} />
            <Text style={[
              styles.statusText,
              isPending ? { color: theme.COLORS.warning } : { color: theme.COLORS.success }
            ]}>
              {isPending ? 'Pending' : 'Completed'}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
           
            
            <View style={styles.infoItem}>
              <Icon name="phone" size={14} color={theme.COLORS.textTertiary} />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>
                {item.phone || '--'}
              </Text>
              {item.phone && item.phone.length >= 10 && (
                <TouchableOpacity 
                  onPress={() => handleCall(item.phone)}
                  style={styles.callButton}
                  activeOpacity={0.6}
                >
                  <Icon name="call" size={16} color={theme.COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {!isPending && item.amount > 0 && (
            <View style={styles.amountContainer}>
              <Icon name="currency-rupee" size={14} color={theme.COLORS.success} />
              <Text style={styles.amountText}>
                Earned: ₹{item.amount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Icon name="calendar-today" size={14} color={theme.COLORS.textTertiary} />
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.timeText}>• {formatTime(item.date)}</Text>
          </View>
          
          <View style={styles.referralCodeBadge}>
            <Icon name="code" size={12} color={theme.COLORS.primary} />
            <Text style={styles.referralCodeBadgeText}>
              {item.referralCode || userData?.referral_code}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={theme.COLORS.primary} />
      <Text style={styles.loadingText}>Loading referrals...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyIcon}>
        <Icon 
          name="person-add" 
          size={60} 
          color={theme.COLORS.textTertiary} 
        />
      </View>
      <Text style={styles.emptyTitle}>No Referrals Found</Text>
      <Text style={styles.emptyText}>
        {activeFilter === 'all' 
          ? 'Share your referral code with friends to start earning rewards!'
          : activeFilter === 'pending'
            ? 'No pending referrals found.'
            : 'No completed referrals yet.'}
      </Text>
      {activeFilter === 'all' && (
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={shareReferralLink}
          activeOpacity={0.8}
        >
          <Icon name="share" size={20} color={theme.COLORS.white} />
          <Text style={styles.buttonText}>Share Referral Code</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    
    return (
      <>
        {renderUserCard()}
        {renderStats()}
        {renderFilterButtons()}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            My Referrals ({filteredReferrals.length})
          </Text>
        </View>

        {filteredReferrals.length > 0 ? (
          filteredReferrals.map((item, index) => renderReferralCard(item, index))
        ) : (
          renderEmptyState()
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader 
        title="My Referrals" 
        showBack={true}
        rightIcon={
          <TouchableOpacity onPress={shareReferralLink} style={styles.headerButton}>
            <Icon name="share" size={22} color={theme.COLORS.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.COLORS.primary]}
            tintColor={theme.COLORS.primary}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: theme.COLORS.white,
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    ...theme.SHADOWS.medium,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
    marginBottom: 2,
  },
  userBalance: {
    fontSize: 14,
    fontFamily: theme.FONTS.family.medium,
    color: theme.COLORS.success,
    marginBottom: 6,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  referralCodeText: {
    fontSize: 12,
    fontFamily: theme.FONTS.family.medium,
    color: theme.COLORS.primary,
    marginRight: 6,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.gray100,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  userStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 14,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.primary,
    marginBottom: 4,
  },
  userStatLabel: {
    fontSize: 10,
    color: theme.COLORS.textTertiary,
    fontFamily: theme.FONTS.family.regular,
  },
  userStatDivider: {
    width: 1,
    backgroundColor: theme.COLORS.borderLight,
    marginHorizontal: 8,
  },
  helpTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.warning + '10',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.warning + '20',
  },
  helpTipText: {
    flex: 1,
    fontSize: 12,
    color: theme.COLORS.textSecondary,
    fontFamily: theme.FONTS.family.regular,
    marginLeft: 8,
  },
  closeTipButton: {
    padding: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    ...theme.SHADOWS.small,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 14,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.COLORS.textTertiary,
    fontFamily: theme.FONTS.family.regular,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.COLORS.gray100,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: theme.FONTS.family.medium,
    color: theme.COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.COLORS.white,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
  },
  referralCard: {
    backgroundColor: theme.COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    ...theme.SHADOWS.small,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarText: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.COLORS.primary + '15',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontFamily: theme.FONTS.family.bold,
    color: theme.COLORS.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: theme.COLORS.textTertiary,
    marginBottom: 4,
  },
  schemeName: {
    fontSize: 12,
    color: theme.COLORS.primary,
    fontFamily: theme.FONTS.family.medium,
  },
  pendingSchemeName: {
    color: theme.COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: theme.COLORS.warning + '10',
  },
  completedBadge: {
    backgroundColor: theme.COLORS.success + '10',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: theme.FONTS.family.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.COLORS.textTertiary,
    fontFamily: theme.FONTS.family.regular,
    marginLeft: 6,
    marginRight: 8,
    width: 50,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: theme.COLORS.textPrimary,
    fontFamily: theme.FONTS.family.medium,
  },
  callButton: {
    padding: 4,
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.success + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  amountText: {
    fontSize: 12,
    color: theme.COLORS.success,
    fontFamily: theme.FONTS.family.semiBold,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.borderLight,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: theme.COLORS.textSecondary,
    fontFamily: theme.FONTS.family.medium,
    marginLeft: 4,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.COLORS.textTertiary,
  },
  referralCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  referralCodeBadgeText: {
    fontSize: 10,
    color: theme.COLORS.primary,
    fontFamily: theme.FONTS.family.medium,
    marginLeft: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.COLORS.textSecondary,
    fontFamily: theme.FONTS.family.regular,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: theme.FONTS.family.semiBold,
    color: theme.COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    ...theme.SHADOWS.small,
  },
  buttonText: {
    color: theme.COLORS.white,
    fontFamily: theme.FONTS.family.semiBold,
    fontSize: 14,
    marginLeft: 8,
  },
  headerButton: {
    padding: 8,
  },
});

export default ReferralPending;