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


// import { Alert, Platform } from "react-native";
// import * as Notifications from "expo-notifications";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { API_BASE_URL } from "../Config/API";

// /* =====================================================
//    ANDROID NOTIFICATION CHANNEL WITH COLOR & IMAGE SUPPORT
// ===================================================== */
// if (Platform.OS === "android") {
//   // Create default channel with color
//   Notifications.setNotificationChannelAsync("default", {
//     name: "Default Notifications",
//     importance: Notifications.AndroidImportance.MAX,
//     sound: "default",
//     vibrationPattern: [0, 250, 250, 250],
//     lightColor: "#FF231F7C",
//     // Android 8.0+ supports custom colors per channel
//     bypassDnd: true,
//     lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
//     enableVibrate: true,
//   });

//   // Create a channel for image notifications
//   Notifications.setNotificationChannelAsync("images", {
//     name: "Image Notifications",
//     importance: Notifications.AndroidImportance.MAX,
//     sound: "default",
//     vibrationPattern: [0, 250, 250, 250],
//     lightColor: "#FF231F7C",
//     bypassDnd: true,
//     lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
//     enableVibrate: true,
//   });
// }

// /* =====================================================
//    FOREGROUND POPUP HANDLER
// ===================================================== */
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// /* =====================================================
//    DEVICE ID GENERATION
// ===================================================== */
// async function generateDeviceId() {
//   const saved = await AsyncStorage.getItem("deviceId");
//   if (saved) return saved;

//   const newId = `dev-${Date.now()}-${Math.random()
//     .toString(36)
//     .substring(2, 8)}`;
//   await AsyncStorage.setItem("deviceId", newId);
//   return newId;
// }

// /* =====================================================
//    SEND TOKEN TO BACKEND
// ===================================================== */
// export async function sendPushTokenToServer(expoToken, userId) {
//   try {
//     const deviceId = await generateDeviceId();

//     const payload = {
//       deviceId,
//       deviceType: "mobile",
//       expoToken,
//       fcmToken: "",
//       userId,
//       // Include platform info for backend to handle platform-specific payloads
//       platform: Platform.OS,
//     };

//     const res = await fetch(`${API_BASE_URL}/device/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     console.log("📤 Token sent to server:", payload);
//     return res.ok;
//   } catch (err) {
//     console.error("❌ Token send failed:", err);
//     return false;
//   }
// }

// /* =====================================================
//    REGISTER FOR PUSH NOTIFICATIONS
// ===================================================== */
// export async function registerForPushNotifications(userId) {
//   try {
//     // 1️⃣ Permission
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       Alert.alert(
//         "Notifications Disabled",
//         "Enable notifications to receive important updates."
//       );
//       return null;
//     }

//     // 2️⃣ Get Expo Project ID
//     const projectId =
//       Constants.expoConfig?.extra?.eas?.projectId ||
//       Constants.easConfig?.projectId;

//     if (!projectId) {
//       console.error("❌ Expo projectId missing");
//       return null;
//     }

//     // 3️⃣ Get Expo Push Token
//     const tokenResponse = await Notifications.getExpoPushTokenAsync({
//       projectId,
//     });

//     const expoToken = tokenResponse.data;
//     console.log("📨 Expo Push Token:", expoToken);

//     // 4️⃣ Send token to backend
//     if (userId) {
//       await sendPushTokenToServer(expoToken, userId);
//     }

//     return expoToken;
//   } catch (error) {
//     console.error("❌ Push registration error:", error);
//     return null;
//   }
// }

// /* =====================================================
//    PROCESS NOTIFICATION WITH IMAGE & COLOR
// ===================================================== */
// async function processNotificationWithImage(notification) {
//   const { data, title, body } = notification.request.content;
  
//   // Check if notification has image
//   if (data?.imageUrl && Platform.OS === 'android') {
//     // For Android, we need to create/update a channel with the notification
//     // The actual image will be handled by the notification payload from server
//     console.log('🖼️ Notification includes image:', data.imageUrl);
    
//     // You can use a different channel for image notifications
//     if (data.notificationType === 'image') {
//       await Notifications.setNotificationChannelAsync("image-channel", {
//         name: data.channelName || "Image Updates",
//         importance: Notifications.AndroidImportance.MAX,
//         sound: "default",
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: data.accentColor || "#FF231F7C",
//       });
//     }
//   }

//   // Apply accent color if provided
//   if (data?.accentColor && Platform.OS === 'android') {
//     console.log('🎨 Notification accent color:', data.accentColor);
//   }

//   return notification;
// }

// /* =====================================================
//    LISTEN FOR NOTIFICATIONS
// ===================================================== */
// export function listenForNotifications(navigation) {
//   // 🔔 Notification received (foreground)
//   const notificationListener =
//     Notifications.addNotificationReceivedListener(async (notification) => {
//       console.log(
//         "📦 Notification Received:",
//         JSON.stringify(notification.request.content, null, 2)
//       );

//       // Process image/color data
//       await processNotificationWithImage(notification);

//       // You can show an in-app preview of images
//       const { data, title, body } = notification.request.content;
      
//       // Show custom in-app alert with image if needed
//       if (data?.imageUrl) {
//         // You can emit an event or update state to show image in app
//         console.log('📱 In-app image URL:', data.imageUrl);
//       }
//     });

//   // 🖱 Notification tapped
//   const responseListener =
//     Notifications.addNotificationResponseReceivedListener((response) => {
//       const data = response.notification.request.content.data;
//       console.log("🖱 Notification tapped:", data);

//       // Handle navigation with image/color data
//       if (data?.type === "payment") {
//         navigation?.navigate("Payments", { 
//           notificationData: data,
//           imageUrl: data.imageUrl 
//         });
//       }
//       if (data?.type === "rate_update") {
//         navigation?.navigate("Rates", { 
//           notificationData: data,
//           accentColor: data.accentColor 
//         });
//       }
//       if (data?.type === "promotion" && data?.imageUrl) {
//         navigation?.navigate("PromotionDetails", { 
//           imageUrl: data.imageUrl,
//           promotionId: data.promotionId 
//         });
//       }
//     });

//   return { notificationListener, responseListener };
// }

// /* =====================================================
//    REMOVE LISTENERS
// ===================================================== */
// export function removeNotificationListeners(listeners) {
//   if (listeners?.notificationListener) {
//     Notifications.removeNotificationSubscription(
//       listeners.notificationListener
//     );
//   }
//   if (listeners?.responseListener) {
//     Notifications.removeNotificationSubscription(
//       listeners.responseListener
//     );
//   }
// }

// /* =====================================================
//    HELPER: Get notification data with image
// ===================================================== */
// export function getNotificationImage(notification) {
//   return notification?.request?.content?.data?.imageUrl || null;
// }

// /* =====================================================
//    HELPER: Get notification accent color
// ===================================================== */
// export function getNotificationAccentColor(notification) {
//   return notification?.request?.content?.data?.accentColor || "#FF231F7C";
// }