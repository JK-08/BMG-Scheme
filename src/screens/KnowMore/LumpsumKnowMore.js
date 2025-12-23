import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  AccessibilityInfo,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  moderateScale,
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
} from "../../utils/AppTheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { SafeAreaView } from "react-native-safe-area-context";

// ==========================================
// UPDATED SCHEME CONTENT (TAMIL + ENGLISH) - NEW DATA
// ==========================================
const SCHEME_CONTENT = {
  tamil: {
   

    lumpSum: [
      "வகை: ஒருமுறை மொத்த தொகை செலுத்தும் திட்டம்",
      "குறைந்தபட்ச தொகை: ₹10,000",
      "காலவரை: 330 நாட்கள்",
      "திட்டப்பயன் தொகை: திட்டம் நிறைவு பெறும் நாளில், முன்பணத் தொகையில் அதிகபட்சம் 15% வரை நன்மை",
      "திட்டப்பயன் தொகை பயன்படுத்தும் காலம்: 331வது நாள் முதல் 345வது நாள் வரை நகை வாங்கலுக்கு மட்டும்",
      "நிலையான கொடுப்பனவு பதிவு: குறைந்தபட்சம் 165 நாட்கள் தொகை வைத்திருத்தல்",
    ],

   
    termsTitle: "பொது விதிமுறைகள்",
    terms: [
      "இத் திட்டத்தில் சேரும் நபர் இந்திய குடிமகனாகவும் குறைந்தது 18 வயது நிறைவடைந்தவறாகவும் இருத்தல்  வேண்டும். திட்டத்தில் இணைய தேவையான அடையாள ஆவணத்தை சமர்ப்பிக்க வேண்டும்.",
      "வாடிக்கையாளர் செலுத்தும் அனைத்து தொகையும் கொள்முதல் செய்யப்போகும் நகைகள் / பொருள்களுக்கு  ரூபாய் மதிப்பில் முன்பணமாக (Advance Payment) மட்டுமே வரவு வைக்கப்படும். இத்திட்டத்தில் கொள்முதல் செய்யப்போகும் நகைகள்/பொருள்களின் எடையில் வரவு வைக்க முடியாது. அனைத்து திட்டங்களும், நகைகள் வாங்கும் நோக்கத்திற்காக மட்டுமே பயன்படுத்தப்பட முடியும் . இத்திட்டத்தின் கீழ் செலுத்தப்பட்ட தொகைகள் பணமாக திருப்பிச் பெற முடியாது அல்லது பணமாக மாற்றிக் கொள்ள முடியாது.",
      "இத்திட்டத்தின் காலம் முடிந்ததும், அதற்கான நன்மைகளை பெற வாடிக்கையாளர் தாங்கள் செலுத்திய தொகைக்கான ரசீதுகள் அல்லது சான்றுகளை வைத்திருத்தல் வேண்டும்.",
      "இத்திட்டத்தின் பயன்தொகையாக , வாடிக்கையாளர் செலுத்திய மொத்த தொகையும் மற்றும்  தகுதியான திட்ட நன்மைகளும் சேர்த்தே கணக்கிடப்படும். இத்திட்டத்தில் சேர்ந்த தினத்திலிருந்து  331வது நாள் முதல் 345வது நாள் வரை நகைகளாகவோ / பொருள்களாகவோ  கொள்முதல் செய்து முடிக்கப்பட வேண்டும்.345 நாட்களுக்குள் நகையாக கொள்முதல் செய்யாவிட்டால் , திட்டமும் அதனுடன் தொடர்புடைய நன்மைகளும் தானாகவே ரத்து செய்யப்படும்.",
      "திட்டத்தின் கீழ் நகைகள் வாங்கும் போது, ஜி.எஸ்.டி (GST), செய்கூலி கட்டணம் (Making Charges), ஹால்மார்க் கட்டணம் (Hallmarking Charges), கல் கட்டணம் (Stone Charges) மற்றும் பிற பொருத்தமான கட்டணங்கள் தனியாக வசூலிக்கப்படும்.",
      "திட்டத்தின் பயன்தொகையை  BMG ஜுவல்லர்ஸ் நிறுவனத்தில் இருந்து கோல்ட் பாலிஷ் வெள்ளி நகைகள் மற்றும் வெள்ளி பொருட்கள் வாங்குவதற்காக மட்டுமே பயன்படுத்த முடியும். வாங்கும் நாளில் நிலவும் விலையில் நகைகள் / பொருள்கள் விற்பனை செய்யப்படும்.",
      "அனைத்து பணப் பரிவர்த்தனைகளுக்கும்  (cash, UPI, கார்டு அல்லது வங்கி பரிமாற்றம்) நேரடியாக BMG ஜுவல்லர்ஸ் நிறுவனத்திற்கு  செய்யப்பட வேண்டும். ஒவ்வொரு பணம் செலுத்துதலுக்கும் செல்லுபடியாகும் ரசீது பெற்றுக்கொள்ளவேண்டும் .வாடிக்கையாளர்கள் பணத்தை நேரத்திற்குள் செலுத்துவது அவர்களின் பொறுப்பாகும். 330 நாட்கள் கடந்த பின் பணம் செலுத்த முடியாது.",
      "திட்டத்தில் ஏதேனும் தவறுதல் (Default) நிகழ்ந்தால், வழங்கப்பட்ட பரிசுகளின் மதிப்பு வாடிக்கையாளர் செலுத்திய தொகையிலிருந்து கழிக்கப்படும்; மேலும் அனைத்து திட்ட நன்மைகள் அல்லது போனஸ்கள் ரத்து செய்யப்பட்டதாக கருதப்படும். திட்டத்திற்கான விதிமுறைகளின் படி வாடிக்கையாளரின் நிலையான தொகை செலுத்துதலின் அடிப்படையில் வழங்கப்படும் விகிதாசார போனஸ், நிறுவனத்தின் முழுமையான விருப்பதிகாரத்தின் (sole discretion) படி மட்டும் வழங்கப்படும். 'தவறு' (Default) என்பது திட்டத்தை பாதியிலேயே நிறுத்துதல் அல்லது குறிப்பிடப்பட்ட காலத்திற்குள் திட்ட விதிமுறைகளின்படி பணம் செலுத்தத் தவறுதல் ஆகியவற்றைக் குறிக்கிறது.",
      "ரொக்கப் பணம் (Cash) செலுத்துதலுக்கு, வாடிக்கையாளர் நேரடியாகக் கிளை கவுண்டரில் பணம் செலுத்தி, செல்லுபடியாகும் ரசீதைப் பெற வேண்டும்.",
      "திட்ட அட்டை (Scheme Card) அல்லது பாஸ்புக் தொலைந்துபோகும் பட்சத்தில், அதற்கான நிர்ணயிக்கப்பட்ட கட்டணத்தைச் (applicable charges) செலுத்திய பிறகு மட்டுமே மாற்று அட்டை அல்லது பாஸ்புக் வழங்கப்படும்.ஒரு திட்டத்திலிருந்து மற்றொரு திட்டத்திற்கு மாற்றுவதற்கு (transfers) அனுமதிக்கப்பட மாட்டாது.",
      "நிறுவனம் எந்தவொரு முன்னறிவிப்பும் இன்றி, எந்தத் திட்டத்தையும் திருத்துவதற்கோ, நிறுத்தி வைப்பதற்கோ, அல்லது விலக்கிக் கொள்வதற்கோ உரிமை கொண்டுள்ளது. ஏதேனும் சர்ச்சைகள் (disputes) ஏற்பட்டால், அவை மதுரை நீதிமன்றங்களின் அதிகார வரம்பிற்கு உட்பட்டதாகும்.",
      "திட்டத்தின் பயன்தொகையானது கண்டிப்பாக நகைகள் / பொருட்கள் வாங்குவதற்கு மட்டுமே பயன்படுத்தப்படும்; ரொக்கப் பணம் திரும்ப வழங்கப்பட மாட்டாது (no cash refunds).",
    ],

    joinNow: "இப்போது சேரவும்",
    close: "மூடு",
  },

  english: {
   

    lumpSum: [
      "Type: One-time Payment plan",
      "Minimum Amount: ₹10,000",
      "Tenure: 330 days",
      "Benefits: upto 15% on the Advance amount at Scheme Completion",
      "Benefit Utilisation Period: Jewellery purchase only between the 331st and 345th day",
      "Sustained Payment Record: Min. Holding of 165 days",
    ],

  

    termsTitle: "General Conditions",
    terms: [
      "This scheme is open to individuals who are Citizen of India & aged 18 years and above with valid identification proof.",
      "All amounts paid by the customer are treated as advance payments for purchase in near future, in value (₹) and not in metal weight. All schemes are applicable only for jewellery purchases. Amounts paid under this scheme cannot be withdrawn in cash or converted to cash.",
      "Customer must retain valid proof of payments to claim scheme benefits after scheme tenure completion.",
      "Scheme Eligible Amount = Total amount paid + eligible scheme benefits. Must be claimed between the 331st and 345th day from date of joining. If not claimed within 345 days, scheme and related benefits automatically lapse.",
      "GST, Making charges, Hallmarking Charges, Stone charges, any other charges, etc., are applicable extra at the time of Jewel purchase under the scheme/s.",
      "Scheme Eligible Amount can be used only to buy Gold-Polish Silver Jewellery and Silver Articles from BMG Jewellers, at the prevailing prices on the date of purchase.",
      "All payments must be made directly to BMG Jewellers through authorised modes (cash, UPI, card, or bank transfer) with valid receipts issued. Customers are responsible for timely payments, and payment cannot be made after 330 days.",
      "In the event of any default, the value of any gift issued under the scheme will be deducted from the customer's payments, and all scheme benefits or bonuses shall stand forfeited. The proportionate bonus is subject to customer's Sustained Payment Records and will be granted solely at the discretion of the company. 'Default' refers to discontinuing the scheme or failing to make payments as per plan terms within specified period.",
      "For Cash payments, customer must pay directly at the branch counter & obtain valid receipt.",
      "In case the scheme card or passbook is lost, a replacement will be issued upon payment of applicable charges. Scheme transfers or conversions from one plan to another are not permitted.",
      "The company reserves the right to revise, suspend, or withdraw any scheme without prior notice. All disputes shall be subject to exclusive jurisdiction of the courts located in Madurai, Tamilnadu, India.",
      "Scheme Eligible Amount is strictly for jewellery purchase; no cash refunds will be issued.",
    ],

    joinNow: "Join Now",
    close: "Close",
  },
};

// ==========================================
// REUSABLE SECTION COMPONENT
// ==========================================
const SchemeSection = React.memo(
  ({ title, items, iconName = "circle-small", iconSize = 20 }) => (
    <View style={styles.schemeSection}>
      <Text style={styles.schemeTitle}>{title}</Text>

      {(items ?? []).map((item, index) => {
        // Check if item is a header (contains colon or is just a label)
        const isHeader = item.includes(":") || 
                         item.includes("%") || 
                         item === "Benefit Structure:" ||
                         item === "திட்டப்பயன் தொகை அமைப்பு:";
        
        return (
          <View key={`${title}-${index}`} style={styles.featureItem}>
            {isHeader ? (
              <>
                <Icon
                  name="chevron-right"
                  size={moderateScale(iconSize)}
                  color={COLORS.primary}
                  style={styles.featureIcon}
                />
                <Text style={[styles.featureText, styles.headerText]}>{item}</Text>
              </>
            ) : (
              <>
                <Icon
                  name={iconName}
                  size={moderateScale(iconSize)}
                  color={COLORS.primary}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{item}</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  )
);

function LumpsumKnowMore() {
  const route = useRoute();
  const navigation = useNavigation();
  const { schemeId } = route.params || {};
  const [language, setLanguage] = useState("english");

  const content = useMemo(() => SCHEME_CONTENT[language], [language]);
  const isEnglish = language === "english";

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "english" ? "tamil" : "english";
      AccessibilityInfo.announceForAccessibility(
        next === "english"
          ? "Language changed to English"
          : "மொழி தமிழ் மாற்றப்பட்டது"
      );
      return next;
    });
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CommonHeader title="Know More" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Language switch */}
            <TouchableOpacity
              style={styles.languageButton}
              onPress={toggleLanguage}
              activeOpacity={0.8}
            >
              <Icon name="translate" size={SIZES.icon.sm} color={COLORS.white} />
              <Text style={styles.languageButtonText}>
                {isEnglish ? "தமிழ்" : "English"}
              </Text>
            </TouchableOpacity>

            {/* Scheme Sections */}
          
            <SchemeSection title="BMG LUMPSUM" items={content.lumpSum} />
           

            {/* Terms */}
            <View style={styles.termsSection}>
              <Text style={styles.sectionTitle}>{content.termsTitle}</Text>

              {content.terms.map((item, index) => (
                <View key={`term-${index}`} style={styles.featureItem}>
                  <Icon
                    name="numeric"
                    size={SIZES.icon.xs}
                    color={COLORS.primary}
                    style={{ marginTop: 4, marginRight: 8 }}
                  />
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("AddNewMember", { schemeId })
                }
              >
                <Icon
                  name="account-plus"
                  size={SIZES.icon.sm}
                  color={COLORS.white}
                />
                <Text style={styles.buttonText}>{content.joinNow}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.navigate("MainLanding")}
              >
                <Text style={styles.closeButtonText}>{content.close}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// =============== FIXED STYLES ===============
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: SIZES.padding.xl,
  },

  container: {
    flexGrow: 1,
    padding: SIZES.padding.lg,
    width: "100%",
    minHeight: 0, // prevents clipping in android
    backgroundColor: COLORS.whiteOpacity50,
  },

  languageButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.lg,
    ...SHADOWS.sm,
  },

  languageButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: SIZES.font.sm,
    marginLeft: 6,
  },

  schemeSection: {
    width: "100%",
    marginBottom: SIZES.margin.xl,
    backgroundColor: COLORS.white,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.sm,
  },

  schemeTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.margin.md,
    textAlign: "center",
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SIZES.margin.sm,
    width: "100%",
  },

  featureIcon: {
    marginTop: 4,
    marginRight: 8,
  },

  featureText: {
    flex: 1,
    minWidth: 0,        // ensures wrapping on all phones
    flexShrink: 1,
    flexWrap: "wrap",
    ...FONTS.body,
    color: "#000000",    // Changed to BLACK color
    lineHeight: SIZES.font.md * 1.6,
    textAlign: "left",
  },

  headerText: {
    ...FONTS.bodyBold,
    color: "#000000",    // Changed to BLACK color
  },

  termsSection: {
    width: "100%",
    marginTop: SIZES.margin.md,
    backgroundColor: COLORS.white,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.sm,
  },

  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.margin.lg,
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: SIZES.margin.xl,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    flexWrap: "wrap",
    gap: SIZES.margin.lg,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xxl,
    borderRadius: SIZES.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.md,
    minWidth: moderateScale(140),
    justifyContent: "center",
  },

  buttonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontSize: SIZES.font.md,
    marginLeft: 6,
  },

  closeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xxl,
    borderRadius: SIZES.radius.lg,
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOWS.sm,
    minWidth: moderateScale(140),
    justifyContent: "center",
  },

  closeButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    textAlign: "center",
    fontSize: SIZES.font.md,
  },
});

export default LumpsumKnowMore;