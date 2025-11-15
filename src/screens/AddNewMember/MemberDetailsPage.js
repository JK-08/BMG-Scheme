import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { SHADOWS, COLORS, SIZES, FONTS } from "../../utils/MainTheme";
import { MaterialIcons } from "@expo/vector-icons";

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

  // -------------------------------------------------------------------
  // LOAD SAVED FORM + USER PROFILE
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // SAVE FORM ON CHANGE
  // -------------------------------------------------------------------
  useEffect(() => {
    AsyncStorage.setItem("digigoldMemberForm", JSON.stringify(formData)).catch(
      (err) => console.error("Save error:", err)
    );
  }, [formData]);

  // -------------------------------------------------------------------
  // KEYBOARD HANDLING
  // -------------------------------------------------------------------
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);

      if (activeInput && inputRefs.current[activeInput]) {
        setTimeout(() => {
          inputRefs.current[activeInput].measure((x, y, w, h, px, py) => {
            scrollViewRef.current?.scrollTo({
              y: py - 120,
              animated: true,
            });
          });
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

  // -------------------------------------------------------------------
  // FETCH PINCODE -> DISTRICT & STATE
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchLocation = async () => {
      if (formData.pincode.length !== 6) {
        setFormData((prev) => ({ ...prev, city: "", state: "" }));
        return;
      }

      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${formData.pincode}`
        );
        const data = await res.json();

        if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const district = data[0].PostOffice[0].District;
          const state = data[0].PostOffice[0].State;

          setFormData((prev) => ({
            ...prev,
            city: district,
            state,
          }));

          setValidationErrors((prev) => ({ ...prev, pincode: "" }));
        } else {
          setFormData((prev) => ({ ...prev, city: "", state: "" }));
          setValidationErrors((prev) => ({
            ...prev,
            pincode: "Invalid PIN Code",
          }));
        }
      } catch (err) {
        console.error("PIN fetch error:", err);
      }
    };

    fetchLocation();
  }, [formData.pincode]);

  // -------------------------------------------------------------------
  // FIELD UPDATE HANDLER
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------------------
  const validate = (d) => {
    const errors = {};
    const required = (field, msg) => {
      if (!d[field]?.trim()) errors[field] = msg;
    };

    required("name", "Name is required");
    if (!/^\d{10}$/.test(d.mobile))
      errors.mobile = "Enter valid 10-digit mobile";
    if (!/^\S+@\S+\.\S+$/.test(d.email)) errors.email = "Enter valid email";

    required("doorNo", "Door No. is required");
    required("street", "Street is required"); // This is now address1
    required("area", "Area/Locality is required"); // This is now address2

    if (!/^\d{6}$/.test(d.pincode)) errors.pincode = "Enter 6-digit PIN";

    required("city", "City is required");
    required("state", "State is required"); // This is now selectedState

    required("nomeni", "Nominee Name is required");
    if (!/^\d{10}$/.test(d.mobile2))
      errors.mobile2 = "Enter valid 10-digit nominee mobile";

    if (d.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(d.panNumber))
      errors.panNumber = "Enter valid PAN number";

    if (d.aadharNumber && !/^\d{12}$/.test(d.aadharNumber))
      errors.aadharNumber = "Enter valid 12-digit Aadhar number";

    setValidationErrors(errors);
    return errors;
  };

  // -------------------------------------------------------------------
  // NEXT BUTTON
  // -------------------------------------------------------------------
  const handleNext = () => {
    const errors = validate(formData);

    if (Object.keys(errors).length === 0) {
      // Transform data to match AddNewMember's expected structure
      const transformedData = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        doorNo: formData.doorNo,
        address1: formData.street, // Map street to address1
        address2: formData.area, // Map area to address2
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode,
        selectedState: formData.state, // Map state to selectedState
        country: "India", // Hardcode as India
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber,
        nomeni: formData.nomeni,
        mobile2: formData.mobile2,
      };

      console.log("Transformed data for AddNewMember:", transformedData);
      onNext(transformedData);
      return;
    }

    const firstError = Object.keys(errors)[0];
    if (firstError && inputRefs.current[firstError]) {
      inputRefs.current[firstError]?.measure((x, y, w, h, px, py) => {
        scrollViewRef.current?.scrollTo({ y: py - 100, animated: true });
        inputRefs.current[firstError]?.focus?.();
      });
    }

    Alert.alert("Incomplete Form", "Please fill all required fields.");
  };
  // -------------------------------------------------------------------
  // CLEAR DATA
  // -------------------------------------------------------------------
  const clearSavedData = async () => {
    await AsyncStorage.removeItem("digigoldMemberForm");
    setFormData(INITIAL_FORM);
    Alert.alert("Cleared", "Form data reset.");
  };

  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
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
              style={[styles.input, { backgroundColor: COLORS.disabled }]}
              value={formData.name}
              editable={false}
            />
          </View>

          {/* Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={[
                  styles.mobileField,
                  { backgroundColor: COLORS.disabled },
                ]}
                value={formData.mobile}
                editable={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.disabled }]}
              value={formData.email}
              editable={false}
            />
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
            />
          </View>

          {/* STATE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              editable={false}
            />
          </View>
        </View>

        {/* NOMINEE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nominee Details</Text>

          {/* Nominee Name */}
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

  // -------------------------------------------------------------------
  // SMALL REUSABLE INPUT COMPONENT
  // -------------------------------------------------------------------
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.md },
  header: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: "center",
    marginBottom: SIZES.lg,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: SIZES.md,
    top: SIZES.md,
  },
  clearBtn: {
    position: "absolute",
    right: SIZES.md,
    top: SIZES.md,
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    ...FONTS.h5,
    color: COLORS.white,
    fontFamily: "PoppinsBold",
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.md,
  },
  sectionTitle: {
    ...FONTS.h6,
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    fontFamily: "PoppinsBold",
  },
  optionalNote: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SIZES.md,
  },
  inputGroup: { marginBottom: SIZES.md },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.md,
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  errorInput: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  mobileInput: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SIZES.md,
  },
  countryCode: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginRight: 8,
  },
  mobileField: { flex: 1, ...FONTS.body, color: COLORS.textPrimary },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: SIZES.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SIZES.lg,
  },
  confirmText: {
    ...FONTS.h6,
    color: COLORS.white,
    fontFamily: "PoppinsBold",
  },
});

export default MemberDetailsPage;
