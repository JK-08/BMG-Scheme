// screens/AadhaarVerificationScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import theme from "../../utils/AppTheme";
import { validateAadhaar } from "../../screens/AddNewMember/Validations";
import { aadhaarService } from "../../services/DigiLockerService";
import CommonHeader from "../CommonHeader/CommonHeader";

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

const AadhaarVerificationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { onVerificationComplete, existingAadhaar } = route.params || {};
  
  const [aadhaarNumber, setAadhaarNumber] = useState(existingAadhaar || "");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate verification ID on component mount
  useEffect(() => {
    const newVerificationId = aadhaarService.generateVerificationId();
    setVerificationId(newVerificationId);
  }, []);

  const formatAadhaarInput = (value) => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setAadhaarNumber(formatted);
    setError("");
  };

  const validateAndInitiateVerification = async () => {
    const aadhaarWithoutSpaces = aadhaarNumber.replace(/\s/g, '');
    const validationError = validateAadhaar(aadhaarWithoutSpaces);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create verification request
      const redirectUrl = "bmgjewellers://digilocker-callback";
      
      const result = await aadhaarService.createVerification({
        verification_id: verificationId,
        redirect_url: redirectUrl,
        user_flow: "signup"
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to initiate verification");
      }

      // Navigate to WebView screen
      navigation.navigate("DigiLockerWebViewScreen", {
        verificationUrl: result.verificationUrl,
        verificationId: verificationId,
        onVerificationComplete: (verifiedData) => {
          // Pass the extracted data back to the main form
          if (onVerificationComplete) {
            onVerificationComplete({
              ...verifiedData,
              aadhaarVerified: true,
              aadhaarVerificationId: verificationId,
              aadhaarVerifiedAt: new Date().toISOString()
            });
          }
          
          navigation.goBack();
        }
      });
      
    } catch (error) {
      console.error('Verification initiation error:', error);
      setError(error.message || "Failed to start verification");
      Alert.alert("Error", error.message || "Failed to start verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    if (onVerificationComplete) {
      onVerificationComplete({
        idProofNo: aadhaarService.formatAadhaarNumber(aadhaarNumber.replace(/\s/g, '')),
        aadhaarVerified: false
      });
    }
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader
        title="Aadhaar Verification"
        subtitle="Verify your identity securely through DigiLocker"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <View style={styles.stepIcon}>
            <Text style={styles.stepIconText}>🔐</Text>
          </View>
          
          <Text style={styles.stepTitle}>Secure Aadhaar Verification</Text>
          <Text style={styles.stepDescription}>
            Verify your Aadhaar securely through DigiLocker, Government of India's digital document wallet.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Instant verification</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Auto-fill your details</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>100% secure & encrypted</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Aadhaar Number *</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={aadhaarNumber}
              onChangeText={formatAadhaarInput}
              placeholder="XXXX XXXX XXXX"
              keyboardType="number-pad"
              maxLength={14}
              editable={!isLoading}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.hintText}>
                Enter 12-digit Aadhaar number without spaces
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={validateAndInitiateVerification}
            disabled={isLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify via DigiLocker</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={handleManualEntry}
          >
            <Text style={styles.manualEntryText}>Enter Details Manually</Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>
              Your Aadhaar data is processed securely through DigiLocker and is not stored on our servers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding.lg,
  },
  stepContainer: {
    padding: SIZES.padding.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.sm,
  },
  stepIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SIZES.margin.lg,
  },
  stepIconText: {
    fontSize: 35,
  },
  stepTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
    textAlign: 'center',
  },
  stepDescription: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin.xl,
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: COLORS.successLight + '10',
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.xl,
  },
  benefitsTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.success,
    fontWeight: FONTS.weight.bold,
    marginBottom: SIZES.margin.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
  },
  benefitIcon: {
    marginRight: SIZES.margin.sm,
  },
  benefitText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: SIZES.margin.xl,
  },
  inputLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  input: {
    ...COMMON_STYLES.input.default,
    paddingVertical: SIZES.padding.md,
    fontSize: SIZES.font.lg,
    letterSpacing: 1,
  },
  inputError: {
    ...COMMON_STYLES.input.error,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
  },
  hintText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginTop: SIZES.margin.xs,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin.md,
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  verifyButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  manualEntryButton: {
    paddingVertical: SIZES.padding.md,
    alignItems: 'center',
  },
  manualEntryText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SIZES.margin.xl,
    padding: SIZES.padding.md,
    backgroundColor: COLORS.infoLight + '10',
    borderRadius: SIZES.radius.md,
  },
  securityIcon: {
    marginRight: SIZES.margin.sm,
    marginTop: 2,
  },
  securityText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});

export default AadhaarVerificationScreen;