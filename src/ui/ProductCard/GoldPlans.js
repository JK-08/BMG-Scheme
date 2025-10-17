import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { TextDefault } from "../../components";
import { alignment, colors, scale } from "../../utils";
import { COLORS, FONTS, SIZES } from "../../utils/Theme";

function GoldPlan(props) {
  const { schemeId, schemeName, description = "No description available" } = props;

  const navigation = useNavigation();

  // Define quotes for different schemes
  const schemeQuotes = {
    BAS: "Start your journey to financial freedom with BAS!",
    BDS: "Secure your future with the trusted BDS plan.",
    BFD: "BFD helps you grow wealth step by step.",
  };

  // Pick quote based on description or fallback
  const displayQuote = schemeQuotes[description] || "";

  // Handle scheme navigation
  const handleJoinScheme = () => {
    navigation.navigate("AddNewMember", { schemeId });
  };

  const handleKnowMore = () => {
    navigation.navigate("KnowMore", { schemeId });
  };

  return (
    <TouchableOpacity style={[styles.cardContainer, props.styles]}>
      <LinearGradient
        colors={[COLORS.gradientcolor7, COLORS.gradientcolor8]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.rightTop}>
            <TextDefault style={styles.text} bold>
              {schemeName}
            </TextDefault>
          </View>
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <TextDefault style={styles.description}>{description}</TextDefault>
          {displayQuote !== "" && (
            <TextDefault style={styles.quote}>{displayQuote}</TextDefault>
          )}
          
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.payButton} onPress={handleKnowMore}>
            <TextDefault style={styles.payButtonText}>Know More</TextDefault>
          </TouchableOpacity>

          <TouchableOpacity style={styles.payButton} onPress={handleJoinScheme}>
            <TextDefault style={styles.payButtonText}>Join Scheme</TextDefault>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: scale(15),
    overflow: "hidden",
  },
  gradientBackground: {
    borderRadius: scale(15),
    padding: scale(5),
    overflow: "hidden",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(20),
    ...alignment.Psmall,
  },
  rightTop: {
    alignItems: "flex-end",
  },
  centerSection: {
    marginBottom: scale(5),
    ...alignment.Psmall,
    marginTop: scale(-15),
    gap: scale(8),
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(10),
  },
  payButton: {
    backgroundColor: colors.white,
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: scale(5),
  },
  text: {
    color: colors.greenColor,
    fontWeight: "bold",
    ...FONTS.body1,
    fontSize: SIZES.font,
  },
  payButtonText: {
    color: colors.black,
    fontWeight: "bold",
    textAlign: "center",
    ...FONTS.body1,
    fontSize: SIZES.fontSm,
  },
  quote: {
    color: colors.white,
    fontSize: SIZES.h6,
    fontWeight: "bold",
    marginBottom: 5,
    ...FONTS.body1,
  },
  description: {
    color: colors.white,
    fontSize: SIZES.h4,
    fontWeight: "bold",
    ...FONTS.body,
  },
});

export default GoldPlan;
