import { StyleSheet } from "react-native";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

export const styles = StyleSheet.create({
  // ===== LAYOUT & CONTAINERS =====
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
    gap: SIZES.margin.lg,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding.lg,
  },

  // ===== SECTIONS & CARDS =====
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
  cardActions: {
    flexDirection: "row",
    gap: SIZES.margin.xs,
  },

  // ===== INPUT FIELDS =====
  inputContainer: {
    marginBottom: SIZES.margin.lg,
    position: "relative",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
    flexWrap: "wrap",
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
    textAlignVertical: "top",
    lineHeight: 20,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "08",
    borderWidth: 1.5,
  },
  inputValid: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "05",
  },
  inputVerified: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "08",
    borderWidth: 2,
  },
  inputFailed: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "08",
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
    color: COLORS.textDisabled,
    opacity: 0.7,
  },
  inputAadhaarReady: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  inputWithButtonContainer: {
    position: "relative",
  },
  inputWithButton: {
    paddingRight: 100,
  },
  aadhaarInput: {
    paddingRight: 140,
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: FONTS.weight.medium,
  },
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.sm,
    flexWrap: "wrap",
  },
  aadhaarInputContainer: {
    position: "relative",
    marginBottom: SIZES.margin.xs,
  },
  aadhaarActions: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== GENDER SELECTOR =====
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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.margin.xs,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary + "10",
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

  // ===== TERMS & CONDITIONS =====
  termsContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.sm,
  },
  termsLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: FONTS.weight.medium,
  },
  termsCheckboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: SIZES.radius.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SIZES.margin.sm,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: SIZES.font.sm,
    fontWeight: "bold",
  },
  termsHelpButton: {
    marginLeft: SIZES.margin.xs,
    backgroundColor: COLORS.primary + "10",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  termsHelpText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: "bold",
  },

  // ===== ROW LAYOUT =====
  row: {
    flexDirection: "row",
    marginHorizontal: -SIZES.margin.xs,
    marginBottom: SIZES.margin.md,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: SIZES.margin.xs,
  },

  // ===== BUTTONS =====
  button: {
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
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
  buttonTextDisabled: {
    color: COLORS.textDisabled,
  },
  verifyButtonInline: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
    ...SHADOWS.sm,
  },
  verifyButtonFull: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm + 2,
    borderRadius: SIZES.radius.sm,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SIZES.margin.xs,
  },
  verifyButtonText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    fontSize: 12,
  },
  verifyButtonTextInline: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    fontSize: 12,
  },

  // ===== FORM ACTIONS =====
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

  // ===== ERROR & VALIDATION =====
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: COLORS.success + "20",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  validIcon: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "bold",
  },
  invalidIcon: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginLeft: SIZES.margin.sm,
  },

  // ===== VERIFICATION STATUS =====
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.margin.sm,
    backgroundColor: "transparent",
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
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  verificationMessageText: {
    ...FONTS.caption,
    fontSize: 11,
    textAlign: "center",
  },

  // ===== VERIFIED AADHAAR DISPLAY =====
  verifiedAadhaarContainer: {
    marginBottom: SIZES.margin.lg,
    backgroundColor: COLORS.success + "08",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    borderWidth: 2,
    borderColor: COLORS.success + "20",
    ...SHADOWS.sm,
  },
  verifiedAadhaarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.md,
  },
  verifiedAadhaarLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
    fontSize: 15,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
  },
  verifiedAadhaarNumber: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: SIZES.margin.md,
    fontWeight: FONTS.weight.bold,
    fontSize: 20,
  },
  verificationDetails: {
    alignItems: "center",
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

  // ===== KYC STATUS =====
  kycStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.margin.sm,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  kycStatusComplete: {
    backgroundColor: COLORS.success + "10",
    borderWidth: 1,
    borderColor: COLORS.success + "20",
  },
  kycStatusPending: {
    backgroundColor: COLORS.warning + "10",
    borderWidth: 1,
    borderColor: COLORS.warning + "20",
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

  // ===== DATA DISPLAY =====
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

  // ===== ACTION BUTTONS =====
  actionButton: {
    paddingVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
  },
  editButton: {
    backgroundColor: COLORS.infoLight + "20",
  },
  actionButtonText: {
    ...FONTS.caption,
    color: COLORS.info,
    fontWeight: FONTS.weight.medium,
  },

  // ===== EMPTY STATE =====
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

  // ===== LOADING & TEXT =====
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },

  // ===== MODAL STYLES =====
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  termsModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...SHADOWS.xl,
  },
  termsModalHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  termsModalTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.margin.xs,
    textAlign: "center",
  },
  termsModalSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  otpModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  otpModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  otpModalHeader: {
    alignItems: "center",
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
    textAlign: "center",
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.margin.xl,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.sm,
    textAlign: "center",
    ...FONTS.h4,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  otpModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.margin.lg,
  },
  otpButton: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
  },
  otpCloseText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  
  // ===== CONSENT MODAL =====
  consentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.lg,
  },
  consentModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...SHADOWS.xl,
  },
  consentModalHeader: {
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  consentModalIcon: {
    fontSize: SIZES.font.xxxl,
    marginBottom: SIZES.margin.md,
  },
  consentModalTitle: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
  consentModalContent: {
    maxHeight: 300,
    marginBottom: SIZES.margin.lg,
  },
  consentModalText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: SIZES.margin.md,
  },
  consentDisclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.infoLight + "10",
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    borderWidth: 1,
    borderColor: COLORS.info + "20",
  },
  consentDisclaimerIcon: {
    marginRight: SIZES.margin.sm,
    marginTop: 2,
    color: COLORS.info,
  },
  consentDisclaimerText: {
    ...FONTS.caption,
    color: COLORS.info,
    flex: 1,
    lineHeight: 16,
  },
  consentModalActions: {
    gap: SIZES.margin.md,
  },
  consentAcceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  consentAcceptButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  consentDeclineButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  consentDeclineButtonText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
  },

  // ===== DATE PICKER MODAL STYLES =====
datePickerModalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: SIZES.padding.lg,
},
datePickerModalContent: {
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.lg,
  padding: SIZES.padding.xl,
  width: '100%',
  maxWidth: 400,
  maxHeight: '80%',
  ...SHADOWS.lg,
},
datePickerHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SIZES.margin.lg,
  paddingBottom: SIZES.padding.md,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.borderLight,
},
datePickerTitle: {
  ...FONTS.h5,
  color: COLORS.textPrimary,
  fontWeight: FONTS.weight.semibold,
},
datePickerCloseButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: COLORS.backgroundSecondary,
  justifyContent: 'center',
  alignItems: 'center',
},
datePickerCloseText: {
  fontSize: 16,
  color: COLORS.textSecondary,
  fontWeight: 'bold',
  lineHeight: 16,
},
selectedDatePreview: {
  backgroundColor: COLORS.primary + '10',
  padding: SIZES.padding.md,
  borderRadius: SIZES.radius.md,
  marginBottom: SIZES.margin.lg,
  borderWidth: 1,
  borderColor: COLORS.primary + '20',
  alignItems: 'center',
},
selectedDatePreviewText: {
  ...FONTS.bodyLarge,
  color: COLORS.primaryDark,
  fontWeight: FONTS.weight.semibold,
  fontSize: 16,
},
threeRowSelector: {
  flexDirection: 'row',
  height: 250,
  marginBottom: SIZES.margin.xl,
  borderRadius: SIZES.radius.md,
  overflow: 'hidden',
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.borderLight,
},
columnContainer: {
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
  borderRightWidth: 1,
  borderRightColor: COLORS.borderLight,
},
columnContainerLast: {
  borderRightWidth: 0,
},
columnTitle: {
  backgroundColor: COLORS.backgroundSecondary,
  paddingVertical: SIZES.padding.sm,
  textAlign: 'center',
  fontSize: 13,
  fontWeight: FONTS.weight.semibold,
  color: COLORS.textSecondary,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.borderLight,
},
columnScrollContainer: {
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
},
columnScrollView: {
  flex: 1,
  zIndex: 1,
},
columnItem: {
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: SIZES.padding.xs,
},
columnItemContent: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: SIZES.radius.sm,
},
columnItemContentSelected: {
  backgroundColor: COLORS.primary,
  marginHorizontal: 2,
},
columnItemSelected: {
  zIndex: 2,
},
columnItemText: {
  fontSize: 16,
  color: COLORS.textSecondary,
  textAlign: 'center',
  fontWeight: FONTS.weight.regular,
},
columnItemTextSelected: {
  color: COLORS.white,
  fontWeight: FONTS.weight.bold,
  fontSize: 16,
},

// Selection Indicator Lines - REMOVED TOP AND BOTTOM BORDERS
selectionIndicatorTop: {
  // Removed - no top border line
},
selectionIndicatorMiddle: {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: 40,
  backgroundColor: COLORS.primary + '08', // Light background for selection area
  zIndex: 1,
  marginTop: -20,

  borderTopColor: COLORS.primary + '20',

  borderBottomColor: COLORS.primary + '20',
},


// Date Picker Action Buttons
datePickerActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: SIZES.margin.md,
},
datePickerCancelButton: {
  flex: 1,
  paddingVertical: SIZES.padding.lg,
  backgroundColor: COLORS.white,
  borderRadius: SIZES.radius.md,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1.5,
  borderColor: COLORS.border,
  ...SHADOWS.sm,
},
datePickerCancelText: {
  ...FONTS.bodyMedium,
  color: COLORS.textPrimary,
  fontWeight: FONTS.weight.medium,
},
datePickerConfirmButton: {
  flex: 1,
  paddingVertical: SIZES.padding.lg,
  backgroundColor: COLORS.primary,
  borderRadius: SIZES.radius.md,
  alignItems: 'center',
  justifyContent: 'center',
  ...SHADOWS.sm,
},
datePickerConfirmText: {
  ...FONTS.bodyMedium,
  color: COLORS.white,
  fontWeight: FONTS.weight.semibold,
},

// ===== DATE OF BIRTH INPUT STYLES =====
dobContainer: {
  marginBottom: SIZES.margin.lg,
},
dobInputHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SIZES.margin.xs,
},
dobInputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
},
dobInput: {
  flex: 1,
  paddingRight: 60, // Space for calendar icon
},
calendarIconButton: {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: 50,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLORS.backgroundSecondary,
  borderRadius: SIZES.radius.md,
  borderWidth: 1,
  borderColor: COLORS.border,
  marginLeft: SIZES.margin.xs,
},
calendarIcon: {
  fontSize: 18,
  color: COLORS.textSecondary,
},
dobHintText: {
  ...FONTS.caption,
  color: COLORS.textTertiary,
  marginTop: SIZES.margin.xs,
  marginLeft: SIZES.margin.xs,
},

// ===== VALIDATION ICON =====
validationIcon: {
  marginLeft: SIZES.margin.sm,
  backgroundColor: COLORS.success + '20',
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
});