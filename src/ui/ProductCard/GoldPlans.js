import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TextDefault } from "../../components";
import appTheme from "../../utils/MainTheme";

import scheme1 from "../../assets/image/2.jpg";
import scheme2 from "../../assets/image/3.jpg";
import scheme3 from "../../assets/image/4.jpg";

const { COLORS, SIZES, FONTS, moderateScale, SHADOWS } = appTheme;

function GoldPlan({
  schemeId = 0,
  schemeName = "Unnamed Scheme",
  description = "",
  styles: customStyles,
}) {
  const navigation = useNavigation();

  // Map images by schemeId (instead of hardcoding names)
  const schemeImagesById = {
    1: scheme1,
    2: scheme3,
    3: scheme2,
  };

  const schemeImage = schemeImagesById[schemeId] || null;

  // Navigate to AddNewMember page
  const handleJoinScheme = () => {
    navigation.navigate("AddNewMember", {
      schemeId,
      schemeName,
    });
    console.log(
      "Navigating to AddNewMember with scheme ID:",
      schemeId,
      "Name:",
      schemeName
    );
  };

  // Navigate to KnowMore page
  const handleKnowMore = () => {
    navigation.navigate("KnowMore", {
      schemeId,
      schemeName,
    });
  };

  return (
    <View style={[styles.cardContainer, customStyles]}>
      <ImageBackground
        source={schemeImage}
        style={styles.imageBackground}
        imageStyle={{
          borderTopLeftRadius: SIZES.radius.lg,
          borderTopRightRadius: SIZES.radius.lg,
        }}
        resizeMode="cover"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.knowMoreButton]}
          onPress={handleKnowMore}
        >
          <TextDefault style={styles.knowMoreButtonText}>Know More</TextDefault>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.joinButton]}
          onPress={handleJoinScheme}
        >
          <TextDefault style={styles.joinButtonText}>Join Scheme</TextDefault>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: SIZES.radius.lg,
    overflow: "hidden",
    width: "95%",
    alignSelf: "center",
    marginVertical: moderateScale(10),
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  imageBackground: {
    width: "100%",
    height: moderateScale(200),
    justifyContent: "flex-end",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SIZES.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  knowMoreButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: moderateScale(8),
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    marginLeft: moderateScale(8),
  },
  knowMoreButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  joinButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.textInverse,
    fontWeight: "600",
  },
});

export default GoldPlan;
