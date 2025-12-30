// UserProfile.styles.js
import { StyleSheet } from "react-native";
import theme from "../../utils/AppTheme";

// Destructure theme
const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

export const UserProfileStyles = StyleSheet.create({
  // ========== CONTAINER STYLES ==========
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },

  // ========== MODAL STYLES ==========
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // ========== FORM STYLES ==========
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: SIZES.padding.lg,
    paddingBottom: SIZES.padding.xxxl,
    gap: SIZES.margin.lg,
  },

  // ========== SECTION STYLES ==========
  section: {
    marginBottom: SIZES.margin.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    ...SHADOWS.sm,
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

  // ========== INPUT FIELD STYLES ==========
  inputContainer: {
    marginBottom: SIZES.margin.lg,
    position: 'relative',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.xs,
    flexWrap: 'wrap',
  },
  inputLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: FONTS.weight.medium,
  },
  requiredIndicator: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: FONTS.weight.bold,
  },

  // Main Input Styling
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 48,
    ...SHADOWS.xs,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: SIZES.padding.md,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '08',
    borderWidth: 1.5,
  },
  inputValid: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
  },
  inputVerified: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '08',
    borderWidth: 2,
  },
  inputFailed: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '08',
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
    color: COLORS.textDisabled,
    opacity: 0.7,
  },
  inputWithButton: {
    paddingRight: 100, // Make room for verify button
  },
  inputAadhaarReady: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1.5,
  },

  // Input with button container
  inputWithButtonContainer: {
    position: 'relative',
  },
  verifyButtonInline: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    ...SHADOWS.sm,
  },
  verifyButtonTextInline: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    fontSize: 12,
  },

  // Error and Validation Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin.xs,
    paddingHorizontal: 2,
  },
  errorIcon: {
    marginRight: SIZES.margin.xs,
    fontSize: 12,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    fontSize: 12,
    flex: 1,
  },
  validationIconContainer: {
    marginLeft: SIZES.margin.sm,
    backgroundColor: COLORS.success + '20',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validIcon: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  invalidIcon: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Loading Indicator
  loadingIndicator: {
    marginLeft: SIZES.margin.sm,
  },

  // Verification Status
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.margin.sm,
    backgroundColor: 'transparent',
  },
  verificationStatusIcon: {
    marginRight: 4,
    fontSize: 10,
  },
  verificationStatusText: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: FONTS.weight.medium,
  },
  verificationMessage: {
    padding: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    marginTop: SIZES.margin.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  verificationMessageText: {
    ...FONTS.caption,
    fontSize: 11,
    textAlign: 'center',
  },

  // ========== AADHAAR SPECIFIC STYLES ==========
  aadhaarFieldContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.xs,
  },
  aadhaarInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
    flexWrap: 'wrap',
  },
  aadhaarNote: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginLeft: SIZES.margin.sm,
    fontSize: 12,
    flex: 1,
  },
  aadhaarInputContainer: {
    position: 'relative',
    marginBottom: SIZES.margin.xs,
  },
  aadhaarInput: {
    paddingRight: 140,
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: FONTS.weight.medium,
  },
  aadhaarActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonFull: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm + 2,
    borderRadius: SIZES.radius.sm,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.margin.xs,
    // ...SHADOWS.sm,
  },
  verifyButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    fontSize: 12,
  },
  termsRequiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  termsRequiredIcon: {
    marginRight: SIZES.margin.xs,
    color: COLORS.warning,
    fontSize: 12,
  },
  termsRequiredText: {
    ...FONTS.caption,
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: FONTS.weight.medium,
    flex: 1,
  },
  termsRequiredButton: {
    marginLeft: SIZES.margin.xs,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.xs,
  },
  termsRequiredButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
  },

  // Verified Aadhaar Container
  verifiedAadhaarContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.success + '08',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    borderWidth: 2,
    borderColor: COLORS.success + '20',
    // ...SHADOWS.sm,
  },
  verifiedAadhaarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin.md,
  },
  verifiedAadhaarLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
    fontSize: 15,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.xs,
  },
  verifiedBadgeText: {
    ...FONTS.caption,
    color: COLORS.success,
    fontWeight: FONTS.weight.bold,
    fontSize: 12,
  },
  verifiedAadhaarContent: {
    marginBottom: SIZES.margin.md,
    alignItems: 'center',
  },
  verifiedAadhaarNumber: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SIZES.margin.md,
    fontWeight: FONTS.weight.bold,
    fontSize: 20,
  },
  verificationDetails: {
    alignItems: 'center',
    gap: SIZES.margin.xs,
    marginTop: SIZES.margin.sm,
  },
  verificationId: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
  },
  verificationDate: {
    ...FONTS.caption,
    color: COLORS.success,
    fontSize: 12,
    fontWeight: FONTS.weight.medium,
  },
  changeAadhaarButton: {
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    // ...SHADOWS.xs,
  },
  changeAadhaarButtonText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
    fontSize: 13,
  },

  // Aadhaar Data Notice
  aadhaarDataNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight + '20',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.lg,
  },
  aadhaarDataNoticeIcon: {
    marginRight: SIZES.margin.sm,
    fontSize: SIZES.font.md,
  },
  aadhaarDataNoticeText: {
    ...FONTS.body,
    color: COLORS.success,
    flex: 1,
    fontWeight: FONTS.weight.medium,
  },

  // KYC Status Styles
  kycStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin.sm,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  kycStatusComplete: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  kycStatusPending: {
    backgroundColor: COLORS.warning + '10',
    borderWidth: 1,
    borderColor: COLORS.warning + '20',
  },
  kycStatusIcon: {
    marginRight: SIZES.margin.xs,
    fontSize: 12,
  },
  kycStatusText: {
    ...FONTS.caption,
    fontSize: 12,
    fontWeight: FONTS.weight.medium,
  },
  kycStatusTextComplete: {
    color: COLORS.success,
  },
  kycStatusTextPending: {
    color: COLORS.warning,
  },
  kycWarningText: {
    ...FONTS.caption,
    color: COLORS.warning,
    marginTop: SIZES.margin.xs,
    fontSize: 12,
  },
  kycSuccessText: {
    ...FONTS.caption,
    color: COLORS.success,
    marginTop: SIZES.margin.xs,
    fontSize: 12,
    fontWeight: FONTS.weight.medium,
  },

  // ========== GENDER SELECTOR STYLES ==========
  genderContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  genderLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
    fontSize: 14,
    fontWeight: FONTS.weight.medium,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin.xs,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  genderOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },

  // ========== TERMS AND CONDITIONS STYLES ==========
  termsContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
  },
  termsLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: FONTS.weight.medium,
  },
  termsHelpButton: {
    marginLeft: SIZES.margin.xs,
    backgroundColor: COLORS.primary + '10',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsHelpText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  termsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: SIZES.radius.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SIZES.margin.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: SIZES.font.sm,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // ========== LAYOUT STYLES ==========
  row: {
    flexDirection: 'row',
    marginHorizontal: -SIZES.margin.xs,
    marginBottom: SIZES.margin.md,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },

  // ========== FORM ACTIONS ==========
  formActions: {
    flexDirection: 'row',
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

  // ========== BUTTON STYLES ==========
  button: {
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  buttonSmall: {
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    minHeight: 40,
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
  buttonInfo: {
    backgroundColor: COLORS.info,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.button,
  },
  buttonTextSmall: {
    ...FONTS.caption,
    fontWeight: FONTS.weight.medium,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  buttonTextGold: {
    color: COLORS.textPrimary,
  },
  buttonTextInfo: {
    color: COLORS.white,
  },
  buttonTextDisabled: {
    color: COLORS.textDisabled,
  },

  // ========== USER DATA CARD STYLES ==========
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding.lg,
  },
  card: {
    ...COMMON_STYLES.card.elevated,
    marginBottom: SIZES.margin.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    alignSelf: 'flex-start',
  },
  statusText: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SIZES.margin.xs,
  },
  actionButton: {
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  editButton: {
    backgroundColor: COLORS.infoLight + '20',
  },
  actionButtonText: {
    ...FONTS.caption,
    color: COLORS.info,
    fontWeight: FONTS.weight.medium,
  },
  cardContent: {
    gap: SIZES.margin.sm,
  },
  dataRow: {
    flexDirection: 'row',
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

  // ========== AADHAAR SECTION IN CARD ==========
  aadhaarSection: {
    marginVertical: SIZES.margin.sm,
    paddingVertical: SIZES.padding.sm,
  },
  aadhaarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.xs,
  },
  verificationBadge: {
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.margin.sm,
  },
  verificationBadgeText: {
    ...FONTS.caption,
    fontWeight: FONTS.weight.medium,
  },
  aadhaarDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.margin.xs,
  },
  aadhaarValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  verifyAadhaarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    marginLeft: SIZES.margin.sm,
  },
  verifyAadhaarButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
  },

  // Verification Prompt
  verificationPrompt: {
    backgroundColor: COLORS.warningLight + '10',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginTop: SIZES.margin.sm,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.xs,
  },
  promptIcon: {
    marginRight: SIZES.margin.xs,
  },
  promptTitle: {
    ...FONTS.caption,
    color: COLORS.warning,
    fontWeight: FONTS.weight.bold,
  },
  promptText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    lineHeight: 16,
  },
  benefitsList: {
    marginLeft: SIZES.margin.md,
  },
  benefitItem: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },

  // ========== EMPTY STATE STYLES ==========
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  emptyStateText: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: SIZES.margin.xl,
  },
  emptyStateButton: {
    minWidth: 200,
  },

  // ========== MODAL SPECIFIC STYLES ==========
  
  // Terms Modal
  termsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.lg,
  },
  termsModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...SHADOWS.xl,
  },
  termsModalHeader: {
    alignItems: 'center',
    marginBottom: SIZES.margin.lg,
  },
  termsModalTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.margin.xs,
    textAlign: 'center',
  },
  termsModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  termsContent: {
    maxHeight: 400,
    marginBottom: SIZES.margin.lg,
  },
  termSection: {
    marginBottom: SIZES.margin.lg,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  termTitle: {
    ...FONTS.h6,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
    fontWeight: FONTS.weight.bold,
  },
  termSubtitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
    fontStyle: 'italic',
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: SIZES.margin.xs,
    paddingLeft: SIZES.padding.sm,
  },
  termBullet: {
    marginRight: SIZES.margin.sm,
    color: COLORS.textSecondary,
  },
  termText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  subsection: {
    marginLeft: SIZES.margin.md,
    marginTop: SIZES.margin.sm,
  },
  subsectionTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
    fontWeight: FONTS.weight.medium,
  },

  // OTP Modal
  otpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.lg,
  },
  otpModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  otpModalHeader: {
    alignItems: 'center',
    marginBottom: SIZES.margin.xl,
  },
  otpModalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  otpModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin.xl,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.sm,
    textAlign: 'center',
    ...FONTS.h4,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  otpInputFirst: {
    marginLeft: 0,
  },
  otpInputLast: {
    marginRight: 0,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  otpModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin.lg,
  },
  otpButton: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.margin.xs,
  },
  otpButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  otpButtonTextPrimary: {
    ...FONTS.button,
    color: COLORS.white,
  },
  otpCloseButton: {
    alignItems: 'center',
    paddingVertical: SIZES.padding.md,
  },
  otpCloseText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },

  // Use Aadhaar Data Modal
  useAadhaarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.lg,
  },
  useAadhaarModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.xl,
  },
  useAadhaarModalHeader: {
    alignItems: 'center',
    marginBottom: SIZES.margin.xl,
  },
  useAadhaarModalIcon: {
    fontSize: SIZES.font.xxxl,
    marginBottom: SIZES.margin.md,
  },
  useAadhaarModalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
    textAlign: 'center',
  },
  useAadhaarModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  useAadhaarModalContent: {
    marginBottom: SIZES.margin.xl,
  },
  useAadhaarModalInfo: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
    textAlign: 'center',
  },
  aadhaarBenefitsList: {
    backgroundColor: COLORS.successLight + '10',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  useAadhaarModalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight + '10',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
  },
  useAadhaarModalNoteIcon: {
    marginRight: SIZES.margin.sm,
    marginTop: 2,
  },
  useAadhaarModalNoteText: {
    ...FONTS.caption,
    color: COLORS.info,
    flex: 1,
    lineHeight: 16,
  },
  useAadhaarModalActions: {
    gap: SIZES.margin.md,
  },
  useAadhaarModalButton: {
    paddingVertical: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  useAadhaarButton: {
    backgroundColor: COLORS.primary,
  },
  manualEntryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  useAadhaarButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  manualEntryButtonText: {
    ...FONTS.button,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  useAadhaarModalCancel: {
    alignItems: 'center',
    paddingVertical: SIZES.padding.md,
  },
  useAadhaarModalCancelText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  // Add these styles to your UserStyles.js
verifiedAadhaarContainer: {
  marginBottom: 16,
  borderWidth: 1,
  borderColor: COLORS.success + '40',
  borderRadius: 8,
  backgroundColor: COLORS.success + '10',
  padding: 16,
},

verifiedAadhaarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

verifiedAadhaarLabel: {
  ...FONTS.body3,
  fontWeight: '600',
  color: COLORS.darkGray,
},

verifiedBadge: {
  backgroundColor: COLORS.success + '20',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 4,
},

verifiedBadgeText: {
  ...FONTS.caption,
  color: COLORS.success,
  fontWeight: '600',
},

verifiedAadhaarContent: {
  alignItems: 'center',
},

maskedAadhaarDisplay: {
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.lightGray,
  borderRadius: 8,
  padding: 12,
  width: '100%',
  marginBottom: 12,
  alignItems: 'center',
},

maskedAadhaarValue: {
  ...FONTS.h3,
  letterSpacing: 2,
  color: COLORS.darkGray,
  fontWeight: '600',
},

verificationDetails: {
  width: '100%',
  marginTop: 8,
},

verificationId: {
  ...FONTS.caption,
  color: COLORS.darkGray,
  marginBottom: 4,
  textAlign: 'center',
},

verificationDate: {
  ...FONTS.caption,
  color: COLORS.darkGray,
  fontStyle: 'italic',
  textAlign: 'center',
},

changeAadhaarButton: {
  marginTop: 12,
  alignSelf: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.warning,
  borderRadius: 6,
},

changeAadhaarButtonText: {
  ...FONTS.body4,
  color: COLORS.warning,
  fontWeight: '500',
},
});

// Export as default
export default UserProfileStyles;