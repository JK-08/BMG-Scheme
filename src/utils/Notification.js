// 📁 src/services/NotificationService.js
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { API_BASE_URL } from "../Config/API";
import Constants from "expo-constants";

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    null
  );
}

// ----------------- Android Notification Channels -----------------
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    lightColor: "#FF0000",
  });

  Notifications.setNotificationChannelAsync("promo", {
    name: "Promotions",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    lightColor: "#FFD700",
  });
}

// ----------------- Foreground Notification Handler -----------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ----------------- Generate Unique Device ID -----------------
async function generateDeviceId() {
  const saved = await AsyncStorage.getItem("deviceId");
  if (saved) return saved;

  const newId = `dev-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
  await AsyncStorage.setItem("deviceId", newId);
  return newId;
}

// ----------------- Send Push Token to Server -----------------
export async function sendPushTokenToServer(expoToken, userId) {
  try {
    const deviceId = await generateDeviceId();

    const data = {
      deviceId,
      deviceType: "mobile",
      expoToken,
      fcmToken: "",
      userId,
    };

    console.log("📤 Sending token:", data);

    const res = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    console.log("📥 Server Response:", text);

    return res.ok;
  } catch (err) {
    console.log("❌ Server Error:", err);
    return false;
  }
}

// ----------------- Register for Push Notifications -----------------
export async function registerForPushNotifications(userId, options = {}) {
  const {
    showWelcomeNotification = true,
    welcomeTitle = "🎉 Welcome!",
    welcomeBody = "Check out the latest schemes now.",
    welcomeImage = "https://t3.ftcdn.net/jpg/01/76/98/40/360_F_176984023_8I82qQPmKn8TqNAZXIYMCSiwccoUiPBg.jpg",
  } = options;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;

    if (status !== "granted") {
      Alert.alert(
        "Enable Notifications",
        "Please allow notification permission to receive important updates and offers.",
        [{ text: "OK" }]
      );
      return null;
    }
  }

  try {
    const projectId = getExpoProjectId();

    if (!projectId) {
      console.log("❌ Expo Project ID not found");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("📨 Fresh Expo Token:", token.data);

    console.log("📨 Fresh Expo Token:", token.data);

    if (userId) {
      await sendPushTokenToServer(token.data, userId);
    }

    // Send welcome notification via server if not already sent
    if (showWelcomeNotification && finalStatus === "granted") {
      const welcomeSent = await AsyncStorage.getItem("welcomeNotificationSent");
      if (welcomeSent !== "true") {
        // wait 1 second to ensure token is registered
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const success = await sendServerNotification({ userId });
        if (success) {
          await AsyncStorage.setItem("welcomeNotificationSent", "true");
          console.log("✅ Welcome notification sent via server");
        } else {
          console.log("❌ Failed to send welcome notification");
        }
      }
    }

    return token.data;
  } catch (err) {
    console.log("❌ Error getting push token:", err);
    return null;
  }
}

// ----------------- Send Notification via Server API -----------------
export async function sendServerNotification({ userId }) {
  try {
    const apiUrl = `${API_BASE_URL}/notifications/sendMessage/5/user/${userId}`;

    // Send POST request without a body
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    console.log("📥 Server Notification Response:", text);

    return res.ok;
  } catch (error) {
    console.log("❌ Error sending server notification:", error);
    return false;
  }
}

// ----------------- Listen for Notifications -----------------
export function listenForNotifications() {
  // Foreground notification
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      const { title, body } = notification.request.content;

      showMessage({
        message: title || "Notification",
        description: body || "",
        type: "info",
        duration: 5000,
        icon: "auto",
      });
    }
  );

  // User tapped notification
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(
        "🖱 User tapped notification:",
        response.notification.request.content
      );
      // Navigate if needed
    });

  return { notificationListener, responseListener };
}

// ----------------- Remove Listeners -----------------
export function removeNotificationListeners(listeners) {
  if (listeners.notificationListener)
    Notifications.removeNotificationSubscription(
      listeners.notificationListener
    );
  if (listeners.responseListener)
    Notifications.removeNotificationSubscription(listeners.responseListener);
}
