import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  scale,
  moderateScale,
  COLORS,
  FONTS,
  SIZES,
  DIGIGOLD_COLORS,
} from "../../utils/Theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

// ==========================================
// UPDATED SCHEME CONTENT (TAMIL + ENGLISH)
// ==========================================
const SCHEME_CONTENT = {
  tamil: {
    smartPay: [
      "இது ஒரு Flexible திட்டம் — 330 நாட்களுக்குள் எந்நேரமும், எவ்வளவு வேண்டுமானாலும் பணம் செலுத்தலாம்.",
      "ஒரு பரிவர்த்தனைக்கு குறைந்தபட்ச கட்டணம்: ரூ.100.",
      "திட்ட காலம்: 330 நாட்கள்.",
      "போனஸ் அமைப்பு:",
      "1 – 75 நாட்களில் செலுத்திய பணத்திற்கு 10% போனஸ்.",
      "76 – 150 நாட்களில் செலுத்திய பணத்திற்கு 7.5% போனஸ்.",
      "151 – 225 நாட்களில் செலுத்திய பணத்திற்கு 4% போனஸ்.",
      "226 – 300 நாட்களில் செலுத்திய பணத்திற்கு 1.75% போனஸ்.",
      "301 – 330 நாட்களில் செலுத்திய பணத்திற்கு 0% போனஸ்.",
      "கொள்முதல்: திட்டத்தில் சேர்ந்த 331வது நாள் முதல் 345வது நாள் வரை மட்டுமே நகை வாங்க முடியும்.",
    ],

    // Added Lumpsum (Tamil)
    lumpSum: [
      "ஒரே தடவையில் முதலீடு செய்யும் திட்டம்.",
      "குறைந்தபட்ச முதலீடு: ₹10,000.",
      "காலம்: 330 நாட்கள்.",
      "மெச்சுரிட்டியில் அதிகபட்சம் 16% வரை போனஸ் கிடைக்கும்.",
      "கொள்முதல்: 331 முதல் 345 நாட்களில் மட்டுமே நகை வாங்க முடியும்.",
    ],

    // Added Bright Plan (Tamil)
    bright: [
      "மாதாந்திர நிலையான கட்டணம் செலுத்தும் திட்டம்.",
      "குறைந்தபட்சம்: ₹1,000 (₹500 இன் மடங்காக).",
      "காலம்: 11 மாதங்கள் (சுமார் 330 நாட்கள்).",
      "மெச்சுரிட்டியில் 1 மாத தவணை மதிப்பிற்கு இணையான போனஸ் கிடைக்கும்.",
      "கொள்முதல்: 331 முதல் 345 நாட்களில் மட்டுமே நகை வாங்க முடியும்.",
    ],

    termsTitle: "பொது விதிமுறைகள்",
    terms: [
      "இத்திட்டத்தில் சேரும் நபர் இந்திய குடியுரிமை பெற்றவராகவும் 18 வயதிற்கு மேற்பட்டவராகவும் இருக்க வேண்டும்.",
      "செலுத்தும் அனைத்து தொகைகளும் நகை கொள்முதல் முன் பணமாக மட்டுமே கருதப்படும்.",
      "திட்ட பயன்தொகை: மொத்த செலுத்திய தொகை + போனஸ்.",
      "பயன்தொகை 331 முதல் 345 நாட்களில் மட்டுமே பயன்படுத்தலாம்.",
      "GST, செய்கூலி, ஹால்மார்க் கட்டணம் போன்றவை விதிக்கப்படும்.",
      "பயன்தொகை BMG நகைகளுக்கே பயன்படுத்தப்படும்.",
      "330 நாட்கள் கழித்து பணம் செலுத்த அனுமதி இல்லை.",
      "Default ஆனால் போனஸ் நன்மைகள் ரத்து செய்யப்படும்.",
      "ரசீது பெறுதல் கட்டாயம்.",
      "அட்டை/பாஸ்புக் தொலைந்தால் கட்டணம் விதிக்கப்படும்.",
      "திட்ட மாற்றம் அனுமதி இல்லை.",
      "நிறுவனத்திற்கு திட்டத்தை திருத்த / ரத்து செய்ய உரிமை உண்டு.",
      "எல்லா சர்ச்சைகளும் மதுரை நீதிமன்ற அதிகாரத்திற்குட்பட்டவை.",
      "பயன்தொகை ரொக்கமாக வழங்கப்படாது.",
    ],

    joinNow: "இப்போது சேரவும்",
    close: "மூடு",
  },

  english: {
    smartPay: [
      "Flexible scheme — Pay any time, any amount within 330 days.",
      "Minimum Payment per transaction: ₹100.",
      "Tenure: 330 days.",
      "Bonus Structure:",
      "Payments within 1 – 75 days: 10% Bonus.",
      "Payments within 76 – 150 days: 7.5% Bonus.",
      "Payments within 151 – 225 days: 4% Bonus.",
      "Payments within 226 – 300 days: 1.75% Bonus.",
      "Payments within 301 – 330 days: 0% Bonus.",
      "Redemption allowed only between the 331st and 345th day.",
    ],

    // Added LumpSum plan (English)
    lumpSum: [
      "One-time investment plan.",
      "Minimum Amount: ₹10,000.",
      "Tenure: 330 days.",
      "Bonus: Up to 16% at maturity based on invested value.",
      "Redemption: Jewellery purchase only between Day 331–345.",
    ],

    // Added Bright plan (English)
    bright: [
      "Monthly fixed payment plan.",
      "Minimum Amount: ₹1,000 (in multiples of ₹500).",
      "Tenure: 11 months (approx. 330 days).",
      "Bonus: One month's instalment equivalent bonus at maturity.",
      "Redemption: Jewellery purchase only between Day 331–345.",
    ],

    termsTitle: "General Conditions",
    terms: [
      "Open to Indian citizens aged 18+ with valid ID.",
      "All payments treated as advance value, not metal weight.",
      "Eligible Amount = Total paid + bonus.",
      "Redemption only between Day 331–345.",
      "GST, making charges, hallmarking charges apply.",
      "Eligible only for BMG jewellery purchases.",
      "No payments after 330 days.",
      "Default cancels bonus benefits.",
      "Receipt must be collected for cash payments.",
      "Lost card/passbook will be replaced with charges.",
      "Scheme transfer not allowed.",
      "Company has rights to alter or withdraw schemes.",
      "Disputes under Madurai jurisdiction.",
      "No cash refund allowed.",
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

      {(items ?? []).map((item, index) => (
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
  )
);

// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
function KnowMore() {
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
        next === "english" ? "Language changed to English" : "மொழி தமிழ் மாற்றப்பட்டது"
      );
      return next;
    });
  }, []);

  const handleJoinNow = useCallback(() => {
    navigation.navigate("AddNewMember", { schemeId });
  }, [navigation, schemeId]);

  const handleClose = useCallback(() => {
    navigation.navigate("MainLanding");
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <CommonHeader title="Know More" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Language Switch */}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Icon name="translate" size={16} color={COLORS.white} />
            <Text style={styles.languageButtonText}>
              {isEnglish ? "தமிழ்" : "English"}
            </Text>
          </TouchableOpacity>

          {/* SCHEME SECTIONS */}
          <SchemeSection title="BMG SMART PAY" items={content.smartPay} />
          <SchemeSection title="BMG LUMPSUM" items={content.lumpSum} />
          <SchemeSection title="BMG BRIGHT" items={content.bright} />

          {/* TERMS */}
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>{content.termsTitle}</Text>

            {content.terms.map((item, index) => (
              <View key={`term-${index}`} style={styles.featureItem}>
                <Icon
                  name="asterisk"
                  size={12}
                  color={DIGIGOLD_COLORS.primary}
                />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleJoinNow}>
              <Icon name="account-plus" size={18} color={COLORS.white} />
              <Text style={styles.buttonText}>{content.joinNow}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>{content.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  languageButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIGIGOLD_COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  languageButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 6,
  },
  schemeSection: {
    marginBottom: 20,
  },
  schemeTitle: {
    fontSize: SIZES.font + 1,
    fontWeight: "700",
    color: DIGIGOLD_COLORS.primary,
    marginVertical: 12,
    textDecorationLine: "underline",
  },
  termsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: SIZES.font + 1,
    fontWeight: "700",
    color: DIGIGOLD_COLORS.primary,
    marginBottom: 15,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  featureText: {
    flex: 1,
    color: DIGIGOLD_COLORS.textPrimary,
    textAlign: "justify",
    paddingLeft: 5,
  },
  buttonContainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: DIGIGOLD_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: DIGIGOLD_COLORS.primary,
  },
  closeButtonText: {
    color: DIGIGOLD_COLORS.primary,
    fontWeight: "600",
  },
   sectionContainer: {
    marginTop: 18,
    padding: 12,
    backgroundColor: "#FFF4EE",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#CD865C",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomColor: "#e5e5e5",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFE8DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    color: "#666",
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  /*** TABLE STYLES ***/
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#CD865C",
    padding: 10,
    borderRadius: 8,
  },
  tableHeadText: {
    flex: 1,
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8D0C4",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#444",
    textAlign: "center",
  },
});

export default KnowMore;
