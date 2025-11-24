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
  const handleExternalLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const handleEmail = () => Linking.openURL("mailto:Contact@bmgjewellers.in");
  const handlePhoneCall = () => Linking.openURL("tel:+919514333601");

  const policySections = [
    {
      title: "Introduction",
      icon: "info",
      content:
        "At BMG Jewellers, your privacy is our top priority. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you use our Jewellery Chit App, website, or related services.",
    },
    {
      title: "Information We Collect",
      icon: "person",
      content: "",
      subsections: [
        {
          title: "Personal Information",
          content:
            "Full Name, Date of Birth, Gender, Contact Details, Residential Address, Government-issued ID (Aadhaar, PAN), Photographs",
        },
        {
          title: "Financial Information",
          content:
            "Bank Account Details, UPI ID, Transaction History, Payment Records, Chit contributions",
        },
        {
          title: "Technical Information",
          content: "Device Information, IP Address, Location, App usage patterns",
        },
      ],
    },
    {
      title: "Purpose of Data Collection",
      icon: "data-usage",
      content:
        "Register and manage your account, Enable chit scheme participation, Process payments and transactions, Verify identity and prevent fraud, Communicate updates and offers, Enhance app performance and security",
    },
    {
      title: "Data Sharing & Disclosure",
      icon: "share",
      content: "",
      subsections: [
        {
          title: "We Share With",
          content:
            "Trusted Service Providers, Legal Authorities (when required), Business Transfers (merger/acquisition)",
        },
        {
          title: "We Never Share With",
          content: "Third parties for commercial gain without your consent",
        },
      ],
    },
    {
      title: "Your Rights",
      icon: "security",
      content:
        "Access your data, Correct inaccurate information, Withdraw consent, Request data portability, Request deletion (subject to legal requirements)",
    },
    {
      title: "Data Security",
      icon: "lock",
      content:
        "Encryption of sensitive data (SSL/HTTPS), Controlled access to information, Secure data centers, Regular system audits, Confidentiality of login credentials",
    },
    {
      title: "Children's Privacy",
      icon: "child-care",
      content:
        "Our services are intended for individuals aged 18 years and above. We do not knowingly collect personal data from minors.",
    },
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
                    <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                    <Text style={styles.subsectionContent}>
                      {subsection.content}
                    </Text>
                  </View>
                ))}
            </View>
          ))}

          {/* Contact Information */}
          <View style={styles.contactCard}>
            <Text style={styles.contactCardTitle}>
              Contact Our Grievance Officer
            </Text>

            <ContactInfo
              icon="email"
              label="Email"
              value="Contact@bmgjewellers.in"
              onPress={handleEmail}
              isLink={true}
            />
            <ContactInfo
              icon="phone"
              label="Phone"
              value="+91-95143 33601"
              onPress={handlePhoneCall}
            />
            <ContactInfo
              icon="business"
              label="Address"
              value="M/s. BMG Jewellers Pvt Ltd, 160, Melamasi St, Madurai-625001"
            />
            <ContactInfo
              icon="access-time"
              label="Office Hours"
              value="[Mon-Sat 10:00 AM - 6:00 PM, Sun 11:00 AM - 4:00 PM]"
            />
          </View>

          {/* Legal Footer */}
          <LinearGradient
            colors={COLORS.gradient.primary}
            style={styles.legalFooter}
          >
            <Icon name="gavel" size={moderateScale(20)} color={COLORS.white} />
            <Text style={styles.legalText}>
              Governed by Indian Laws • Information Technology Act, 2000
            </Text>
          </LinearGradient>

          {/* Copyright */}
          <View style={styles.copyright}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} BMG Jewellers. All rights reserved.
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
  },
  subsection: { 
    marginTop: verticalScale(SIZES.padding.sm) 
  },
  subsectionTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginBottom: verticalScale(SIZES.xs),
  },
  subsectionContent: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.md * 1.4,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.lg),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  contactCardTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(SIZES.padding.md),
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
  legalFooter: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginHorizontal: SIZES.padding.lg,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(SIZES.padding.lg),
    ...SHADOWS.md,
  },
  legalText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    marginLeft: SIZES.padding.sm,
    textAlign: "center",
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