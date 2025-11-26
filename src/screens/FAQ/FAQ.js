import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import theme from "../../utils/AppTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale, SHADOWS } = theme;

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const languageOptions = [
  { label: "English", value: "EN" },
  { label: "தமிழ்", value: "TA" },
];

// Grouped FAQ Data with category icon and color
const faqSections = [
  {
    title: "Gold-Polished Silver Jewellery",
    icon: "redeem",
    iconColor: COLORS.primary,
    faqs: [
      {
        q: "What is gold-polished silver jewellery?",
        a: "It is pure silver jewellery coated with a thin layer of gold (micron or flash polish) to give the appearance of real gold at an affordable price.",
      },
      {
        q: "How long will the gold polish last?",
        a: "With normal usage, 6–12 months. With proper care (no perfumes/water/sweat contact), it can last 1–2 years depending on usage.",
      },
      {
        q: "Will the polish fade?",
        a: "Yes, all gold-polished jewellery fades over time due to exposure to moisture, sweat, perfumes, and chemicals.",
      },
      {
        q: "Do you offer repolishing service?",
        a: "Yes, repolishing is available. Charges depend on the size, weight, and type of jewellery.",
      },
      {
        q: "Is the base metal original silver?",
        a: "Yes. All our gold-polished jewellery is made using pure 92.5 silver unless mentioned otherwise.",
      },
      {
        q: "How to maintain gold-polished jewellery?",
        a: "Avoid perfumes, hair sprays, sweat.\n\nRemove while bathing.\n\nWipe after use.\n\nStore in airtight zip covers.",
      },
      {
        q: "Can I wear it daily?",
        a: "Light usage is fine. But continuous daily wear will reduce polish life faster.",
      },
      {
        q: "Will it cause skin allergies?",
        a: "No. Silver is a hypoallergenic metal.",
      },
    ],
  },

  {
    title: "Plain Silver Jewellery",
    icon: "verified",
    iconColor: COLORS.secondary,
    faqs: [
      {
        q: "Are your silver products 92.5 purity?",
        a: "Yes, all jewellery items are made of 92.5 hallmarked silver (unless otherwise specified).",
      },
      {
        q: "Do your products come with hallmark?",
        a: "Yes, BIS hallmark / 925 stamp is present wherever applicable.",
      },
      {
        q: "Do you custom-make silver jewellery?",
        a: "Yes, custom designs can be made based on order.",
      },
      {
        q: "Can I exchange old silver jewellery?",
        a: "Yes, we buy/exchange silver based on current silver rates.",
      },
    ],
  },

  {
    title: "Silver Vessels & Articles",
    icon: "inventory",
    iconColor: COLORS.primaryDark,
    faqs: [
      {
        q: "What is the purity of your silver vessels?",
        a: "Our vessels are made of 80% (coin silver), 90%, or 92.5% depending on the design and customer requirement.",
      },
      {
        q: "Do silver vessels turn black?",
        a: "Yes, silver naturally oxidizes. Regular cleaning will maintain shine.",
      },
      {
        q: "How to clean silver vessels at home?",
        a: "Use:\n\nToothpaste\n\nBaking soda + hot water\n\nSilver polish liquid\n\nSoft cloth (no scrubbers)",
      },
      {
        q: "Do you engrave names or initials on vessels?",
        a: "Yes, name engraving can be done on most items.",
      },
    ],
  },

  {
    title: "Payments, Billing & Delivery",
    icon: "payment",
    iconColor: COLORS.success,
    faqs: [
      {
        q: "Do you provide bill for every purchase?",
        a: "Yes, 100% transparent billing with GST where applicable.",
      },
      {
        q: "Do you accept online payments?",
        a: "Yes – UPI, Net Banking, Debit/Credit Card, Cash.",
      },
      {
        q: "Do you offer home delivery?",
        a: "Yes, delivery within the city. Courier available for outstation customers.",
      },
      {
        q: "Is COD available?",
        a: "Depends on order value and location (optional).",
      },
    ],
  },

  {
    title: "Returns, Exchange & Warranty",
    icon: "repeat",
    iconColor: COLORS.warning,
    faqs: [
      {
        q: "What is your return policy?",
        a: "Unused items can be returned within 24–48 hours (except customized items).",
      },
      {
        q: "Can I exchange gold-polished items?",
        a: "Yes, but polishing charges and usage wear will be considered.",
      },
      {
        q: "Is there any warranty for gold polish?",
        a: "No warranty for polish, as it depends entirely on usage habits.",
      },
      {
        q: "Do you buy back your silver products?",
        a: "Yes, we buy back silver based on purity & live silver rate.",
      },
    ],
  },

  {
    title: "Product Information & Ordering",
    icon: "info",
    iconColor: COLORS.info,
    faqs: [
      {
        q: "Do you provide catalogue images?",
        a: "Yes, WhatsApp and Instagram catalogue available.",
      },
      {
        q: "Can I pre-book items for functions?",
        a: "Yes, booking facility is available.",
      },
      {
        q: "Do you provide gift packing?",
        a: "Yes, premium gift packing options available.",
      },
      {
        q: "Can you supply bulk orders?",
        a: "Yes, for weddings, corporate gifting, temple articles, and wholesalers.",
      },
      {
        q: "Do you provide size alteration?",
        a: "Yes, ring/bangle/chain size adjustments are done.",
      },
      {
        q: "Are your products kids-friendly?",
        a: "Yes, non-allergic and lightweight kid-friendly collections are available.",
      },
    ],
  },
];
const faqSectionsTamil = [
  {
    title: "தங்கம் போலிஷ் வெள்ளி நகைகள்",
    icon: "redeem",
    iconColor: COLORS.primary,
    faqs: [
      {
        q: "Gold Polish Silver Jewellery என்றால் என்ன?",
        a: "92.5 வெள்ளி நகைக்கு தங்கப் போலிஷ் (micron/flash coating) செய்யப்படுகிறது. இது தங்க நகை போலத் தெரியும்போது, விலை குறைவாக இருக்கும்.",
      },
      {
        q: "தங்கப் போலிஷ் எவ்வளவு நாள் நீடிக்கும்?",
        a: "சாதாரணமாக 6–12 மாதங்கள்.\nநல்ல பராமரிப்பு செய்தால் 1–2 வருடங்கள் வரை நீடிக்கும்.",
      },
      {
        q: "போலிஷ் குறையுமா?",
        a: "ஆம். Perfume, sweat, water, chemicals ஆகியவற்றால் காலப்போக்கில் மங்கும்.",
      },
      {
        q: "மறுபடியும் போலிஷ் செய்யலாமா?",
        a: "ஆமாம், repolishing வசதி உள்ளது. Charges நகையின் அளவு & எடையைப் பொறுத்து இருக்கும்.",
      },
      {
        q: "Base metal pure silver தானா?",
        a: "ஆம், எங்கள் நகைகள் அனைத்தும் 92.5 வெள்ளியில் தயாரிக்கப்படுகின்றன.",
      },
      {
        q: "எப்படி பராமரிக்க வேண்டும்?",
        a: "Perfume/sweat/water தவிர்க்கவும்\n\nBath/handwash போது அகற்றவும்\n\nபயன்படுத்திய பிறகு துடைத்து வைத்துக் கொள்ளவும்\n\nAirtight zip cover பயன்படுத்தவும்",
      },
      {
        q: "Daily use செய்யலாமா?",
        a: "சிறிய அளவில் yes. ஆனால் தினமும் தொடர்ந்து பயன்படுத்தினால் Polish life குறையும்.",
      },
      { q: "Skin allergy வருமா?", a: "இல்லை. வெள்ளி hypoallergenic metal." },
    ],
  },

  {
    title: "Plain Silver Jewellery",
    icon: "verified",
    iconColor: COLORS.secondary,
    faqs: [
      {
        q: "நகைகள் 92.5 purity தானா?",
        a: "ஆம், 92.5 hallmark/stamp கொண்ட pure silver.",
      },
      {
        q: "Hallmark இருக்கும் தானே?",
        a: "ஆம், BIS / 925 hallmark உள்ளது (வகையைப் பொறுத்து).",
      },
      {
        q: "Custom design தயாரிக்கிறீர்களா?",
        a: "ஆம், உங்கள் விருப்பப்படி order செய்து கொடுக்கலாம்.",
      },
      {
        q: "பழைய வெள்ளி exchange செய்யலாமா?",
        a: "ஆம், அந்த நாள் silver rate அடிப்படையில் வாங்கப்படும் / மாற்றிக்கொள்ளலாம்.",
      },
    ],
  },

  {
    title: "Silver Vessels & Articles",
    icon: "inventory",
    iconColor: COLORS.primaryDark,
    faqs: [
      {
        q: "வெள்ளி பாத்திரங்கள் எந்த purity?",
        a: "80%, 90% மற்றும் 92.5 purity என்று வகைபோல் இருக்கும்.",
      },
      {
        q: "Silver vessels கருப்பாகிப்போகுமா?",
        a: "ஆம், silver இயற்கையாக oxidize ஆகும். ஆனால் சரியான சுத்தம் செய்தால் shine திரும்பும்.",
      },
      {
        q: "வீட்டில் எப்படி சுத்தம் செய்வது?",
        a: "Toothpaste\n\nBaking soda + hot water\n\nSilver polish liquid\n\nமென்மையான துணி (scrubber இல்லை)",
      },
      {
        q: "Name engraving கிடைக்குமா?",
        a: "ஆமாம், பெயர்/initials பொறித்துக் தரப்படும்.",
      },
    ],
  },

  {
    title: "Payment, Billing & Delivery",
    icon: "payment",
    iconColor: COLORS.success,
    faqs: [
      {
        q: "Bill கொடுப்பீர்களா?",
        a: "ஆம், 100% transparent billing, GST உடன் (வகைப்படி).",
      },
      {
        q: "Online payment accept செய்வீர்களா?",
        a: "ஆம் – UPI, Net Banking, Card, Cash அனைத்தும் கிடைக்கும்.",
      },
      {
        q: "Home delivery உண்டா?",
        a: "ஆம், நகரத்திற்குள் delivery. Outstationக்கு courier.",
      },
      {
        q: "Cash on Delivery (COD) உண்டா?",
        a: "Order value/location அடிப்படையில்.",
      },
    ],
  },

  {
    title: "Return, Exchange & Warranty",
    icon: "repeat",
    iconColor: COLORS.warning,
    faqs: [
      {
        q: "Return policy என்ன?",
        a: "பயன்படுத்தாத பொருட்கள் 24–48 மணி நேரத்தில் return செய்யலாம் (custom orders exception).",
      },
      {
        q: "Gold polish items exchange செய்யலாமா?",
        a: "ஆம், ஆனால் usage wear & polishing charges பொருந்தும்.",
      },
      {
        q: "Gold polishக்கு warranty உண்டா?",
        a: "இல்லை. Polish life முழுமையாக பயன்படுத்தும் முறையைப் பொறுத்தது.",
      },
      {
        q: "நீங்கள் விற்ற silver items மீண்டும் வாங்குவீர்களா?",
        a: "ஆம், purity மற்றும் அந்த நாள் silver rate அடிப்படையில்.",
      },
    ],
  },

  {
    title: "Product Information & Ordering",
    icon: "info",
    iconColor: COLORS.info,
    faqs: [
      {
        q: "Catalogue images கொடுக்கிறீர்களா?",
        a: "ஆம், WhatsApp / Instagram catalogue கிடைக்கும்.",
      },
      {
        q: "Functionக்காக items pre-book செய்யலாமா?",
        a: "ஆம், pre-booking வசதி உள்ளது.",
      },
      { q: "Gift packing உண்டா?", a: "ஆம், premium gift packing options." },
      {
        q: "Bulk orders கொடுக்குகிறீர்களா?",
        a: "ஆம் – திருமணம், corporate gifting, temple items, wholesale supply.",
      },
      {
        q: "Size alteration செய்யலாமா?",
        a: "ஆம் — ring/bangle/chain size adjustment.",
      },
      {
        q: "Kids-friendly designs உண்டா?",
        a: "ஆம், allergy-free குழந்தைகள் நகைகள் கிடைக்கும்.",
      },
    ],
  },
];

const FAQItem = ({ question, answer, defaultOpen = false }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={styles.questionRow}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Icon
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={moderateScale(24)}
          color={COLORS.primary}
        />
      </TouchableOpacity>
      {expanded && <Text style={styles.answerText}>{answer}</Text>}
    </View>
  );
};

const FAQPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  const faqData = selectedLanguage === "EN" ? faqSections : faqSectionsTamil;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <CommonHeader title="FAQs" />

        {/* 🔄 Language Swap Button */}
        <View
          style={{
            alignItems: "flex-end",
            width: "100%",
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setSelectedLanguage((prev) => (prev === "EN" ? "TA" : "EN"))
            }
            style={{
              backgroundColor: "#fff",
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              marginBottom: 20,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#000", fontSize: 15, fontWeight: "600" }}>
              {selectedLanguage === "EN" ? "தமிழ்" : "English"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {faqData.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name={section.icon} size={22} color={section.iconColor} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {section.faqs.map((faq, idx) => (
                <FAQItem
                  key={idx}
                  question={faq.q}
                  answer={faq.a}
                  defaultOpen={false}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} BMG Jewellers. All rights reserved.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollContent: {
    padding: SIZES.padding.lg,
    paddingBottom: verticalScale(SIZES.padding.xl),
  },
  sectionCard: {
    marginBottom: verticalScale(SIZES.padding.lg),
    padding: SIZES.padding.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(SIZES.padding.md),
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.primary,
    flex: 1,
  },
  faqItem: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(SIZES.padding.sm),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SIZES.padding.md,
  },
  answerText: {
    marginTop: verticalScale(SIZES.padding.sm),
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.md * 1.4,
  },
  footer: {
    marginTop: verticalScale(SIZES.padding.xl),
    alignItems: "center",
  },
  footerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
});

export default FAQPage;
