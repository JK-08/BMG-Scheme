import React from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES, SHADOWS } from "../../utils/AppTheme";

const { width } = Dimensions.get("window");

const DigiCertificationFooter = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/image/image.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>100% Certified Jewellery</Text>

          <Text style={styles.subtitle}>
            Fully authenticated and verified by Bureau of Indian Standards (BIS).
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: SIZES.padding.lg,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    // marginBottom: SIZES.margin.md,
    width: width - SIZES.padding.xl * 2,
    ...SHADOWS.sm,
  },

  logo: {
    width: SIZES.icon.xxl,
    height: SIZES.icon.xxl,
    marginRight: SIZES.margin.md,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.heading.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },

  subtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.md * 1.5,
  },
});

export default DigiCertificationFooter;
