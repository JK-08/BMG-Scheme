import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { API_BASE_URL } from "../Config/API";

/* =====================================================
   FOREGROUND NOTIFICATION HANDLER
   - Show banners in foreground
   - Play sound
   - Show in list
===================================================== */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* =====================================================
   ANDROID NOTIFICATION CHANNEL
   - Needed for images to show on Android
===================================================== */
async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default Notifications",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    allowBubbles: true,  // helps rich media
  });
}

/* =====================================================
   DEVICE ID
===================================================== */
async function generateDeviceId() {
  const stored = await AsyncStorage.getItem("deviceId");
  if (stored) return stored;

  const newId = `dev-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

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
      deviceType: Platform.OS,
      expoToken,
      fcmToken: "",
      userId,
    };

    const res = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

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
  if (Platform.OS === "web") return null;

  if (!Device.isDevice) {
    console.warn(
      "⚠️ Physical device required for push notifications. Images will not work on simulator."
    );
  }

  await setupAndroidChannel();

  // 1️⃣ Permissions
  let { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const request = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: true },
    });
    status = request.status;
  }

  if (status !== "granted") {
    Alert.alert("Notifications permission denied");
    return null;
  }

  // 2️⃣ Project ID (EAS-safe)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.error("❌ Missing EAS projectId");
    return null;
  }

  // 3️⃣ Expo Push Token
  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  const expoToken = tokenResponse.data;
  console.log("✅ Expo Push Token:", expoToken);

  // 4️⃣ Send to backend
  if (userId) {
    await sendPushTokenToServer(expoToken, userId);
  }

  return expoToken;
}

/* =====================================================
   LISTEN FOR NOTIFICATIONS
   - Handles foreground and taps
   - Supports image notifications
===================================================== */
export function listenForNotifications(navigation) {
  // Foreground notifications
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      const content = notification.request.content;
      console.log("📩 Foreground notification:", content);

      // Optional: show alert manually
      if (content.image) {
        Alert.alert(
          content.title || "Notification",
          content.body || "",
          [{ text: "OK" }]
        );
      }
    }
  );

  // Notification taps
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const content = response.notification.request.content;
      console.log("👆 Notification tapped:", content);

      const data = content.data;

      // Navigate based on data
      if (data?.type === "payment") {
        navigation?.navigate("Payments");
      } else if (data?.type === "rate_update") {
        navigation?.navigate("Rates");
      }
    }
  );

  return { notificationListener, responseListener };
}

/* =====================================================
   REMOVE LISTENERS
===================================================== */
export function removeNotificationListeners(listeners) {
  listeners?.notificationListener?.remove();
  listeners?.responseListener?.remove();
}
