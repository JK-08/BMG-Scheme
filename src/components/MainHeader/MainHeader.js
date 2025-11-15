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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import DrawerMenu from "../../screens/ProfileDashboard/ProfileContainer/ProfileSidebar";
import { COLORS } from "../../utils/Theme";
import { colors1 } from "../../utils/colors";
import styles from "./Styles";
import { API_BASE_URL_OLD } from "../../Config/API";

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

  return `Rate updated on ${formattedHour}:${minutes} ${ampm} ${day}-${month}-${year}`;
};

// ========== Custom Hook: Coin Animation ==========
const useCoinAnimation = (delay = 0) => {
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
      outputRange: [1, 0.6, 1],
    });
    const opacity = animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.3, 1],
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

  const goldAnimatedStyle = useCoinAnimation(0);
  const silverAnimatedStyle = useCoinAnimation(SILVER_ANIMATION_DELAY);

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
      setRateUpdated(getFormattedUpdateTime(new Date()));
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
      colors={[COLORS.primary1, COLORS.primary2, COLORS.primary3]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.headerContainer1}
    >
      {/* Top Section */}
      <View style={styles.topHeaderSection}>
        {/* FAQ */}
        <TouchableOpacity
          style={styles.faqIconContainer}
          onPress={() => navigation.navigate("HelpCenter")}
        >
          <Icon name="help" size={22} color={colors1.primaryText} />
        </TouchableOpacity>

        {/* Drawer Menu */}
        <DrawerMenu isVisible={isDrawerVisible} onClose={closeDrawer} />

        {/* Logo + Company */}
        <View style={styles.mainHeaderSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/image/logo4.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.companyNameContainer}>
            <Text style={styles.companyName}>BMG JEWELLERS</Text>
            <Text style={styles.companySubtitle}>Pvt Ltd</Text>
          </View>
        </View>

        {/* Menu */}
        <TouchableOpacity
          style={styles.menuIconContainer}
          onPress={toggleDrawer}
        >
          <Icon name="menu" size={26} color={colors1.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Rate Update Timestamp */}
      <View style={styles.rateUpdateContainer}>
        <Text style={styles.updateText}>{getFormattedUpdateTime()}</Text>
      </View>

      {/* Rate Cards */}
      <View style={styles.rateCardsOverlayContainer}>
        {/* Gold */}
        <LinearGradient
          colors={["#fff", "#fff", "#fff"]}
          style={styles.rateCardOverlay}
        >
          <View style={styles.rateCardContent}>
            <View style={styles.rateIconContainer}>
              <Animated.View
                style={[styles.animatedCoinContainer, goldAnimatedStyle]}
              >
                <Image
                  source={require("../../assets/gold.png")}
                  style={styles.rateCoinIcon}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
            <View style={styles.rateTextContainer}>
              <Text style={[styles.rateLabel, styles.goldText]}>Gold Rate</Text>
              <Text style={[styles.rateValue, styles.goldText]}>
                ₹{goldRate || "---"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Silver */}
        <LinearGradient
          colors={["#fff", "#fff", "#fff"]}
          style={styles.rateCardOverlay}
        >
          <View style={styles.rateCardContent}>
            <View style={styles.rateIconContainer}>
              <Animated.View
                style={[styles.animatedCoinContainer, silverAnimatedStyle]}
              >
                <Image
                  source={require("../../assets/silver.png")}
                  style={styles.rateCoinIcon}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
            <View style={styles.rateTextContainer}>
              <Text style={[styles.rateLabel, styles.silverText]}>
                Silver Rate
              </Text>
              <Text style={[styles.rateValue, styles.silverText]}>
                ₹{silverRate || "---"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

export default React.memo(Header);
