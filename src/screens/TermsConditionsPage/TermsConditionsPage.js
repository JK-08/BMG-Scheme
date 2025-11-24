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
    paddingBottom: verticalScale(SIZES.padding.xl),
  },
  contentContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginTop: verticalScale(SIZES.padding.md),
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
  subtitle: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    marginBottom: verticalScale(SIZES.padding.sm),
    marginTop: verticalScale(SIZES.xs),
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
    color: COLORS.textPrimary,
    marginBottom: verticalScale(SIZES.padding.sm),
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(SIZES.padding.sm),
    paddingLeft: SIZES.xs,
  },
  bullet: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.padding.sm,
    marginTop: verticalScale(SIZES.padding.sm),
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
  },
});

export default TermsFAQPage;