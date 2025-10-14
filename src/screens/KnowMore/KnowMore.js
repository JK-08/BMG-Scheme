import React from 'react';
import { View, ScrollView, StyleSheet, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { scale, moderateScale, COLORS, FONTS, SIZES, DIGIGOLD_COLORS } from '../../utils/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonHeader from '../../components/CommonHeader/CommonHeader';

function KnowMore() {
  const route = useRoute();
  const navigation = useNavigation();
  const { schemeId } = route.params || {};

  const DottedCircle = ({ iconName }) => (
    <View style={styles.dottedCircleContainer}>
      <View style={styles.dottedCircle}>
        <Icon name={iconName} size={moderateScale(30)} color={DIGIGOLD_COLORS.primary} />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/bg4.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <CommonHeader title={'KnowMore'}></CommonHeader>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={styles.description}>
          Choose from our variety of silver savings schemes that offer flexible payment options and attractive bonuses. Our silver schemes are designed to help you save systematically and redeem beautiful silver jewellery at BMG Jewellers.
        </Text> */}

        {/* BMG AMOUNT SILVER */}
        <Text style={styles.schemeTitle}>BMG AMOUNT SILVER</Text>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு திட்ட காலங்கள் 11 மாதங்கள்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ரூபாய் 1000 முதல் பணம் செலுத்தலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>11-வது மாத இறுதியில் ஒரு மாத தொகை போனஷாக கணக்கிடப்பட்டு வெள்ளி பொருட்கள் வழங்கப்படும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>முதல் மாதம் செலுத்தும் தொகை மாதம்தோறும் செலுத்த வேண்டும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டத்திற்கு GST இதர வரி உண்டு.</Text>
        </View>

        {/* BMG DIGI SILVER */}
        <Text style={styles.schemeTitle}>BMG DIGI SILVER</Text>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு திட்ட காலங்கள் 11 மாதங்கள்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ரூபாய் 100 முதல் பணம் செலுத்தலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>மாதந்தோறும் எவ்வளவு தொகை வேண்டுமானாலும் செலுத்திக் கொள்ளலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>முதிர்வு நாளில் தாங்கள் செலுத்திய ஒவ்வொரு மாத தொகைக்கும் முடிவில் 15% போனஸ் பணமாக வர வைக்கப்பட்டு வெள்ளி பொருளாக வழங்கப்படும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டத்திற்கு GST இதர வரி உண்டு.</Text>
        </View>

        {/* BMG LUMPSUM SILVER */}
        <Text style={styles.schemeTitle}>BMG LUMPSUM SILVER</Text>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு திட்டங்கள் 11 மாதங்கள்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ஒரே ஒரு முறை மட்டும் பணம் செலுத்தும் திட்டம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ஆரம்ப தொகை ரூ.5000 மேல் பணம் செலுத்த வேண்டும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>நீங்கள் செலுத்திய பணம் பணமாக வரவு வைக்கப்படும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>முதிர்வு 330 நாளில் தாங்கள் செலுத்திய பணத்திற்கு 16% போனஸ் பணமாக வரவு வைக்கப்பட்டு, வெள்ளிப் பொருட்களாக வழங்கப்படும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="circle-small" size={moderateScale(20)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டத்திற்கு GST இதர வரி உண்டு.</Text>
        </View>

        {/* Terms and Conditions */}
        <Text style={styles.sectionTitle}>விதிமுறைகள் மற்றும் நிபந்தனைகள்</Text>
        
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ஒவ்வொரு மாதமும் நீங்கள் செலுத்தும் தொகை அட்வான்ஸ் முறையில் வெள்ளி பொருட்கள் வாங்குவதற்காக உங்கள் கணக்கில் வர வைக்கப்படுகிறது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>LUMPSUM சேமிப்பு திட்டதிற்கு பழைய வெள்ளி பொருட்கள் கொடுத்து இத்திட்டதில் இணையலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>பழைய வெள்ளிப்பொருட்களை இந்தத்திட்டத்தின் கீழ் எக்ஸ்சேஞ்ச் செய்து கொள்ளலாம். இது நிறுவனம் விதித்த நிபந்தனைகளுக்கு உட்பட்டது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டதில் இணையும்போது மற்றும் இத்திட்டம் நிறைவுடையும் போது பணத்தைத் திரும்பப்பெறும் போதும் அடையாள அட்டை மற்றும் வங்கிக்கணக்குப் புத்தகத்திற்கான சான்றினை சமர்ப்பிக்கவும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>வாடிக்கையாளர் பெயர், முகவரி, கைபேசி எண் மாற்றம் செய்யவேண்டும் என்றால் முன்பே தகவல் தெரிவித்து அதற்குரிய ஆவணங்களை கொடுக்கவும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு அட்டை தொலைந்து விட்டால் ரூபாய் 200/- செலுத்தி புதிய சேமிப்பு அட்டை பெற்றுக்கொள்ளலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு திட்டத்தை மற்றொரு சேமிப்பு திட்டத்தோடு இணைக்க இயலாது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>சேமிப்பு தொகை குறைந்தபட்ச இருப்பு 90 நாட்கள் இருக்கவேண்டும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>அனைத்து திட்டங்களிலும் வெள்ளி பொருட்களாக மட்டும் பெற்றுக்கொள்ள முடியும், பணமாக பெற இயலாது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>வாடிக்காயளர்கள் 11 மாதம் முடிந்த பின்புதான் நகைகள் வாங்கவேண்டும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இந்த கொள்முதல் திட்டதின் கீழ் நகைகளை வாங்கும் போது நடைமுறையில் உள்ள சலுகைகள் மற்றும் தள்ளுபடி எதுவும் பொருந்ததாது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>வாடிக்கையாளர் திட்டத்தை கால வரைக்குள் முடிக்கவும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டதில் வெள்ளி நாணயங்கள் வழங்கப்படமாட்டது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இடையில் கட்டத்தவறினால் 11 மாத கால முடிவில் எந்தவித போனஸ் இன்றி கட்டிய தொகைக்கு மட்டும் வெள்ளிப்பொருட்கள் பெற்றுக்கொள்ளலாம்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>ஒவ்வொரு மாதமும் தவறாமல் பணம் செலுத்தினால் மட்டுமே வாடிக்கையாளர்கள் போனஸ் பெறமுடியும் தவறினால் போனஸ் தொகை பெறமுடியாது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>பதிவு செய்யப்பட்ட நாளிலிருந்து 345 நாட்களுக்குள் வாங்கவில்லை என்றால், வாடிக்கையாளர் சேமிப்பு தொகை அவரவர் வங்கிக் கணக்கில் திரும்பப் பெறப்படும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>வெள்ளி விலை ஏற்ற இறக்கத்திற்கு நிறுவனம் பொறுப்பேற்காது.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இத்திட்டங்கள் அனைத்தும் எங்கள் நிறுவனத்தின் விதிமுறைகளுக்கு உட்பட்டதாகும்.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="asterisk" size={moderateScale(12)} color={DIGIGOLD_COLORS.primary} />
          <Text style={styles.featureText}>இவை அனைத்தும் வெள்ளி பொருட்களுக்கு மட்டுமே பொருந்தும். மேற்படி திட்டத்தில் ஏற்படும் கருத்து வேறுபாடுகளுக்கு நாடவேண்டுமானல் மதுரை கோர்ட் மூலம் மட்டுமே தீர்க்கப்படும்.</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddNewMember', { schemeId })}>
            <Text style={styles.buttonText}>Join Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('MainLanding')}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.63)',
  },
  backgroundImage: {
    flex: 1,
  },
  description: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.textPrimary,
    marginBottom: moderateScale(15),
    lineHeight: moderateScale(20),
    textAlign: 'justify',
  },
  schemeTitle: {
    ...FONTS.heading,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.primary,
    marginVertical: moderateScale(10),
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    ...FONTS.heading,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.primary,
    marginVertical: moderateScale(15),
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(8),
  },
  featureText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.textPrimary,
    flex: 1,
    lineHeight: moderateScale(18),
    textAlign: 'justify',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: moderateScale(20),
    gap: moderateScale(30),
  },
  button: {
    backgroundColor: DIGIGOLD_COLORS.primary,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(25),
    borderRadius: SIZES.radius_sm,
    elevation: 3,
  },
  closeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(25),
    borderRadius: SIZES.radius_sm,
    borderWidth: 1,
    borderColor: DIGIGOLD_COLORS.primary,
    elevation: 2,
  },
  buttonText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
  },
  closeButtonText: {
    ...FONTS.body1,
    fontSize: SIZES.font,
    color: DIGIGOLD_COLORS.primary,
    textAlign: 'center',
  },
});

export default KnowMore;