import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  scale,
  moderateScale,
  COLORS,
  FONTS,
  SIZES,
} from "../../utils/AppTheme";
import styles from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import NotificationService from "../../services/NotificationService"; // Import the service
import AsyncStorage from "@react-native-async-storage/async-storage";

function BottomTab({ screen }) {
  const navigation = useNavigation();
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getIconColor = (currentScreen) => {
    return screen === currentScreen ? COLORS.primary : COLORS.textSecondary;
  };

  const getTextStyle = (currentScreen) => {
    return screen === currentScreen ? styles.activeText : styles.inactiveText;
  };

  // Function to check for unread notifications
  const checkUnreadNotifications = async () => {
    try {
      setIsLoading(true);
      // You need to get the userId from your auth context/store
      // For now, using a default or getting from storage
      // const userId = "66"; // TODO: Get this from your auth context

      const userId = await AsyncStorage.getItem("userId");
      
      const response = await NotificationService.getUnreadCount(userId);
      
      if (response.code === 200) {
        // Check if there are any unread notifications
        const unreadCount = response.data.unreadCount || 0;
        setHasUnread(unreadCount > 0);
      }
    } catch (error) {
      console.error("Error checking unread notifications:", error);
      setHasUnread(false); // Default to false on error
    } finally {
      setIsLoading(false);
    }
  };

  // Check for unread notifications when component mounts
  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkUnreadNotifications();
      
      // Optional: Set up polling to check periodically
      const interval = setInterval(checkUnreadNotifications, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }, [])
  );

  // Also refresh when user navigates to notifications page
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh when any screen with this BottomTab comes into focus
      checkUnreadNotifications();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.footerContainer}>
      {/* Home Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MainLanding")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="home"
          size={SIZES.icon.md}
          color={getIconColor("HOME")}
        />
        <Text style={getTextStyle("HOME")}>Home</Text>
      </TouchableOpacity>

      {/* Schemes Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MyScheme")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="savings"
          size={SIZES.icon.md}
          color={getIconColor("SCHEMES")}
        />
        <Text style={getTextStyle("SCHEMES")}>Schemes</Text>
      </TouchableOpacity>

      {/* Notifications Icon */}
      <TouchableOpacity
        onPress={() => {
          // When user clicks notifications, clear the badge immediately
          setHasUnread(false);
          navigation.navigate("NotificationsPage");
        }}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <View style={styles.notificationIconContainer}>
          <MaterialCommunityIcons
            name="bell"
            size={SIZES.icon.md}
            color={getIconColor("NotificationsPage")}
          />
          {/* Simple red dot badge - no count */}
          {hasUnread && <View style={styles.dotBadge} />}
        </View>
        <Text style={getTextStyle("NotificationsPage")}>Notification</Text>
      </TouchableOpacity>

      {/* Support Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate("HelpCenter")}
        style={styles.footerBtnContainer}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="headset"
          size={SIZES.icon.md}
          color={getIconColor("HelpCenter")}
        />
        <Text style={getTextStyle("HelpCenter")}>Support</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BottomTab;