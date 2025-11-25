import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  scale,
  moderateScale,
  COLORS,
  FONTS,
  SIZES,
} from "../../utils/AppTheme";
import styles from "./styles";
import { MaterialIcons } from "@expo/vector-icons";

function BottomTab({ screen }) {
  const navigation = useNavigation();

  const getIconColor = (currentScreen) => {
    return screen === currentScreen ? COLORS.primary : COLORS.textSecondary;
  };

  const getTextStyle = (currentScreen) => {
    return screen === currentScreen ? styles.activeText : styles.inactiveText;
  };

  return (
    <View style={styles.footerContainer}>
      {/* Home Icon */}
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

      {/* Schemes Icon */}
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

      {/* Notifications Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Rewards")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="trophy"
          size={SIZES.icon.md}
          color={getIconColor("Rewards")}
        />
        <Text style={getTextStyle("Rewards")}>Rewards</Text>
      </TouchableOpacity>

      {/* Support Icon */}
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
