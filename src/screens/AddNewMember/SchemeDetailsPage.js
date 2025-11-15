import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  ImageBackground
} from "react-native";
import appTheme from "../../utils/MainTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { API_BASE_URL_OLD } from "../../Config/API";
import CustomPicker from "./CustomPicker";

// Import separate scheme pages
import DigiSilverScheme from "../../components/Schemes/DigiSilverScheme";
import AmountScheme from "../../components/Schemes/AmountScheme";
import FixedDepositScheme from "../../components/Schemes/FixedDepositScheme";

const { COLORS, SIZES, FONTS } = appTheme;

const SchemeDetailsPage = ({
  schemeData,
  onSubmit,
  onBack,
  validationErrors = {},
  setValidationErrors,
  isSubmitting,
  API_BASE_URL,
  schemes,
  selectedSchemeId,
  schemeName,
}) => {
  console.log("Scheme Details Page Loaded");
  console.log("Selected Scheme ID:", selectedSchemeId, "Type:", typeof selectedSchemeId);
  console.log("Scheme Name:", schemeName);

  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);

  // Convert selectedSchemeId to number to ensure consistent type comparison
  const numericSchemeId = Number(selectedSchemeId);

  const [formData, setFormData] = useState({
    selectedSchemeId: numericSchemeId,
    selectedGroupCodeObj: null,
    selectedCurrentRegNoObj: null,
    amount: "",
    accCode: "",
    modePay: "C",
    calculatedWeight: "",
    ...schemeData,
  });

  const [transactionTypes, setTransactionTypes] = useState([]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      if (activeInput && inputRefs.current[activeInput]) {
        inputRefs.current[activeInput].measureLayout(
          scrollViewRef.current.getScrollableNode(),
          (x, y) => {
            scrollViewRef.current.scrollTo({
              y: y + 20,
              animated: true,
            });
          },
          () => console.log('Error measuring input layout')
        );
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setActiveInput(null);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [activeInput]);

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_OLD}/account/getTranType`);
        if (!response.ok) throw new Error("Network response was not ok.");
        const data = await response.json();
        setTransactionTypes(data);
      } catch (error) {
        console.error("Error fetching transaction types:", error);
      }
    };
    fetchTransactionTypes();
  }, [API_BASE_URL_OLD]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    const errors = {};
    
    if (!numericSchemeId) {
      errors.scheme = "Please select a scheme";
    }

    // Common validation for all schemes
    if (!formData?.amount) {
      errors.amount = "Please enter a valid amount";
    }

    if (!formData?.accCode) {
      errors.accCode = "Please select a payment mode";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData);
    } else {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly in Scheme Details."
      );
    }
  };

  // Render the appropriate scheme component
  const renderSchemeComponent = () => {
    switch (numericSchemeId) {
      case 1:
        return (
          <AmountScheme
            formData={formData}
            updateFormData={updateFormData}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting}
            API_BASE_URL_OLD={API_BASE_URL_OLD}
            numericSchemeId={numericSchemeId}
            inputRefs={inputRefs}
            setActiveInput={setActiveInput}
          />
        );
      case 2:
        return (
          <DigiSilverScheme
            formData={formData}
            updateFormData={updateFormData}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting}
            API_BASE_URL_OLD={API_BASE_URL_OLD}
            numericSchemeId={numericSchemeId}
            inputRefs={inputRefs}
            setActiveInput={setActiveInput}
          />
        );
      case 3:
        return (
          <FixedDepositScheme
            formData={formData}
            updateFormData={updateFormData}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            isSubmitting={isSubmitting}
            API_BASE_URL_OLD={API_BASE_URL_OLD}
            numericSchemeId={numericSchemeId}
            inputRefs={inputRefs}
            setActiveInput={setActiveInput}
          />
        );
      default:
        return (
          <View style={styles.noSchemeContainer}>
            <Text style={styles.noSchemeText}>
              Please select a valid scheme
            </Text>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 60, android: 80 })}
      style={styles.container}
    >
      <ImageBackground 
        source={require("../../assets/image.png")} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardHeight + 50 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CommonHeader title={"Scheme Details"} />
          <View style={styles.card}>

            {/* Scheme Display (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Selected Scheme
              </Text>
              <View style={styles.staticValueContainer}>
                <Text style={styles.staticValueText}>
                  {schemeName || 'No Scheme Selected'}
                </Text>
              </View>
            </View>

            {/* Render the specific scheme component */}
            {renderSchemeComponent()}

            {/* Payment Mode (Common for all schemes) */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  Payment Mode
                </Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <CustomPicker
                selectedValue={formData?.accCode || ''}
                onValueChange={(itemValue) => {
                  updateFormData('accCode', itemValue);
                  const selectedType = transactionTypes.find((type) => type.ACCOUNT === itemValue);
                  if (selectedType?.CARDTYPE) {
                    updateFormData('modePay', selectedType.CARDTYPE);
                  }
                }}
                items={[
                  { label: 'Select Payment Mode', value: '' },
                  ...transactionTypes.map((type) => ({ label: type.NAME, value: type.ACCOUNT }))
                ]}
                placeholder="Select Payment Mode"
                enabled={!isSubmitting}
              />
              {validationErrors?.accCode && (
                <Text style={styles.errorText}>{validationErrors.accCode}</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} />
                    <Text style={styles.loadingText}>
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.backButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={onBack}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...appTheme.SHADOWS.md,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  label: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginRight: SIZES.xs,
    lineHeight: SIZES.font.md * 1.4,
  },
  asterisk: {
    fontSize: SIZES.font.md,
    color: COLORS.error,
    fontFamily: FONTS.family.bodyBold,
    lineHeight: SIZES.font.md,
  },
  staticValueContainer: {
    height: SIZES.input.height,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  staticValueText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.md * 1.4,
  },
  errorText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.error,
    marginTop: SIZES.xs,
    lineHeight: SIZES.font.sm * 1.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.xl,
    gap: SIZES.md,
  },
  button: {
    flex: 1,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.button.md,
    ...appTheme.SHADOWS.sm,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  backButton: {
    backgroundColor: COLORS.textSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
  },
  buttonText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.white,
    lineHeight: SIZES.font.md * 1.4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.white,
    marginLeft: SIZES.sm,
    lineHeight: SIZES.font.sm * 1.4,
  },
  noSchemeContainer: {
    padding: SIZES.padding.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.lg,
  },
  noSchemeText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: SIZES.font.md * 1.4,
  },
});

export default SchemeDetailsPage;