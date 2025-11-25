import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import AppContainer from "./src/routes/routes";
import { colors } from "./src/utils/colors";
import useFonts from "./src/utils/Fonts";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // LOAD FONTS
  useEffect(() => {
    (async () => {
      await useFonts();
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />
      <AppContainer />
      <FlashMessage position="top" />
    </SafeAreaView>
  );
}
