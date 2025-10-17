import React from 'react';
import { ScrollView, View, SafeAreaView, StatusBar, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextDefault } from '../../components';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS } from '../../utils/Theme';

const CONTENT = {
  story: [
    "BMG Jewellers began as a small, family-run business in Madurai with a mission to provide high-quality, genuine jewellery.",
    "Now a trusted name, we’re recognized for our craftsmanship, value, and customer care, rooted in the cultural richness of Madurai.",
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
      description: 'For generations, we’ve built honest relationships with no hidden costs.',
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
  const { height, width } = Dimensions.get('window');

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={[styles.background, { width, height }]}
      resizeMode="cover" // ensure image covers entire screen
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <CommonHeader title="About Us" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.logoGradient}
            >
              <Image
                source={require('../../assets/image/logo4.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        {/* Our Story Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="book" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Our Story</TextDefault>
          </View>
          {CONTENT.story.map((text, index) => (
            <TextDefault key={index} style={[FONTS.font, styles.sectionContent]}>
              {text}
            </TextDefault>
          ))}
        </View>

        {/* Craftsmanship Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="precision-manufacturing" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Our Craftsmanship</TextDefault>
          </View>
          {CONTENT.craftsmanship.map((text, index) => (
            <TextDefault key={index} style={[FONTS.font, styles.sectionContent]}>
              {text}
            </TextDefault>
          ))}
          <View style={styles.certificationBox}>
            <LinearGradient
              colors={[COLORS.success + '15', COLORS.transparent]}
              style={styles.certificationGradient}
            >
              <MaterialIcons name="verified" size={SIZES.h3} color={COLORS.success} />
              <TextDefault style={[FONTS.font, styles.certificationText]}>
                All items crafted with <TextDefault style={FONTS.body1}>92.5 BIS hallmark-certified silver</TextDefault> for guaranteed purity.
              </TextDefault>
            </LinearGradient>
          </View>
        </View>

        {/* Why Choose Us Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="star" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Why Choose Us</TextDefault>
          </View>
          {CONTENT.features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={[feature.color + '15', COLORS.transparent]}
                style={styles.featureGradient}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '30' }]}>
                  <MaterialIcons name={feature.icon} size={SIZES.h5} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <TextDefault style={[FONTS.h5, styles.featureTitle]}>{feature.title}</TextDefault>
                  <TextDefault style={[FONTS.fontSm, styles.featureDescription]}>
                    {feature.description}
                  </TextDefault>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="flag" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Our Mission</TextDefault>
          </View>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.missionGradient}
          >
            <TextDefault style={[FONTS.h5, styles.missionText]}>
              {CONTENT.mission}
            </TextDefault>
          </LinearGradient>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="visibility" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Our Vision</TextDefault>
          </View>
          <LinearGradient
            colors={[COLORS.warning + '15', COLORS.transparent]}
            style={styles.visionGradient}
          >
            <MaterialIcons name="trending-up" size={SIZES.h3} color={COLORS.warning} />
            <TextDefault style={[FONTS.font, styles.visionText]}>
              {CONTENT.vision}
            </TextDefault>
          </LinearGradient>
        </View>

        {/* Promise Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="favorite" size={SIZES.h5} color={COLORS.primary} />
            <TextDefault style={[FONTS.h4, styles.sectionTitle]}>Our Promise</TextDefault>
          </View>
          <LinearGradient
            colors={[COLORS.secondary + '15', COLORS.transparent]}
            style={styles.promiseGradient}
          >
            {CONTENT.promise.map((text, index) => (
              <TextDefault
                key={index}
                style={[FONTS.font, styles.promiseText, index === 1 && FONTS.body1]}
              >
                {text}
              </TextDefault>
            ))}
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 1,
    // backgroundColor: COLORS.card,
    marginBottom: SIZES.margin,
  },
  logoGradient: {
    width: SIZES.width * 0.2,
    height: SIZES.width * 0.2,
    borderRadius: SIZES.radius_lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: SIZES.width * 0.15,
    height: SIZES.width * 0.15,
    borderRadius: SIZES.radius_lg,
  },
  section: {
    backgroundColor: COLORS.card,
    marginBottom: SIZES.margin,
    padding: SIZES.padding,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    marginLeft: SIZES.padding * 0.5,
  },
  sectionContent: {
    marginBottom: SIZES.padding * 0.75,
    textAlign: 'justify',
  },
  certificationBox: {
    marginTop: SIZES.padding,
  },
  certificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  certificationText: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  featureCard: {
    marginBottom: SIZES.padding,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  featureIcon: {
    width: SIZES.width * 0.1,
    height: SIZES.width * 0.1,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  featureTitle: {
    marginBottom: SIZES.radius_sm * 0.5,
  },
  featureDescription: {
    lineHeight: SIZES.font * 1.2,
  },
  missionGradient: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  missionText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  visionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  visionText: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  promiseGradient: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  promiseText: {
    textAlign: 'center',
    marginTop: SIZES.padding * 0.5,
  },
};

export default AboutPage;