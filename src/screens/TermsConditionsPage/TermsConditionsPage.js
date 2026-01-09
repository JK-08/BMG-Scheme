import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { TextDefault } from "../../components";
import theme from "../../utils/AppTheme";

const {
  COLORS,
  SIZES,
  FONTS,
  verticalScale,
  moderateScale,
  SHADOWS,
} = theme;

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

const [openSections, setOpenSections] = useState(
  termsData.map(() => true) // 👈 ALL OPEN by default
);


 const toggleSection = (index) => {
  setOpenSections((prev) => {
    const updated = [...prev];
    updated[index] = !updated[index];
    return updated;
  });
};

  const BulletPoint = ({ text }) => (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <TextDefault style={styles.bulletText}>{text}</TextDefault>
    </View>
  );

  const NumberedPoint = ({ index, text }) => (
    <View style={styles.numberRow}>
      <View style={styles.numberCircle}>
        <TextDefault style={styles.numberText}>{index}</TextDefault>
      </View>
      <TextDefault style={styles.bulletText}>{text}</TextDefault>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CommonHeader title="Terms of Use" />

          {/* Header */}
          <View style={styles.topCard}>
            <TextDefault style={styles.companyName}>
              BMG Jewellers Private Limited
            </TextDefault>

            <TextDefault style={styles.updatedText}>
              Last Updated: 26/12/2024
            </TextDefault>

            <TextDefault style={styles.paragraph}>
              These Terms of Use govern your access to and use of the mobile
              application, website, and services operated by BMG Jewellers
              Private Limited.
            </TextDefault>

            <TextDefault style={styles.paragraph}>
              By using the Platform, you confirm that you have read, understood,
              and agreed to these Terms.
            </TextDefault>
          </View>

          {/* Sections */}
          <View style={styles.contentCard}>
          {termsData.map((section, index) => (
  <View key={section.id} style={styles.section}>
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.sectionHeader}
      onPress={() => toggleSection(index)}
    >
      <Icon
        name={
          openSections[index]
            ? "keyboard-arrow-up"
            : "keyboard-arrow-down"
        }
        size={moderateScale(24)}
        color={COLORS.primary}
      />
      <TextDefault style={styles.sectionTitle}>
        {section.title}
      </TextDefault>
    </TouchableOpacity>

    {openSections[index] && (
      <View style={styles.sectionBody}>
        {section.content.map((item, i) => (
          <BulletPoint key={i} text={item} />
        ))}

        {section.subsections?.map((sub) => (
          <View key={sub.id} style={styles.subSection}>
            <TextDefault style={styles.subTitle}>{sub.title}</TextDefault>
            {sub.content.map((text, i) => (
              <BulletPoint key={i} text={text} />
            ))}
          </View>
        ))}
      </View>
    )}
  </View>
))}


            <View style={styles.footer}>
              <TextDefault style={styles.footerText}>
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
  container: { flex: 1 },
  background: { flex: 1 },

  scrollContent: {
    paddingBottom: verticalScale(30),
  },

  topCard: {
    backgroundColor: COLORS.card,
    margin: SIZES.padding.lg,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.md,
  },

  companyName: {
    ...FONTS.h4,
    textAlign: "center",
    color: COLORS.primary,
  },

  updatedText: {
    ...FONTS.bodySmall,
    textAlign: "center",
    marginVertical: verticalScale(6),
    color: COLORS.textSecondary,
  },

  paragraph: {
    ...FONTS.body,
    textAlign: "justify",
    lineHeight: 22,
    marginTop: verticalScale(8),
  },

  contentCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    ...SHADOWS.md,
  },

  section: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: verticalScale(10),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    ...FONTS.h5,
    marginLeft: SIZES.padding.sm,
    flex: 1,
    flexWrap: "wrap",
  },

  sectionBody: {
    marginTop: verticalScale(10),
    paddingLeft: moderateScale(30),
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(8),
  },

  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 10,
  },

  bulletText: {
    ...FONTS.body,
    flex: 1,
    lineHeight: 22,
  },

  subSection: {
    marginTop: verticalScale(10),
  },

  subTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginBottom: verticalScale(6),
  },

  footer: {
    marginTop: verticalScale(20),
    alignItems: "center",
  },

  footerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default TermsFAQPage;
