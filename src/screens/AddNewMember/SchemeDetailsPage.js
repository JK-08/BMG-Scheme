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
import appTheme from "../../utils/Theme";
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
  validationErrors,
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
    if (!formData.amount) {
      errors.amount = "Please enter a valid amount";
    }

    if (!formData.accCode) {
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
            <Text style={[styles.noSchemeText, FONTS.h6]}>
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
          <View style={[styles.card]}>

            {/* Scheme Display (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, FONTS.h6]}>
                Selected Scheme
              </Text>
              <View
                style={[
                  styles.staticValueContainer,
                  { backgroundColor: COLORS.input, borderColor: COLORS.borderColor }
                ]}
              >
                <Text style={[styles.staticValueText, FONTS.font]}>
                  {schemeName || 'No Scheme Selected'}
                </Text>
              </View>
            </View>

            {/* Render the specific scheme component */}
            {renderSchemeComponent()}

            {/* Payment Mode (Common for all schemes) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, FONTS.h6]}>
                Payment Mode <Text style={[styles.asterisk, { color: COLORS.danger }]}>*</Text>
              </Text>
              <CustomPicker
                selectedValue={formData.accCode}
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
              {validationErrors.accCode && (
                <Text style={[styles.errorText, FONTS.fontSm]}>{validationErrors.accCode}</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={[styles.buttonRow, { gap: SIZES.margin }]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  isSubmitting && styles.buttonDisabled,
                  { backgroundColor: COLORS.primary }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} />
                    <Text style={[styles.buttonText, styles.loadingText, FONTS.h6, { color: COLORS.white }]}>
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.buttonText, FONTS.h6, { color: COLORS.white }]}>Submit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.backButton,
                  isSubmitting && styles.buttonDisabled,
                  { backgroundColor: COLORS.secondary, borderColor: COLORS.outline }
                ]}
                onPress={onBack}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, FONTS.h6, { color: COLORS.white }]}>Back</Text>
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
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.card1,
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1,
  },
  label: {
    ...FONTS.h6,
    color: COLORS.label,
    marginBottom: SIZES.margin / 2,
    letterSpacing: 0.3,
  },
  staticValueContainer: {
    height: 56,
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  staticValueText: {
    ...FONTS.font,
    color: COLORS.text,
  },
  errorText: {
    ...FONTS.fontSm,
    color: COLORS.danger,
    marginTop: 6,
    marginLeft: 6,
  },
  asterisk: {
    color: COLORS.danger,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
    gap: SIZES.margin,
    marginBottom: SIZES.margin * 2,
  },
  button: {
    flex: 1,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    height: 46,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1.5,
    borderColor: COLORS.outline,
  },
  buttonText: {
    ...FONTS.h6,
    color: COLORS.white,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: SIZES.margin,
  },
  noSchemeContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSchemeText: {
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default SchemeDetailsPage;