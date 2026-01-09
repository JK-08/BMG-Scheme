import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { API_BASE_URL } from "../Config/API";

/* =====================================================
   ANDROID NOTIFICATION CHANNEL (REQUIRED)
===================================================== */
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default Notifications",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

/* =====================================================
   FOREGROUND POPUP HANDLER (CRITICAL)
===================================================== */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // 🔔 SHOW POPUP
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* =====================================================
   DEVICE ID GENERATION
===================================================== */
async function generateDeviceId() {
  const saved = await AsyncStorage.getItem("deviceId");
  if (saved) return saved;

  const newId = `dev-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
  await AsyncStorage.setItem("deviceId", newId);
  return newId;
}

/* =====================================================
   SEND TOKEN TO BACKEND
===================================================== */
export async function sendPushTokenToServer(expoToken, userId) {
  try {
    const deviceId = await generateDeviceId();

    const payload = {
      deviceId,
      deviceType: "mobile",
      expoToken,
      fcmToken: "",
      userId,
    };

    const res = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📤 Token sent to server:", payload);
    return res.ok;
  } catch (err) {
    console.error("❌ Token send failed:", err);
    return false;
  }
}

/* =====================================================
   REGISTER FOR PUSH NOTIFICATIONS
===================================================== */
export async function registerForPushNotifications(userId) {
  try {
    // 1️⃣ Permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Enable notifications to receive important updates."
      );
      return null;
    }

    // 2️⃣ Get Expo Project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.error("❌ Expo projectId missing");
      return null;
    }

    // 3️⃣ Get Expo Push Token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const expoToken = tokenResponse.data;
    console.log("📨 Expo Push Token:", expoToken);

    // 4️⃣ Send token to backend
    if (userId) {
      await sendPushTokenToServer(expoToken, userId);
    }

    return expoToken;
  } catch (error) {
    console.error("❌ Push registration error:", error);
    return null;
  }
}

/* =====================================================
   LISTEN FOR NOTIFICATIONS
===================================================== */
export function listenForNotifications(navigation) {
  // 🔔 Notification received (foreground)
  const notificationListener =
    Notifications.addNotificationReceivedListener((notification) => {
      console.log(
        "📦 Notification Received:",
        JSON.stringify(notification.request.content, null, 2)
      );
    });

  // 🖱 Notification tapped
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("🖱 Notification tapped:", data);

      // Example deep link handling
      if (data?.type === "payment") {
        navigation?.navigate("Payments");
      }
      if (data?.type === "rate_update") {
        navigation?.navigate("Rates");
      }
    });

  return { notificationListener, responseListener };
}

/* =====================================================
   REMOVE LISTENERS
===================================================== */
export function removeNotificationListeners(listeners) {
  if (listeners?.notificationListener) {
    Notifications.removeNotificationSubscription(
      listeners.notificationListener
    );
  }
  if (listeners?.responseListener) {
    Notifications.removeNotificationSubscription(
      listeners.responseListener
    );
  }
}