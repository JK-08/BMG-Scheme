import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextDefault } from '../../components';
import { COLORS, SIZES, FONTS, moderateScale } from '../../utils/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function ProductCard({ productData, navigation }) {
  // If productData is an array, take the first item (for single card display)
  // If it's a single object, use it directly
  const item = Array.isArray(productData) ? productData[0] : productData;

  if (!item) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="inbox" size={40} color={COLORS.gray} />
        <TextDefault style={styles.emptyText}>No product data</TextDefault>
      </View>
    );
  }

  const { pname, regNo, groupCode, maturityDate, schemeSummary, personalInfo, status } = item;
  const isActive = status === 'Active';

  // Determine scheme type and whether to show weight or amount
  const schemeSName = schemeSummary?.schemeSName;
  const isWeightLedger = schemeSummary?.weightLedger === 'Y';
  
  // Scheme type checks
  const isBMGAmountScheme = schemeSName === 'BAS';
  const isBMGDigiSilver = schemeSName === 'BDS';
  const isBMGFixedDeposit = schemeSName === 'BFD';

  // Calculate installment values
  const paidInstallments = parseInt(schemeSummary?.schemaSummaryTransBalance?.insPaid) || 0;
  const totalInstallments = parseInt(schemeSummary?.instalment) || 0;
  const isInstallmentCompleted = paidInstallments >= totalInstallments;

  // Determine what to display based on weightLedger flag
  let statValue1, statLabel1;
  
  if (isWeightLedger) {
    // Show weight for silver schemes
    statValue1 = `${schemeSummary?.totalWeight || 0}g`;
    statLabel1 = 'Total Silver';
  } else if (isBMGAmountScheme) {
    // Show installments for amount schemes
    statValue1 = `${paidInstallments}/${totalInstallments}`;
    statLabel1 = 'Installments';
  } else {
    // Show amount received for other schemes
    statValue1 = `₹${parseFloat(schemeSummary?.schemaSummaryTransBalance?.amtrecd || 0).toLocaleString('en-IN')}`;
    statLabel1 = 'Amount Saved';
  }

  const totalAmount = `₹${parseFloat(schemeSummary?.schemaSummaryTransBalance?.amtrecd || 0).toLocaleString('en-IN')}`;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewDetails = () => {
    navigation.navigate('ProductDescription', {
      productData: item,
      status: item.status,
      accountDetails: {
        schemeSummary: item.schemeSummary,
        personalInfo: item.personalInfo
      },
    });
  };

  const handlePayNow = () => {
    const isDigiSilverPlan = isBMGDigiSilver;

    console.log('Navigating to Buy with data:', {
      productData: item,
      status: item.status,
      accountDetails: {
        schemeSummary: item.schemeSummary,
        personalInfo: item.personalInfo
      },
      isDigiSilverPlan,
    });

    navigation.navigate('Buy', {
      productData: item,
      status: item.status,
      accountDetails: {
        schemeSummary: item.schemeSummary,
        personalInfo: item.personalInfo
      },
      isDigiSilverPlan,
    });
  };

  // Determine if Pay Now button should be shown
  // Hide Pay Now for: inactive cards, fixed deposits, or completed installments
  const shouldShowPayNow = isActive && 
                          !isBMGFixedDeposit && 
                          !(isBMGAmountScheme && isInstallmentCompleted);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleViewDetails}
      style={[styles.cardContainer, !isActive && styles.inactiveCard]}
    >
      <LinearGradient
        colors={isActive ? COLORS.gradientPrimary : ['#bdc3c7', '#95a5a6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBadge}>
              <MaterialIcons 
                name="account-balance" 
                size={18} 
                color={isActive ? COLORS.primary : COLORS.gray} 
              />
            </View>
            <View style={styles.headerInfo}>
              <TextDefault style={styles.schemeCode}>
                {groupCode} - {regNo}
              </TextDefault>
              <TextDefault style={styles.schemeName} numberOfLines={1}>
                {schemeSummary?.schemeName || pname}
              </TextDefault>
            </View>
          </View>
          
          {status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: isActive ? COLORS.success : COLORS.danger }
            ]}>
              <TextDefault style={styles.statusText}>{status}</TextDefault>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialIcons 
              name={isWeightLedger ? "scale" : "event-note"} 
              size={20} 
              color={isActive ? "rgba(255,255,255,0.9)" : "#7f8c8d"} 
            />
            <TextDefault style={[styles.statLabel, { color: isActive ? 'rgba(255,255,255,0.9)' : '#7f8c8d' }]}>
              {statLabel1}
            </TextDefault>
            <TextDefault style={[styles.statValue, { color: isActive ? COLORS.white : '#7f8c8d' }]}>
              {statValue1}
            </TextDefault>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons 
              name="payments" 
              size={20} 
              color={isActive ? "rgba(255,255,255,0.9)" : "#7f8c8d"} 
            />
            <TextDefault style={[styles.statLabel, { color: isActive ? 'rgba(255,255,255,0.9)' : '#7f8c8d' }]}>
              {isWeightLedger ? 'Silver Value' : 'Total Amount'}
            </TextDefault>
            <TextDefault style={[styles.statValue, { color: isActive ? COLORS.white : '#7f8c8d' }]}>
              {totalAmount}
            </TextDefault>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons 
              name="event" 
              size={20} 
              color={isActive ? "rgba(255,255,255,0.9)" : "#7f8c8d"} 
            />
            <TextDefault style={[styles.statLabel, { color: isActive ? 'rgba(255,255,255,0.9)' : '#7f8c8d' }]}>
              Maturity
            </TextDefault>
            <TextDefault 
              style={[styles.statValue, { color: isActive ? COLORS.white : '#7f8c8d' }]} 
              numberOfLines={1}
            >
              {formatDate(maturityDate)}
            </TextDefault>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, !shouldShowPayNow && styles.fullWidthButton]}
            onPress={handleViewDetails}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="visibility" 
              size={16} 
              color={isActive ? COLORS.primary : COLORS.gray} 
            />
            <TextDefault style={[
              styles.actionButtonText, 
              { color: isActive ? COLORS.primary : COLORS.gray }
            ]}>
              View Details
            </TextDefault>
          </TouchableOpacity>

          {shouldShowPayNow && (
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={handlePayNow}
              activeOpacity={0.7}
            >
              <MaterialIcons name="payment" size={16} color={COLORS.white} />
              <TextDefault style={styles.payButtonText}>Pay Now</TextDefault>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
    margin: moderateScale(8),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: SIZES.radius_lg,
  },
  emptyText: {
    color: COLORS.gray,
    marginTop: moderateScale(10),
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
  cardContainer: {
    margin: moderateScale(15),
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveCard: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gradientBackground: {
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(16),
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: moderateScale(12),
  },
  iconBadge: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  schemeCode: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    opacity: 0.9,
    marginBottom: moderateScale(2),
    ...FONTS.subheading,
  },
  schemeName: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    ...FONTS.body1,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    color: COLORS.white,
    fontSize: moderateScale(10),
    fontWeight: '700',
    ...FONTS.body1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SIZES.radius,
    padding: moderateScale(12),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: moderateScale(4),
  },
  statLabel: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    textAlign: 'center',
    ...FONTS.body1,
  },
  statValue: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textAlign: 'center',
    ...FONTS.body1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: moderateScale(8),
  },
  actionContainer: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom: moderateScale(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(10),
    gap: moderateScale(6),
  },
  fullWidthButton: {
    flex: 0,
    width: '100%',
  },
  payButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    ...FONTS.body1,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '700',
    ...FONTS.body1,
  },
});

export default ProductCard;