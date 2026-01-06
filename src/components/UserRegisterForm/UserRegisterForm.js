import React from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
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
import { saveUserData } from "../../utils/AsynchStorageHelper";

// Import hooks and services
import { useUserProfile } from "./Userhook";
import { styles } from "./UserStyles";

// Sub-components for the form
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

const TermsCheckbox = ({
  termsAccepted,
  updateField,
  errors,
  setShowTermsModal,
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
        style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
        onPress={() => updateField("termsAccepted", !termsAccepted)}
      >
        {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: "#374151" }}>
          I agree to the Terms and Conditions and Privacy Policy
        </Text>
      </View>
    </View>
    {errors.termsAccepted && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{errors.termsAccepted}</Text>
      </View>
    )}
  </View>
);

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
              {/* REMOVED the terms check here */}
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
    </View>
  );
};

// Main Component
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
    updateState, // ADD THIS - IT'S NOW RETURNED FROM THE HOOK
  } = useUserProfile();

  const navigation = useNavigation();
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
        onBackPress={() => navigation.navigate('MainLanding')}
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

              <CustomInput
                label="Date of Birth (YYYY-MM-DD)"
                value={formData.dateOfBirth}
                onChangeText={(v) => updateField("dateOfBirth", v)}
                placeholder="1992-08-25"
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
                disabled={isLoading || !formData.termsAccepted}
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
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
