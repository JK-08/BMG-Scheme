import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTab } from "../../components";
import { SHADOWS, COLORS, SIZES, FONTS } from "../../utils/AppTheme";
import { MaterialIcons } from "@expo/vector-icons";

// <-- import your validators (adjust path if needed) -->
import {
  validateAadhaar,
  validatePAN,
  validateMobile,
  validateEmail,
  validatePincode,
} from "./Validations";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  doorNo: "",
  street: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  nomeni: "",
  mobile2: "",
  panNumber: "",
  aadharNumber: "",
};

const MemberDetailsPage = ({ onNext, onBack }) => {
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [validationErrors, setValidationErrors] = useState({});

  // LOAD SAVED FORM + USER PROFILE
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("digigoldMemberForm");
        const savedData = stored ? JSON.parse(stored) : {};

        const [email, username, phone] = await Promise.all([
          AsyncStorage.getItem("userEmail"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("userPhoneNumber"),
        ]);

        setFormData((prev) => ({
          ...prev,
          ...savedData,
          name: username || savedData.name || "",
          mobile: phone || savedData.mobile || "",
          email: email || savedData.email || "",
        }));
      } catch (e) {
        console.error("Load error:", e);
      }
    })();
  }, []);

  // SAVE FORM ON CHANGE
  useEffect(() => {
    AsyncStorage.setItem("digigoldMemberForm", JSON.stringify(formData)).catch(
      (err) => console.error("Save error:", err)
    );
  }, [formData]);

  // KEYBOARD HANDLING
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);

      if (activeInput && inputRefs.current[activeInput]) {
        setTimeout(() => {
          inputRefs.current[activeInput].measureLayout(
            scrollViewRef.current,
            (x, y, w, h) => {
              scrollViewRef.current?.scrollTo({
                y: y - 80,
                animated: true,
              });
            }
          );
        }, 100);
      }
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [activeInput]);

  // FETCH PINCODE -> DISTRICT & STATE
  useEffect(() => {
    if (formData.pincode.length !== 6) {
      setFormData((prev) => ({ ...prev, city: "", state: "" }));
      return;
    }

    const fetchLocation = async () => {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${formData.pincode}`
        );
        const data = await response.json();

        if (data[0]?.Status === "Success") {
          const district = data[0].PostOffice[0].District || "";
          const state = data[0].PostOffice[0].State || "";

          setFormData((prev) => ({
            ...prev,
            city: district,
            state: state,
          }));
        } else {
          setFormData((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch (e) {
        console.error("Pincode fetch error:", e);
      }
    };

    fetchLocation();
  }, [formData.pincode]);

  // FIELD UPDATE HANDLER
  const updateField = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Special handlers
  const handleMobile = (t) =>
    updateField("mobile", t.replace(/\D/g, "").slice(0, 10));

  const handleNomineeMobile = (t) =>
    updateField("mobile2", t.replace(/\D/g, "").slice(0, 10));

  const handlePincode = (t) =>
    updateField("pincode", t.replace(/\D/g, "").slice(0, 6));

  const handlePan = (t) =>
    updateField(
      "panNumber",
      t
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 10)
        .toUpperCase()
    );

  const handleAadhar = (t) =>
    updateField("aadharNumber", t.replace(/\D/g, "").slice(0, 12));

  // VALIDATION: now using centralized validators
  const validate = (d) => {
    const errors = {};

    // required checks
    if (!d.name?.trim()) errors.name = "Name is required";

    // mobile (use validator) — even if field is readOnly, validate presence/format
    const mobileErr = validateMobile(d.mobile || "");
    if (mobileErr) errors.mobile = mobileErr;

    // email
    const emailErr = validateEmail(d.email || "");
    if (emailErr) errors.email = emailErr;

    // address required fields
    if (!d.doorNo?.trim()) errors.doorNo = "Door No. is required";
    if (!d.street?.trim()) errors.street = "Street is required";
    if (!d.area?.trim()) errors.area = "Area/Locality is required";

    // pincode
    const pinErr = validatePincode(d.pincode || "");
    if (pinErr) errors.pincode = pinErr;

    // city/state (auto filled but still required)
    if (!d.city?.trim()) errors.city = "City is required";
    if (!d.state?.trim()) errors.state = "State is required";

    // nominee
    if (!d.nomeni?.trim()) errors.nomeni = "Nominee Name is required";
    const nomMobileErr = validateMobile(d.mobile2 || "");
    if (nomMobileErr) errors.mobile2 = nomMobileErr;

    // PAN (optional — only validate when provided)
    if (d.panNumber?.trim()) {
      const panErr = validatePAN(d.panNumber);
      if (panErr) errors.panNumber = panErr;
    } else {
      // if you want PAN required, remove this else-block
    }

    // Aadhaar (optional — only validate when provided)
    if (d.aadharNumber?.trim()) {
      const aErr = validateAadhaar(d.aadharNumber);
      if (aErr) errors.aadharNumber = aErr;
    }

    setValidationErrors(errors);
    return errors;
  };

  // NEXT BUTTON
  const handleNext = () => {
    const errors = validate(formData);

    if (Object.keys(errors).length === 0) {
      const transformedData = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        doorNo: formData.doorNo,
        address1: formData.street,
        address2: formData.area,
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode,
        selectedState: formData.state,
        country: "India",
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber,
        nomeni: formData.nomeni,
        mobile2: formData.mobile2,
      };

      console.log("Transformed data for AddNewMember:", transformedData);
      onNext(transformedData);
      return;
    }

    // focus the first error field
    const firstError = Object.keys(errors)[0];
    if (firstError && inputRefs.current[firstError]) {
      try {
        inputRefs.current[firstError].measure((x, y, w, h, px, py) => {
          scrollViewRef.current?.scrollTo({ y: py - 100, animated: true });
          inputRefs.current[firstError]?.focus?.();
        });
      } catch (e) {
        // some readOnly fields may not support focus/measure — ignore
      }
    }

    Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
  };

  // CLEAR DATA
  const clearSavedData = async () => {
    await AsyncStorage.removeItem("digigoldMemberForm");
    setFormData(INITIAL_FORM);
    setValidationErrors({});
    Alert.alert("Cleared", "Form data reset.");
  };

  // UI render (unchanged)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight || 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Confirm Your KYC Details</Text>
          <Text style={styles.headerSubtitle}>To Join Our Schemes</Text>

          <TouchableOpacity onPress={clearSavedData} style={styles.clearBtn}>
            <MaterialIcons name="delete" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* BASIC DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.errorInput]}
              value={formData.name}
              editable={true}
              onChangeText={(t) => updateField("name", t)}
              placeholder="Enter Name"
              placeholderTextColor={COLORS.inputPlaceholder}
              onFocus={() => setActiveInput("name")}
              ref={(ref) => (inputRefs.current.name = ref)}
            />
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          {/* Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>

            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>+91</Text>

              <TextInput
                style={[
                  styles.mobileField,
                  validationErrors.mobile && styles.errorInput,
                ]}
                value={formData.mobile}
                editable={false}
                maxLength={10}
                keyboardType="numeric"
                onChangeText={handleMobile}
                placeholder="Enter Mobile Number"
                placeholderTextColor={COLORS.inputPlaceholder}
                onFocus={() => setActiveInput("mobile")}
                ref={(ref) => (inputRefs.current.mobile = ref)}
              />
            </View>

            {validationErrors.mobile && (
              <Text style={styles.errorText}>{validationErrors.mobile}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.email && styles.errorInput,
              ]}
              value={formData.email}
              editable={true}
              onChangeText={(t) => updateField("email", t)}
              keyboardType="email-address"
              placeholder="Enter Email"
              placeholderTextColor={COLORS.inputPlaceholder}
              onFocus={() => setActiveInput("email")}
              ref={(ref) => (inputRefs.current.email = ref)}
            />
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>
        </View>

        {/* ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          {renderInput("doorNo", "Door No. *")}
          {renderInput("street", "Street *")}
          {renderInput("area", "Area / Locality *")}

          {/* PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.pincode && styles.errorInput,
              ]}
              value={formData.pincode}
              maxLength={6}
              keyboardType="numeric"
              onFocus={() => setActiveInput("pincode")}
              onChangeText={handlePincode}
              ref={(ref) => (inputRefs.current.pincode = ref)}
              placeholder="Enter PIN Code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.pincode && (
              <Text style={styles.errorText}>{validationErrors.pincode}</Text>
            )}
          </View>

          {/* DISTRICT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.city && (
              <Text style={styles.errorText}>{validationErrors.city}</Text>
            )}
          </View>

          {/* STATE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.state && (
              <Text style={styles.errorText}>{validationErrors.state}</Text>
            )}
          </View>
        </View>

        {/* NOMINEE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nominee Details</Text>

          {renderInput("nomeni", "Nominee Name *")}

          {/* Nominee Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nominee Mobile Number *</Text>
            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={[styles.mobileField]}
                maxLength={10}
                value={formData.mobile2}
                onChangeText={handleNomineeMobile}
                onFocus={() => setActiveInput("mobile2")}
                ref={(ref) => (inputRefs.current.mobile2 = ref)}
                placeholder="Enter Nominee Mobile"
                keyboardType="numeric"
              />
            </View>
            {validationErrors.mobile2 && (
              <Text style={styles.errorText}>{validationErrors.mobile2}</Text>
            )}
          </View>
        </View>

        {/* OPTIONAL KYC */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KYC Documents (Optional)</Text>
          <Text style={styles.optionalNote}>
            These documents are optional but recommended.
          </Text>

          {/* PAN */}
          {renderInput("panNumber", "PAN Number", handlePan)}

          {/* Aadhar */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhar Number</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.aadharNumber && styles.errorInput,
              ]}
              value={formData.aadharNumber}
              maxLength={12}
              onChangeText={handleAadhar}
              onFocus={() => setActiveInput("aadharNumber")}
              ref={(ref) => (inputRefs.current.aadharNumber = ref)}
              placeholder="Enter Aadhar Number"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="numeric"
            />
            {validationErrors.aadharNumber && (
              <Text style={styles.errorText}>
                {validationErrors.aadharNumber}
              </Text>
            )}
          </View>
        </View>

        {/* CONFIRM BUTTON */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleNext}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTab />
    </KeyboardAvoidingView>
  );

  // SMALL REUSABLE INPUT COMPONENT
  function renderInput(field, label, handler) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, validationErrors[field] && styles.errorInput]}
          value={formData[field]}
          onChangeText={handler || ((t) => updateField(field, t))}
          onFocus={() => setActiveInput(field)}
          ref={(ref) => (inputRefs.current[field] = ref)}
          placeholder={`Enter ${label}`}
          placeholderTextColor={COLORS.inputPlaceholder}
        />
        {validationErrors[field] && (
          <Text style={styles.errorText}>{validationErrors[field]}</Text>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    padding: SIZES.padding.lg 
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
    position: "relative",
    ...SHADOWS.md,
  },
  backBtn: {
    position: "absolute",
    left: SIZES.padding.lg,
    top: SIZES.padding.lg,
  },
  clearBtn: {
    position: "absolute",
    right: SIZES.padding.lg,
    top: SIZES.padding.lg,
    backgroundColor: COLORS.primaryDark,
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.white,
    marginTop: SIZES.margin.sm,
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginTop: SIZES.margin.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
  },
  optionalNote: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SIZES.margin.md,
  },
  inputGroup: { 
    marginBottom: SIZES.margin.md 
  },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  input: {
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  errorInput: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  mobileInput: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.padding.md,
  },
  countryCode: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginRight: SIZES.margin.sm,
  },
  mobileField: { 
    flex: 1, 
    ...FONTS.body, 
    color: COLORS.textPrimary 
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: SIZES.button.lg,
    borderRadius: SIZES.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SIZES.margin.xl,
    ...SHADOWS.md,
  },
  confirmText: {
    ...FONTS.button,
    color: COLORS.white,
  },
});

export default MemberDetailsPage;