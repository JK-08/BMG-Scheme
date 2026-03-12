// src/screens/SplashScreen.js

import React from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { colors } from "../../utils/colors";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* If you have logo */}
      <Image source={require("../../assets/icon.png")} style={styles.logo} />

      {/* <ActivityIndicator size="large" color={colors.primary} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
});
