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
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTab } from "../../components";
import { SHADOWS, COLORS, SIZES, FONTS } from "../../utils/AppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
} from "./Validations";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  dateOfBirth: "",
  maritalStatus: "",
  anniversaryDate: "",
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
  selectedSchemeId: null,
  selectedSchemeName: "",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MemberDetailsPage = ({
  onNext,
  onBack,
  onSchemeSelect,
  validationErrors,
  setValidationErrors,
  initialSchemeId,
  initialSchemeName,
  allSchemes,
  isFetchingSchemes
}) => {
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});
  const navigation = useNavigation();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  // Scheme selection state
  const [selectedScheme, setSelectedScheme] = useState({
    id: initialSchemeId || null,
    name: initialSchemeName || "Select a Scheme"
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    day: "01",
    month: "01",
    year: "1990",
  });

  // Aadhaar validation state
  const [isAadhaarValid, setIsAadhaarValid] = useState(false);
  const [isValidatingAadhaar, setIsValidatingAadhaar] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // LOAD SAVED FORM
  useEffect(() => {
    const loadInitialData = async () => {
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
          selectedSchemeId: initialSchemeId || savedData.selectedSchemeId || null,
          selectedSchemeName: initialSchemeName || savedData.selectedSchemeName || "",
        }));

        // Update selectedScheme state
        if (initialSchemeId || savedData.selectedSchemeId) {
          setSelectedScheme({
            id: initialSchemeId || savedData.selectedSchemeId,
            name: initialSchemeName || savedData.selectedSchemeName || "Select a Scheme"
          });
        }

        if (savedData.dateOfBirth) {
          const [year, month, day] = savedData.dateOfBirth.split("-");
          setSelectedDate({ day, month, year });
        }

        // Validate Aadhaar if present
        if (savedData.aadharNumber) {
          const aadhaarErr = validateAadhaar(savedData.aadharNumber);
          setIsAadhaarValid(!aadhaarErr);
        }
      } catch (e) {
        console.error("Load error:", e);
      }
    };

    loadInitialData();
  }, [initialSchemeId, initialSchemeName]);

  // SAVE FORM ON CHANGE
  useEffect(() => {
    const dataToSave = {
      ...formData,
      selectedSchemeId: selectedScheme.id,
      selectedSchemeName: selectedScheme.name,
    };
    AsyncStorage.setItem("digigoldMemberForm", JSON.stringify(dataToSave)).catch(
      (err) => console.error("Save error:", err)
    );
  }, [formData, selectedScheme]);

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

    // Clear any existing error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Validate Aadhaar in real-time
    if (field === "aadharNumber") {
      if (value.length === 12) {
        setIsValidatingAadhaar(true);
        setTimeout(() => {
          const aadhaarErr = validateAadhaar(value);
          setIsAadhaarValid(!aadhaarErr);
          setIsValidatingAadhaar(false);
          
          if (aadhaarErr && validationErrors.aadharNumber !== aadhaarErr) {
            setValidationErrors((prev) => ({ ...prev, aadharNumber: aadhaarErr }));
          } else if (!aadhaarErr && validationErrors.aadharNumber) {
            setValidationErrors((prev) => ({ ...prev, aadharNumber: "" }));
          }
        }, 500);
      } else {
        setIsAadhaarValid(false);
      }
    }
  };

  // Special handlers
  const handleMobile = (t) => {
    updateField("mobile", t.replace(/\D/g, ""));
  };

  const handleNomineeMobile = (t) => {
    updateField("mobile2", t.replace(/\D/g, ""));
  };

  const handlePincode = (t) => {
    updateField("pincode", t.replace(/\D/g, ""));
  };

  const handlePan = (t) => {
    updateField("panNumber", t.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
  };

  const handleAadhar = (t) => {
    // Allow only digits and format with spaces for readability
    const cleanValue = t.replace(/\D/g, "");
    
    // Format as XXXX XXXX XXXX
    let formattedValue = cleanValue;
    if (cleanValue.length > 8) {
      formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 8)} ${cleanValue.slice(8, 12)}`;
    } else if (cleanValue.length > 4) {
      formattedValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
    }
    
    updateField("aadharNumber", formattedValue.trim());
  };


  // DATE HANDLERS
  const openDatePicker = (type) => {
    if (type === "dob" && formData.dateOfBirth) {
      const [year, month, day] = formData.dateOfBirth.split("-");
      setSelectedDate({ day, month, year });
    } else if (type === "anniversary" && formData.anniversaryDate) {
      const [year, month, day] = formData.anniversaryDate.split("-");
      setSelectedDate({ day, month, year });
    } else {
      setSelectedDate({ day: "", month: "", year: "" });
    }
    setShowDatePicker(type);
  };

  const handleDateConfirm = () => {
    if (!selectedDate.day || !selectedDate.month || !selectedDate.year) {
      Alert.alert("Error", "Please select a valid date");
      return;
    }

    const formattedDate = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;

    if (showDatePicker === "dob") {
      updateField("dateOfBirth", formattedDate);
    } else if (showDatePicker === "anniversary") {
      updateField("anniversaryDate", formattedDate);
    }

    setShowDatePicker(null);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // MARITAL STATUS HANDLER
  const handleMaritalStatus = (status) => {
    updateField("maritalStatus", status);
    if (status === "unmarried") {
      updateField("anniversaryDate", "");
    }
  };

  // VALIDATION
  const validate = (d = {}) => {
    const errors = {};

    // Safety guard
    if (!d || typeof d !== "object") {
      errors.form = "Form data missing";
      setValidationErrors(errors);
      return errors;
    }

   
    /* ---------------- Name ---------------- */
    const nameErr = validateName(d.name || "");
    if (nameErr) errors.name = nameErr;

    /* ---------------- Date of Birth ---------------- */
    const dobErr = validateDOB(d.dateOfBirth || "");
    if (dobErr) errors.dateOfBirth = dobErr;

    /* ---------------- Marital Status ---------------- */
    if (!d.maritalStatus) {
      errors.maritalStatus = "Marital Status is required";
    }

    /* ---------------- Anniversary (if married) ---------------- */
    if (
      d.maritalStatus === "married" &&
      !d.anniversaryDate?.trim()
    ) {
      errors.anniversaryDate = "Anniversary Date is required";
    } else if (d.maritalStatus === "married" && d.anniversaryDate) {
      const anniversaryDate = new Date(d.anniversaryDate);
      const today = new Date();
      
      if (anniversaryDate > today) {
        errors.anniversaryDate = "Anniversary cannot be in the future";
      }
    }

    /* ---------------- Mobile ---------------- */
    const mobileErr = validateMobile(d.mobile || "");
    if (mobileErr) errors.mobile = mobileErr;

    /* ---------------- Email (optional) ---------------- */
    if (d.email?.trim()) {
      const emailErr = validateEmail(d.email);
      if (emailErr) errors.email = emailErr;
    }

    /* ---------------- Address ---------------- */
    const doorNoErr = validateAddressField(d.doorNo || "", "Door No.");
    if (doorNoErr) errors.doorNo = doorNoErr;

    const streetErr = validateAddressField(d.street || "", "Street");
    if (streetErr) errors.street = streetErr;

    const areaErr = validateAddressField(d.area || "", "Area/Locality");
    if (areaErr) errors.area = areaErr;

    const pinErr = validatePincode(d.pincode || "");
    if (pinErr) errors.pincode = pinErr;

    if (!d.city?.trim()) errors.city = "City is required";
    if (!d.state?.trim()) errors.state = "State is required";

    /* ---------------- Nominee ---------------- */
    const nomineeErr = validateNomineeName(d.nomeni || "");
    if (nomineeErr) errors.nomeni = nomineeErr;

    const nomMobileErr = validateMobile(d.mobile2 || "");
    if (nomMobileErr) errors.mobile2 = nomMobileErr;

    /* ---------------- PAN (optional) ---------------- */
    if (d.panNumber?.trim()) {
      const panErr = validatePAN(d.panNumber);
      if (panErr) errors.panNumber = panErr;
    }

    /* ---------------- Aadhaar ---------------- */
    const aadhaarErr = validateAadhaar(d.aadharNumber?.replace(/\s/g, '') || "");
    if (aadhaarErr) errors.aadharNumber = aadhaarErr;

    setValidationErrors(errors);
    return errors;
  };

  // NEXT BUTTON
  const handleNext = () => {
    const errors = validate(formData);
    
    if (Object.keys(errors).length === 0 && selectedScheme.id) {
      const transformedData = {
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        anniversaryDate: formData.anniversaryDate,
        doorNo: formData.doorNo.trim(),
        address1: formData.street.trim(),
        address2: formData.area.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode,
        selectedState: formData.state.trim(),
        country: "India",
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber.replace(/\s/g, ''),
        aadhaarVerified: isAadhaarValid,
        nomeni: formData.nomeni.trim(),
        mobile2: formData.mobile2,
        selectedSchemeId: selectedScheme.id,
        selectedSchemeName: selectedScheme.name,
      };

      console.log("Transformed data for next step:", transformedData);

      // Call onNext prop
      if (onNext && typeof onNext === 'function') {
        onNext(transformedData);
      }

      return;
    }

    // Focus the first error field
    const firstError = Object.keys(errors)[0];
    if (firstError && inputRefs.current[firstError]) {
      try {
        inputRefs.current[firstError].measure((x, y, w, h, px, py) => {
          scrollViewRef.current?.scrollTo({ y: py - 100, animated: true });
          inputRefs.current[firstError]?.focus?.();
        });
      } catch (e) {
        // Some readOnly fields may not support focus/measure - ignore
      }
    }

    if (!selectedScheme.id) {
      Alert.alert("Scheme Required", "Please select a scheme to continue.");
    } else {
      Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
    }
  };

  // CLEAR DATA
  const clearSavedData = async () => {
    await AsyncStorage.removeItem("digigoldMemberForm");
    setFormData((prev) => ({
      ...INITIAL_FORM,
      mobile: prev.mobile, // Preserve user mobile number
    }));

    setSelectedScheme({
      id: initialSchemeId || null,
      name: initialSchemeName || "Select a Scheme"
    });

    setValidationErrors({});
    setIsAadhaarValid(false);
    Alert.alert("Cleared", "Form data reset (mobile number preserved).");
  };

  // Helper function to render input
  const renderInput = (field, label, handler, isRequired = true) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} {isRequired ? "*" : ""}
        </Text>
        <TextInput
          style={[
            styles.input,
            validationErrors[field] && styles.errorInput,
            field === "aadharNumber" && isAadhaarValid && styles.verifiedInput,
          ]}
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

        {field === "aadharNumber" && isValidatingAadhaar && (
          <View style={styles.validationStatus}>
            <ActivityIndicator size="small" color={COLORS.info} />
            <Text style={styles.validatingText}>Validating Aadhaar...</Text>
          </View>
        )}

        {field === "aadharNumber" && isAadhaarValid && !isValidatingAadhaar && (
          <View style={styles.validationStatus}>
            <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.validText}>Aadhaar is valid</Text>
          </View>
        )}
      </View>
    );
  };

  // Custom Picker Component
  const renderCustomPicker = () => {
    return (
      <View style={styles.pickerContainer}>
        {/* Day Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Day</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.pickerItem,
                  selectedDate.day === day && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, day }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.day === day && styles.pickerItemTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Month</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {months.map((month) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.pickerItem,
                  selectedDate.month === month && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, month }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.month === month &&
                    styles.pickerItemTextSelected,
                  ]}
                >
                  {MONTHS[parseInt(month) - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
          >
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.pickerItem,
                  selectedDate.year === year && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedDate((prev) => ({ ...prev, year }))}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedDate.year === year && styles.pickerItemTextSelected,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Aadhaar validation UI component
  const renderAadhaarSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Aadhaar Verification
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Aadhaar Number *</Text>
        
        <View style={styles.aadhaarContainer}>
          <TextInput
            style={[
              styles.input,
              styles.aadhaarInput,
              validationErrors.aadharNumber && styles.errorInput,
              isAadhaarValid && styles.verifiedInput,
            ]}
            value={formData.aadharNumber}
            onChangeText={handleAadhar}
            onFocus={() => setActiveInput("aadharNumber")}
            ref={(ref) => (inputRefs.current.aadharNumber = ref)}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor={COLORS.inputPlaceholder}
            keyboardType="numeric"
            maxLength={14} // 12 digits + 2 spaces
          />
        </View>

        {validationErrors.aadharNumber && (
          <Text style={styles.errorText}>{validationErrors.aadharNumber}</Text>
        )}

        {isValidatingAadhaar && (
          <Text style={styles.infoNote}>Validating Aadhaar...</Text>
        )}

        {isAadhaarValid && !isValidatingAadhaar && (
          <View style={styles.successContainer}>
            <MaterialIcons name="verified" size={16} color={COLORS.success} />
            <Text style={styles.successNote}>Aadhaar number is valid</Text>
          </View>
        )}

        <Text style={styles.helperText}>
          Enter your 12-digit Aadhaar number. The system will validate it.
        </Text>
      </View>
    </View>
  );

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

        {/* AADHAAR SECTION */}
        {renderAadhaarSection()}

       

        {/* BASIC DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          
          {renderInput("name", "Name", null, true)}

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Date of Birth *
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                validationErrors.dateOfBirth && styles.errorInput,
              ]}
              onPress={() => openDatePicker("dob")}
            >
              <Text
                style={[
                  formData.dateOfBirth
                    ? styles.dateText
                    : styles.placeholderText,
                ]}
              >
                {formData.dateOfBirth
                  ? formatDateDisplay(formData.dateOfBirth)
                  : "Select Date of Birth"}
              </Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.textSecondary}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
            {validationErrors.dateOfBirth && (
              <Text style={styles.errorText}>
                {validationErrors.dateOfBirth}
              </Text>
            )}
          </View>

          {/* Marital Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Marital Status *
            </Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.maritalStatus === "married" &&
                  styles.checkboxSelected,
                ]}
                onPress={() => handleMaritalStatus("married")}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    formData.maritalStatus === "married" &&
                    styles.checkboxTextSelected,
                  ]}
                >
                  Married
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.maritalStatus === "unmarried" &&
                  styles.checkboxSelected,
                ]}
                onPress={() => handleMaritalStatus("unmarried")}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    formData.maritalStatus === "unmarried" &&
                    styles.checkboxTextSelected,
                  ]}
                >
                  Unmarried
                </Text>
              </TouchableOpacity>
            </View>
            {validationErrors.maritalStatus && (
              <Text style={styles.errorText}>
                {validationErrors.maritalStatus}
              </Text>
            )}
          </View>

          {/* Anniversary Date (only show if married) */}
          {formData.maritalStatus === "married" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Anniversary Date *
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  validationErrors.anniversaryDate && styles.errorInput,
                ]}
                onPress={() => openDatePicker("anniversary")}
              >
                <Text
                  style={[
                    formData.anniversaryDate
                      ? styles.dateText
                      : styles.placeholderText,
                  ]}
                >
                  {formData.anniversaryDate
                    ? formatDateDisplay(formData.anniversaryDate)
                    : "Select Anniversary Date"}
                </Text>
                <MaterialIcons
                  name="event"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.dateIcon}
                />
              </TouchableOpacity>
              {validationErrors.anniversaryDate && (
                <Text style={styles.errorText}>
                  {validationErrors.anniversaryDate}
                </Text>
              )}
            </View>
          )}

          {/* Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mobile Number *
            </Text>
            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>
                +91
              </Text>
              <TextInput
                style={[
                  styles.mobileField,
                  validationErrors.mobile && styles.errorInput,
                ]}
                value={formData.mobile}
                editable={false}
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
          {renderInput("email", "Email", null, false)}
        </View>

        {/* ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          {renderInput("doorNo", "Door No.", null, true)}
          {renderInput("street", "Street", null, true)}
          {renderInput("area", "Area / Locality", null, true)}

          {/* PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              PIN Code *
            </Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.pincode && styles.errorInput,
              ]}
              value={formData.pincode}
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
            <Text style={styles.label}>
              District *
            </Text>
            <TextInput
              style={[styles.input]}
              value={formData.city}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled from PIN code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.city && (
              <Text style={styles.errorText}>{validationErrors.city}</Text>
            )}
          </View>

          {/* STATE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              State *
            </Text>
            <TextInput
              style={[styles.input]}
              value={formData.state}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-filled from PIN code"
              placeholderTextColor={COLORS.inputPlaceholder}
            />
            {validationErrors.state && (
              <Text style={styles.errorText}>{validationErrors.state}</Text>
            )}
          </View>
        </View>

        {/* PAN (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAN Card (Optional)</Text>
          <Text style={styles.optionalNote}>
            PAN is optional but recommended for financial transactions.
          </Text>
          {renderInput("panNumber", "PAN Number", handlePan, false)}
        </View>

        {/* NOMINEE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nominee Details</Text>
          
          {renderInput("nomeni", "Nominee Name", null, true)}

          {/* Nominee Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nominee Mobile Number *
            </Text>
            <View style={styles.mobileInput}>
              <Text style={styles.countryCode}>
                +91
              </Text>
              <TextInput
                style={[
                  styles.mobileField,
                  validationErrors.mobile2 && styles.errorInput,
                ]}
                value={formData.mobile2}
                onChangeText={handleNomineeMobile}
                onFocus={() => setActiveInput("mobile2")}
                ref={(ref) => (inputRefs.current.mobile2 = ref)}
                placeholder="Enter Nominee Mobile"
                keyboardType="numeric"
                placeholderTextColor={COLORS.inputPlaceholder}
              />
            </View>
            {validationErrors.mobile2 && (
              <Text style={styles.errorText}>{validationErrors.mobile2}</Text>
            )}
          </View>
        </View>

        {/* CONFIRM BUTTON */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (loading || !selectedScheme.id) && styles.confirmBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={loading || !selectedScheme.id}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.confirmText}>
              {!selectedScheme.id ? "Select Scheme First" : "Confirm & Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* CUSTOM DATE PICKER MODAL */}
      <Modal visible={!!showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker === "dob"
                  ? "Select Date of Birth"
                  : "Select Anniversary Date"}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedDatePreview}>
              Selected: {selectedDate.day}/{selectedDate.month}/
              {selectedDate.year}
            </Text>

            {renderCustomPicker()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setButton}
                onPress={handleDateConfirm}
              >
                <Text style={styles.setButtonText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTab />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding.lg,
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
    marginBottom: SIZES.margin.md,
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
    justifyContent: "center",
    ...FONTS.body,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorInput: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  verifiedInput: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.inputPlaceholder,
    flex: 1,
  },
  dateIcon: {
    marginLeft: SIZES.margin.sm,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.margin.xs,
  },
  checkbox: {
    flex: 1,
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.margin.xs,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  checkboxText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  checkboxTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  mobileInput: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
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
    color: COLORS.textPrimary,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
  },
  loadingText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
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
  confirmBtnDisabled: {
    backgroundColor: COLORS.disabled,
  },
  confirmText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  // Aadhaar specific styles
  aadhaarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  aadhaarInput: {
    flex: 1,
  },
  validationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  validatingText: {
    ...FONTS.caption,
    color: COLORS.info,
    marginLeft: 4,
  },
  validText: {
    ...FONTS.caption,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: "600",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.xs,
  },
  infoNote: {
    ...FONTS.caption,
    color: COLORS.info,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  successNote: {
    ...FONTS.caption,
    color: COLORS.success,
    marginTop: SIZES.margin.xs,
    fontWeight: "600",
  },
  helperText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    fontStyle: "italic",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.padding.lg,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  modalTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedDatePreview: {
    ...FONTS.body,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SIZES.margin.lg,
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    height: 200,
    marginBottom: SIZES.margin.lg,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },
  pickerLabel: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.margin.sm,
    fontWeight: "600",
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    marginVertical: 2,
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerItemText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  pickerItemTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.margin.lg,
  },
  cancelButton: {
    height: SIZES.button.md,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.md,
  },
  cancelButtonText: {
    ...FONTS.button,
    color: COLORS.textSecondary,
  },
  setButton: {
    height: SIZES.button.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.md,
  },
  setButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
});

export default MemberDetailsPage;