import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { TextDefault } from '../../components';
import theme from '../../utils/AppTheme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { COLORS, SIZES, FONTS, verticalScale, moderateScale, SHADOWS } = theme;

const TermsFAQPage = () => {
  const termsData = [
    {
      id: '1',
      title: "1. Legal Nature of This Document",
      content: [
        "This is an electronic record generated in accordance with the Information Technology Act, 2000 and the rules framed thereunder.",
        "This document does not require physical or digital signatures.",
        "Continued access or use of the Platform constitutes valid acceptance of these Terms.",
      ],
    },
    {
      id: '2',
      title: "2. Eligibility to Use",
      content: [
        "The Platform may be used only by individuals who:",
        "Are 18 years of age or older",
        "Are legally competent to enter into binding contracts under Indian law",
        "By using the Platform, you represent and warrant that you meet these eligibility criteria.",
      ],
    },
    {
      id: '3',
      title: "3. Account Registration",
      content: [
        "To access certain features or services, you may be required to create an account and provide accurate, current, and complete information, including but not limited to:",
        "Full name",
        "Mobile number",
        "Email address",
        "Date of birth",
        "Residential address",
        "KYC documentation (where required)",
      ],
      subsections: [
        {
          id: '3a',
          title: "User Responsibilities:",
          content: [
            "You are solely responsible for:",
            "Maintaining the confidentiality of your login credentials",
            "All activities carried out through your account",
          ],
        },
        {
          id: '3b',
          title: "Company Rights:",
          content: [
            "BMG reserves the right to:",
            "Accept or reject any registration at its sole discretion",
            "Suspend, restrict, or terminate accounts without prior notice in cases of policy violation, suspected fraud, misrepresentation, or legal non-compliance",
          ],
        },
      ],
    },
    {
      id: '4',
      title: "4. Permitted Use",
      content: [
        "The Platform is intended strictly for personal, lawful, and non-commercial use.",
      ],
      subsections: [
        {
          id: '4a',
          title: "Users shall not:",
          content: [
            "Misuse or interfere with the Platform's operations",
            "Attempt unauthorized access to systems or data",
            "Copy, scrape, reverse engineer, modify, or exploit any content or technology",
            "Use the Platform for illegal, misleading, deceptive, or fraudulent purposes",
          ],
        },
      ],
    },
    {
      id: '5',
      title: "5. Services Offered",
      content: [
        "BMG Jewellers provides digital access to information and services relating to:",
        "Gold-polished silver jewellery",
        "Plain silver articles including vessels, idols, coins, and bars (999 purity)",
        "Jewellery purchase schemes and savings plans",
      ],
      subsections: [
        {
          id: '5a',
          title: "Important Notes:",
          content: [
            "Product descriptions, images, pricing, and availability are indicative and subject to change at the time of final purchase.",
            "BMG reserves the right to modify, suspend, or discontinue any product or service without prior notice.",
          ],
        },
      ],
    },
    {
      id: '6',
      title: "6. Payments & Transactions",
      content: [
        "Payments may be made via UPI, debit card, credit card, net banking, or other approved payment methods.",
        "You agree to provide accurate payment details and authorize BMG to process transactions accordingly.",
        "Prices are subject to applicable taxes, statutory levies, and market-linked fluctuations.",
        "Each jewellery or savings scheme shall be governed by its specific scheme terms, including lock-in periods, redemption rules, and eligibility conditions.",
      ],
    },
    {
      id: '7',
      title: "7. Statutory & Tax Compliance",
      content: [
        "PAN details are mandatory for transactions exceeding limits prescribed under the Income Tax Act, 1961.",
        "You agree to submit PAN, KYC, or other statutory documents when requested.",
        "BMG shall not be liable for penalties, delays, or consequences arising from non-compliance by the user.",
        "Non-compliant transactions may be rejected, withheld, or delayed.",
      ],
    },
    {
      id: '8',
      title: "8. Refund & Redemption Policy",
      content: [
        "Refunds and redemptions shall be governed strictly by the applicable scheme terms.",
        "No interest, bonus, or additional benefit shall be payable unless expressly stated in writing.",
        "Refunds shall be processed only to the registered bank account of the customer.",
        "BMG may request additional documentation prior to processing refunds.",
      ],
    },
    {
      id: '9',
      title: "9. Data Privacy & Security",
      content: [
        "Personal data is collected, stored, and processed in accordance with:",
        "Information Technology Act, 2000",
        "IT (Reasonable Security Practices and Procedures and Sensitive Personal Data) Rules, 2011",
        "BMG's Privacy Policy",
        "Users are advised to review the Privacy Policy available on the Platform.",
      ],
    },
    {
      id: '10',
      title: "10. Force Majeure",
      content: [
        "BMG shall not be liable for any failure or delay in performance due to events beyond reasonable control, including but not limited to:",
        "Natural disasters",
        "System or server failures",
        "Government orders or regulatory actions",
        "Network or payment gateway disruptions",
        "Cybersecurity incidents",
      ],
    },
    {
      id: '11',
      title: "11. Suspension & Termination",
      content: [
        "BMG may suspend or terminate access to the Platform if:",
        "These Terms are violated",
        "Fraud, abuse, or misuse is detected",
        "Required by law or regulatory authority",
        "Termination shall not affect completed transactions or accrued legal obligations.",
      ],
    },
    {
      id: '12',
      title: "12. Intellectual Property",
      content: [
        "All content on the Platform, including trademarks, logos, designs, text, images, software, and proprietary material, is the exclusive property of BMG Jewellers Private Limited.",
        "Unauthorized use, reproduction, distribution, or modification is strictly prohibited.",
        "Any feedback or suggestions submitted by users may be used by BMG without obligation or compensation.",
      ],
    },
    {
      id: '13',
      title: "13. Disclaimers & Limitation of Liability",
      content: [
        "The Platform is provided on an 'as-is' and 'as-available' basis.",
        "BMG does not guarantee uninterrupted or error-free access.",
        "BMG shall not be liable for indirect, incidental, consequential, or speculative losses.",
        "Jewellery prices are market-linked; BMG does not guarantee appreciation, returns, or future value.",
      ],
    },
    {
      id: '14',
      title: "14. Communication Consent",
      content: [
        "By registering, you consent to receive:",
        "Transactional notifications",
        "Service-related communications",
        "Promotional messages",
        "via SMS, WhatsApp, email, or calls, in compliance with TRAI regulations.",
        "Opt-out mechanisms shall be provided where applicable.",
      ],
    },
    {
      id: '15',
      title: "15. Grievance Redressal",
      content: [
        "In accordance with applicable laws, BMG has established a grievance redressal mechanism.",
      ],
      subsections: [
        {
          id: '15a',
          title: "Grievance Officer:",
          content: [
            "Name: Administrative officer",
            "Email: contact@bmgjewellers.in",
            "Response Time: Within 48 hours",
            "Resolution Time: Up to 30 days",
          ],
        },
      ],
    },
    {
      id: '16',
      title: "16. Governing Law & Dispute Resolution",
      content: [
        "These Terms shall be governed by the laws of India.",
        "Any dispute shall be resolved through arbitration under the Arbitration and Conciliation Act, 1996.",
        "Venue: Tamil Nadu",
        "Language: English or Tamil",
      ],
    },
    {
      id: '17',
      title: "17. General Provisions",
      content: [
        "Severability: Invalid provisions shall not affect the enforceability of remaining clauses",
        "Waiver: Failure to enforce any right shall not constitute a waiver",
        "Assignment: BMG may assign its rights and obligations without user consent",
      ],
    },
    {
      id: '18',
      title: "18. Contact Details",
      content: [
        "BMG Jewellers Private Limited",
        "54, VAITHIYANATHAPURAM, THATHANERI,",
        "Madurai, Tamil Nadu, 625018",
        "Email: contact@bmgjewellers.in",
        "Phone: 7094670946",
      ],
    },
  ];

  // Initialize all sections as closed (collapsed) initially
  const [openSections, setOpenSections] = useState(
    termsData.map(() => false) // All sections closed by default
  );

  const toggleSection = (index) => {
    const updated = [...openSections];
    updated[index] = !updated[index];
    setOpenSections(updated);
  };

  // Helper function to render content with unique keys
  const renderContent = (content, contentIndex) => (
    <View key={`content-${contentIndex}`} style={styles.pointContainer}>
      <View style={styles.bullet} />
      <TextDefault style={styles.pointText}>{content}</TextDefault>
    </View>
  );

  const renderNumberedContent = (content, contentIndex, parentIndex) => (
    <View key={`numbered-${parentIndex}-${contentIndex}`} style={styles.numberedContainer}>
      <View style={styles.numberCircle}>
        <TextDefault style={styles.numberText}>{contentIndex + 1}</TextDefault>
      </View>
      <TextDefault style={styles.pointText}>{content}</TextDefault>
    </View>
  );

  // Function to check if content should be rendered as numbered list
  const shouldRenderNumbered = (sectionTitle, contentIndex) => {
    if (sectionTitle === "3. Account Registration" && contentIndex >= 1 && contentIndex <= 6) {
      return true;
    } else if (sectionTitle === "5. Services Offered" && contentIndex >= 1 && contentIndex <= 3) {
      return true;
    } else if (sectionTitle === "10. Force Majeure" && contentIndex >= 1 && contentIndex <= 5) {
      return true;
    } else if (sectionTitle === "14. Communication Consent" && contentIndex >= 1 && contentIndex <= 3) {
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CommonHeader title="Terms of Use" />

          <View style={styles.headerContainer}>
            <TextDefault style={styles.headerTitle}>
              BMG Jewellers Private Limited
            </TextDefault>
            <TextDefault style={styles.headerSubtitle}>
              Last Updated: 26/12/2024
            </TextDefault>
            <TextDefault style={styles.introText}>
              These Terms of Use ("Terms") govern your access to and use of the mobile application, website, digital platforms, and related services (collectively, the "Platform") operated by BMG Jewellers Private Limited, a company incorporated under the Companies Act, 2013, India (hereinafter referred to as "BMG", "Company", "we", "us", or "our").
            </TextDefault>
            <TextDefault style={styles.introText}>
              By accessing, registering on, or using the Platform, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and all applicable laws and regulations.
            </TextDefault>
          </View>

          <View style={styles.contentContainer}>
            {termsData.map((section, index) => (
              <View key={section.id} style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleSection(index)}
                >
                  <View style={styles.iconContainer}>
                    <Icon
                      name={openSections[index] ? "expand-less" : "expand-more"}
                      size={moderateScale(20)}
                      color={COLORS.primary}
                    />
                  </View>
                  <TextDefault style={styles.sectionTitle}>{section.title}</TextDefault>
                </TouchableOpacity>

                {openSections[index] && (
                  <View style={styles.sectionContent}>
                    {section.content.map((point, contentIndex) => {
                      // Check if content starts with bullet points list
                      if (point.includes(":")) {
                        const [prefix, ...rest] = point.split(":");
                        return (
                          <View key={`${section.id}-prefix-${contentIndex}`}>
                            <TextDefault style={styles.subsectionTitle}>{prefix}:</TextDefault>
                            {rest.length > 0 && renderContent(rest.join(":").trim(), contentIndex)}
                          </View>
                        );
                      } else if (shouldRenderNumbered(section.title, contentIndex)) {
                        return renderNumberedContent(point, contentIndex - 1, index);
                      } else {
                        return renderContent(point, contentIndex);
                      }
                    })}

                    {section.subsections &&
                      section.subsections.map((sub, subIndex) => (
                        <View key={`${section.id}-sub-${sub.id}`} style={styles.subsection}>
                          <TextDefault style={styles.subsectionTitle}>{sub.title}</TextDefault>
                          {sub.content.map((point, contentIndex) => {
                            if (point.includes(":")) {
                              const [prefix, ...rest] = point.split(":");
                              return (
                                <View key={`${section.id}-sub-${sub.id}-${contentIndex}`}>
                                  <TextDefault style={styles.subsectionSubtitle}>{prefix}:</TextDefault>
                                  {rest.length > 0 && renderContent(rest.join(":").trim(), contentIndex)}
                                </View>
                              );
                            } else {
                              return renderContent(point, contentIndex);
                            }
                          })}
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.footer}>
              <TextDefault style={styles.lastUpdated}>
                © 2024 BMG Jewellers Private Limited. All rights reserved.
              </TextDefault>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  backgroundImage: { 
    flex: 1, 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: verticalScale(SIZES.padding.xl),
  },
  headerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginTop: verticalScale(SIZES.padding.md),
    marginBottom: verticalScale(SIZES.padding.lg),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: verticalScale(SIZES.xs),
  },
  headerSubtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: verticalScale(SIZES.padding.lg),
    fontStyle: 'italic',
  },
  introText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
    marginBottom: verticalScale(SIZES.padding.md),
    textAlign: 'justify',
  },
  contentContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.xl),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  section: {
    marginBottom: verticalScale(SIZES.padding.lg),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
    paddingLeft: SIZES.padding.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  iconContainer: { 
    marginRight: SIZES.padding.sm,
    width: moderateScale(24),
    alignItems: 'center',
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: SIZES.font.lg * 1.3,
  },
  sectionContent: {
    marginTop: verticalScale(SIZES.xs),
  },
  subsection: {
    marginLeft: SIZES.padding.sm,
    marginTop: verticalScale(SIZES.padding.md),
    paddingLeft: SIZES.padding.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.borderMedium,
  },
  subsectionTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginBottom: verticalScale(SIZES.padding.sm),
    fontWeight: '600',
  },
  subsectionSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: verticalScale(SIZES.xs),
    fontWeight: '500',
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(SIZES.padding.sm),
    paddingLeft: SIZES.xs,
  },
  numberedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(SIZES.padding.sm),
    marginLeft: SIZES.padding.sm,
  },
  bullet: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.padding.sm,
    marginTop: verticalScale(SIZES.padding.sm),
  },
  numberCircle: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.sm,
    marginTop: verticalScale(SIZES.xs),
  },
  numberText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  pointText: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: verticalScale(SIZES.padding.lg),
    marginTop: verticalScale(SIZES.padding.sm),
    alignItems: 'center',
  },
  lastUpdated: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TermsFAQPage;