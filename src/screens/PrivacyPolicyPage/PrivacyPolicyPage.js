import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const { COLORS, SIZES, FONTS, verticalScale, moderateScale, SHADOWS } = theme;

const PrivacyPolicyPage = () => {
  const handleEmail = () => Linking.openURL("mailto:contact@bmgjewellers.in");
  const handlePhoneCall = () => Linking.openURL("tel:+917094670946");

  const policySections = [
    {
      title: "Legal Basis & Applicable Laws",
      icon: "gavel",
      content: "This Policy is framed in compliance with:",
      subsections: [
        {
          content: "Digital Personal Data Protection Act, 2023 (India)"
        },
        {
          content: "Information Technology Act, 2000"
        },
        {
          content: "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011"
        },
        {
          content: "Aadhaar Act, 2016 and UIDAI regulations"
        },
        {
          content: "Reserve Bank of India / State Chit Fund guidelines (where applicable)"
        },
        {
          content: "Global data protection principles including GDPR (EU), to the extent applicable as best practice"
        }
      ]
    },
    {
      title: "Definitions",
      icon: "menu-book",
      content: "",
      subsections: [
        {
          title: "Personal Data",
          content: "Any data about an individual who is identifiable, such as name, mobile number, address, etc."
        },
        {
          title: "Sensitive Personal Data",
          content: "As defined under IT Rules, 2011 (bank details, biometric data, etc.)"
        },
        {
          title: "Data Fiduciary",
          content: "The Company, which determines the purpose and means of processing personal data"
        },
        {
          title: "Data Principal",
          content: "The individual to whom the personal data relates (Customer/User)"
        }
      ]
    },
    {
      title: "User Consent",
      icon: "check-circle",
      content: "By accessing or using our App, Website, or Services, and by ticking the consent checkbox during login or enrolment, you:",
      subsections: [
        {
          content: "Freely and voluntarily consent to the collection and processing of your personal data"
        },
        {
          content: "Confirm that the information provided is accurate"
        },
        {
          content: "Understand the purpose, usage, and retention of your data"
        },
        {
          content: "Acknowledge your rights under applicable laws"
        }
      ],
      note: "Consent is purpose-specific, informed, revocable, and recorded electronically."
    },
    {
      title: "Information We Collect",
      icon: "category",
      content: "",
      subsections: [
        {
          title: "Information Provided Directly by You",
          content: "Full Name, Mobile Number, Email Address (optional), Residential Address, PAN / Voter ID / Driving Licence (as applicable), Chit enrolment details, Payment details (transaction reference only, not card data)"
        },
        {
          title: "Aadhaar Information (Important Clarification)",
          content: "Aadhaar is used only for identity verification. Aadhaar number, copy, image, XML, or biometric data is NOT stored. Only masked Aadhaar (last 4 digits) and verification status may be recorded. Aadhaar may be viewed physically or verified through UIDAI-authorised mechanisms."
        },
        {
          title: "Information Collected Automatically",
          content: "IP address, Device type, OS, browser, App usage logs, Date, time, and activity history, Cookies and similar technologies (Website only)"
        }
      ]
    },
    {
      title: "Purpose of Data Collection",
      icon: "data-usage",
      content: "We collect and process personal data strictly for:",
      subsections: [
        {
          content: "Jewellery chit enrolment and management"
        },
        {
          content: "Customer identification and verification"
        },
        {
          content: "Compliance with legal and regulatory obligations"
        },
        {
          content: "Transaction processing and account maintenance"
        },
        {
          content: "Customer support and grievance redressal"
        },
        {
          content: "Fraud prevention and security monitoring"
        },
        {
          content: "Audit, accounting, and statutory reporting"
        }
      ]
    },
    {
      title: "Data Minimisation & Purpose Limitation",
      icon: "filter-list",
      content: "Only data necessary for stated purposes is collected. Data is not used for unrelated purposes. Marketing communication is done only with separate consent."
    },
    {
      title: "Storage & Retention of Data",
      icon: "storage",
      content: "",
      subsections: [
        {
          content: "Data is stored in secure servers located in India"
        },
        {
          content: "Physical records are kept in locked premises with restricted access"
        },
        {
          content: "Personal data is retained during active chit period and for statutory period after closure (generally 7 years)"
        },
        {
          content: "Data is securely deleted or anonymised after retention period"
        }
      ]
    },
    {
      title: "Data Sharing & Disclosure",
      icon: "share",
      content: "We do not sell or rent personal data. Data may be shared only with:",
      subsections: [
        {
          content: "UIDAI-authorised service providers (verification only)"
        },
        {
          content: "Payment gateways and banks (transaction processing)"
        },
        {
          content: "Auditors, legal advisors, and statutory authorities"
        },
        {
          content: "Government agencies when legally required"
        }
      ],
      note: "All third parties are bound by confidentiality and data protection obligations."
    },
    {
      title: "Data Security Practices",
      icon: "security",
      content: "We implement reasonable security practices including:",
      subsections: [
        {
          content: "Encryption of digital data"
        },
        {
          content: "Role-based access control"
        },
        {
          content: "Audit logs and monitoring"
        },
        {
          content: "Secure APIs"
        },
        {
          content: "Firewalls and malware protection"
        },
        {
          content: "Staff training and confidentiality agreements"
        }
      ]
    },
    {
      title: "User Rights (Data Principal Rights)",
      icon: "person",
      content: "You have the right to:",
      subsections: [
        {
          content: "Access your personal data"
        },
        {
          content: "Correct inaccurate data"
        },
        {
          content: "Withdraw consent (subject to legal obligations)"
        },
        {
          content: "Request deletion after legal retention"
        },
        {
          content: "Grievance redressal"
        }
      ],
      note: "Requests may be submitted via email or support portal."
    },
    {
      title: "Withdrawal of Consent",
      icon: "cancel",
      content: "Consent can be withdrawn by written request. Withdrawal may affect our ability to provide services where data processing is mandatory by law."
    },
    {
      title: "Children's Data",
      icon: "child-care",
      content: "Our services are not intended for minors. Customers must be 18 years or older. No data of minors is knowingly collected."
    },
    {
      title: "Data Breach Management",
      icon: "warning",
      content: "In the event of a data breach:",
      subsections: [
        {
          content: "Internal assessment will be conducted immediately"
        },
        {
          content: "Affected users and authorities will be notified as per law"
        },
        {
          content: "Remedial measures will be taken promptly"
        }
      ]
    },
    {
      title: "Cross-Border Data Transfer",
      icon: "public",
      content: "Personal data is processed and stored within India. No cross-border transfer is done except as permitted by law."
    },
    {
      title: "Amendments to Policy",
      icon: "update",
      content: "This Policy may be updated periodically. Changes will be notified through App / Website."
    }
  ];

  const ContactInfo = ({ icon, label, value, onPress, isLink = false }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactRow}>
        <Icon name={icon} size={moderateScale(18)} color={COLORS.primary} />
        <Text style={styles.contactLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.contactValue, isLink && styles.link]}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CommonHeader title={"Privacy Policy"} />

          

          {/* Company Info */}
          <View style={styles.companyInfoCard}>
            <Text style={styles.companyName}>BMG Jewellers Private Limited</Text>
            <Text style={styles.companyAddress}>
              54, Vaithiyanathapuram, Thathaneri, Madurai, Tamil Nadu, 625018
            </Text>
          </View>

          {/* Policy Sections */}
          {policySections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Icon name={section.icon} size={moderateScale(20)} color={COLORS.white} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {section.content ? (
                <Text style={styles.sectionContent}>{section.content}</Text>
              ) : null}

              {section.subsections &&
                section.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    {subsection.title && (
                      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                    )}
                    <Text style={styles.subsectionContent}>
                      {subsection.content}
                    </Text>
                  </View>
                ))}

              {section.note && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>{section.note}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Grievance Redressal Officer */}
          <View style={styles.grievanceCard}>
            <Text style={styles.grievanceTitle}>
              Grievance Redressal Officer
            </Text>
            <Text style={styles.grievanceSubtitle}>
              As required under law
            </Text>

            <ContactInfo
              icon="person"
              label="Name"
              value="Administrative Officer"
            />
            <ContactInfo
              icon="email"
              label="Email"
              value="contact@bmgjewellers.in"
              onPress={handleEmail}
              isLink={true}
            />
            <ContactInfo
              icon="phone"
              label="Contact"
              value="7094670946"
              onPress={handlePhoneCall}
            />
            <Text style={styles.grievanceNote}>
              Complaints will be resolved within the statutory timeframe.
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.governingCard}>
            <Icon name="balance" size={moderateScale(20)} color={COLORS.primary} />
            <Text style={styles.governingText}>
              Governing Law & Jurisdiction
            </Text>
            <Text style={styles.governingDetails}>
              This Policy shall be governed by the laws of India. Courts at Madurai shall have exclusive jurisdiction.
            </Text>
          </View>

          {/* Acknowledgement */}
          <LinearGradient
            colors={COLORS.gradient.primary}
            style={styles.acknowledgementCard}
          >
            <Icon name="verified" size={moderateScale(20)} color={COLORS.white} />
            <Text style={styles.acknowledgementText}>
              By using our App or Website, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
              Aadhaar is used strictly for verification purposes and is never stored.
              Personal data is processed lawfully, fairly, and transparently.
            </Text>
          </LinearGradient>

          {/* Effective Date */}
          <View style={styles.effectiveDateCard}>
            <Icon name="calendar-today" size={moderateScale(18)} color={COLORS.primary} />
            <Text style={styles.effectiveDateText}>
              Last updated Date: 18.12.2025 
            </Text>
          </View>

          {/* Copyright */}
          <View style={styles.copyright}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} BMG Jewellers Private Limited. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: verticalScale(SIZES.padding.xl),
  },
  effectiveDateCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  effectiveDateText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginLeft: SIZES.padding.sm,
  },
  companyInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  companyName: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginBottom: verticalScale(SIZES.xs),
    textAlign: "center",
  },
  companyAddress: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: verticalScale(SIZES.padding.sm) 
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionContent: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  subsection: { 
    marginBottom: verticalScale(SIZES.padding.sm),
    paddingLeft: SIZES.padding.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primaryLight,
  },
  subsectionTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginBottom: verticalScale(SIZES.xs),
    fontWeight: "600",
  },
  subsectionContent: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.md * 1.4,
  },
  noteContainer: {
    marginTop: verticalScale(SIZES.padding.sm),
    padding: SIZES.padding.sm,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: SIZES.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  noteText: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    fontStyle: "italic",
  },
  grievanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  grievanceTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(SIZES.xs),
    textAlign: "center",
  },
  grievanceSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: verticalScale(SIZES.padding.md),
    textAlign: "center",
  },
  grievanceNote: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: verticalScale(SIZES.padding.md),
    fontStyle: "italic",
    textAlign: "center",
  },
  contactItem: { 
    marginBottom: verticalScale(SIZES.padding.md) 
  },
  contactRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: verticalScale(SIZES.xs) 
  },
  contactLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginLeft: SIZES.padding.sm,
  },
  contactValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.3,
    paddingLeft: moderateScale(28),
  },
  link: { 
    color: COLORS.primary, 
    textDecorationLine: "underline" 
  },
  governingCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    alignItems: "center",
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  governingText: {
    ...FONTS.h6,
    color: COLORS.primary,
    marginVertical: verticalScale(SIZES.padding.sm),
    textAlign: "center",
  },
  governingDetails: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.4,
  },
  acknowledgementCard: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.lg),
    alignItems: "center",
    ...SHADOWS.md,
  },
  acknowledgementText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    marginTop: verticalScale(SIZES.padding.sm),
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.4,
  },
  copyright: { 
    alignItems: "center", 
    paddingHorizontal: SIZES.padding.lg 
  },
  copyrightText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default PrivacyPolicyPage;