import React, { useState } from 'react';
import {
  SafeAreaView,
  Alert,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MainTheme from '../../utils/MainTheme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '../../Config/API';
import { getUserData, clearUserData } from '../../utils/AsynchStorageHelper';

const { COLORS, SIZES, FONTS, verticalScale, moderateScale } = MainTheme;

function DeleteAccount() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const userData = await getUserData();
              if (!userData || !userData.id) throw new Error('User ID not found');

              const response = await fetch(`${API_BASE_URL}/user/delete/${userData.id}`, {
                method: 'DELETE',
              });

              const result = await response.json();

              if (response.ok) {
                await clearUserData();

                Alert.alert(
                  'Account Deleted Successfully',
                  result.message || 'Your account has been permanently deleted.',
                  [{ text: 'OK', onPress: () => navigation.replace('LoginPage') }]
                );
              } else {
                Alert.alert('Deletion Failed', result.message || 'Failed to delete account. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please check your connection and try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ImageBackground
          source={require('../../assets/image.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.error} />
            <Text style={styles.loadingText}>Securely removing your data...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/image.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <CommonHeader title="Delete Account" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Header */}
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>Delete My Account Permanently</Text>
            <View style={styles.headerIconContainer}>
              <Icon name="delete-forever" size={moderateScale(28)} color={COLORS.error} />
            </View>
          </View>

          {/* Important Notice */}
          <View style={styles.noticeContainer}>
            <View style={styles.noticeHeader}>
              <Icon name="warning" size={moderateScale(24)} color={COLORS.warning} />
              <Text style={styles.noticeTitle}>⚠️ Important Notice</Text>
            </View>
            <Text style={styles.noticeDescription}>
              Deleting your account is permanent and irreversible.
            </Text>
            
            <View style={styles.warningList}>
              {[
                'Your profile and login access will be permanently removed',
                'All personal data linked to your account will be deleted as per our data retention policy',
                'Unused benefits, bonuses, or rewards will be forfeited',
                'Transaction history may not be recoverable after deletion'
              ].map((item, index) => (
                <View key={index} style={styles.warningItem}>
                  <Icon name="close" size={moderateScale(16)} color={COLORS.error} />
                  <Text style={styles.warningText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Before You Proceed Section */}
          <View style={styles.beforeProceedContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="check-circle" size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>📌 Before You Proceed</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Please ensure that:
            </Text>
            
            <View style={styles.checklist}>
              {[
                'All active schemes are completed or closed',
                'All outstanding dues are cleared',
                'Any pending redemption / delivery is completed'
              ].map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>•</Text>
                  </View>
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.noteBox}>
              <Icon name="info" size={moderateScale(16)} color={COLORS.warning} />
              <Text style={styles.noteText}>
                If you have an active scheme or pending balance, account deletion may not be allowed.
              </Text>
            </View>
          </View>

          {/* Data & Compliance Note */}
          <View style={styles.complianceContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="policy" size={moderateScale(20)} color={COLORS.textSecondary} />
              <Text style={styles.sectionTitle}>Data & Compliance Note</Text>
            </View>
            <View style={styles.complianceItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>•</Text>
              </View>
              <Text style={styles.complianceText}>
                Certain transaction records may be retained for legal, audit, or regulatory purposes as required by law.
              </Text>
            </View>
          </View>

          {/* Need Help Section */}
          <View style={styles.helpContainer}>
            <View style={styles.helpHeader}>
              <Icon name="help-outline" size={moderateScale(24)} color={COLORS.info} />
              <Text style={styles.helpTitle}>❓ Need Help?</Text>
            </View>
            <Text style={styles.helpDescription}>
              If you are facing issues or have concerns, we recommend contacting our support team before deleting your account.
            </Text>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Icon name="phone" size={moderateScale(18)} color={COLORS.primary} />
                <Text style={styles.contactText}>Customer Support : +91-7094670946</Text>
              </View>
              <View style={styles.contactItem}>
                <Icon name="email" size={moderateScale(18)} color={COLORS.primary} />
                <Text style={styles.contactText}>Email : contact@bmgjewellers.in</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              <Icon name="delete-forever" size={moderateScale(20)} color={COLORS.white} />
              <Text style={styles.deleteButtonText}>
                {loading ? 'Deleting Account...' : 'Delete Account Permanently'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { 
    flexGrow: 1, 
    padding: SIZES.padding.md, 
    paddingBottom: verticalScale(40) 
  },
  loadingContainer: { flex: 1 },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginTop: verticalScale(16),
  },
  
  // Main Header
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: verticalScale(20),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainTitle: {
    flex: 1,
    fontFamily: FONTS.family.heading,
    fontSize: SIZES.font.xl,
    color: COLORS.error,
    marginRight: moderateScale(10),
  },
  headerIconContainer: {
    backgroundColor: COLORS.error + '20',
    borderRadius: 50,
    padding: moderateScale(8),
  },
  
  // Notice Container
  noticeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.warningLight,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  noticeTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.warning,
    marginLeft: moderateScale(8),
  },
  noticeDescription: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(16),
    lineHeight: verticalScale(22),
  },
  warningList: {
    marginTop: verticalScale(8),
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  warningText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
    flex: 1,
    marginLeft: moderateScale(10),
  },
  
  // Before Proceed Section
  beforeProceedContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(8),
  },
  sectionDescription: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: verticalScale(12),
  },
  checklist: {
    marginLeft: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  bulletPoint: {
    width: moderateScale(20),
    alignItems: 'center',
  },
  bulletText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
  },
  checklistText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight + '20',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(8),
    fontStyle: 'italic',
    lineHeight: verticalScale(18),
  },
  
  // Compliance Container
  complianceContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  complianceText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(20),
    marginLeft: moderateScale(8),
  },
  
  // Help Container
  helpContainer: {
    backgroundColor: COLORS.infoLight + '15',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.infoLight,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  helpTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.info,
    marginLeft: moderateScale(8),
  },
  helpDescription: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(16),
    lineHeight: verticalScale(22),
  },
  contactInfo: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  contactText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(12),
  },
  
  // Action Buttons
  actionsContainer: { 
    marginTop: verticalScale(10) 
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(12),
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.white,
    marginLeft: moderateScale(8),
  },
  cancelButton: {
    padding: SIZES.padding.md,
    alignItems: 'center',
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.primary,
  },
});

export default DeleteAccount;