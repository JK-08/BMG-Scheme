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
            <Text style={styles.loadingText}>Removing your data securely...</Text>
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
          {/* Warning Header */}
          <View style={styles.warningHeader}>
            <View style={styles.warningIcon}>
              <Icon name="warning" size={moderateScale(32)} color={COLORS.error} />
            </View>
            <Text style={styles.warningTitle}>Permanent Account Deletion</Text>
            <Text style={styles.warningSubtitle}>This action cannot be undone</Text>
          </View>

          {/* Main Warning */}
          <View style={styles.mainWarning}>
            <Text style={styles.mainWarningText}>
              All your personal data, transaction history, and account information will be permanently deleted from our systems.
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Before You Proceed</Text>

            {[
              { icon: 'info', text: 'All personal information and transaction history will be permanently deleted' },
              { icon: 'monetization-on', text: 'Digi Gold holdings will be liquidated at current market rates' },
              { icon: 'schedule', text: 'Proceeds will be transferred within 3-5 business days' },
              { icon: 'cancel', text: 'Active schemes and rewards points will be lost' },
              { icon: 'support-agent', text: 'Contact support for assistance with withdrawals' },
            ].map((item, idx) => (
              <View key={idx} style={styles.instructionItem}>
                <Icon name={item.icon} size={moderateScale(16)} color={COLORS.warning} />
                <Text style={styles.instructionText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Contact Support */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>Need help? Contact our support team</Text>
            <Text style={styles.supportEmail}>support@bmgjewellers.com</Text>
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
  contentContainer: { flexGrow: 1, padding: SIZES.padding.md, paddingBottom: verticalScale(40) },
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
  warningHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: verticalScale(20),
    borderWidth: 2,
    borderColor: COLORS.errorLight,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  warningIcon: { marginBottom: verticalScale(12) },
  warningTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.xl,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  warningSubtitle: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mainWarning: {
    backgroundColor: COLORS.errorLight + '20',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  mainWarningText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(22),
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  instructionsTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
    paddingLeft: moderateScale(4),
  },
  instructionText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
    flex: 1,
    marginLeft: moderateScale(12),
  },
  supportContainer: {
    backgroundColor: COLORS.infoLight + '20',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.infoLight,
  },
  supportText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    marginBottom: verticalScale(4),
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  supportEmail: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.info,
    textAlign: 'center',
  },
  actionsContainer: { marginTop: verticalScale(10) },
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
