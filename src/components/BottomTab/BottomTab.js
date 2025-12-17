import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  COLORS,
  SIZES,
} from "../../utils/AppTheme";
import styles from "./styles";

function BottomTab({ screen }) {
  const navigation = useNavigation();

  const getIconColor = (currentScreen) =>
    screen === currentScreen ? COLORS.primary : COLORS.textSecondary;

  const getTextStyle = (currentScreen) =>
    screen === currentScreen ? styles.activeText : styles.inactiveText;

  return (
    <View style={styles.footerContainer}>
      {/* Home */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MainLanding")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="home"
          size={SIZES.icon.md}
          color={getIconColor("HOME")}
        />
        <Text style={getTextStyle("HOME")}>Home</Text>
      </TouchableOpacity>

      {/* Schemes */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MyScheme")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="savings"
          size={SIZES.icon.md}
          color={getIconColor("SCHEMES")}
        />
        <Text style={getTextStyle("SCHEMES")}>Schemes</Text>
      </TouchableOpacity>

      {/* Referral */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ReferralScreen")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="gift"
          size={SIZES.icon.md}
          color={getIconColor("ReferralScreen")}
        />
        <Text style={getTextStyle("ReferralScreen")}>Referral</Text>
      </TouchableOpacity>

      {/* Support */}
      <TouchableOpacity
        onPress={() => navigation.navigate("HelpCenter")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="headset"
          size={SIZES.icon.md}
          color={getIconColor("HelpCenter")}
        />
        <Text style={getTextStyle("HelpCenter")}>Support</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BottomTab;
