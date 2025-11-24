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
  ImageBackground,
} from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { API_BASE_URL_OLD } from "../../Config/API";
import CustomPicker from "./CustomPicker";

import DigiSilverScheme from "../../components/Schemes/DigiSilverScheme";
import AmountScheme from "../../components/Schemes/AmountScheme";
import FixedDepositScheme from "../../components/Schemes/FixedDepositScheme";

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
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);

  const numericSchemeId = Number(selectedSchemeId);

  const [isAgreed, setIsAgreed] = useState(false);

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
  const MINIMUM_AMOUNT_MAP = {
    1: 1, // Amount Scheme
    2: 100, // Digi Silver
    3: 10000, // Fixed Deposit
  };

  const minAmount = MINIMUM_AMOUNT_MAP[numericSchemeId] || 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
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
            () => console.log("Error measuring input layout")
          );
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setActiveInput(null);
      }
    );

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
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = () => {
    const errors = {};

    if (!numericSchemeId) {
      errors.scheme = "Please select a scheme";
    }

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
    if (!isAgreed) {
      Alert.alert(
        "Agreement Required",
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    if (validateStep()) {
      onSubmit(formData);
    } else {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly in Scheme Details."
      );
    }
  };

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight + 50 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CommonHeader title={"Scheme Details"} />

          <View style={styles.card}>
            {/* Read-only Scheme */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Selected Scheme</Text>
              <View style={styles.staticValueContainer}>
                <Text style={styles.staticValueText}>
                  {schemeName || "No Scheme Selected"}
                </Text>
              </View>
            </View>

            {/* RENDER SCHEME UI */}
            {renderSchemeComponent()}

            {/* Payment Mode */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Payment Mode</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <CustomPicker
                selectedValue={formData?.accCode || ""}
                onValueChange={(itemValue) => {
                  updateFormData("accCode", itemValue);

                  const selectedType = transactionTypes.find(
                    (type) => type.ACCOUNT === itemValue
                  );

                  if (selectedType?.CARDTYPE) {
                    updateFormData("modePay", selectedType.CARDTYPE);
                  }
                }}
                items={[
                  { label: "Select Payment Mode", value: "" },
                  ...transactionTypes.map((type) => ({
                    label: type.NAME,
                    value: type.ACCOUNT,
                  })),
                ]}
              />

              {validationErrors?.accCode && (
                <Text style={styles.errorText}>{validationErrors.accCode}</Text>
              )}
            </View>

            {/* AGREEMENT CHECKBOX */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAgreed(!isAgreed)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, isAgreed && styles.checkboxChecked]}
              >
                {isAgreed && <Text style={styles.checkboxTick}>✔</Text>}
              </View>

              <Text style={styles.checkboxText}>
                I agree to the Terms & Conditions and Privacy Policy
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  (isSubmitting ||
                    !isAgreed ||
                    Number(formData.amount) < minAmount) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || Number(formData.amount) < minAmount}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.white} />
                    <Text style={styles.loadingText}>Submitting...</Text>
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
                <Text style={styles.backButtonText}>Back</Text>
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
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  inputContainer: {
    marginBottom: SIZES.margin.lg,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  label: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginRight: SIZES.margin.xs,
  },
  asterisk: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
  },
  staticValueContainer: {
    height: SIZES.input.height,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground,
  },
  staticValueText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.margin.xl,
    gap: SIZES.margin.md,
  },
  button: {
    flex: 1,
    borderRadius: SIZES.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    height: SIZES.button.lg,
    ...SHADOWS.sm,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  backButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  backButtonText: {
    ...FONTS.button,
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginLeft: SIZES.margin.sm,
  },
  noSchemeContainer: {
    padding: SIZES.padding.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: "dashed",
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.lg,
  },
  noSchemeText: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.md,
    marginBottom: SIZES.margin.lg,
  },
  checkbox: {
    width: SIZES.icon.sm,
    height: SIZES.icon.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius.xs,
    marginRight: SIZES.margin.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.white,
    fontSize: SIZES.font.sm,
    fontWeight: FONTS.weight.bold,
  },
  checkboxText: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
});

export default SchemeDetailsPage;
