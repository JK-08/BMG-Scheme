import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import AppContainer from "./src/routes/routes";
import DevelopmentScreen from "./src/screens/Splashscreen/DevelopmentScreen";
import SplashScreen from "./src/screens/Splashscreen/SplashScreen";
import { colors } from "./src/utils/colors";
import useFonts from "./src/utils/Fonts";
import { getAppStatus } from "./src/services/DevelopmentService";
import "react-native-gesture-handler";
import { checkForAppUpdate } from "./src/utils/VersionChecker";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appEnabled, setAppEnabled] = useState(null);
  const [devMessage, setDevMessage] = useState("");

useEffect(() => {
  const initApp = async () => {
    try {
      await useFonts();
      setFontsLoaded(true);

      const response = await getAppStatus();

      setAppEnabled(response?.enabled ?? false);
      setDevMessage(response?.message ?? "");

      // ✅ CHECK FOR UPDATE AFTER APP IS READY
      if (response?.enabled) {
        setTimeout(() => {
          checkForAppUpdate();
        }, 1500); // slight delay so splash doesn't clash with alert
      }

    } catch (error) {
      console.log("Initialization error:", error);
      setAppEnabled(false);
    }
  };

  initApp();
}, []);

  // Show splash while loading
  if (!fontsLoaded || appEnabled === null) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />
      {appEnabled ? (
        <AppContainer />
      ) : (
        <DevelopmentScreen message={devMessage} />
      )}
      <FlashMessage position="top" />
    </SafeAreaView>
  );
}
