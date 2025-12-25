import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
  Linking
} from "react-native";
import CommonHeader from "../CommonHeader/CommonHeader";
import theme from "../../utils/AppTheme"; // Import the theme
import {
  validateAadhaar,
  validatePAN,
  validateMobile,
  validateEmail,
  validatePincode,
  validateName,
  validateDOB,
  validateNomineeName,
  validateAddressField,
} from "../../screens/AddNewMember/Validations"; // Import validations
import { useNavigation } from "@react-navigation/native";

// Destructure theme
const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

// Custom Input Component with theme
const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType,
  required = false,
  editable = true,
  loading = false,
  showValidationIcon = false,
  isValid = null,
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {required && <Text style={styles.requiredIndicator}> *</Text>}
      {loading && (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.loadingIndicator}
        />
      )}
      {showValidationIcon && value && !error && isValid !== null && (
        <View style={styles.validationIconContainer}>
          <Text style={isValid ? styles.validIcon : styles.invalidIcon}>
            {isValid ? "✓" : "✗"}
          </Text>
        </View>
      )}
    </View>
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        !error && value && isValid && styles.inputValid,
        multiline && styles.inputMultiline,
        !editable && styles.inputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.inputPlaceholder}
      multiline={multiline}
      keyboardType={keyboardType || "default"}
      editable={editable}
    />
    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

// Custom Button Component with theme
const CustomButton = ({
  title,
  onPress,
  variant = "primary",
  style,
  disabled = false,
  loading = false,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === "primary" && styles.buttonPrimary,
      variant === "secondary" && styles.buttonSecondary,
      variant === "danger" && styles.buttonDanger,
      variant === "gold" && styles.buttonGold,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator size="small" color={COLORS.white} />
    ) : (
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.buttonTextSecondary,
          variant === "gold" && styles.buttonTextGold,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

// Toggle Switch Component
const ToggleSwitch = ({ label, value, onValueChange }) => (
  <View style={styles.toggleContainer}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
      thumbColor={value ? COLORS.primary : COLORS.gray400}
    />
  </View>
);

// Data Card Component with theme
const DataCard = ({ data, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{data.pName}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {data.maritalStatus === "married" ? "👨‍👩‍👧‍👦 Married" : "👤 Single"}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
        >
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.actionButtonTextDanger}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.cardContent}>
      <DataRow label="Mobile" value={data.mobile} />
      <DataRow label="Email" value={data.email} />
      <DataRow label="Date of Birth" value={data.dob} />
      <DataRow
        label="Marital Status"
        value={data.maritalStatus === "married" ? "Married" : "Single"}
      />
      {data.maritalStatus === "married" && (
        <DataRow label="Anniversary Date" value={data.anniversaryDate} />
      )}
      <DataRow
        label="Address"
        value={`${data.doorNo}, ${data.address1}, ${data.address2}, ${data.city}, ${data.state} - ${data.pinCode}`}
      />
      {data.nomeni && <DataRow label="Nominee" value={data.nomeni} />}
      {data.mobile2 && <DataRow label="Nominee Mobile" value={data.mobile2} />}
      {data.idProofNo && <DataRow label="ID Proof No" value={data.idProofNo} />}
      {data.panNumber && <DataRow label="PAN Number" value={data.panNumber} />}
    </View>
  </View>
);

const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}:</Text>
    <Text style={styles.dataValue}>{value || "N/A"}</Text>
  </View>
);

// Main App Component
export default function App() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isMarried, setIsMarried] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const navigation = useNavigation();

  const [fieldValidity, setFieldValidity] = useState({});

  const [formData, setFormData] = useState({
    pName: "",
    mobile: "",
    mobile2: "",
    email: "",
    dob: "",
    maritalStatus: "single",
    doorNo: "",
    address1: "",
    address2: "",
    area: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    nomeni: "",
    idProofNo: "",
    panNumber: "",
    anniversaryDate: "",
  });

  const [errors, setErrors] = useState({});

  // Function to fetch city/state from PIN code
  const fetchCityStateFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    setIsFetchingPincode(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        const po = data[0].PostOffice[0];

        // ✅ Correct Indian mapping
        setFormData((prev) => ({
          ...prev,
          city: po.District || "",
          state: po.State || "",
          country: po.Country || "India",
        }));

        setErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
          pinCode: "",
        }));

        setFieldValidity((prev) => ({
          ...prev,
          city: true,
          state: true,
          pinCode: true,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          pinCode: "Invalid PIN code. No records found.",
        }));

        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          country: "India",
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrors((prev) => ({
        ...prev,
        pinCode: "Network error. Please try again.",
      }));
    } finally {
      setIsFetchingPincode(false);
    }
  };

  useEffect(() => {
  const handleDeepLink = (event) => {
    if (event.url && event.url.includes('bmgjewellers://aadhaar-callback')) {
      // User returned from verification
      Alert.alert(
        "Returned from Verification",
        "Please check the verification status in the Aadhaar verification screen.",
        [{ text: "OK" }]
      );
    }
  };

  Linking.addEventListener('url', handleDeepLink);
  
  // Check initial URL if app was launched from deep link
  Linking.getInitialURL().then((url) => {
    if (url && url.includes('bmgjewellers://aadhaar-callback')) {
      handleDeepLink({ url });
    }
  });

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);

  // Update field function with real-time validation
  const updateField = (field, value) => {
    let processedValue = value;

    // Apply field-specific formatting
    if (field === "pinCode" || field === "mobile" || field === "mobile2") {
      processedValue = value.replace(/[^0-9]/g, "");
      // Limit pinCode to 6 digits
      if (field === "pinCode") {
        processedValue = processedValue.slice(0, 6);
      }
      // Limit mobile numbers to 10 digits
      if (field === "mobile" || field === "mobile2") {
        processedValue = processedValue.slice(0, 10);
      }
    }

    // Update form data
    setFormData({ ...formData, [field]: processedValue });

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Real-time validation for specific fields
    // ✅ FIXED
    if (
      processedValue.trim() ||
      [
        "email",
        "pName",
        "mobile",
        "mobile2",
        "dob",
        "doorNo",
        "address1",
        "address2",
        "area",
        "city",
        "state",
        "pinCode",
        "idProofNo",
      ].includes(field)
    ) {
      let isValid = false;
      let errorMsg = "";

      switch (field) {
        case "pinCode":
          errorMsg = validatePincode(processedValue);
          isValid = !errorMsg;
          if (processedValue.length === 6 && isValid) {
            fetchCityStateFromPincode(processedValue);
          }
          break;

        case "mobile":
        case "mobile2":
          errorMsg = validateMobile(processedValue);
          isValid = !errorMsg;
          break;

        case "email":
          errorMsg = validateEmail(processedValue);
          isValid = !errorMsg;
          break;

        case "pName":
          errorMsg = validateName(processedValue);
          isValid = !errorMsg;
          break;

        case "dob":
          errorMsg = validateDOB(processedValue);
          isValid = !errorMsg;
          break;

        case "doorNo":
          errorMsg = validateAddressField(processedValue, "Door number");
          isValid = !errorMsg;
          break;

        case "address1":
          errorMsg = validateAddressField(processedValue, "Address Line 1");
          isValid = !errorMsg;
          break;

        case "address2":
          errorMsg = validateAddressField(processedValue, "Address Line 2");
          isValid = !errorMsg;
          break;

        case "area":
          errorMsg = validateAddressField(processedValue, "Area");
          isValid = !errorMsg;
          break;

        case "city":
          errorMsg = validateAddressField(processedValue, "City");
          isValid = !errorMsg;
          break;

        case "state":
          errorMsg = validateAddressField(processedValue, "State");
          isValid = !errorMsg;
          break;

        case "idProofNo":
          const aadhaarWithoutSpaces = processedValue.replace(/\s/g, "");
          errorMsg = validateAadhaar(aadhaarWithoutSpaces);
          isValid = !errorMsg;
          break;

        case "panNumber":
          if (processedValue) {
            errorMsg = validatePAN(processedValue);
            isValid = !errorMsg;
          }
          break;

        default:
          isValid = true;
      }

      // Update field validity
      setFieldValidity((prev) => ({ ...prev, [field]: isValid }));

      // Update errors if invalid
      if (!isValid && errorMsg) {
        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
      }
    }
  };

// In your main App.js component
const navigateToAadhaarVerification = () => {
  navigation.navigate("AadhaarVerification", {
    existingAadhaar: formData.idProofNo,
    onVerificationComplete: (verifiedData) => {
      // Update form with verified data
      setFormData((prev) => ({
        ...prev,
        ...verifiedData,
      }));

      // Show success message
      Alert.alert(
        "✅ Aadhaar Verified",
        "Your Aadhaar has been verified successfully! Details have been auto-filled.",
        [{ text: "OK" }]
      );
    },
  });
};

  const validateForm = () => {
    const newErrors = {};
    const newFieldValidity = {};

    // ===== CORE REQUIRED FIELDS =====
    const coreRequiredFields = [
      { field: "pName", validator: (v) => validateName(v), label: "Full Name" },
      {
        field: "mobile",
        validator: (v) => validateMobile(v),
        label: "Mobile Number",
      },
      {
        field: "email",
        validator: (v) => {
          if (!v || v.trim() === "") return "Email address is required";
          return validateEmail(v);
        },
        label: "Email Address",
      },
      {
        field: "dob",
        validator: (v) => validateDOB(v),
        label: "Date of Birth",
      },
      {
        field: "doorNo",
        validator: (v) => validateAddressField(v, "Door number"),
        label: "Door Number",
      },
      {
        field: "address1",
        validator: (v) => validateAddressField(v, "Address Line 1"),
        label: "Address Line 1",
      },
      {
        field: "address2",
        validator: (v) => validateAddressField(v, "Address Line 2"),
        label: "Address Line 2",
      },
      {
        field: "area",
        validator: (v) => validateAddressField(v, "Area"),
        label: "Area",
      },
      {
        field: "city",
        validator: (v) => validateAddressField(v, "City"),
        label: "City",
      },
      {
        field: "state",
        validator: (v) => validateAddressField(v, "State"),
        label: "State",
      },
      {
        field: "pinCode",
        validator: (v) => validatePincode(v),
        label: "PIN Code",
      },
      {
        field: "country",
        validator: (v) => validateAddressField(v, "Country"),
        label: "Country",
      },
      {
        field: "idProofNo",
        validator: (v) => {
          const val = v.replace(/\s/g, "");
          return validateAadhaar(val);
        },
        label: "Aadhaar Number",
      },
    ];

    // Validate core fields
    coreRequiredFields.forEach(({ field, validator }) => {
      const value = formData[field] || "";
      const error = validator(value);
      if (error) {
        newErrors[field] = error;
        newFieldValidity[field] = false;
      } else {
        newFieldValidity[field] = true;
      }
    });

    // Optional fields
    if (formData.nomeni && formData.nomeni.trim()) {
      const err = validateNomineeName(formData.nomeni);
      newErrors.nomeni = err || "";
      newFieldValidity.nomeni = !err;
    }

    if (!formData.mobile2 || !formData.mobile2.trim()) {
      newErrors.mobile2 = "Nominee Mobile is required";
      newFieldValidity.mobile2 = false;
    } else {
      const err = validateMobile(formData.mobile2);
      newErrors.mobile2 = err || "";
      newFieldValidity.mobile2 = !err;
    }

    if (formData.panNumber && formData.panNumber.trim()) {
      const err = validatePAN(formData.panNumber);
      newErrors.panNumber = err || "";
      newFieldValidity.panNumber = !err;
    }

    // ===== Married Conditional Field =====
    if (isMarried) {
      if (!formData.anniversaryDate || formData.anniversaryDate.trim() === "") {
        newErrors.anniversaryDate =
          "Anniversary date is required for married users";
        newFieldValidity.anniversaryDate = false;
      } else {
        const annivDate = new Date(formData.anniversaryDate);
        const today = new Date();

        if (isNaN(annivDate.getTime())) {
          newErrors.anniversaryDate = "Invalid anniversary date format";
          newFieldValidity.anniversaryDate = false;
        } else if (annivDate > today) {
          newErrors.anniversaryDate =
            "Anniversary date cannot be in the future";
          newFieldValidity.anniversaryDate = false;
        } else {
          newErrors.anniversaryDate = "";
          newFieldValidity.anniversaryDate = true;
        }
      }
    }

    setErrors(newErrors);
    setFieldValidity(newFieldValidity);

    // Show alert if any errors
    if (Object.keys(newErrors).some((k) => newErrors[k])) {
      const errorMessage = Object.entries(newErrors)
        .filter(([_, e]) => e)
        .map(([f, e]) => {
          const names = {
            pName: "Full Name",
            mobile: "Mobile Number",
            mobile2: "Nominee Mobile",
            email: "Email Address",
            dob: "Date of Birth",
            doorNo: "Door Number",
            address1: "Address Line 1",
            address2: "Address Line 2",
            area: "Area",
            city: "City",
            state: "State",
            pinCode: "PIN Code",
            country: "Country",
            nomeni: "Nominee Name",
            idProofNo: "Aadhaar Number",
            panNumber: "PAN Number",
            anniversaryDate: "Anniversary Date",
          };
          return `• ${names[f] || f}: ${e}`;
        })
        .join("\n\n");

      Alert.alert(
        "Validation Error ⚠️",
        `Please fix the following errors:\n\n${errorMessage}`
      );
      return false;
    }

    return true;
  };

  // Add this function to test your validation
  const testEmailValidation = () => {
    console.log("=== TESTING EMAIL VALIDATION ===");
    console.log("Empty string:", validateEmail(""));
    console.log("Invalid email:", validateEmail("test"));
    console.log("Valid email:", validateEmail("test@example.com"));
    console.log("=== END TEST ===");
  };

  // You can call this in a useEffect or add a test button
  useEffect(() => {
    testEmailValidation();
  }, []);

  const handleSubmit = () => {
    console.log("=== SUBMIT CLICKED ===");
    console.log("Current form data:", formData);
    console.log("Email field value:", formData.email);

    // Validate the form
    const isValid = validateForm();

    console.log("Form validation result:", isValid);

    if (!isValid) {
      console.log("❌ Form validation FAILED - NOT saving data");
      return; // Stop here if validation fails
    }

    console.log("✅ Form validation PASSED - Saving data...");

    // Prepare user data
    const userData = {
      ...formData,
      maritalStatus: isMarried ? "married" : "single",
      anniversaryDate: isMarried ? formData.anniversaryDate : "",
    };

    if (editingIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingIndex] = userData;
      setUsers(updatedUsers);
      Alert.alert("Success ✅", "User updated successfully!", [
        { text: "OK", onPress: resetForm },
      ]);
    } else {
      setUsers([...users, userData]);
      Alert.alert("Success ✅", "User added successfully!", [
        { text: "OK", onPress: resetForm },
      ]);
    }
  };
  const resetForm = () => {
    setFormData({
      pName: "",
      mobile: "",
      mobile2: "",
      email: "",
      dob: "",
      maritalStatus: "single",
      doorNo: "",
      address1: "",
      address2: "",
      area: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      nomeni: "",
      idProofNo: "",
      panNumber: "",
      anniversaryDate: "",
    });
    setIsMarried(false);
    setErrors({});
    setFieldValidity({});
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    const user = users[index];
    setFormData(user);
    setIsMarried(user.maritalStatus === "married");
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedUsers = users.filter((_, i) => i !== index);
            setUsers(updatedUsers);
            Alert.alert("Deleted", "User has been deleted successfully.");
          },
        },
      ]
    );
  };

  const handleMaritalStatusChange = (value) => {
    setIsMarried(value);
    updateField("maritalStatus", value ? "married" : "single");
    if (!value) {
      updateField("anniversaryDate", "");
      if (errors.anniversaryDate) {
        setErrors({ ...errors, anniversaryDate: "" });
      }
    }
  };

  // Format Aadhaar number with spaces
  const formatAadhaar = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Format as XXXX XXXX XXXX
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  // Format PAN to uppercase
  const formatPAN = (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <CommonHeader
        title="User Profile Management"
        subtitle={`${users.length} Users Registered`}
      />

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        {/* Total Users */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        {/* Married Users */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.maritalStatus === "married").length}
          </Text>
          <Text style={styles.statLabel}>Married</Text>
        </View>

        {/* Unmarried Users */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.maritalStatus !== "married").length}
          </Text>
          <Text style={styles.statLabel}>Unmarried</Text>
        </View>
      </View>

      {/* Add Button */}
      {!showForm && (
        <View style={styles.addButtonContainer}>
          <CustomButton
            title="➕ Add New User"
            onPress={() => setShowForm(true)}
            variant="gold"
            style={styles.addButton}
          />
        </View>
      )}

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          {/* Common Header for Modal */}
          <CommonHeader
            title={
              editingIndex !== null ? "Edit User Profile" : "Create New Profile"
            }
            subtitle="Fill in the details below. Fields marked with * are required."
            showBackButton={true}
            onBackPress={resetForm}
          />

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Personal Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👤 Personal Information</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Full Name"
                value={formData.pName}
                onChangeText={(v) => updateField("pName", v)}
                placeholder="Enter full name"
                error={errors.pName}
                required
                showValidationIcon={true}
                isValid={fieldValidity.pName}
              />
              <CustomInput
                label="Mobile Number"
                value={formData.mobile}
                onChangeText={(v) => updateField("mobile", v)}
                placeholder="Enter 10-digit mobile number"
                keyboardType="number-pad"
                error={errors.mobile}
                required
                showValidationIcon={true}
                isValid={fieldValidity.mobile}
              />

              <CustomInput
                label="Email Address"
                value={formData.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="Enter email address"
                keyboardType="email-address"
                error={errors.email}
                required
                showValidationIcon={true}
                isValid={fieldValidity.email}
              />

              <CustomInput
                label="Date of Birth (YYYY-MM-DD)"
                value={formData.dob}
                onChangeText={(v) => updateField("dob", v)}
                placeholder="2004-11-17"
                error={errors.dob}
                required
                showValidationIcon={true}
                isValid={fieldValidity.dob}
              />

              <ToggleSwitch
                label="Married"
                value={isMarried}
                onValueChange={handleMaritalStatusChange}
              />

              {isMarried && (
                <CustomInput
                  label="Anniversary Date (YYYY-MM-DD)"
                  value={formData.anniversaryDate}
                  onChangeText={(v) => updateField("anniversaryDate", v)}
                  placeholder="Anniversary Date"
                  error={errors.anniversaryDate}
                  showValidationIcon={true}
                  isValid={fieldValidity.anniversaryDate}
                />
              )}
            </View>

            {/* Address Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏠 Address Details</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Door No"
                value={formData.doorNo}
                onChangeText={(v) => updateField("doorNo", v)}
                placeholder="Enter door number"
                error={errors.doorNo}
                required
                showValidationIcon={true}
                isValid={fieldValidity.doorNo}
              />
              <CustomInput
                label="Address Line 1"
                value={formData.address1}
                onChangeText={(v) => updateField("address1", v)}
                placeholder="Street name"
                error={errors.address1}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address1}
              />
              <CustomInput
                label="Address Line 2"
                value={formData.address2}
                onChangeText={(v) => updateField("address2", v)}
                placeholder="Locality/Landmark"
                error={errors.address2}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address2}
              />

              <CustomInput
                label="Area"
                value={formData.area}
                onChangeText={(v) => updateField("area", v)}
                placeholder="Enter area"
                error={errors.area}
                required
                showValidationIcon={true}
                isValid={fieldValidity.area}
              />

              {/* City/State Row */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="PIN Code"
                    value={formData.pinCode}
                    onChangeText={(v) => updateField("pinCode", v)}
                    placeholder="6-digit PIN code"
                    keyboardType="number-pad"
                    error={errors.pinCode}
                    required
                    loading={isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.pinCode}
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="City"
                    value={formData.city}
                    onChangeText={(v) => updateField("city", v)}
                    placeholder="Enter city"
                    error={errors.city}
                    required
                    editable={isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.city}
                  />
                </View>
              </View>

              {/* PIN Code/Country Row */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="State"
                    value={formData.state}
                    onChangeText={(v) => updateField("state", v)}
                    placeholder="Enter state"
                    error={errors.state}
                    required
                    editable={isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.state}
                  />
                </View>

                <View style={styles.halfInput}>
                  <CustomInput
                    label="Country"
                    value={formData.country}
                    onChangeText={(v) => updateField("country", v)}
                    placeholder="India"
                    editable={isFetchingPincode}
                  />
                </View>
              </View>
            </View>

            {/* Nominee Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👥 Nominee Information</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Nominee Name"
                value={formData.nomeni}
                onChangeText={(v) => updateField("nomeni", v)}
                placeholder="Enter nominee name"
                error={errors.nomeni}
                showValidationIcon={true}
                isValid={fieldValidity.nomeni}
              />
              <CustomInput
                label="Nominee Mobile"
                value={formData.mobile2}
                onChangeText={(v) => updateField("mobile2", v)}
                placeholder="Enter nominee mobile"
                keyboardType="phone-pad"
                error={errors.mobile2}
                showValidationIcon={true}
                isValid={fieldValidity.mobile2}
              />
            </View>

            {/* ID Proof Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 ID Proof Details</Text>
                <View style={styles.sectionDivider} />
              </View>

              <View style={styles.aadhaarInputContainer}>
                <CustomInput
                  label="Aadhaar Number"
                  value={formData.idProofNo}
                  onChangeText={(v) => {
                    const formatted = formatAadhaar(v);
                    updateField("idProofNo", formatted);
                  }}
                  placeholder="XXXX XXXX XXXX"
                  keyboardType="number-pad"
                  error={errors.idProofNo}
                  required
                  showValidationIcon={true}
                  isValid={fieldValidity.idProofNo}
                />

                {/* Add Verify Aadhaar Button */}
                <TouchableOpacity
                  style={styles.verifyAadhaarButton}
                  onPress={navigateToAadhaarVerification}
                  disabled={
                    !formData.idProofNo ||
                    formData.idProofNo.replace(/\s/g, "").length !== 12
                  }
                >
                  <Text style={styles.verifyAadhaarButtonText}>
                    {formData.aadhaarVerified
                      ? "✅ Verified"
                      : "🔗 Verify via DigiLocker"}
                  </Text>
                </TouchableOpacity>

                {/* Show verification status */}
                {formData.aadhaarVerificationId && (
                  <View style={styles.verificationStatusContainer}>
                    <Text style={styles.verificationStatusText}>
                      Verification ID: {formData.aadhaarVerificationId}
                    </Text>
                    <Text
                      style={[
                        styles.verificationStatusText,
                        formData.aadhaarStatus === "SUCCESS" &&
                          styles.verificationStatusSuccess,
                        formData.aadhaarStatus === "PENDING" &&
                          styles.verificationStatusPending,
                      ]}
                    >
                      Status: {formData.aadhaarStatus || "Not Verified"}
                    </Text>
                  </View>
                )}
              </View>
              <CustomInput
                label="PAN Number (Optional)"
                value={formData.panNumber}
                onChangeText={(v) => {
                  const formatted = formatPAN(v);
                  updateField("panNumber", formatted);
                }}
                placeholder="ABCDE1234F"
                keyboardType="default"
                error={errors.panNumber}
                showValidationIcon={true}
                isValid={fieldValidity.panNumber}
              />
            </View>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <CustomButton
                title="Cancel"
                onPress={resetForm}
                variant="secondary"
                style={styles.cancelButton}
              />
              <CustomButton
                title={
                  editingIndex !== null ? "Update Profile" : "Save Profile"
                }
                onPress={handleSubmit}
                variant="primary"
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* User List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👤</Text>
            <Text style={styles.emptyStateTitle}>No Users Yet</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first user profile
            </Text>
            <CustomButton
              title="Add First User"
              onPress={() => setShowForm(true)}
              variant="primary"
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          users.map((user, index) => (
            <DataCard
              key={index}
              data={user}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: SIZES.padding.sm,
  },
  statNumber: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Add Button
  addButtonContainer: {
    padding: SIZES.padding.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  addButton: {
    ...COMMON_STYLES.button.gold,
    paddingVertical: SIZES.padding.lg,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: SIZES.padding.lg,
    paddingBottom: SIZES.padding.xxxl,
  },

  // Validation Alert
  alertContainer: {
    backgroundColor: COLORS.errorLight + "20",
    marginHorizontal: SIZES.padding.lg,
    marginTop: SIZES.margin.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.errorLight,
    padding: SIZES.padding.md,
    maxHeight: 200,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.sm,
  },
  alertIcon: {
    fontSize: SIZES.font.lg,
    marginRight: SIZES.margin.sm,
  },
  alertTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
    fontWeight: FONTS.weight.bold,
    flex: 1,
  },
  alertCloseButton: {
    padding: SIZES.padding.xs,
  },
  alertCloseText: {
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
  },
  alertScrollView: {
    maxHeight: 140,
  },
  alertMessage: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
  },
  alertErrorItem: {
    flexDirection: "row",
    marginBottom: SIZES.margin.xs,
    alignItems: "flex-start",
  },
  alertErrorDot: {
    color: COLORS.error,
    marginRight: SIZES.margin.xs,
    marginTop: 2,
  },
  alertErrorText: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
    flex: 1,
  },
  alertFieldName: {
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
  },

  // Section
  section: {
    marginBottom: SIZES.margin.xl,
  },
  sectionHeader: {
    marginBottom: SIZES.margin.lg,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
  },
  sectionDivider: {
    height: 2,
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.full,
  },

  // Inputs
  inputContainer: {
    marginBottom: SIZES.margin.lg,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  inputLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  requiredIndicator: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
  },
  loadingIndicator: {
    marginLeft: SIZES.margin.xs,
  },
  validationIconContainer: {
    marginLeft: SIZES.margin.xs,
  },
  validIcon: {
    color: COLORS.success,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },
  invalidIcon: {
    color: COLORS.error,
    fontSize: SIZES.font.md,
    fontWeight: "bold",
  },
  input: {
    ...COMMON_STYLES.input.default,
    paddingVertical: SIZES.padding.md,
  },
  inputError: {
    ...COMMON_STYLES.input.error,
  },
  inputValid: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    color: COLORS.textDisabled,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: "top",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  errorIcon: {
    marginRight: SIZES.margin.xs,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    flex: 1,
  },

  // Toggle
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
    paddingVertical: SIZES.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  toggleLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },

  // Row Layout
  row: {
    flexDirection: "row",
    marginHorizontal: -SIZES.margin.xs,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },

  // Buttons
  button: {
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  buttonPrimary: {
    ...COMMON_STYLES.button.primary,
  },
  buttonSecondary: {
    ...COMMON_STYLES.button.secondary,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonGold: {
    ...COMMON_STYLES.button.gold,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.button,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  buttonTextGold: {
    color: COLORS.textPrimary,
  },
  buttonTextDisabled: {
    color: COLORS.textDisabled,
  },

  // Form Actions
  formActions: {
    flexDirection: "row",
    marginTop: SIZES.margin.xxl,
    marginBottom: SIZES.margin.xxxl,
    paddingHorizontal: SIZES.padding.sm,
  },
  cancelButton: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  saveButton: {
    flex: 2,
    marginLeft: SIZES.margin.sm,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding.lg,
  },

  // Card
  card: {
    ...COMMON_STYLES.card.elevated,
    marginBottom: SIZES.margin.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.margin.md,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: SIZES.margin.sm,
  },
  cardTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  statusBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
    alignSelf: "flex-start",
  },
  statusText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  cardActions: {
    flexDirection: "row",
    gap: SIZES.margin.xs,
  },
  actionButton: {
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  editButton: {
    backgroundColor: COLORS.infoLight + "20",
  },
  deleteButton: {
    backgroundColor: COLORS.errorLight + "20",
  },
  actionButtonText: {
    ...FONTS.caption,
    color: COLORS.info,
    fontWeight: FONTS.weight.medium,
  },
  actionButtonTextDanger: {
    ...FONTS.caption,
    color: COLORS.error,
    fontWeight: FONTS.weight.medium,
  },
  cardContent: {
    gap: SIZES.margin.sm,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: SIZES.padding.xs,
  },
  dataLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    width: 120,
  },
  dataValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xxxl,
    paddingHorizontal: SIZES.padding.xl,
  },
  emptyStateIcon: {
    fontSize: SIZES.font.xxxl * 2,
    marginBottom: SIZES.margin.lg,
  },
  emptyStateTitle: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    textAlign: "center",
  },
  emptyStateText: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
  },
  emptyStateButton: {
    minWidth: 200,
  },
    aadhaarInputContainer: {
      marginBottom: SIZES.margin.lg,
    },
    verifyAadhaarButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: SIZES.padding.sm,
      paddingHorizontal: SIZES.padding.md,
      borderRadius: SIZES.radius.sm,
      alignItems: 'center',
      marginTop: SIZES.margin.sm,
      ...SHADOWS.xs,
    },
    verifyAadhaarButtonText: {
      ...FONTS.caption,
      color: COLORS.white,
      fontWeight: FONTS.weight.medium,
    },
    verificationStatusContainer: {
      marginTop: SIZES.margin.sm,
      padding: SIZES.padding.sm,
      backgroundColor: COLORS.gray50,
      borderRadius: SIZES.radius.sm,
    },
    verificationStatusText: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
    },
    verificationStatusSuccess: {
      color: COLORS.success,
      fontWeight: FONTS.weight.bold,
    },
    verificationStatusPending: {
      color: COLORS.warning,
      fontWeight: FONTS.weight.bold,
    },
     aadhaarInputContainer: {
    marginBottom: SIZES.margin.lg,
  },
  verifyAadhaarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    marginTop: SIZES.margin.sm,
    ...SHADOWS.xs,
  },
  verifyAadhaarButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
  },
  verificationStatusContainer: {
    marginTop: SIZES.margin.sm,
    padding: SIZES.padding.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radius.sm,
  },
  verificationStatusText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  verificationStatusSuccess: {
    color: COLORS.success,
    fontWeight: FONTS.weight.bold,
  },
  verificationStatusPending: {
    color: COLORS.warning,
    fontWeight: FONTS.weight.bold,
  },
});
