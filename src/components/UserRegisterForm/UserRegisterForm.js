import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";

// Import components
import CommonHeader from "../CommonHeader/CommonHeader";
import {
  OTPModal,
  CustomInput,
  DataRow,
  ConsentModal,
  CustomButton,
} from "./RegisterComponents";
import { useNavigation } from "@react-navigation/native";

// Import hooks and services
import { useUserProfile } from "./Userhook";
import { styles } from "./UserStyles";

// ===== CUSTOM DATE PICKER COMPONENT =====
const CustomDatePicker = ({ visible, currentDate, onSelectDate, onClose }) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthsFull = [
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

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const [yearsList, setYearsList] = useState([]);
  const [daysList, setDaysList] = useState([]);

  // Refs for ScrollViews
  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);

  // Item height for calculation
  const ITEM_HEIGHT = 40;

  // Generate years (100 years back from current year)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    setYearsList(years);

    // Initialize with current date or passed date
    if (currentDate) {
      const date = new Date(currentDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    }
  }, [currentDate]);

  // Generate days based on selected month and year
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    setDaysList(days);

    // Adjust selected day if it exceeds days in month
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (yearScrollRef.current && yearsList.length > 0) {
      const yearIndex = yearsList.findIndex((y) => y === selectedYear);
      const scrollY = yearIndex * ITEM_HEIGHT;
      yearScrollRef.current.scrollTo({ y: scrollY, animated: true });
    }
  }, [selectedYear, yearsList]);

  useEffect(() => {
    if (monthScrollRef.current) {
      const scrollY = selectedMonth * ITEM_HEIGHT;
      monthScrollRef.current.scrollTo({ y: scrollY, animated: true });
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (dayScrollRef.current && daysList.length > 0) {
      const dayIndex = selectedDay - 1;
      const scrollY = dayIndex * ITEM_HEIGHT;
      dayScrollRef.current.scrollTo({ y: scrollY, animated: true });
    }
  }, [selectedDay, daysList]);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(selectedDay).padStart(2, "0")}`;
    onSelectDate(formattedDate);
    onClose();
  };

  const getCurrentDate = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    return date.toDateString();
  };

  // Render items with centered selection indicator
  const renderYearItem = (year, index) => {
    const isSelected = selectedYear === year;
    return (
      <TouchableOpacity
        key={year}
        style={[styles.columnItem, isSelected && styles.columnItemSelected]}
        onPress={() => handleYearSelect(year)}
      >
        <View
          style={[
            styles.columnItemContent,
            isSelected && styles.columnItemContentSelected,
          ]}
        >
          <Text
            style={[
              styles.columnItemText,
              isSelected && styles.columnItemTextSelected,
            ]}
          >
            {year}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMonthItem = (month, index) => {
    const isSelected = selectedMonth === index;
    return (
      <TouchableOpacity
        key={index}
        style={[styles.columnItem, isSelected && styles.columnItemSelected]}
        onPress={() => handleMonthSelect(index)}
      >
        <View
          style={[
            styles.columnItemContent,
            isSelected && styles.columnItemContentSelected,
          ]}
        >
          <Text
            style={[
              styles.columnItemText,
              isSelected && styles.columnItemTextSelected,
            ]}
          >
            {month}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayItem = (day, index) => {
    const isSelected = selectedDay === day;
    return (
      <TouchableOpacity
        key={day}
        style={[styles.columnItem, isSelected && styles.columnItemSelected]}
        onPress={() => handleDaySelect(day)}
      >
        <View
          style={[
            styles.columnItemContent,
            isSelected && styles.columnItemContentSelected,
          ]}
        >
          <Text
            style={[
              styles.columnItemText,
              isSelected && styles.columnItemTextSelected,
            ]}
          >
            {day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.datePickerModalContainer}>
        <View style={styles.datePickerModalContent}>
          {/* Header */}
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.datePickerCloseButton}
            >
              <Text style={styles.datePickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Selection Display */}
          <View style={styles.selectedDatePreview}>
            <Text style={styles.selectedDatePreviewText}>
              {getCurrentDate()}
            </Text>
          </View>

          {/* Three Row Selector */}
          <View style={styles.threeRowSelector}>
            {/* Year Column */}
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Year</Text>
              <View style={styles.columnScrollContainer}>
                {/* Only middle indicator remains */}
                <View style={styles.selectionIndicatorMiddle} />

                <ScrollView
                  ref={yearScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {yearsList.map(renderYearItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>

            {/* Month Column */}
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Month</Text>
              <View style={styles.columnScrollContainer}>
                {/* Only middle indicator remains */}
                <View style={styles.selectionIndicatorMiddle} />

                <ScrollView
                  ref={monthScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {months.map(renderMonthItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>

            {/* Day Column */}
            <View style={[styles.columnContainer, styles.columnContainerLast]}>
              <Text style={styles.columnTitle}>Day</Text>
              <View style={styles.columnScrollContainer}>
                {/* Only middle indicator remains */}
                <View style={styles.selectionIndicatorMiddle} />

                <ScrollView
                  ref={dayScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {daysList.map(renderDayItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerCancelButton}
              onPress={onClose}
            >
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.datePickerConfirmText}>Select Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ===== DATE OF BIRTH INPUT COMPONENT =====
const DateOfBirthInput = ({
  value,
  onChangeText,
  error,
  required,
  isValid,
  showValidationIcon,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <View style={styles.dobContainer}>
      <View style={styles.dobInputHeader}>
        <Text style={styles.inputLabel}>
          Date of Birth{" "}
          {required && <Text style={styles.requiredIndicator}>*</Text>}
        </Text>
        {showValidationIcon && isValid && (
          <View style={styles.validationIcon}>
            <Text>✅</Text>
          </View>
        )}
      </View>

      <View style={styles.dobInputWrapper}>
        <TextInput
          style={[
            styles.input,
            styles.dobInput,
            error && styles.inputError,
            isValid && styles.inputValid,
          ]}
          value={formatDateForDisplay(value)}
          onChangeText={onChangeText}
          placeholder="DD-MM-YYYY"
          editable={false}
        />
        <TouchableOpacity
          style={styles.calendarIconButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dobHintText}>Format: DD-MM-YYYY</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <CustomDatePicker
        visible={showDatePicker}
        currentDate={value}
        onSelectDate={onChangeText}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );
};

// ===== GENDER SELECTOR COMPONENT =====
const GenderSelector = ({ gender, updateField, errors }) => (
  <View style={styles.genderContainer}>
    <Text style={styles.genderLabel}>Gender *</Text>
    <View style={styles.genderOptions}>
      {["female", "male", "other"].map((g) => (
        <TouchableOpacity
          key={g}
          style={[
            styles.genderOption,
            gender === g && styles.genderOptionSelected,
          ]}
          onPress={() => updateField("gender", g)}
        >
          <Text
            style={[
              styles.genderOptionText,
              gender === g && styles.genderOptionTextSelected,
            ]}
          >
            {g === "female" ? "👩 Female" : g === "male" ? "👨 Male" : "Other"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {errors.gender && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{errors.gender}</Text>
      </View>
    )}
  </View>
);

// ===== UPDATED TERMS CHECKBOX COMPONENT =====
const TermsCheckbox = ({
  termsAccepted,
  updateField,
  errors,
  setShowTermsModal,
  aadhaarVerified,
}) => (
  <View style={styles.termsContainer}>
    <View style={styles.termsHeader}>
      <Text style={styles.termsLabel}>Terms and Conditions *</Text>
      <TouchableOpacity
        style={styles.termsHelpButton}
        onPress={setShowTermsModal}
      >
        <Text style={styles.termsHelpText}>❓</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.termsCheckboxRow}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          termsAccepted && styles.checkboxChecked,
          aadhaarVerified && styles.checkboxAutoAccepted,
        ]}
        onPress={() => {
          if (!aadhaarVerified) {
            updateField("termsAccepted", !termsAccepted);
          }
        }}
        disabled={aadhaarVerified}
      >
        {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        {aadhaarVerified ? (
          <View>
            <Text style={styles.autoAcceptedText}>
              ✅ Automatically accepted with Aadhaar verification
            </Text>
            <Text style={styles.termsHelperText}>
              Terms and Conditions are automatically accepted when Aadhaar is verified.
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14, color: "#374151" }}>
            I agree to the Terms and Conditions and Privacy Policy
          </Text>
        )}
      </View>
    </View>
    {errors.termsAccepted && !aadhaarVerified && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{errors.termsAccepted}</Text>
      </View>
    )}
    {aadhaarVerified && (
      <View style={styles.infoContainer}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Terms automatically accepted as part of Aadhaar verification
        </Text>
      </View>
    )}
  </View>
);

// ===== AADHAAR FIELD COMPONENT =====
const AadhaarField = ({
  formData,
  errors,
  updateField,
  handleVerifyAadhaar,
  verificationInProgress,
  pendingAadhaarVerification,
  userData,
}) => {
  const isAadhaarVerified =
    formData.aadhaarVerified || (userData && userData.aadhaarVerified);
  const maskedAadhaar = formData.maskedAadhaar || userData?.maskedAadhaar;

  if (isAadhaarVerified) {
    return (
      <View style={styles.verifiedAadhaarContainer}>
        <View style={styles.verifiedAadhaarHeader}>
          <Text style={styles.verifiedAadhaarLabel}>Aadhaar Number</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>✅ Verified</Text>
          </View>
        </View>

        <View style={styles.verifiedAadhaarContent}>
          <Text style={styles.verifiedAadhaarNumber}>
            {maskedAadhaar ||
              `XXXX-XXXX-${formData.idProofNo?.slice(8) || "****"}`}
          </Text>
        </View>
        <View style={styles.autoAcceptedNote}>
          <Text style={styles.autoAcceptedNoteText}>
            ✅ KYC & Terms automatically accepted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aadhaarFieldContainer}>
      <View style={styles.aadhaarInputHeader}>
        <Text style={styles.inputLabel}>Aadhaar Number</Text>
        <Text style={styles.requiredIndicator}> *</Text>
      </View>

      <View style={styles.aadhaarInputContainer}>
        <TextInput
          style={[
            styles.input,
            styles.aadhaarInput,
            formData.idProofNo &&
              formData.idProofNo.length === 12 &&
              !errors.idProofNo &&
              styles.inputAadhaarReady,
            errors.idProofNo && styles.inputError,
          ]}
          value={formData.idProofNo}
          onChangeText={(v) => updateField("idProofNo", v)}
          placeholder="12-digit Aadhaar number"
          keyboardType="number-pad"
          maxLength={12}
        />

        {formData.idProofNo &&
          formData.idProofNo.length === 12 &&
          !errors.idProofNo && (
            <View style={styles.aadhaarActions}>
              <TouchableOpacity
                style={styles.verifyButtonFull}
                onPress={handleVerifyAadhaar}
                disabled={verificationInProgress || pendingAadhaarVerification}
              >
                {verificationInProgress || pendingAadhaarVerification ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.verifyButtonText}>
                      🔐 Verify Aadhaar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
      </View>

      {errors.idProofNo && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errors.idProofNo}</Text>
        </View>
      )}
      
      <View style={styles.aadhaarNoteContainer}>
        <Text style={styles.aadhaarNoteText}>
          ℹ️ Aadhaar verification will automatically accept Terms & Conditions and complete KYC
        </Text>
      </View>
    </View>
  );
};

// ===== KYC STATUS BADGE =====
const KYCStatusBadge = ({ aadhaarVerified, kycVerified, termsAccepted }) => {
  if (aadhaarVerified && kycVerified && termsAccepted) {
    return (
      <View style={styles.fullKycBadge}>
        <Text style={styles.fullKycBadgeText}>✅ Full KYC Verified</Text>
      </View>
    );
  }
  
  if (aadhaarVerified && !kycVerified) {
    return (
      <View style={styles.partialKycBadge}>
        <Text style={styles.partialKycBadgeText}>🔄 KYC Pending Terms</Text>
      </View>
    );
  }
  
  if (!aadhaarVerified) {
    return (
      <View style={styles.noKycBadge}>
        <Text style={styles.noKycBadgeText}>❌ KYC Not Started</Text>
      </View>
    );
  }
  
  return null;
};

// ===== MAIN PROFILE MANAGEMENT COMPONENT =====
export default function ProfileManagement() {
  const {
    // State
    userData,
    showForm,
    isFetchingPincode,
    isLoading,
    userId,
    showOTPModal,
    verifyingOTP,
    phoneToVerify,
    isFetchingData,
    fieldValidity,
    verificationInProgress,
    showTermsModal,
    showConsentModal,
    pendingAadhaarVerification,
    formData,
    errors,

    // Functions
    updateField,
    handleVerifyAadhaar,
    handleConsentAccept,
    handleConsentClose,
    verifyOTP,
    handleSubmit,
    resetForm,
    handleEdit,
    fetchUserData,
    updateState,
  } = useUserProfile();

  const navigation = useNavigation();

  // Disable terms button when Aadhaar is verified
  const isTermsDisabled = formData.aadhaarVerified;

  // ===== RENDER LOADING STATE =====
  if (isFetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <View style={styles.container}>
      <ConsentModal
        visible={showConsentModal}
        onAccept={handleConsentAccept}
        onClose={handleConsentClose}
      />

      <OTPModal
        visible={showOTPModal}
        phoneNumber={phoneToVerify}
        onVerify={verifyOTP}
        onClose={() => updateState({ showOTPModal: false })}
        loading={verifyingOTP}
      />

      {/* Header */}
      <CommonHeader
        title="User Profile Management"
        subtitle={userData ? `Welcome, ${userData.username}` : "Loading..."}
        onBackPress={() => navigation.navigate("MainLanding")}
      />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <CommonHeader
            title="Edit Your Profile"
            subtitle="Update your information below. Fields marked with * are required."
            showBackButton={true}
            onBackPress={resetForm}
          />

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* KYC Status Banner */}
            {formData.aadhaarVerified && (
              <View style={styles.kycBanner}>
                <Text style={styles.kycBannerText}>
                  ✅ Aadhaar Verified - Terms & KYC automatically accepted
                </Text>
              </View>
            )}

            {/* Personal Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👤 Personal Information</Text>
                <View style={styles.sectionDivider} />
              </View>

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
                label="Username"
                value={formData.username}
                onChangeText={(v) => updateField("username", v)}
                placeholder="Enter username"
                error={errors.username}
                required
                showValidationIcon={true}
                isValid={fieldValidity.username}
              />

              <GenderSelector
                gender={formData.gender}
                updateField={updateField}
                errors={errors}
              />

              <CustomInput
                label="Phone Number"
                value={formData.contactNumber}
                onChangeText={(v) =>
                  updateField(
                    "contactNumber",
                    v.replace(/[^0-9]/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                error={errors.contactNumber}
                required
                showValidationIcon={true}
                isValid={fieldValidity.contactNumber}
                maxLength={10}
              />

              {/* Updated Date of Birth input with three-row picker */}
              <DateOfBirthInput
                value={formData.dateOfBirth}
                onChangeText={(v) => updateField("dateOfBirth", v)}
                error={errors.dateOfBirth}
                required
                showValidationIcon={true}
                isValid={fieldValidity.dateOfBirth}
              />

              <AadhaarField
                formData={formData}
                errors={errors}
                updateField={updateField}
                handleVerifyAadhaar={handleVerifyAadhaar}
                verificationInProgress={verificationInProgress}
                pendingAadhaarVerification={pendingAadhaarVerification}
                userData={userData}
              />
            </View>

            {/* Address Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏠 Address Details</Text>
                <View style={styles.sectionDivider} />
              </View>

              <CustomInput
                label="Address Line 1"
                value={formData.address1}
                onChangeText={(v) => updateField("address1", v)}
                placeholder="Street 12"
                error={errors.address1}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address1}
              />

              <CustomInput
                label="Address Line 2"
                value={formData.address2}
                onChangeText={(v) => updateField("address2", v)}
                placeholder="Apartment 101"
                error={errors.address2}
                required
                showValidationIcon={true}
                isValid={fieldValidity.address2}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="PIN Code"
                    value={formData.pincode}
                    onChangeText={(v) => updateField("pincode", v)}
                    placeholder="6-digit PIN code"
                    keyboardType="number-pad"
                    error={errors.pincode}
                    required
                    loading={isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.pincode}
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
                    editable={!isFetchingPincode}
                    showValidationIcon={true}
                    isValid={fieldValidity.city}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label="State"
                    value={formData.state}
                    onChangeText={(v) => updateField("state", v)}
                    placeholder="Enter state"
                    error={errors.state}
                    required
                    editable={!isFetchingPincode}
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
                    editable={!isFetchingPincode}
                  />
                </View>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 Terms & Conditions</Text>
                <View style={styles.sectionDivider} />
              </View>
              <TermsCheckbox
                termsAccepted={formData.termsAccepted}
                updateField={updateField}
                errors={errors}
                setShowTermsModal={() => updateState({ showTermsModal: true })}
                aadhaarVerified={formData.aadhaarVerified}
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
                title="Update Profile"
                onPress={handleSubmit}
                variant="primary"
                style={styles.saveButton}
                loading={isLoading}
                // Enable button when Aadhaar is verified OR terms are accepted
                disabled={isLoading || (!formData.termsAccepted && !formData.aadhaarVerified)}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* User Profile Card */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {!userData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👤</Text>
            <Text style={styles.emptyStateTitle}>No User Data Found</Text>
            <Text style={styles.emptyStateText}>
              Please check your internet connection and try again
            </Text>
            <CustomButton
              title="Refresh Data"
              onPress={() => fetchUserData(userId)}
              variant="primary"
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{userData.username}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {userData.gender === "female"
                      ? "👩 Female"
                      : userData.gender === "male"
                      ? "👨 Male"
                      : "Other"}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={handleEdit}
                >
                  <Text style={styles.actionButtonText}>✏️ Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* KYC Status Summary */}
            <KYCStatusBadge
              aadhaarVerified={userData.aadhaarVerified}
              kycVerified={userData.kycVerified}
              termsAccepted={userData.termsAccepted}
            />

            <View style={{ gap: 8 }}>
              <DataRow label="Username" value={userData.username} />
              <DataRow label="Email" value={userData.email} />
              <DataRow
                label="Phone"
                value={userData.contactNumber || "Not provided"}
              />
              <DataRow label="Gender" value={userData.gender} />
              <DataRow
                label="Date of Birth"
                value={userData.dateOfBirth || "Not provided"}
              />
              <DataRow
                label="Address"
                value={`${userData?.address1 || ""}, ${
                  userData?.address2 || ""
                }, ${userData?.city || ""}, ${userData?.state || ""}, ${
                  userData?.pincode || ""
                }, ${userData?.country || ""}`}
              />
              <DataRow
                label="Wallet Balance"
                value={`₹${userData.walletBalance?.toFixed(2) || "0.00"}`}
              />
              <DataRow
                label="Referral Code"
                value={userData.referralCode || "N/A"}
              />

              {userData.maskedAadhaar && (
                <DataRow
                  label="Masked Aadhaar"
                  value={userData.maskedAadhaar}
                />
              )}

              <DataRow
                label="Aadhaar Verified"
                value={userData.aadhaarVerified ? "✅ Yes" : "❌ No"}
              />
              <DataRow
                label="KYC Verified"
                value={userData.kycVerified ? "✅ Yes" : "❌ No"}
              />
              <DataRow
                label="Terms Accepted"
                value={userData.termsAccepted ? "✅ Yes" : "❌ No"}
              />
              
              {/* Auto-acceptance note */}
              {userData.aadhaarVerified && userData.termsAccepted && (
                <View style={styles.autoAcceptNoteCard}>
                  <Text style={styles.autoAcceptNoteText}>
                    ℹ️ Terms automatically accepted with Aadhaar verification
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}