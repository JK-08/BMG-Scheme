import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { TextDefault } from '../../components';
import appTheme from '../../utils/Theme';
import CommonHeader from '../../components/CommonHeader/CommonHeader';

const { COLORS, SIZES, FONTS } = appTheme;

const TermsConditionsPage = () => {
  const [language, setLanguage] = useState('english'); // 'english' or 'tamil'

  const termsDataEnglish = [
    {
      title: "1. Product Representation",
      content: [
        "Images are for reference only. Minor variations in color or finish may occur.",
        "All products are handcrafted, so slight irregularities are natural.",
        "For exact details, contact us before ordering."
      ]
    },
    {
      title: "2. Pricing",
      subtitle: "Currency & Taxes",
      content: [
        "All prices are in INR and inclusive of GST"
      ],
      subsections: [
        {
          title: "Price Changes",
          content: [
            "Prices may change without prior notice",
            "Final amount charged will be as displayed at checkout."
          ]
        }
      ]
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
        "₹50 COD fee may apply"
      ]
    },
    {
      title: "4. Product Use & Care",
      content: [
        "Handle gold-polished jewellery with care. Avoid water & chemicals.",
        "Store in a dry pouch when not in use.",
        "No guarantee for polish durability; depends on usage.",
        "Ask us for maintenance tips to extend product life."
      ]
    },
    {
      title: "5. Limitation of Liability",
      content: [
        "We are not liable for:",
        "Shipping delays or damage",
        "Force majeure events",
        "Improper use or care"
      ]
    },
    {
      title: "6. Intellectual Property",
      content: [
        "All content is © and the property of our brand. No part may be:",
        "Copied or redistributed without permission",
        "Used commercially",
        "Altered or modified"
      ]
    },
    {
      title: "7. Governing Law",
      content: [
        "These terms are governed by Indian law.",
        "Disputes will be settled in Madurai, Tamil Nadu.",
        "Contact us before placing orders if you have any questions."
      ]
    }
  ];

  const termsDataTamil = [
    {
      title: "1. தயாரிப்பு விளக்கம்",
      content: [
        "படங்கள் குறிப்புக்கு மட்டுமே. நிறம் அல்லது பூச்சில் சிறிய வேறுபாடுகள் ஏற்படலாம்.",
        "அனைத்து தயாரிப்புகளும் கைவினைப் பொருட்கள், எனவே சிறிய ஒழுங்கின்மைகள் இயல்பானவை.",
        "துல்லியமான விவரங்களுக்கு, ஆர்டர் செய்வதற்கு முன் எங்களை தொடர்பு கொள்ளவும்."
      ]
    },
    {
      title: "2. விலை நிர்ணயம்",
      subtitle: "நாணயம் & வரிகள்",
      content: [
        "அனைத்து விலைகளும் INR இல் மற்றும் GST உள்ளடக்கியது"
      ],
      subsections: [
        {
          title: "விலை மாற்றங்கள்",
          content: [
            "முன் அறிவிப்பு இல்லாமல் விலைகள் மாறலாம்",
            "இறுதி தொகை செக்அவுட்டில் காட்டப்பட்டபடி வசூலிக்கப்படும்."
          ]
        }
      ]
    },
    {
      title: "3. பணம் செலுத்துதல்",
      content: [
        "நாங்கள் பின்வரும் கட்டண முறைகளை ஏற்கிறோம்:",
        "ஆன்லைன் பேமெண்ட்ஸ்",
        "UPI",
        "டெபிட்/கிரெடிட் கார்டுகள்",
        "நெட் பேங்கிங்",
        "கேஷ் ஆன் டெலிவரி (தேர்ந்தெடுக்கப்பட்ட பின் குறியீடுகள் மட்டும்)",
        "₹50 COD கட்டணம் பொருந்தும்"
      ]
    },
    {
      title: "4. தயாரிப்பு பயன்பாடு & பராமரிப்பு",
      content: [
        "தங்க பூச்சு நகைகளை கவனமாக கையாளவும். நீர் & இரசாயனங்களை தவிர்க்கவும்.",
        "பயன்படுத்தாத போது உலர்ந்த பையில் சேமிக்கவும்.",
        "பூச்சு நீடித்திருக்கும் என்பதற்கு உத்தரவாதம் இல்லை; பயன்பாட்டைப் பொறுத்தது.",
        "தயாரிப்பு ஆயுளை நீட்டிக்க பராமரிப்பு குறிப்புகளுக்கு எங்களிடம் கேளுங்கள்."
      ]
    },
    {
      title: "5. பொறுப்பு வரம்பு",
      content: [
        "நாங்கள் பொறுப்பல்ல:",
        "கப்பல் தாமதங்கள் அல்லது சேதம்",
        "கட்டாய நிகழ்வுகள்",
        "தவறான பயன்பாடு அல்லது பராமரிப்பு"
      ]
    },
    {
      title: "6. அறிவுசார் சொத்து",
      content: [
        "அனைத்து உள்ளடக்கமும் © மற்றும் எங்கள் பிராண்டின் சொத்து. எந்தப் பகுதியையும்:",
        "அனுமதியின்றி நகலெடுக்கவோ அல்லது மறுவிநியோகம் செய்யவோ கூடாது",
        "வணிக ரீதியாக பயன்படுத்த கூடாது",
        "மாற்றவோ அல்லது திருத்தவோ கூடாது"
      ]
    },
    {
      title: "7. ஆளும் சட்டம்",
      content: [
        "இந்த விதிமுறைகள் இந்திய சட்டத்தால் நிர்வகிக்கப்படுகின்றன.",
        "தகராறுகள் மதுரை, தமிழ்நாட்டில் தீர்க்கப்படும்.",
        "ஏதேனும் கேள்விகள் இருந்தால் ஆர்டர் செய்வதற்கு முன் எங்களை தொடர்பு கொள்ளவும்."
      ]
    }
  ];

  const termsData = language === 'english' ? termsDataEnglish : termsDataTamil;

  const renderContent = (content) => {
    const isHeaderLine = content.includes(':') && !content.includes('INR');
    
    return (
      <View style={[
        styles.pointContainer,
        isHeaderLine && styles.headerLine
      ]}>
        {!isHeaderLine && (
          <View style={styles.bullet} />
        )}
        <TextDefault style={[
          styles.pointText,
          isHeaderLine && styles.headerText
        ]}>
          {content}
        </TextDefault>
      </View>
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'tamil' : 'english');
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/image.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CommonHeader title={language === 'english' ? "Terms & Conditions" : "விதிமுறைகள் & நிபந்தனைகள்"} />
          
          {/* Language Toggle Button */}
          {/* <TouchableOpacity 
            style={styles.languageButton}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <TextDefault style={styles.languageButtonText}>
              {language === 'english' ? 'தமிழில் படிக்க' : 'Read in English'}
            </TextDefault>
          </TouchableOpacity> */}

          <View style={styles.contentContainer}>
            {termsData.map((section, index) => (
              <View key={index} style={styles.section}>
                <TextDefault style={styles.sectionTitle}>{section.title}</TextDefault>
                
                {section.subtitle && (
                  <TextDefault style={styles.subtitle}>{section.subtitle}</TextDefault>
                )}
                
                {section.content.map((point, pointIndex) => (
                  <View key={pointIndex}>
                    {renderContent(point)}
                  </View>
                ))}
                
                {section.subsections && section.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <TextDefault style={styles.subsectionTitle}>{subsection.title}</TextDefault>
                    {subsection.content.map((point, pointIndex) => (
                      <View key={pointIndex}>
                        {renderContent(point)}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
            
            <View style={styles.footer}>
              <TextDefault style={styles.lastUpdated}>
                {language === 'english' ? 'Last Updated: 23 August 2025' : 'கடைசியாக புதுப்பிக்கப்பட்டது: 23 ஆகஸ்ட் 2025'}
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
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2.5,
  },
  languageButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.7,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.radius_lg,
    alignSelf: 'center',
    marginBottom: SIZES.margin,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  languageButtonText: {
    ...FONTS.font,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    backgroundColor: COLORS.card1,
    borderRadius: SIZES.radius_lg,
    padding: SIZES.padding,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  section: {
    marginBottom: SIZES.margin * 1.5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
    paddingLeft: SIZES.margin,
  },
  sectionTitle: {
    ...FONTS.heading,
    color: COLORS.primary,
    marginBottom: SIZES.margin / 2,
    // fontWeight: '700',
    fontSize: SIZES.h5,
  },
  subtitle: {
    ...FONTS.font,
    color: COLORS.secondary,
    marginBottom: SIZES.margin / 2,
    fontWeight: '600',
  },
  subsection: {
    marginLeft: SIZES.margin,
    marginTop: SIZES.margin / 2,
  },
  subsectionTitle: {
    ...FONTS.font,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
    fontWeight: '600',
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.margin / 2,
    paddingLeft: SIZES.margin / 2,
  },
  headerLine: {
    marginBottom: SIZES.margin / 3,
    marginTop: SIZES.margin / 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.margin,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    ...FONTS.font,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.5,
  },
  headerText: {
    fontWeight: '600',
    color: COLORS.secondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingTop: SIZES.padding,
    marginTop: SIZES.margin,
    alignItems: 'center',
  },
  lastUpdated: {
    ...FONTS.fontSm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});

export default TermsConditionsPage;