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
      points: [
        "Digital Personal Data Protection Act, 2023 (India)",
        "Information Technology Act, 2000",
        "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011",
        "Aadhaar Act, 2016 and UIDAI regulations",
        "Reserve Bank of India / State Chit Fund guidelines (where applicable)",
        "Global data protection principles including GDPR (EU), to the extent applicable as best practice"
      ]
    },
    {
      title: "Definitions",
      icon: "menu-book",
      definitions: [
        {
          term: "Personal Data",
          meaning: "Any data about an individual who is identifiable, such as name, mobile number, address, etc."
        },
        {
          term: "Sensitive Personal Data",
          meaning: "As defined under IT Rules, 2011 (bank details, biometric data, etc.)"
        },
        {
          term: "Data Fiduciary",
          meaning: "The Company, which determines the purpose and means of processing personal data"
        },
        {
          term: "Data Principal",
          meaning: "The individual to whom the personal data relates (Customer/User)"
        }
      ]
    },
    {
      title: "User Consent",
      icon: "check-circle",
      content: "By accessing or using our App, Website, or Services, and by ticking the consent checkbox during login or enrolment, you:",
      points: [
        "Freely and voluntarily consent to the collection and processing of your personal data",
        "Confirm that the information provided is accurate",
        "Understand the purpose, usage, and retention of your data",
        "Acknowledge your rights under applicable laws"
      ],
      note: "Consent is purpose-specific, informed, revocable, and recorded electronically."
    },
    {
      title: "Information We Collect",
      icon: "category",
      subsections: [
        {
          title: "Information Provided Directly by You",
          points: [
            "Full Name",
            "Mobile Number",
            "Email Address (optional)",
            "Residential Address",
            "PAN / Voter ID / Driving Licence (as applicable)",
            "Chit enrolment details",
            "Payment details (transaction reference only, not card data)"
          ]
        },
        {
          title: "Aadhaar Information (Important Clarification)",
          points: [
            "Aadhaar is used only for identity verification.",
            " Aadhaar number, copy, image, XML, or biometric data is NOT stored.",
            "Only masked Aadhaar (last 4 digits) and verification status may be recorded.",
            " Aadhaar may be viewed physically or verified through UIDAI-authorised mechanisms.",
            
          ]
        },
        {
          title: "Information Collected Automatically",
          points: [
            "IP address",
            "Device type, OS, browser",
            "App usage logs",
            "Date, time, and activity history",
            "Cookies and similar technologies (Website only)"
          ]
        }
      ]
    },
    {
      title: "Purpose of Data Collection",
      icon: "data-usage",
      content: "We collect and process personal data strictly for:",
      points: [
        "Jewellery chit enrolment and management",
        "Customer identification and verification",
        "Compliance with legal and regulatory obligations",
        "Transaction processing and account maintenance",
        "Customer support and grievance redressal",
        "Fraud prevention and security monitoring",
        "Audit, accounting, and statutory reporting"
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
      points: [
        "Data is stored in secure servers located in India",
        "Physical records are kept in locked premises with restricted access",
        "Personal data is retained during active chit period and for statutory period after closure (generally 7 years)",
        "Data is securely deleted or anonymised after retention period"
      ]
    },
    {
      title: "Data Sharing & Disclosure",
      icon: "share",
      content: "We do not sell or rent personal data. Data may be shared only with:",
      points: [
        "UIDAI-authorised service providers (verification only)",
        "Payment gateways and banks (transaction processing)",
        "Auditors, legal advisors, and statutory authorities",
        "Government agencies when legally required"
      ],
      note: "All third parties are bound by confidentiality and data protection obligations."
    },
    {
      title: "Data Security Practices",
      icon: "security",
      content: "We implement reasonable security practices including:",
      points: [
        "Encryption of digital data",
        "Role-based access control",
        "Audit logs and monitoring",
        "Secure APIs",
        "Firewalls and malware protection",
        "Staff training and confidentiality agreements"
      ]
    },
    {
      title: "User Rights (Data Principal Rights)",
      icon: "person",
      content: "You have the right to:",
      points: [
        "Access your personal data",
        "Correct inaccurate data",
        "Withdraw consent (subject to legal obligations)",
        "Request deletion after legal retention",
        "Grievance redressal"
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
      points: [
        "Internal assessment will be conducted immediately",
        "Affected users and authorities will be notified as per law",
        "Remedial measures will be taken promptly"
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

  const PointItem = ({ point, index }) => (
    <View style={styles.pointItem} key={index}>
      <View style={styles.bulletPoint}>
        <Text style={styles.bulletText}>•</Text>
      </View>
      <Text style={styles.pointText}>{point}</Text>
    </View>
  );

  const DefinitionItem = ({ term, meaning, index }) => (
    <View style={styles.definitionItem} key={index}>
      <Text style={styles.definitionTerm}>{term}:</Text>
      <Text style={styles.definitionMeaning}>{meaning}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <CommonHeader title={"Privacy Policy"} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

              {section.content && (
                <Text style={styles.sectionContent}>{section.content}</Text>
              )}

              {/* Points List */}
              {section.points && (
                <View style={styles.pointsContainer}>
                  {section.points.map((point, pointIndex) => (
                    <PointItem key={pointIndex} point={point} index={pointIndex} />
                  ))}
                </View>
              )}

              {/* Definitions List */}
              {section.definitions && (
                <View style={styles.definitionsContainer}>
                  {section.definitions.map((definition, defIndex) => (
                    <DefinitionItem
                      key={defIndex}
                      term={definition.term}
                      meaning={definition.meaning}
                    />
                  ))}
                </View>
              )}

              {/* Subsections */}
              {section.subsections && section.subsections.map((subsection, subIndex) => (
                <View key={subIndex} style={styles.subsection}>
                  {subsection.title && (
                    <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                  )}
                  
                  {subsection.content && (
                    <Text style={styles.subsectionContent}>{subsection.content}</Text>
                  )}
                  
                  {subsection.points && (
                    <View style={styles.subPointsContainer}>
                      {subsection.points.map((point, pointIndex) => (
                        <PointItem key={pointIndex} point={point} index={pointIndex} />
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Note */}
              {section.note && (
                <View style={styles.noteContainer}>
                  <Icon name="info" size={moderateScale(14)} color={COLORS.primary} style={styles.noteIcon} />
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
            <Icon name="balance" size={moderateScale(24)} color={COLORS.primary} />
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
            <Icon name="verified" size={moderateScale(24)} color={COLORS.white} />
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
  container: { 
    flex: 1,
    backgroundColor: COLORS.background 
  },
  backgroundImage: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: verticalScale(SIZES.padding.xl),
    paddingTop: verticalScale(SIZES.padding.sm),
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
    lineHeight: moderateScale(20),
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
    fontSize: moderateScale(16),
  },
  sectionContent: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  pointsContainer: {
    marginTop: verticalScale(SIZES.padding.xs),
  },
  pointItem: {
    flexDirection: "row",
    marginBottom: verticalScale(SIZES.padding.xs),
    alignItems: "flex-start",
  },
  bulletPoint: {
    marginRight: SIZES.padding.sm,
    marginTop: moderateScale(2),
  },
  bulletText: {
    fontSize: moderateScale(18),
    color: COLORS.primary,
  },
  pointText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: moderateScale(20),
  },
  definitionsContainer: {
    marginTop: verticalScale(SIZES.padding.xs),
  },
  definitionItem: {
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  definitionTerm: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: verticalScale(2),
  },
  definitionMeaning: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: moderateScale(20),
  },
  subsection: {
    marginTop: verticalScale(SIZES.padding.md),
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
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  subPointsContainer: {
    marginTop: verticalScale(SIZES.padding.xs),
  },
  noteContainer: {
    marginTop: verticalScale(SIZES.padding.sm),
    padding: SIZES.padding.sm,
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: SIZES.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  noteIcon: {
    marginRight: SIZES.padding.xs,
    marginTop: moderateScale(2),
  },
  noteText: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    fontStyle: "italic",
    flex: 1,
    lineHeight: moderateScale(18),
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
    lineHeight: moderateScale(20),
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
    lineHeight: moderateScale(20),
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
    lineHeight: moderateScale(20),
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