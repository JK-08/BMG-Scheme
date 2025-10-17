import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  scale,
  moderateScale,
  COLORS,
  FONTS,
  SIZES,
  DIGIGOLD_COLORS,
} from '../../utils/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonHeader from '../../components/CommonHeader/CommonHeader';

// Separate content into a constants file for better maintainability
const SCHEME_CONTENT = {
  tamil: {
    amountSilver: [
      'சேமிப்பு திட்ட காலங்கள் 11 மாதங்கள்.',
      'ரூபாய் 1000 முதல் பணம் செலுத்தலாம்.',
      '11-வது மாத இறுதியில் ஒரு மாத தொகை போனஷாக கணக்கிடப்பட்டு வெள்ளி பொருட்கள் வழங்கப்படும்.',
      'முதல் மாதம் செலுத்தும் தொகை மாதம்தோறும் செலுத்த வேண்டும்.',
      'இத்திட்டத்திற்கு GST இதர வரி உண்டு.',
    ],
    digiSilver: [
      'சேமிப்பு திட்ட காலங்கள் 11 மாதங்கள்.',
      'ரூபாய் 100 முதல் பணம் செலுத்தலாம்.',
      'மாதந்தோறும் எவ்வளவு தொகை வேண்டுமானாலும் செலுத்திக் கொள்ளலாம்.',
      'முதிர்வு நாளில் தாங்கள் செலுத்திய ஒவ்வொரு மாத தொகைக்கும் முடிவில் 15% போனஸ் பணமாக வர வைக்கப்பட்டு வெள்ளி பொருளாக வழங்கப்படும்.',
      'இத்திட்டத்திற்கு GST இதர வரி உண்டு.',
    ],
    lumpSum: [
      'சேமிப்பு திட்டங்கள் 11 மாதங்கள்.',
      'ஒரே ஒரு முறை மட்டும் பணம் செலுத்தும் திட்டம்.',
      'ஆரம்ப தொகை ரூ.5000 மேல் பணம் செலுத்த வேண்டும்.',
      'நீங்கள் செலுத்திய பணம் பணமாக வரவு வைக்கப்படும்.',
      'முதிர்வு 330 நாளில் தாங்கள் செலுத்திய பணத்திற்கு 16% போனஸ் பணமாக வரவு வைக்கப்பட்டு, வெள்ளிப் பொருட்களாக வழங்கப்படும்.',
      'இத்திட்டத்திற்கு GST இதர வரி உண்டு.',
    ],
    termsTitle: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    terms: [
      'ஒவ்வொரு மாதமும் நீங்கள் செலுத்தும் தொகை அட்வான்ஸ் முறையில் வெள்ளி பொருட்கள் வாங்குவதற்காக உங்கள் கணக்கில் வர வைக்கப்படுகிறது.',
      'LUMPSUM சேமிப்பு திட்டதிற்கு பழைய வெள்ளி பொருட்கள் கொடுத்து இத்திட்டதில் இணையலாம்.',
      'பழைய வெள்ளிப்பொருட்களை இந்தத்திட்டத்தின் கீழ் எக்ஸ்சேஞ்ச் செய்து கொள்ளலாம். இது நிறுவனம் விதித்த நிபந்தனைகளுக்கு உட்பட்டது.',
      'இத்திட்டதில் இணையும்போது மற்றும் இத்திட்டம் நிறைவுடையும் போது பணத்தைத் திரும்பப்பெறும் போதும் அடையாள அட்டை மற்றும் வங்கிக்கணக்குப் புத்தகத்திற்கான சான்றினை சமர்ப்பிக்கவும்.',
      'வாடிக்கையாளர் பெயர், முகவரி, கைபேசி எண் மாற்றம் செய்யவேண்டும் என்றால் முன்பே தகவல் தெரிவித்து அதற்குரிய ஆவணங்களை கொடுக்கவும்.',
      'சேமிப்பு அட்டை தொலைந்து விட்டால் ரூபாய் 200/- செலுத்தி புதிய சேமிப்பு அட்டை பெற்றுக்கொள்ளலாம்.',
      'சேமிப்பு திட்டத்தை மற்றொரு சேமிப்பு திட்டத்தோடு இணைக்க இயலாது.',
      'சேமிப்பு தொகை குறைந்தபட்ச இருப்பு 90 நாட்கள் இருக்கவேண்டும்.',
      'அனைத்து திட்டங்களிலும் வெள்ளி பொருட்களாக மட்டும் பெற்றுக்கொள்ள முடியும், பணமாக பெற இயலாது.',
      'வாடிக்கையாளர் 11 மாதம் முடிந்த பின்புதான் நகைகள் வாங்கவேண்டும்.',
      'இந்த கொள்முதல் திட்டதின் கீழ் நகைகளை வாங்கும் போது நடைமுறையில் உள்ள சலுகைகள் மற்றும் தள்ளுபடி எதுவும் பொருந்தாது.',
      'வாடிக்கையாளர் திட்டத்தை காலவரைக்குள் முடிக்கவும்.',
      'இத்திட்டத்தில் வெள்ளி நாணயங்கள் வழங்கப்படமாட்டாது.',
      'இடையில் கட்டத் தவறினால் 11 மாத கால முடிவில் எந்தவித போனஸ் இன்றி கட்டிய தொகைக்கு மட்டும் வெள்ளிப்பொருட்கள் பெற்றுக்கொள்ளலாம்.',
      'ஒவ்வொரு மாதமும் தவறாமல் பணம் செலுத்தினால் மட்டுமே வாடிக்கையாளர்கள் போனஸ் பெற முடியும்.',
      'பதிவு செய்யப்பட்ட நாளிலிருந்து 345 நாட்களுக்குள் வாங்கவில்லை என்றால், வாடிக்கையாளர் சேமிப்பு தொகை அவரவர் வங்கிக் கணக்கில் திரும்பப் பெறப்படும்.',
      'வெள்ளி விலை ஏற்ற இறக்கத்திற்கு நிறுவனம் பொறுப்பேற்காது.',
      'இத்திட்டங்கள் அனைத்தும் எங்கள் நிறுவன விதிமுறைகளுக்கு உட்பட்டது.',
      'இவை அனைத்தும் வெள்ளி பொருட்களுக்கு மட்டுமே பொருந்தும். அனைத்து விவகாரங்களும் மதுரை நீதிமன்றத்தின் கீழ் தீர்க்கப்படும்.',
    ],
    joinNow: 'இப்போது சேரவும்',
    close: 'மூடு',
  },
  english: {
    amountSilver: [
      'Savings plan period is 11 months.',
      'You can start saving from ₹1000.',
      'At the end of the 11th month, one months amount will be added as a bonus and silver articles will be provided.',
      'The first months amount must be paid every month.',
      'GST and other taxes apply.',
    ],
    digiSilver: [
      'Savings plan period is 11 months.',
      'You can start saving from ₹100.',
      'You can deposit any amount each month as you wish.',
      'At maturity, a 15% bonus will be added and given as silver articles.',
      'GST and other taxes apply.',
    ],
    lumpSum: [
      'Savings plan period is 11 months.',
      'This is a one-time payment plan.',
      'Minimum deposit is ₹5000.',
      'Your payment will be credited as cash value.',
      'After 330 days, a 16% bonus will be added and given as silver articles.',
      'GST and other taxes apply.',
    ],
    termsTitle: 'Terms and Conditions',
    terms: [
      'Every monthly payment you make is credited in advance towards silver purchases.',
      'You can join the Lumpsum Silver plan by exchanging old silver items.',
      'Old silver items can be exchanged under this plan subject to company conditions.',
      'ID proof and bank passbook copy are required when joining and withdrawing.',
      'If you wish to change your name, address or phone number, inform in advance with documents.',
      'If your savings card is lost, pay ₹200 to get a new one.',
      'A savings plan cannot be merged with another.',
      'Minimum savings balance should be maintained for 90 days.',
      'Redemption is only in silver articles – no cash will be given.',
      'Customers can purchase jewellery only after completing 11 months.',
      'Discounts or offers do not apply to purchases under this plan.',
      'Customers must complete the plan within the given duration.',
      'Silver coins are not provided under this plan.',
      'If a payment is missed, at maturity only the deposited amount (no bonus) will be given in silver.',
      'Bonus will be given only if all payments are made on time.',
      'If not redeemed within 345 days from registration, amount will be refunded to the bank account.',
      'The company is not responsible for silver price fluctuations.',
      'All plans are subject to company rules.',
      'All plans apply only to silver articles. Disputes will be handled in Madurai Court only.',
    ],
    joinNow: 'Join Now',
    close: 'Close',
  },
};

// Reusable component for scheme sections
const SchemeSection = React.memo(({ title, items, iconName = 'circle-small', iconSize = 20 }) => (
  <View style={styles.schemeSection}>
    <Text style={styles.schemeTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={`${title}-${index}`} style={styles.featureItem}>
        <Icon
          name={iconName}
          size={moderateScale(iconSize)}
          color={DIGIGOLD_COLORS.primary}
          style={styles.featureIcon}
        />
        <Text style={styles.featureText}>{item}</Text>
      </View>
    ))}
  </View>
));

function KnowMore() {
  const route = useRoute();
  const navigation = useNavigation();
  const { schemeId } = route.params || {};

  const [language, setLanguage] = useState('english');

  // Memoize content to prevent unnecessary recalculations
  const content = useMemo(
    () => SCHEME_CONTENT[language],
    [language]
  );

  const isEnglish = language === 'english';

  // Optimized toggle function with useCallback
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'english' ? 'tamil' : 'english';
      // Announce language change for accessibility
      AccessibilityInfo.announceForAccessibility(
        `Language changed to ${newLang === 'english' ? 'English' : 'Tamil'}`
      );
      return newLang;
    });
  }, []);

  // Optimized navigation handlers
  const handleJoinNow = useCallback(() => {
    navigation.navigate('AddNewMember', { schemeId });
  }, [navigation, schemeId]);

  const handleClose = useCallback(() => {
    navigation.navigate('MainLanding');
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <CommonHeader title="Know More" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Scheme details scroll view"
      >
        <View style={styles.container}>
          {/* Language Switch Button */}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isEnglish ? 'Tamil' : 'English'}`}
            accessibilityHint="Toggles between English and Tamil language"
            activeOpacity={0.7}
          >
            <Icon
              name="translate"
              size={moderateScale(16)}
              color={COLORS.white}
              style={styles.languageIcon}
            />
            <Text style={styles.languageButtonText}>
              {isEnglish ? 'தமிழ்' : 'English'}
            </Text>
          </TouchableOpacity>

          {/* BMG AMOUNT SILVER */}
          <SchemeSection
            title="BMG AMOUNT SILVER"
            items={content.amountSilver}
          />

          {/* BMG DIGI SILVER */}
          <SchemeSection
            title="BMG DIGI SILVER"
            items={content.digiSilver}
          />

          {/* BMG LUMPSUM SILVER */}
          <SchemeSection
            title="BMG LUMPSUM SILVER"
            items={content.lumpSum}
          />

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>{content.termsTitle}</Text>
            {content.terms.map((item, index) => (
              <View key={`term-${index}`} style={styles.featureItem}>
                <Icon
                  name="asterisk"
                  size={moderateScale(12)}
                  color={DIGIGOLD_COLORS.primary}
                  style={styles.asteriskIcon}
                />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleJoinNow}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={content.joinNow}
              accessibilityHint="Navigate to add new member screen"
              activeOpacity={0.8}
            >
              <Icon
                name="account-plus"
                size={moderateScale(18)}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>{content.joinNow}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={content.close}
              accessibilityHint="Return to main landing screen"
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>{content.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.63)',
    minHeight: '100%',
  },
  languageButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DIGIGOLD_COLORS.primary,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    borderRadius: SIZES.radius_sm,
    marginBottom: moderateScale(15),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageIcon: {
    marginRight: moderateScale(6),
  },
  languageButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    ...FONTS.body1,
    fontWeight: '600',
  },
  schemeSection: {
    marginBottom: moderateScale(20),
  },
  schemeTitle: {
    ...FONTS.heading,
    fontSize: SIZES.font + 1,
    fontWeight: '700',
    color: DIGIGOLD_COLORS.primary,
    marginVertical: moderateScale(12),
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },
  termsSection: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  sectionTitle: {
    ...FONTS.heading,
    fontSize: SIZES.font + 1,
    fontWeight: '700',
    color: DIGIGOLD_COLORS.primary,
    marginVertical: moderateScale(15),
    textDecorationLine: 'underline',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(10),
    paddingLeft: moderateScale(4),
  },
  featureIcon: {
    marginTop: moderateScale(-2),
  },
  asteriskIcon: {
    marginTop: moderateScale(4),
  },
  featureText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.textPrimary,
    flex: 1,
    lineHeight: moderateScale(20),
    textAlign: 'justify',
    paddingLeft: moderateScale(4),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(25),
    marginBottom: moderateScale(20),
    gap: moderateScale(15),
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DIGIGOLD_COLORS.primary,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(30),
    borderRadius: SIZES.radius_sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: moderateScale(140),
  },
  buttonIcon: {
    marginRight: moderateScale(8),
  },
  closeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(30),
    borderRadius: SIZES.radius_sm,
    borderWidth: 1.5,
    borderColor: DIGIGOLD_COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: moderateScale(140),
  },
  buttonText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  closeButtonText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    fontWeight: '600',
    color: DIGIGOLD_COLORS.primary,
    textAlign: 'center',
  },
});

export default KnowMore;