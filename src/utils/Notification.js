import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../Config/API';

// REGISTER PUSH TOKEN
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Use Real Device", "Push notifications do not work on emulators.");
    return null;
  }

  try {
    let { status } = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow notifications.");
      return null;
    }

    // GET PROJECT ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    console.log("📌 Expo Push Token:", token);

    return token;

  } catch (e) {
    console.log("❌ Notification Error:", e);
    return null;
  }
}

// GENERATE DEVICE ID
async function generateDeviceId() {
  const saved = await AsyncStorage.getItem("deviceId");
  if (saved) return saved;

  const newId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  await AsyncStorage.setItem("deviceId", newId);
  return newId;
}

// SEND WELCOME NOTIFICATION
async function sendWelcome(userId) {
  try {
    await fetch(`${API_BASE_URL}/notifications/sendMessage/6/user/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    console.log("🎉 Welcome notification sent!");
  } catch (e) {
    console.log("❌ Welcome error:", e);
  }
}

// SEND DEVICE TOKEN TO SERVER
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

    console.log("📤 Sending device data:", data);

    const res = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    console.log("📥 Server Response:", text);

    if (res.ok) {
      await sendWelcome(userId);
    }

    return true;
  } catch (err) {
    console.log("❌ Server Error:", err);
    return false;
  }
}
