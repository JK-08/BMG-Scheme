// components/Header/Header.js
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  ToastAndroid,
  Platform,
  Linking,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import DrawerMenu from "../../screens/ProfileDashboard/ProfileContainer/ProfileSidebar";
import theme from "../../utils/AppTheme";
import styles from "./Styles";
import { API_BASE_URL_OLD } from "../../Config/API";

const { COLORS } = theme;

// ========== Constants ==========
const ANIMATION_DURATION = 2000;
const SILVER_ANIMATION_DELAY = 100;
const API_ENDPOINTS = {
  todayRate: `${API_BASE_URL_OLD}/account/todayrate`,
};

// ========== Helpers ==========
const showToast = (message) => {
  Platform.OS === "android"
    ? ToastAndroid.show(message, ToastAndroid.SHORT)
    : Alert.alert("", message);
};

const getFormattedUpdateTime = () => {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;

  const time = `${formattedHour}:${minutes} ${ampm}`;

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

  const date = `${day}-${month}-${year}`;

  return `${date}  ${time}`;
};

// ========== Custom Hook: Icon Animation ==========
const useIconAnimation = (delay = 0) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      animationValue.setValue(0);
      const animation = Animated.loop(
        Animated.timing(animationValue, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        })
      );
      delay ? setTimeout(() => animation.start(), delay) : animation.start();
      return animation;
    };

    const anim = loopAnimation();
    return () => anim.stop();
  }, [animationValue, delay]);

  return useMemo(() => {
    const rotateY = animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["0deg", "180deg", "360deg"],
    });
    const scale = animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 1],
    });
    const opacity = animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.6, 1],
    });
    return {
      transform: [{ perspective: 1000 }, { rotateY }, { scale }],
      opacity,
    };
  }, [animationValue]);
};

// ========== Header Component ==========
function Header() {
  const navigation = useNavigation();
  const [goldRate, setGoldRate] = useState(null);
  const [silverRate, setSilverRate] = useState(null);
  const [rateUpdated, setRateUpdated] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const dateAnimatedStyle = useIconAnimation(0);
  const silverAnimatedStyle = useIconAnimation(SILVER_ANIMATION_DELAY);



  const toggleDrawer = useCallback(() => {
    setIsDrawerVisible((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => setIsDrawerVisible(false), []);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.todayRate);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGoldRate(data.GOLDRATE);
      setSilverRate(data.SILVERRATE);
      setRateUpdated(getFormattedUpdateTime());
    } catch (err) {
      console.error("❌ Error fetching rates:", err);
      showToast("Failed to fetch rates");
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <LinearGradient
      colors={COLORS.gradient.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerContainer}
    >
      {/* Top Section */}
      <View style={styles.topHeaderSection}>
        {/* FAQ */}
        <TouchableOpacity
          style={styles.faqIconContainer}
          onPress={() => navigation.navigate("NotificationsPage")}
        >
          <MaterialIcons name="notifications" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>

        {/* Drawer Menu */}
        <DrawerMenu isVisible={isDrawerVisible} onClose={closeDrawer} />

        {/* Logo + Company */}
        <View style={styles.mainHeaderSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/BMG-LOGO.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          {/* <View style={styles.companyNameContainer}>
            <Text style={styles.companyName}>BMG JEWELLERS</Text>
            <Text style={styles.companySubtitle}>Pvt Ltd</Text>
          </View> */}
        </View>

        {/* Menu */}
        <TouchableOpacity
          style={styles.menuIconContainer}
          onPress={toggleDrawer}
        >
          <Icon name="menu" size={26} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>
      
      <View>
        <View style={styles.rateCardContainer}>
            <View style={styles.rateTextContainer} onPress={() =>openURL()}>
                <Icon name="event" size={20} color={COLORS.textWhite} />
                <Text style={styles.rateLabel}>Rate Updated on {rateUpdated || "---"} </Text>
            </View>

            {/* <View style={styles.rateIconContainer}>
              <View style={styles.animatedIconContainer}>
                <Icon name="event" size={30} color={COLORS.primary} />
              </View>
            </View> */}
          </View>
      </View>

      {/* === Rate Cards === */}
      <View style={styles.rateCardsOverlayContainer}>
        {/* Silver Rate Card */}
        <LinearGradient
          colors={[COLORS.white, COLORS.white, COLORS.white]}
          style={styles.rateCardOverlay}
        >
          <View style={styles.rateCardContent}>
            {/* LEFT — Silver Coin */}
            <Animated.View
              style={[styles.animatedCoinContainer, silverAnimatedStyle]}
            >
              <Image
                source={require("../../assets/silver.png")}
                style={styles.rateCoinIcon}
                resizeMode="contain"
              />
            </Animated.View>

            {/* RIGHT — Text (Right Aligned) */}
            <View style={styles.rateTextRightAligned}>
              <Text style={styles.rateLabelRight}>Silver Rate</Text>
              <Text style={styles.rateValueRight}>₹{silverRate || "---"}</Text>
              <Text style={styles.rateUnitRight}>per gram</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Date Card */}
        <LinearGradient
          colors={[COLORS.white, COLORS.white, COLORS.white]}
          style={styles.rateCardOverlay}
        >
          <TouchableOpacity style={styles.rateCardContent}  onPress={() => Linking.openURL("https://app.bmgjewellers.com")}>
            

            <View style={styles.rateIconContainer}>
               <MaterialIcons name="shopping-cart" size={25} color={COLORS.primary} />
            </View>
            <View>
               <Text style={styles.shopTitle}>Online Shopping </Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

export default React.memo(Header);
