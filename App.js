import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import FlashMessage from 'react-native-flash-message';

import AppContainer from './src/routes/routes';
import { colors } from './src/utils/colors';
import useFonts from './src/utils/Fonts';


export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load custom fonts
    const loadAppFonts = async () => {
      try {
        await useFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue even if fonts fail
      }
    };
    loadAppFonts();
  }, []);

  useEffect(() => {
    // Listener for when notification is received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification Received:', notification);
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification Tapped:', response);
      // Handle navigation or actions based on notification data
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Or return a loading screen component
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background} 
      />
      <AppContainer />
      
      <FlashMessage position="top" />
    </SafeAreaView>
  );
}
