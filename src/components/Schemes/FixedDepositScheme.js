import React, { useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS } = appTheme;

const FixedDepositScheme = ({
  formData,
  updateFormData,
  validationErrors = {},
  setValidationErrors,
  isSubmitting,
  inputRefs,
  setActiveInput,
  minAmount = 5000, // default minimum amount
}) => {
  const amountRef = useRef(null);

  // Handle amount input
  const handleAmountChange = (text) => {
    const sanitizedText = text.replace(/[^0-9.]/g, "");

    const parts = sanitizedText.split(".");
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
      return;
    }

    updateFormData("amount", sanitizedText);
  };

  // Validate Fixed Deposit fields
  useEffect(() => {
    const errors = { ...validationErrors };

    if (!formData?.amount || formData.amount.trim() === "") {
      errors.amount = "Fixed deposit amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = "Enter a valid amount greater than 0";
    } else if (parseFloat(formData.amount) < minAmount) {
      errors.amount = `Minimum fixed deposit amount is ₹${minAmount.toLocaleString()}`;
    } else {
      delete errors.amount;
    }

    setValidationErrors(errors);
  }, [formData?.amount, minAmount]);

  // Assign ref to parent inputRefs if needed
  useEffect(() => {
    if (inputRefs?.current) {
      inputRefs.current.amount = amountRef.current;
    }
  }, [inputRefs]);

  return (
    <View style={styles.container}>
      {/* Amount Input */}
      <View style={styles.header}>
        <Text style={styles.label}>Fixed Deposit Amount</Text>
        <Text style={styles.asterisk}>*</Text>
      </View>

      <TextInput
        ref={amountRef}
        style={[styles.input, validationErrors?.amount && styles.inputError]}
        keyboardType="decimal-pad"
        value={formData?.amount || ""}
        editable={!isSubmitting}
        onChangeText={handleAmountChange}
        placeholder="Enter fixed deposit amount"
        placeholderTextColor={COLORS.textTertiary}
        maxLength={12}
        onFocus={() => setActiveInput?.("amount")}
      />

      {/* Error Message */}
      {validationErrors?.amount && (
        <Text style={styles.errorText}>{validationErrors.amount}</Text>
      )}

      {/* Hint */}
      <Text style={styles.hintText}>
        Minimum fixed deposit amount is ₹{minAmount.toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  input: {
    height: SIZES.input.height,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    backgroundColor: "transparent",
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  errorText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.error,
    marginTop: SIZES.xs,
    lineHeight: SIZES.font.sm * 1.4,
  },
  hintText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.xs,
    color: COLORS.textTertiary,
    marginTop: SIZES.xs,
    fontStyle: "italic",
    lineHeight: SIZES.font.xs * 1.4,
  },
});

export default FixedDepositScheme;
