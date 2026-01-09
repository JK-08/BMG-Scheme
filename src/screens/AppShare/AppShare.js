import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
  Clipboard,
  RefreshControl,
} from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import theme from "../../utils/AppTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL_OLD } from "../../Config/API";

const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.bmg.bmgscheme";

const ReferralShareScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
  });
  const [userId, setUserId] = useState(null);

  // Load userId on component mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) {
          setUserId(id);
        } else {
          Alert.alert("Error", "User ID not found. Please login again.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading userId:", error);
        Alert.alert("Error", "Failed to load user data");
        setLoading(false);
      }
    };
    loadUserId();
  }, []);

  // Fetch data when userId is available
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const API_URL = `${API_BASE_URL_OLD}/account/referrals/${userId}`;
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      setData(json);
      
      // Process referral stats from API response
      if (json?.referrals) {
        setReferralStats({
          totalReferrals: json.referrals.length,
          successfulReferrals: json.referrals.filter(r => r.status === 'completed' || r.status === 'successful').length,
          pendingReferrals: json.referrals.filter(r => r.status === 'pending').length,
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      Alert.alert(
        "Connection Error",
        "Unable to load referral data. Please check your internet connection.",
        [{ text: "Retry", onPress: () => fetchData() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Fetch data when userId changes
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const onRefresh = useCallback(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Get referral link and code from data
  const referralLink = data?.referrer?.referralLink || "";
  const referralCode = data?.referrer?.referral_code || "";

  // Generate the share message
  const getShareMessage = useCallback(() => {
    return `🌟 Join BMG Jewellery Schemes! 🌟\n\nUse my referral code: ${referralCode}\n\nGet exclusive benefits and start your gold savings journey with BMG Bright, BMG Fixed and SmartPay schemes.\n\n🔗 Referral Link: ${referralLink}\n\n📱 Download the App: ${PLAY_STORE_LINK}\n\n#BMGJewellery #GoldSavings #Referral`;
  }, [referralCode, referralLink]);

  const handleShareNormal = async () => {
    try {
      await Share.share({
        message: getShareMessage(),
        title: 'BMG Jewellery Referral',
      });
    } catch (error) {
      Alert.alert("Error", "Failed to open share options");
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const message = getShareMessage();
      const encodedMessage = encodeURIComponent(message);
      const url = `whatsapp://send?text=${encodedMessage}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp Not Installed",
          "Would you like to install WhatsApp?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Install", 
              onPress: () => Linking.openURL(
                Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
                  : 'market://details?id=com.whatsapp'
              )
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  };

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      Alert.alert("Error", "Referral code not available");
      return;
    }
    
    try {
      await Clipboard.setString(referralCode);
      Alert.alert("Copied!", "Referral code copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy referral code");
    }
  };

  const handleCopyReferralLink = async () => {
    if (!referralLink) {
      Alert.alert("Error", "Referral link not available");
      return;
    }
    
    try {
      await Clipboard.setString(referralLink);
      Alert.alert("Copied!", "Referral link copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy referral link");
    }
  };

  const handleCopyPlayStoreLink = async () => {
    try {
      await Clipboard.setString(PLAY_STORE_LINK);
      Alert.alert("Copied!", "Play Store link copied to clipboard");
    } catch (error) {
      Alert.alert("Error", "Failed to copy Play Store link");
    }
  };

  const handleShareSMS = () => {
    const message = getShareMessage();
    const encodedMessage = encodeURIComponent(message);
    const url = `sms:?body=${encodedMessage}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open messaging app")
    );
  };

  const handleShareEmail = () => {
    const subject = "BMG Jewellery Referral - Exclusive Gold Savings Schemes";
    const body = `Hello!

I wanted to share an amazing opportunity with you from BMG Jewellery!

🌟 Join BMG Jewellery Schemes using my referral code: ${referralCode}

With BMG Bright, BMG Fixed and SmartPay schemes, you can:
• Save gold systematically
• Earn exclusive benefits
• Get flexible payment options
• Enjoy guaranteed returns

🔗 Referral Link: ${referralLink}

📱 Download the App: ${PLAY_STORE_LINK}

Let's grow our savings together!

Best regards`;

    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open email client")
    );
  };

  const handleOpenPlayStore = () => {
    Linking.openURL(PLAY_STORE_LINK).catch(() =>
      Alert.alert("Error", "Unable to open Play Store")
    );
  };

  const handleViewWebView = () => {
    setShowWebView(true);
  };

  const handleBackFromWebView = () => {
    setShowWebView(false);
  };

  if (showWebView) {
    return (
      <View style={styles.webViewContainer}>
        <CommonHeader 
          title="Scheme Details" 
          showBackButton={true}
          onBackPress={handleBackFromWebView}
        />
        <WebView 
          source={{ uri: "https://bmgjewellers.com/scheme" }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.COLORS.primary} />
            </View>
          )}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  // Check if data is available
  if (!data || !referralCode || !referralLink) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Refer & Earn" />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.COLORS.primary]}
              tintColor={theme.COLORS.primary}
            />
          }
        >
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={theme.COLORS.error} />
            <Text style={styles.errorTitle}>Unable to Load Data</Text>
            <Text style={styles.errorText}>
              Please check your internet connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Refer & Earn" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.COLORS.primary]}
            tintColor={theme.COLORS.primary}
          />
        }
      >

        {/* Referral Code Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          
          <TouchableOpacity
            style={styles.referralCodeContainer}
            onPress={handleCopyReferralCode}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.COLORS.gradient.gold}
              style={styles.referralCodeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.referralCodeText}>{referralCode}</Text>
              <MaterialIcons 
                name="content-copy" 
                size={theme.SIZES.icon.md} 
                color={theme.COLORS.white} 
              />
            </LinearGradient>
            <Text style={styles.referralCodeHint}>Tap to copy</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Link Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Referral Link</Text>
          
          <View style={styles.referralLinkContainer}>
            <Text style={styles.referralLinkText} numberOfLines={2}>
              {referralLink}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyReferralLink}
            >
              <MaterialIcons 
                name="content-copy" 
                size={theme.SIZES.icon.sm} 
                color={theme.COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Play Store Link Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Download App</Text>
          
          <View style={styles.playStoreContainer}>
            <View style={styles.playStoreInfo}>
              <Ionicons name="logo-google-playstore" size={24} color={theme.COLORS.primary} />
              <View style={styles.playStoreTextContainer}>
                <Text style={styles.playStoreTitle}>BMG Schemes App</Text>
                <Text style={styles.playStoreLink} numberOfLines={1}>
                  {PLAY_STORE_LINK}
                </Text>
              </View>
            </View>
            <View style={styles.playStoreButtons}>
              <TouchableOpacity
                style={styles.playStoreButton}
                onPress={handleOpenPlayStore}
              >
                <Text style={styles.playStoreButtonText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playStoreButton}
                onPress={handleCopyPlayStoreLink}
              >
                <MaterialIcons 
                  name="content-copy" 
                  size={theme.SIZES.icon.sm} 
                  color={theme.COLORS.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Share Options Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Share Your Referral</Text>
          <Text style={styles.sectionSubtitle}>
            Share your referral code and Play Store link to invite friends
          </Text>

          <View style={styles.shareButtonsContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareWhatsApp}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                style={styles.shareButtonGradient}
              >
                <Ionicons name="logo-whatsapp" size={24} color={theme.COLORS.white} />
                <Text style={styles.shareButtonText}>WhatsApp</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareNormal}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.COLORS.gradient.primary}
                style={styles.shareButtonGradient}
              >
                <Ionicons name="share-social" size={24} color={theme.COLORS.white} />
                <Text style={styles.shareButtonText}>All Apps</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareSMS}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#34B7F1', '#34B7F1']}
                style={styles.shareButtonGradient}
              >
                <Ionicons name="chatbubble" size={24} color={theme.COLORS.white} />
                <Text style={styles.shareButtonText}>SMS</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareEmail}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EA4335', '#D14836']}
                style={styles.shareButtonGradient}
              >
                <Ionicons name="mail" size={24} color={theme.COLORS.white} />
                <Text style={styles.shareButtonText}>Email</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            {[
              { icon: 'person-add', text: 'Share your referral code with friends' },
              { icon: 'link', text: 'They use your code to join BMG schemes' },
              { icon: 'card-giftcard', text: 'You earn rewards when they make deposits' },
              { icon: 'trending-up', text: 'Track your earnings in real-time' },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <MaterialIcons 
                    name={step.icon} 
                    size={theme.SIZES.icon.md} 
                    color={theme.COLORS.primary} 
                  />
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Scheme Info Section */}
        <View style={styles.schemeSection}>
          <LinearGradient
            colors={theme.COLORS.gradient.primaryDark}
            style={styles.schemeGradient}
          >
            <Text style={styles.schemeTitle}>BMG Jewellery Schemes</Text>
            <Text style={styles.schemeDescription}>
              Explore our flexible gold saving schemes like BMG BRIGHT, BMG FIXED and SMARTPAY. 
              Start saving today and enjoy exclusive benefits including guaranteed 
              returns and flexible payment options.
            </Text>
            
            <View style={styles.schemeFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color={theme.COLORS.white} />
                <Text style={styles.featureText}>Secure & Trusted</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="cash" size={20} color={theme.COLORS.white} />
                <Text style={styles.featureText}>Flexible Payments</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="gift" size={20} color={theme.COLORS.white} />
                <Text style={styles.featureText}>Bonus Rewards</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.schemeButton}
              onPress={handleViewWebView}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.COLORS.white, theme.COLORS.gray100]}
                style={styles.schemeButtonGradient}
              >
                <Ionicons 
                  name="information-circle" 
                  size={theme.SIZES.icon.md} 
                  color={theme.COLORS.primary} 
                />
                <Text style={styles.schemeButtonText}>View Scheme Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Referral rewards are subject to scheme terms{'\n'}
            • Minimum deposit required for reward eligibility{'\n'}
            • Rewards are credited after successful completion{'\n'}
            • BMG reserves the right to modify terms{'\n'}
            • For queries, contact support@bmgjewellers.com
          </Text>
        </View>
      </ScrollView>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.margin.md,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  webView: {
    flex: 1,
  },
  statsContainer: {
    marginHorizontal: theme.SIZES.margin.lg,
    marginTop: theme.SIZES.margin.lg,
    borderRadius: theme.SIZES.radius.lg,
    overflow: 'hidden',
    ...theme.SHADOWS.md,
  },
  statsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.SIZES.padding.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.COLORS.whiteOpacity50,
  },
  statValue: {
    ...theme.FONTS.h2,
    color: theme.COLORS.white,
    fontWeight: 'bold',
  },
  statLabel: {
    ...theme.FONTS.caption,
    color: theme.COLORS.white,
    marginTop: theme.SIZES.margin.xs,
    opacity: 0.9,
  },
  sectionContainer: {
    marginHorizontal: theme.SIZES.margin.lg,
    marginTop: theme.SIZES.margin.xl,
  },
  sectionTitle: {
    ...theme.FONTS.h4,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.margin.sm,
  },
  sectionSubtitle: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginBottom: theme.SIZES.margin.lg,
  },
  referralCodeContainer: {
    alignItems: 'center',
  },
  referralCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.SIZES.padding.xl,
    paddingVertical: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.md,
    width: '100%',
    ...theme.SHADOWS.sm,
  },
  referralCodeText: {
    ...theme.FONTS.h2,
    color: theme.COLORS.white,
    marginRight: theme.SIZES.margin.md,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  referralCodeHint: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textTertiary,
    marginTop: theme.SIZES.margin.sm,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.backgroundSecondary,
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  referralLinkText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    flex: 1,
  },
  copyButton: {
    padding: theme.SIZES.padding.xs,
    marginLeft: theme.SIZES.margin.sm,
  },
  playStoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.COLORS.backgroundSecondary,
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  playStoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playStoreTextContainer: {
    marginLeft: theme.SIZES.margin.md,
    flex: 1,
  },
  playStoreTitle: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.margin.xs,
  },
  playStoreLink: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textSecondary,
  },
  playStoreButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playStoreButton: {
    padding: theme.SIZES.padding.sm,
    marginLeft: theme.SIZES.margin.sm,
    backgroundColor: theme.COLORS.primaryLight,
    borderRadius: theme.SIZES.radius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  playStoreButtonText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.white,
    fontWeight: 'bold',
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.SIZES.margin.sm,
  },
  shareButton: {
    width: '48%',
    marginBottom: theme.SIZES.margin.md,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.md,
    ...theme.SHADOWS.sm,
  },
  shareButtonText: {
    ...theme.FONTS.button,
    color: theme.COLORS.white,
    marginLeft: theme.SIZES.margin.sm,
  },
  stepsContainer: {
    marginTop: theme.SIZES.margin.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SIZES.margin.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SIZES.margin.md,
  },
  stepNumberText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.white,
    fontWeight: 'bold',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.margin.md,
    flex: 1,
  },
  schemeSection: {
    marginHorizontal: theme.SIZES.margin.lg,
    marginTop: theme.SIZES.margin.xxl,
    borderRadius: theme.SIZES.radius.lg,
    overflow: 'hidden',
    ...theme.SHADOWS.lg,
  },
  schemeGradient: {
    padding: theme.SIZES.padding.xl,
  },
  schemeTitle: {
    ...theme.FONTS.h3,
    color: theme.COLORS.white,
    marginBottom: theme.SIZES.margin.md,
  },
  schemeDescription: {
    ...theme.FONTS.body,
    color: theme.COLORS.white,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: theme.SIZES.margin.lg,
  },
  schemeFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.SIZES.margin.xl,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.white,
    marginTop: theme.SIZES.margin.xs,
    textAlign: 'center',
  },
  schemeButton: {
    borderRadius: theme.SIZES.radius.md,
    overflow: 'hidden',
  },
  schemeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.SIZES.padding.lg,
  },
  schemeButtonText: {
    ...theme.FONTS.button,
    color: theme.COLORS.primary,
    marginLeft: theme.SIZES.margin.sm,
  },
  termsContainer: {
    marginHorizontal: theme.SIZES.margin.lg,
    marginTop: theme.SIZES.margin.xl,
    marginBottom: theme.SIZES.margin.xxl,
    padding: theme.SIZES.padding.lg,
    backgroundColor: theme.COLORS.backgroundSecondary,
    borderRadius: theme.SIZES.radius.md,
  },
  termsTitle: {
    ...theme.FONTS.h5,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.margin.md,
  },
  termsText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    lineHeight: 20,
  },
   errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SIZES.padding.xl,
    marginTop: theme.SIZES.margin.xxl,
  },
  errorTitle: {
    ...theme.FONTS.h4,
    color: theme.COLORS.error,
    marginTop: theme.SIZES.margin.lg,
    marginBottom: theme.SIZES.margin.sm,
  },
  errorText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: theme.SIZES.margin.xl,
  },
  retryButton: {
    backgroundColor: theme.COLORS.primary,
    paddingHorizontal: theme.SIZES.padding.xl,
    paddingVertical: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
  },
  retryButtonText: {
    ...theme.FONTS.button,
    color: theme.COLORS.white,
  },
});

export default ReferralShareScreen;