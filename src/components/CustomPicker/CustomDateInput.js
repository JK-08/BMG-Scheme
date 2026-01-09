import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import CustomDatePicker from "./CustomDatePicker";

const DateOfBirthInput = ({
  value,
  onChangeText,
  label = "Date of Birth",
  placeholder = "DD-MM-YYYY",
  error = null,
  required = false,
  isValid = false,
  showValidationIcon = false,
  format = "DD-MM-YYYY", // or "YYYY-MM-DD"
  style = {},
  inputStyle = {},
  errorStyle = {},
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format date for display based on format prop
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      if (format === "DD-MM-YYYY") {
        return `${day}-${month}-${year}`;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Handle date selection from picker
  const handleDateSelect = (selectedDate) => {
    onChangeText && onChangeText(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredIndicator}>*</Text>}
        </Text>
        {showValidationIcon && isValid && (
          <View style={styles.validationIcon}>
            <Text style={styles.validationIconText}>✅</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            inputStyle,
            error && styles.inputError,
            isValid && styles.inputValid,
          ]}
          value={formatDateForDisplay(value)}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={false}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.calendarIconButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.hintText}>Format: {format}</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        </View>
      )}

      <CustomDatePicker
        visible={showDatePicker}
        currentDate={value}
        onSelectDate={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
        title={`Select ${label}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  requiredIndicator: {
    color: "#EF4444",
  },
  validationIcon: {
    marginLeft: 8,
  },
  validationIconText: {
    fontSize: 16,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFF",
    paddingRight: 50, // Space for calendar icon
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputValid: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  calendarIconButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  calendarIcon: {
    fontSize: 20,
  },
  hintText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  errorIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    flex: 1,
  },
});

export default DateOfBirthInput;