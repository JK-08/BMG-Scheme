// components/Header/Header.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ToastAndroid,
  Platform,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import DrawerMenu from "../../screens/ProfileDashboard/ProfileContainer/ProfileSidebar";
import theme from "../../utils/AppTheme";
import styles from "./Styles";
import { API_BASE_URL_OLD } from "../../Config/API";
import NotificationService from "../../services/NotificationService";
import { Modal } from "react-native";
import { WebView } from "react-native-webview";
import CommonHeader from "../CommonHeader/CommonHeader";

const { COLORS } = theme;
const ANIMATION_DURATION = 2000;
const SILVER_ANIMATION_DELAY = 100;

const API_ENDPOINTS = {
  todayRate: `${API_BASE_URL_OLD}/account/todayrate`,
};

// ========== Helpers ==========
const showToast = (message) => {
  Platform.OS === "android"
    ? ToastAndroid.show(message, ToastAndroid.SHORT)
    : alert(message);
};

const getFormattedUpdateTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;

  const day = now.getDate().toString().padStart(2, "0");
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  return `${day}-${month}-${year} ${formattedHour}:${minutes} ${ampm}`;
};

// ========== Icon Animation ==========
const useIconAnimation = (delay = 0) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animationValue, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      })
    );

    const timer = delay
      ? setTimeout(() => animation.start(), delay)
      : animation.start();
    return () => {
      animation.stop();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return {
    transform: [
      { perspective: 1000 },
      {
        rotateY: animationValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ["0deg", "180deg", "360deg"],
        }),
      },
      {
        scale: animationValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.8, 1],
        }),
      },
    ],
    opacity: animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.6, 1],
    }),
  };
};

// ========== Header ==========
function Header() {
  const navigation = useNavigation();
  const [goldRate, setGoldRate] = useState(null);
  const [silverRate, setSilverRate] = useState(null);
  const [rateUpdated, setRateUpdated] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showShopWebView, setShowShopWebView] = useState(false);

  const silverAnimatedStyle = useIconAnimation(SILVER_ANIMATION_DELAY);
  const toggleDrawer = useCallback(
    () => setIsDrawerVisible((prev) => !prev),
    []
  );

  // ========== Fetch Rates ==========
  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.todayRate);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGoldRate(data.GOLDRATE);
      setSilverRate(data.SILVERRATE);
      setRateUpdated(getFormattedUpdateTime());
    } catch {
      showToast("Failed to fetch rates");
    }
  }, []);

  // ========== Fetch Unread Notifications ==========
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const result = await NotificationService.getUnreadCount(userId);
      setUnreadCount(result.code === 200 ? result.data.unreadCount || 0 : 0);
    } catch {
      // optional: ignore or log
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRates();
    fetchUnreadNotifications();

    // Intervals
    const rateInterval = setInterval(fetchRates, 20000); // every 20s
    const notifInterval = setInterval(fetchUnreadNotifications, 1000); // every 1s

    return () => {
      clearInterval(rateInterval);
      clearInterval(notifInterval);
    };
  }, [fetchRates, fetchUnreadNotifications]);

  return (
    <LinearGradient
      colors={COLORS.gradient.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerContainer}
    >
      {/* Top Header */}
      <View style={styles.topHeaderSection}>
        {/* Notifications */}
        <TouchableOpacity
          style={styles.faqIconContainer}
          onPress={() => navigation.navigate("NotificationsPage")}
        >
          <View>
            <MaterialIcons
              name={unreadCount > 0 ? "notifications" : "notifications-none"}
              size={28}
              color={COLORS.textWhite}
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Drawer Menu */}
        <DrawerMenu
          isVisible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
        />

        {/* Logo */}
        <View style={styles.mainHeaderSection}>
          <Image
            source={require("../../assets/BMG-LOGO.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuIconContainer}
          onPress={toggleDrawer}
        >
          <Icon name="menu" size={26} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Rate Updated */}
      <View style={styles.rateCardContainer}>
        <View style={styles.rateTextContainer}>
          <Icon name="event" size={20} color={COLORS.textWhite} />
          <Text style={styles.rateLabel}>Rate Updated on {rateUpdated}</Text>
        </View>
      </View>

      {/* Floating Rate Cards */}
      <View style={styles.rateCardsOverlayContainer}>
        {/* Silver Rate */}
        <LinearGradient
          colors={[COLORS.white, COLORS.white]}
          style={styles.rateCardOverlay}
        >
          <View style={styles.rateCardContent}>
            <Animated.View
              style={[styles.animatedCoinContainer, silverAnimatedStyle]}
            >
              <Image
                source={require("../../assets/silver.png")}
                style={styles.rateCoinIcon}
                resizeMode="contain"
              />
            </Animated.View>
            <View style={styles.rateTextRightAligned}>
              <Text style={styles.rateLabelRight}>Silver Rate</Text>
              <Text style={styles.rateValueRight}>₹{silverRate || "---"}</Text>
              <Text style={styles.rateUnitRight}>per gram</Text>
            </View>
          </View>
        </LinearGradient>
       <Modal
  visible={showShopWebView}
  animationType="slide"
  onRequestClose={() => setShowShopWebView(false)}
>
  <View style={{ flex: 1 }}>
    <CommonHeader
      title="Online Shopping"
      onBackPress={() => setShowShopWebView(false)}
    />

    <WebView
      source={{ uri: "https://bmgjewellers.com" }}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
    />
  </View>
</Modal>


        {/* Shopping Card */}
        <LinearGradient
          colors={[COLORS.white, COLORS.white]}
          style={styles.rateCardOverlay}
        >
          <TouchableOpacity
            style={styles.rateCardContent}
            onPress={() => setShowShopWebView(true)}
          >
            <View style={styles.rateIconContainer}>
              <MaterialIcons
                name="shopping-cart"
                size={32}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.shopTitle}>Online {"\n"}Shopping</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

export default React.memo(Header);
