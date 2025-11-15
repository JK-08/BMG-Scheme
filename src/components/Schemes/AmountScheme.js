import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
} from "react-native";
import appTheme from "../../utils/MainTheme";
import CustomPicker from "../../screens/AddNewMember/CustomPicker";

const { COLORS, SIZES, FONTS } = appTheme;

const AmountScheme = ({
  formData,
  updateFormData,
  validationErrors = {},
  setValidationErrors,
  isSubmitting,
  API_BASE_URL_OLD,
  numericSchemeId,
}) => {
  const [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch amounts when scheme changes
  useEffect(() => {
    const fetchAmounts = async () => {
      console.log("Fetching amounts for BMG AMOUNT SCHEME (ID: 1)");
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
        );
        
        console.log("Amounts API Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch amounts. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched amounts data:", data);
        
        const formattedAmounts = data.map((item) => ({
          value: item.AMOUNT.toString(),
          groupCode: item.GROUPCODE,
          currentRegNo: item.CURRENTREGNO,
        }));

        console.log("Formatted amounts:", formattedAmounts);
        setAmounts(formattedAmounts);
      } catch (error) {
        console.error("Error fetching amounts:", error);
        setAmounts([]);
        Alert.alert(
          "Connection Error",
          "Unable to fetch scheme amounts. Please check your connection and try again.",
          [{ text: "OK", style: "default" }]
        );
      } finally {
        setLoading(false);
      }
    };

    if (numericSchemeId) {
      fetchAmounts();
    }
  }, [numericSchemeId, API_BASE_URL_OLD]);

  const handleAmountSelection = (itemValue) => {
    console.log("Selected amount value:", itemValue);
    const selectedAmount = amounts.find((amt) => amt.value === itemValue);
    console.log("Selected amount object:", selectedAmount);
    
    updateFormData('amount', itemValue);
    if (selectedAmount) {
      updateFormData('selectedGroupCodeObj', selectedAmount.groupCode);
      updateFormData('selectedCurrentRegNoObj', selectedAmount.currentRegNo);
    }
  };

  // Validate Amount Scheme specific fields
  useEffect(() => {
    const errors = { ...validationErrors };
    
    if (!formData?.amount) {
      errors.amount = "Please select an amount";
    } else {
      delete errors.amount;
    }

    setValidationErrors(errors);
  }, [formData?.amount]);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_OLD}/member/schemeid?schemeId=${numericSchemeId}`
      );
      if (response.ok) {
        const data = await response.json();
        const formattedAmounts = data.map((item) => ({
          value: item.AMOUNT.toString(),
          groupCode: item.GROUPCODE,
          currentRegNo: item.CURRENTREGNO,
        }));
        setAmounts(formattedAmounts);
      } else {
        throw new Error("Failed to fetch amounts");
      }
    } catch (error) {
      console.error("Error re-fetching amounts:", error);
      Alert.alert(
        "Retry Failed", 
        "Unable to load amounts. Please check your connection.", 
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
        }
      ]}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.label}>
          Investment Amount
        </Text>
        <Text style={styles.asterisk}>*</Text>
      </View>
      
      <Text style={styles.subLabel}>
        Select your preferred investment amount from available options
      </Text>

      {/* Content Section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={COLORS.primary} 
            style={styles.loader} 
          />
          <Text style={styles.loadingText}>
            Loading available amounts...
          </Text>
        </View>
      ) : amounts.length > 0 ? (
        <View style={styles.pickerContainer}>
          <CustomPicker
            selectedValue={formData?.amount || ''}
            onValueChange={handleAmountSelection}
            items={[
              
              ...amounts.map((amt) => ({
                label: `₹${Number(amt.value).toLocaleString()} • ${amt.groupCode}`,
                value: amt.value
              }))
            ]}
            placeholder="Choose amount"
            enabled={!isSubmitting}
          />
          {formData?.amount && (
            <View style={styles.selectedAmountInfo}>
              <Text style={styles.amountInfoText}>
                Selected: <Text style={styles.amountHighlight}>₹{Number(formData.amount).toLocaleString()}</Text>
              </Text>
              <View style={styles.successIndicator}>
                <Text style={styles.successIndicatorText}>✓</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>💸</Text>
          <Text style={styles.noDataTitle}>
            No Amounts Available
          </Text>
          <Text style={styles.noDataText}>
            Currently no investment amounts are available for this scheme.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.retryText}>
                Try Again
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Error Message */}
      {validationErrors?.amount && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {validationErrors.amount}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  label: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    marginRight: SIZES.xs,
    lineHeight: SIZES.font.lg * 1.4,
  },
  asterisk: {
    fontSize: SIZES.font.lg,
    color: COLORS.danger,
    fontFamily: FONTS.family.bodyBold,
    lineHeight: SIZES.font.lg,
  },
  subLabel: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: SIZES.font.sm * 1.6,
  },
  pickerContainer: {
    marginBottom: SIZES.xs,
  },
  selectedAmountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.sm,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.success,
  },
  amountInfoText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.sm * 1.4,
    flex: 1,
  },
  amountHighlight: {
    color: COLORS.primary,
    fontFamily: FONTS.family.bodyBold,
  },
  successIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.xs,
  },
  successIndicatorText: {
    color: COLORS.white,
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.bodyBold,
    lineHeight: SIZES.font.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius.md,
  },
  loader: {
    marginRight: SIZES.sm,
  },
  loadingText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textTertiary,
    lineHeight: SIZES.font.sm * 1.4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius.md,
  },
  noDataIcon: {
    fontSize: SIZES.font.xl,
    marginBottom: SIZES.sm,
  },
  noDataTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
    lineHeight: SIZES.font.md * 1.4,
  },
  noDataText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
    lineHeight: SIZES.font.sm * 1.6,
    paddingHorizontal: SIZES.md,
  },
  retryButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  retryText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    letterSpacing: 0.3,
    lineHeight: SIZES.font.sm * 1.4,
  },
  errorContainer: {
    marginTop: SIZES.sm,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.error,
    lineHeight: SIZES.font.sm * 1.4,
  },
});

export default AmountScheme;