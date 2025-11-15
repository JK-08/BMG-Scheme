import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { TextDefault } from '../../components';
import appTheme from '../../utils/MainTheme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { COLORS, SIZES, FONTS, verticalScale, moderateScale } = appTheme;

const TermsFAQPage = () => {
  const termsData = [
    {
      title: "1. Product Representation",
      content: [
        "Images are for reference only. Minor variations in color or finish may occur.",
        "All products are handcrafted, so slight irregularities are natural.",
        "For exact details, contact us before ordering.",
      ],
    },
    {
      title: "2. Pricing",
      subtitle: "Currency & Taxes",
      content: [
        "All prices are in INR and inclusive of GST",
      ],
      subsections: [
        {
          title: "Price Changes",
          content: [
            "Prices may change without prior notice",
            "Final amount charged will be as displayed at checkout.",
          ],
        },
      ],
    },
    {
      title: "3. Payments",
      content: [
        "We accept the following payment methods:",
        "Online Payments",
        "UPI",
        "Debit/Credit Cards",
        "Net Banking",
        "Cash on Delivery (Selected PIN codes only)",
        "₹50 COD fee may apply",
      ],
    },
    {
      title: "4. Product Use & Care",
      content: [
        "Handle gold-polished jewellery with care. Avoid water & chemicals.",
        "Store in a dry pouch when not in use.",
        "No guarantee for polish durability; depends on usage.",
        "Ask us for maintenance tips to extend product life.",
      ],
    },
    {
      title: "5. Limitation of Liability",
      content: [
        "We are not liable for:",
        "Shipping delays or damage",
        "Force majeure events",
        "Improper use or care",
      ],
    },
    {
      title: "6. Intellectual Property",
      content: [
        "All content is © and the property of our brand. No part may be:",
        "Copied or redistributed without permission",
        "Used commercially",
        "Altered or modified",
      ],
    },
    {
      title: "7. Governing Law",
      content: [
        "These terms are governed by Indian law.",
        "Disputes will be settled in Madurai, Tamil Nadu.",
        "Contact us before placing orders if you have any questions.",
      ],
    },
  ];

  const [openSections, setOpenSections] = useState(
    termsData.map(() => true) // all open by default
  );

  const toggleSection = (index) => {
    const updated = [...openSections];
    updated[index] = !updated[index];
    setOpenSections(updated);
  };

  const renderContent = (content) => (
    <View style={styles.pointContainer}>
      <View style={styles.bullet} />
      <TextDefault style={styles.pointText}>{content}</TextDefault>
    </View>
  );

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
          <CommonHeader title="Terms & Conditions" />

          <View style={styles.contentContainer}>
            {termsData.map((section, index) => (
              <View key={index} style={styles.section}>
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
                    {section.subtitle && (
                      <TextDefault style={styles.subtitle}>{section.subtitle}</TextDefault>
                    )}

                    {section.content.map((point, idx) => (
                      <View key={idx}>{renderContent(point)}</View>
                    ))}

                    {section.subsections &&
                      section.subsections.map((sub, subIndex) => (
                        <View key={subIndex} style={styles.subsection}>
                          <TextDefault style={styles.subsectionTitle}>{sub.title}</TextDefault>
                          {sub.content.map((point, idx) => (
                            <View key={idx}>{renderContent(point)}</View>
                          ))}
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.footer}>
              <TextDefault style={styles.lastUpdated}>
                Last Updated: 23 August 2025
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
    paddingBottom: verticalScale(20),
  },
  contentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginHorizontal: SIZES.padding.md,
    marginTop: verticalScale(10),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  section: {
    marginBottom: verticalScale(16),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
    paddingLeft: moderateScale(12),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  iconContainer: { 
    marginRight: moderateScale(8),
    width: moderateScale(24),
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: verticalScale(24),
  },
  subtitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.secondary,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  sectionContent: {
    marginTop: verticalScale(4),
  },
  subsection: {
    marginLeft: moderateScale(8),
    marginTop: verticalScale(12),
    paddingLeft: moderateScale(8),
    borderLeftWidth: 2,
    borderLeftColor: COLORS.borderMedium,
  },
  subsectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(8),
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
    paddingLeft: moderateScale(4),
  },
  bullet: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: COLORS.primary,
    marginRight: moderateScale(10),
    marginTop: verticalScale(8),
  },
  pointText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: verticalScale(16),
    marginTop: verticalScale(8),
    alignItems: 'center',
  },
  lastUpdated: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default TermsFAQPage;