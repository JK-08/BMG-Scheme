import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayNotification } from './src/utils/Notification';
import App from './App';

// ── Background FCM handler ────────────────────────────────────────
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[FCM] Background message:', remoteMessage);
  const { notification, data } = remoteMessage;

  // Only show via notifee for data-only messages
  // If notification payload exists, FCM shows it natively (avoid duplicate)
  if (!notification && data?.title) {
    await displayNotification(
      data.title,
      data.body ?? '',
      data,
      data.imageUrl
    );
  }
});

// ── Background notifee handler ────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee] Background press:', detail.notification?.data);
  }
});

registerRootComponent(App);
