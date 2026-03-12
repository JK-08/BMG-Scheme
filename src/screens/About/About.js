import React from 'react';
import { ScrollView, View, SafeAreaView, StatusBar, Image, ImageBackground, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextDefault } from '../../components';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import theme from '../../utils/AppTheme';
import {BottomTab} from '../../components';

const { COLORS, SIZES, FONTS, verticalScale, moderateScale, SHADOWS } = theme;

const CONTENT = {
  intro: [
    "BMG Jewellers is a trusted destination for pure 92.5 Hallmarked silver jewellery and articles, crafted to celebrate tradition, elegance, and everyday luxury.",
    "We specialize in a wide range of gold-polished silver jewellery, plain silver ornaments, silver vessels, pooja articles, idols, photo frames, and 999 pure silver bars and coins—each piece designed to combine beauty, purity, and lasting value.",
    "At BMG Jewellers, we believe silver is not just an ornament—it is heritage, investment, and emotion. Every product we offer is carefully curated, quality-checked, and hallmarked to ensure purity, transparency, and customer confidence."
  ],
  whyChooseUs: [
    {
      icon: 'verified',
      title: '92.5 Hallmarked Assurance',
      description: 'All our jewellery and silver articles meet certified purity standards for complete peace of mind.',
      color: COLORS.primary
    },
    {
      icon: 'brush',
      title: 'Gold-Polished Silver Excellence',
      description: 'Experience the elegance of gold-look jewellery with the value and durability of pure silver.',
      color: COLORS.secondary
    },
    {
      icon: 'category',
      title: 'Wide Product Range Under One Roof',
      description: 'From daily-wear ornaments to traditional vessels, from festive jewellery to pure 999 silver bars and coins.',
      color: COLORS.warning
    },
    {
      icon: 'price-check',
      title: 'Transparent Pricing & Ethical Practices',
      description: 'Clear weight, purity, and pricing—no hidden charges, no compromise.',
      color: COLORS.success
    },
    {
      icon: 'design-services',
      title: 'Craftsmanship with Modern Design',
      description: 'Traditional artistry blended with contemporary styles to suit every generation.',
      color: COLORS.info
    },
    {
      icon: 'handshake',
      title: 'Trust Built on Relationships',
      description: 'Customer satisfaction and long-term trust are at the heart of everything we do.',
      color: COLORS.primaryLight
    }
  ],
  vision: "To become a leading and most trusted silver jewellery brand, offering purity-driven products, innovative designs, and unmatched customer experience—both in-store and online.",
  promise: [
    { icon: 'verified', text: 'Certified purity' },
    { icon: 'price-change', text: 'Honest pricing' },
    { icon: 'engineering', text: 'Superior craftsmanship' },
    { icon: 'support-agent', text: 'Customer-first service' }
  ],
  commitment: "BMG Jewellers is committed to delivering silver you can trust, wear, gift, and invest in—today and for generations to come."
};

const AboutPage = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <CommonHeader title="About Us" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TextDefault style={styles.tagline}>
              Silver You Can Trust
            </TextDefault>
          </View>

          {/* Introduction Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="business" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>About BMG Jewellers</TextDefault>
            </View>
            {CONTENT.intro.map((text, index) => (
              <View key={index} style={styles.textContainer}>
                <View style={styles.bullet} />
                <TextDefault style={styles.sectionText}>
                  {text}
                </TextDefault>
              </View>
            ))}
          </View>

          {/* What Makes Us Different Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="star" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>What Makes Us Different</TextDefault>
            </View>
            {CONTENT.whyChooseUs.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                  <MaterialIcons name={feature.icon} size={moderateScale(20)} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <TextDefault style={styles.featureTitle}>{feature.title}</TextDefault>
                  <TextDefault style={styles.featureDescription}>
                    {feature.description}
                  </TextDefault>
                </View>
              </View>
            ))}
          </View>

          {/* Our Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="visibility" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Vision</TextDefault>
            </View>
            <View style={styles.visionBox}>
              <MaterialIcons name="target" size={moderateScale(28)} color={COLORS.primary} />
              <TextDefault style={styles.visionText}>
                {CONTENT.vision}
              </TextDefault>
            </View>
          </View>

          {/* Our Promise Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="favorite" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Promise</TextDefault>
            </View>
            <View style={styles.promiseGrid}>
              {CONTENT.promise.map((item, index) => (
                <View key={index} style={styles.promiseItem}>
                  <View style={styles.promiseIconContainer}>
                    <MaterialIcons name={item.icon} size={moderateScale(18)} color={COLORS.primary} />
                  </View>
                  <TextDefault style={styles.promiseItemText}>
                    {item.text}
                  </TextDefault>
                </View>
              ))}
            </View>
          </View>

          {/* Commitment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="security" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Commitment</TextDefault>
            </View>
            <View style={styles.commitmentBox}>
              <MaterialIcons name="check-circle" size={moderateScale(28)} color={COLORS.success} />
              <TextDefault style={styles.commitmentText}>
                {CONTENT.commitment}
              </TextDefault>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <MaterialIcons name="location-on" size={moderateScale(18)} color={COLORS.textSecondary} />
            <TextDefault style={styles.footerText}>
              Madurai, Tamil Nadu
            </TextDefault>
          </View>
        </ScrollView>
        <BottomTab />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(SIZES.padding.xl),
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(SIZES.padding.xl),
    marginBottom: verticalScale(SIZES.padding.md),
  },
  logoContainer: {
    width: moderateScale(120),
    height: moderateScale(70),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    marginBottom: verticalScale(SIZES.padding.md),
  },
  logo: {
    width: moderateScale(120),
    height: moderateScale(70),
  },
  tagline: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.lg),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(SIZES.padding.lg),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: verticalScale(SIZES.padding.md),
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginLeft: SIZES.padding.md,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(SIZES.padding.md),
  },
  bullet: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.padding.md,
    marginTop: verticalScale(SIZES.padding.sm),
  },
  sectionText: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: verticalScale(SIZES.padding.md),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryLight,
    ...SHADOWS.sm,
  },
  featureIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(SIZES.xs),
  },
  featureDescription: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.md * 1.4,
  },
  visionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '08',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  visionText: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
    marginLeft: SIZES.padding.md,
    textAlign: 'center',
  },
  promiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: verticalScale(SIZES.padding.sm),
  },
  promiseItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(SIZES.padding.md),
    ...SHADOWS.sm,
  },
  promiseIconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding.sm,
  },
  promiseItemText: {
    flex: 1,
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
  },
  commitmentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.success + '08',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  commitmentText: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: SIZES.font.lg * 1.4,
    marginLeft: SIZES.padding.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(SIZES.padding.xl),
    marginHorizontal: SIZES.padding.lg,
  },
  footerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
});

export default AboutPage;