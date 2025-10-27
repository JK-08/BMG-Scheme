// utils/pushNotifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../Config/API';

// Configure notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for push notifications and get Expo Push Token
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert(
      'Physical Device Required',
      'Push notifications only work on physical devices.'
    );
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Push notification permissions are required.'
      );
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.projectId;

    if (!projectId) {
      console.error('❌ Project ID not found in app configuration');
      Alert.alert(
        'Configuration Error',
        'Push notifications are not properly configured.'
      );
      return null;
    }

    console.log('🔧 Using Project ID:', projectId);

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    console.log('✅ Expo Push Token:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    Alert.alert('Error', 'Failed to register for push notifications');
    return null;
  }
}

/**
 * Generate a unique device ID
 */
async function generateDeviceId() {
  try {
    const storedDeviceId = await AsyncStorage.getItem('deviceId');
    if (storedDeviceId) return storedDeviceId;

    const newDeviceId = `mobile-${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('deviceId', newDeviceId);
    return newDeviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    return `mobile-${Date.now()}-fallback`;
  }
}

/**
 * Send a welcome notification after registration
 */
async function sendWelcomeNotification(userId) {
  try {
    console.log('🎉 Sending welcome notification for user:', userId);

    // Make API call with only userId in the URL, no body data
    const response = await fetch(`${API_BASE_URL}/notifications/sendMessage/6/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No body data sent
    });

    const result = await response.text();
    console.log('🔔 Welcome notification response:', result);
    
    if (response.ok) {
      console.log('✅ Welcome notification sent successfully');
    } else {
      console.error('❌ Failed to send welcome notification');
    }
  } catch (error) {
    console.error('❌ Error sending welcome notification:', error);
  }
}

/**
 * Send Expo push token to server and trigger welcome notification
 */
export async function sendPushTokenToServer(expoToken, userId) {
  try {
    console.log('📤 Sending push token to server:', { expoToken, userId });

    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      console.error('❌ No auth token found in AsyncStorage');
      return false;
    }

    const deviceData = {
      deviceId: await generateDeviceId(),
      deviceType: 'mobile',
      expoToken,
      fcmToken: '',
      userId: userId,
    };

    console.log('📱 Device registration data:', deviceData);
    console.log('🔑 Auth Token:', authToken);

    const response = await fetch(`${API_BASE_URL}/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });

    const responseData = await response.text();
    console.log('🔔 Device registration response:', responseData);

    if (response.ok && responseData.toLowerCase().includes('success')) {
      console.log('✅ Device registered successfully with server');

      // Send welcome notification after successful registration
      await sendWelcomeNotification(userId);
      return true;
    } else {
      console.error('❌ Failed to register device with server:', responseData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending push token to server:', error);
    return false;
  }
}