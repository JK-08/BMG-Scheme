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
import appTheme from "../../utils/MainTheme";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = appTheme;

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Grouped FAQ Data with category icon and color
const faqSections = [
  {
    title: "Plans & Payments",
    icon: "payment",
    iconColor: COLORS.primary,
    faqs: [
      { q: "What plans can I join?", a: "Choose from 3 easy saving options — Lumpsum, Bright, or Smart Pay." },
      { q: "What’s the scheme period?", a: "All plans run for 330 days. Redeem between Day 331–345." },
      { q: "What’s the minimum amount to join?", a: "• Lumpsum – ₹10,000\n• Bright – ₹1,000 (multiples of ₹500)\n• Smart Pay – ₹100 per payment" },
      { q: "Can I pay more than once?", a: "Yes! You can add more anytime (as per your scheme)." },
      { q: "Can I join more than one scheme?", a: "Yes! You can enrol in multiple schemes anytime." },
      { q: "How can I make payments?", a: "Pay directly at BMG Jewellers – via cash, UPI, card, or bank transfer." },
      { q: "Can I pay after 330 days?", a: "❌ No, payments accepted only within 330 days." },
    ],
  },
  {
    title: "Redemption & Bonus",
    icon: "redeem",
    iconColor: COLORS.success,
    faqs: [
      { q: "Can I redeem early?", a: "❌ No early redemption. Redeem only after 330 days." },
      { q: "What will I get at maturity?", a: "You’ll get jewellery worth your total payment + bonus value." },
      { q: "What are the bonus benefits?", a: "• Lumpsum: upto 16% Bonus\n• Bright: 1 Month’s Instalment\n• Smart Pay: Up to 10% based on payment period" },
      { q: "What if I stop paying?", a: "Bonus and gifts will be forfeited, and gift value will be deducted." },
      { q: "Can I switch between schemes?", a: "No. Each scheme is independent." },
      { q: "When is the bonus applied?", a: "Your bonus is added at the time of redemption." },
      { q: "What if I forget to redeem?", a: "Schemes not redeemed by Day 345 will lapse automatically." },
    ],
  },
  {
    title: "Jewellery & Assurance",
    icon: "verified",
    iconColor: COLORS.secondary,
    faqs: [
      { q: "Is my amount based on silver weight?", a: "No, it’s treated as advance value (₹), not metal weight." },
      { q: "What if my card/passbook is lost?", a: "You can get a replacement with a small charge." },
      { q: "Are taxes included?", a: "No. GST, making & stone charges apply at redemption." },
      { q: "Can I take cash instead of jewellery?", a: "No. Redemption is only in jewellery purchase." },
      { q: "Who can join the scheme?", a: "Any Indian citizen aged 18 years and above with valid ID proof." },
      { q: "What assurance do I get on jewellery?", a: "All items are 92.5 Hallmark Certified Silver from ✨ BMG Jewellers – India’s Largest Hallmark Silver Showroom." },
    ],
  },
];

const FAQItem = ({ question, answer, defaultOpen = true }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={toggleExpand} style={styles.questionRow} activeOpacity={0.7}>
        <Text style={styles.questionText}>{question}</Text>
        <Icon
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={moderateScale(24)}
          color={COLORS.secondary}
        />
      </TouchableOpacity>
      {expanded && <Text style={styles.answerText}>{answer}</Text>}
    </View>
  );
};

const FAQPage = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <CommonHeader title="FAQs" />

          {faqSections.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name={section.icon} size={22} color={section.iconColor} style={{ marginRight: moderateScale(8) }} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {section.faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.q} answer={faq.a} defaultOpen={true} />
              ))}
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} BMG Jewellers. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollContent: { padding: SIZES.padding.md, paddingBottom: verticalScale(20) },
  sectionCard: {
    marginBottom: verticalScale(15),
    padding: SIZES.padding.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(10) },
  sectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.primary,
    flex: 1,
  },
  faqItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.sm,
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: moderateScale(10),
  },
  answerText: {
    marginTop: verticalScale(6),
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(20),
  },
  footer: { marginTop: verticalScale(20), alignItems: "center" },
  footerText: { fontFamily: FONTS.family.body, fontSize: SIZES.font.sm, color: COLORS.textSecondary },
});

export default FAQPage;
