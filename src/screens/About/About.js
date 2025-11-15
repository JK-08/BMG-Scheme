import React from 'react';
import { ScrollView, View, SafeAreaView, StatusBar, Image, ImageBackground, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextDefault } from '../../components';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS, verticalScale, moderateScale } from '../../utils/MainTheme';
import {BottomTab} from '../../components';
const CONTENT = {
  story: [
    "BMG Jewellers began as a small, family-run business in Madurai with a mission to provide high-quality, genuine jewellery.",
    "Now a trusted name, we're recognized for our craftsmanship, value, and customer care, rooted in the cultural richness of Madurai.",
    "Our legacy is built on lasting customer relationships, with many returning for their special occasions."
  ],
  craftsmanship: [
    "Our master craftsmen blend traditional techniques with modern designs, creating timeless pieces with meticulous attention to detail.",
    "Specializing in gold, diamonds, and precious stones, every piece meets our rigorous quality standards."
  ],
  features: [
    {
      icon: 'diamond',
      title: 'Uncompromising Quality',
      description: 'We use the finest materials and skilled artisans to craft jewellery that endures.',
      color: COLORS.primary
    },
    {
      icon: 'handshake',
      title: 'Trust & Transparency',
      description: 'For generations, we ve built honest relationships with no hidden costs.',
      color: COLORS.secondary
    },
    {
      icon: 'auto-awesome',
      title: 'Heritage & Innovation',
      description: 'We honor traditional craftsmanship while embracing modern designs.',
      color: COLORS.warning
    }
  ],
  mission: "At BMG Jewellers, we aim to make high-quality, beautifully designed jewellery accessible to everyone, with transparency and integrity.",
  vision: "We aspire to be a leading name in jewellery, expanding beyond Madurai while maintaining our commitment to quality and customer satisfaction.",
  promise: [
    "We promise exceptional value, superior craftsmanship, and unwavering customer trust.",
    "Your satisfaction is our ultimate goal, ensuring every interaction with BMG Jewellers is memorable."
  ]
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
                source={require('../../assets/image/logo2.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TextDefault style={styles.tagline}>
              Crafting Timeless Beauty Since 1985
            </TextDefault>
          </View>

          {/* Our Story Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="history" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Story</TextDefault>
            </View>
            {CONTENT.story.map((text, index) => (
              <View key={index} style={styles.textContainer}>
                <View style={styles.bullet} />
                <TextDefault style={styles.sectionText}>
                  {text}
                </TextDefault>
              </View>
            ))}
          </View>

          {/* Craftsmanship Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="precision-manufacturing" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Craftsmanship</TextDefault>
            </View>
            {CONTENT.craftsmanship.map((text, index) => (
              <View key={index} style={styles.textContainer}>
                <View style={styles.bullet} />
                <TextDefault style={styles.sectionText}>
                  {text}
                </TextDefault>
              </View>
            ))}
            <View style={styles.certificationBox}>
              <MaterialIcons name="verified" size={moderateScale(28)} color={COLORS.success} />
              <TextDefault style={styles.certificationText}>
                All items crafted with <TextDefault style={styles.certificationHighlight}>92.5 BIS hallmark-certified silver</TextDefault> for guaranteed purity.
              </TextDefault>
            </View>
          </View>

          {/* Why Choose Us Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="star" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Why Choose Us</TextDefault>
            </View>
            {CONTENT.features.map((feature, index) => (
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

          {/* Mission Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="flag" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Mission</TextDefault>
            </View>
            <View style={styles.missionBox}>
              <MaterialIcons name="target" size={moderateScale(28)} color={COLORS.primary} />
              <TextDefault style={styles.missionText}>
                {CONTENT.mission}
              </TextDefault>
            </View>
          </View>

          {/* Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="visibility" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Vision</TextDefault>
            </View>
            <View style={styles.visionBox}>
              <MaterialIcons name="trending-up" size={moderateScale(28)} color={COLORS.warning} />
              <TextDefault style={styles.visionText}>
                {CONTENT.vision}
              </TextDefault>
            </View>
          </View>

          {/* Promise Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="favorite" size={moderateScale(24)} color={COLORS.primary} />
              <TextDefault style={styles.sectionTitle}>Our Promise</TextDefault>
            </View>
            <View style={styles.promiseBox}>
              <MaterialIcons name="security" size={moderateScale(28)} color={COLORS.secondary} />
              <View style={styles.promiseContent}>
                {CONTENT.promise.map((text, index) => (
                  <View key={index} style={styles.promiseItem}>
                    <View style={styles.promiseBullet} />
                    <TextDefault style={styles.promiseText}>
                      {text}
                    </TextDefault>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TextDefault style={styles.footerText}>
              Thank you for choosing BMG Jewellers
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
    paddingBottom: verticalScale(20),
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  logoContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: verticalScale(10),
  },
  logo: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  tagline: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginHorizontal: SIZES.padding.md,
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: verticalScale(10),
  },
  sectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(10),
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  bullet: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: COLORS.primary,
    marginRight: moderateScale(10),
    marginTop: verticalScale(8),
  },
  sectionText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
  },
  certificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.sm,
    marginTop: verticalScale(10),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  certificationText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(10),
  },
  certificationHighlight: {
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.success,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.sm,
    marginBottom: verticalScale(10),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  featureIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: SIZES.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(4),
  },
  featureDescription: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(18),
  },
  missionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '08',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  missionText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
    marginLeft: moderateScale(10),
    textAlign: 'center',
  },
  visionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '08',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  visionText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
    marginLeft: moderateScale(10),
  },
  promiseBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.secondary + '08',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  promiseContent: {
    flex: 1,
    marginLeft: moderateScale(10),
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  promiseBullet: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: COLORS.secondary,
    marginRight: moderateScale(8),
    marginTop: verticalScale(8),
  },
  promiseText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(20),
  },
  footer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    marginHorizontal: SIZES.padding.md,
  },
  footerText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default AboutPage;