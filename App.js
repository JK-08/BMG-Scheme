import React, { useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppContainer from "./src/routes/routes";
import { colors } from "./src/utils/colors";
import useFonts from "./src/utils/Fonts";


// ⭐ GLOBAL NOTIFICATION HANDLER
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ⭐ CREATE ANDROID CHANNEL
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("colored", {
    name: "Colored Notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
    lightColor: "#FF4500",
    enableLights: true,
  });
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // REGISTER & SEND TOKEN
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📬 Foreground push received:", notification);

        // ⭐ Show notification manually in foreground
        Notifications.scheduleNotificationAsync({
          content: notification.request.content,
          trigger: null, // show immediately
        });
      }
    );

    return () => subscription.remove();
  }, []);

  // LOAD FONTS
  useEffect(() => {
    (async () => {
      await useFonts();
      setFontsLoaded(true);
    })();
  }, []);

  // LISTENERS
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener((n) =>
      console.log("📬 Foreground notification:", n)
    );
    const sub2 = Notifications.addNotificationResponseReceivedListener((r) =>
      console.log("👆 Notification tapped:", r)
    );

    return () => {
      sub1.remove();
      sub2.remove();
    };
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
