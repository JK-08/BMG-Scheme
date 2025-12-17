// DrawerMenu.js
import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Image,
  PanResponder,
  Share,
  Linking,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TextDefault } from "../../../components";
import theme from "../../../utils/AppTheme";
import {
  getUserData,
  clearUserData,
  saveUserData,
} from "../../../utils/AsynchStorageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { checkForUpdate } from "../../../utils/VersionChecker";
import { SafeAreaView } from "react-native-safe-area-context";

const { COLORS, SIZES, FONTS, moderateScale } = theme;
const { width } = Dimensions.get("window");

// Change this to your real version if you want:
const APP_VERSION = "1.0.0";
const appVersion1 = Application.nativeApplicationVersion;
const appVersion = Constants.expoConfig.version;
// Play Store package (from you)
const PLAY_STORE_PACKAGE = "com.bmg.bmgscheme";

const DrawerMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [activeRoute, setActiveRoute] = useState(null);

  // Animated values
  const slideAnim = useRef(new Animated.Value(width)).current; // translateX
  const fadeAnim = useRef(new Animated.Value(0)).current; // overlay opacity
  const profileY = useRef(new Animated.Value(20)).current; // profile slide up
  const profileOpacity = useRef(new Animated.Value(0)).current;

  /* -------------------------
     Fetch stored user + profile picture
  ------------------------- */
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUserData();
        if (data) {
          setUserData(data);
          const storedProfilePic = await AsyncStorage.getItem(
            "userProfilePicture"
          );
          if (storedProfilePic && !data.picture) {
            setUserData((prev) => ({ ...prev, picture: storedProfilePic }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserDetails();
  }, []);

  /* Save profile picture when changed */
  useEffect(() => {
    if (!userData.picture) return;
    AsyncStorage.setItem("userProfilePicture", userData.picture).catch((err) =>
      console.error("Profile picture store error:", err)
    );
  }, [userData.picture]);

  useEffect(() => {
    const verifyVersion = async () => {
      const result = await checkForUpdate("com.bmg.bmgscheme");

      if (result.isUpdateAvailable) {
        Alert.alert(
          "Update Available",
          `A new version (${result.storeVersion}) is available on the Play Store.`,
          [
            {
              text: "Update Now",
              onPress: () => {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.bmg.bmgscheme"
                );
              },
            },
            { text: "Later", style: "cancel" },
          ]
        );
      }
    };

    verifyVersion();
  }, []);

  /* -------------------------
     Open / Close animations
  ------------------------- */
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.stagger(70, [
          Animated.parallel([
            Animated.timing(profileY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(profileOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  /* -------------------------
     PanResponder: swipe-left to close
     Because drawer is anchored to right:
       - when open: translateX = 0
       - when closed: translateX = width (off-screen right)
     On left-swipe gesture.dx will be negative -> -gesture.dx positive
  ------------------------- */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // only when horizontal significant movement
        const isHorizontal =
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 60;
        // only respond when user swipes left (dx < 0)
        return isHorizontal && gesture.dx < 0;
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          // use positive value for translateX
          const newTranslate = Math.min(width, -gesture.dx);
          slideAnim.setValue(newTranslate);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const closeThreshold = 80; // px
        if (-gesture.dx > closeThreshold) {
          // animate off-screen then call onClose
          Animated.timing(slideAnim, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          // restore to open (0)
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /* -------------------------
     Utility handlers
  ------------------------- */
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await clearUserData();
            await AsyncStorage.removeItem("userProfilePicture");
            onClose();
            navigation.replace("LoginPage");
          } catch (error) {
            console.error("Logout error:", error);
            onClose();
            navigation.replace("LoginPage");
          }
        },
      },
    ]);
  };

  const handleMenuNavigate = (route) => {
    setActiveRoute(route);
    onClose();
    setTimeout(() => {
      // small timeout so drawer closes smooth before navigate
      navigation.navigate(route);
    }, 220);
  };

  const handleProfilePictureUpdate = () => {
    Alert.alert("Update Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => {
          console.log("Open camera (implement)");
        },
      },
      {
        text: "Choose from Gallery",
        onPress: () => {
          console.log("Open gallery (implement)");
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleShareApp = async () => {
    try {
      const url = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;
      await Share.share({
        message: `Check out this app: ${url}`,
        url,
        title: "Share App",
      });
    } catch (error) {
      console.error("Share error", error);
    }
  };

  const handleRateUs = async () => {
    const androidUrl = `market://details?id=${PLAY_STORE_PACKAGE}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;
    try {
      if (Platform.OS === "android") {
        const canOpen = await Linking.canOpenURL(androidUrl);
        if (canOpen) {
          return Linking.openURL(androidUrl);
        }
      }
      // Fallback to web URL (works on iOS & web)
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        return Linking.openURL(webUrl);
      }
      Alert.alert("Can't open store", "Unable to open the store URL.");
    } catch (err) {
      console.error("RateUs error", err);
    }
  };

  /* -------------------------
     Menu items
  ------------------------- */
  const menuItems = [
    { label: "About", icon: "info", route: "AboutPage" },
    { label: "FAQ", icon: "support-agent", route: "FAQPage" },
    { label: "Reset MPIN", icon: "settings", route: "ResetMpin" },
    { label: "Help Center", icon: "help-center", route: "HelpCenter" },
    { label: "Privacy Policy", icon: "privacy-tip", route: "PrivacyPolicy" },
    {
      label: "Terms & Conditions",
      icon: "description",
      route: "TermsandCondition",
    },
    {
      label: "Account Delete",
      icon: "delete",
      route: "DeleteButton",
    },
    
  ];

  /* -------------------------
     Small helpers for styles
  ------------------------- */
  const isActive = (route) => activeRoute === route;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Fade overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* touchable area to close when tapping outside */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer (right-side). translateX from 0 (open) -> width (closed/off-screen) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.drawerContent}>
          {/* Header with gradient */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={[1, 0]}
            end={[0, 1]}
            style={styles.headerContainer}
          >
            <View style={styles.headerTopRow}>
              {/* Close arrow */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityLabel="Close drawer"
              >
                <MaterialIcons
                  name="chevron-right"
                  size={moderateScale(28)}
                  color={COLORS.white}
                />
              </Pressable>

              {/* optional place for app logo or icon */}
              {/* <View style={styles.appBadge}>
                <MaterialIcons
                  name="diamond"
                  size={moderateScale(22)}
                  color={COLORS.white}
                />
              </View> */}
            </View>

            {/* Animated profile block */}
            <Animated.View
              style={[
                styles.profileHeader,
                {
                  transform: [{ translateY: profileY }],
                  opacity: profileOpacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.profileCircle}
                // onPress={handleProfilePictureUpdate}
              >
                {userData.picture ? (
                  <Image
                    source={{ uri: userData.picture }}
                    style={styles.profileImage}
                  />
                ) : (
                  <MaterialIcons
                    name="account-circle"
                    size={moderateScale(80)}
                    color={COLORS.white}
                  />
                )}
                {/* <View style={styles.editProfileIcon}>
                  <MaterialIcons
                    name="edit"
                    size={moderateScale(12)}
                    color={COLORS.white}
                  />
                </View> */}
              </TouchableOpacity>

              <TextDefault style={styles.welcomeText}>
                Welcome, {userData.username || "User"}
              </TextDefault>
              <TextDefault style={styles.phoneText}>
                {userData.contactNumber || ""}
              </TextDefault>
            </Animated.View>
          </LinearGradient>

          {/* Menu list */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => handleMenuNavigate(item.route)}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialIcons
                      name={item.icon}
                      size={moderateScale(22)}
                      color={active ? COLORS.primary : COLORS.textPrimary}
                    />
                    <TextDefault
                      style={[
                        styles.menuItemText,
                        active && { color: COLORS.primary },
                      ]}
                    >
                      {item.label}
                    </TextDefault>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Divider-ish spacing */}
            <View style={{ height: 8 }} />

            {/* Extra Actions */}
            <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
              <View style={styles.menuItemContent}>
                <MaterialIcons
                  name="share"
                  size={moderateScale(22)}
                  color={COLORS.textPrimary}
                />
                <TextDefault style={styles.menuItemText}>Share App</TextDefault>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRateUs}>
              <View style={styles.menuItemContent}>
                <MaterialIcons
                  name="star-rate"
                  size={moderateScale(22)}
                  color={COLORS.textPrimary}
                />
                <TextDefault style={styles.menuItemText}>Rate Us</TextDefault>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemContent}>
                <MaterialIcons
                  name="logout"
                  size={moderateScale(22)}
                  color={COLORS.error}
                />
                <TextDefault
                  style={[styles.menuItemText, { color: COLORS.error }]}
                >
                  Logout
                </TextDefault>
              </View>
            </TouchableOpacity>

            {/* Footer / version */}
            <TextDefault
              style={{
                textAlign: "center",
                marginTop: 10,
                marginBottom: 20,
                color: COLORS.textSecondary,
              }}
            >
              Version {Application.nativeApplicationVersion}
            </TextDefault>
            {/* Company Branding */}
            <View style={styles.brandBadge}>
              <Text style={styles.brandLine1}>BrightechSoftware</Text>
              <Text style={styles.brandLine2}>Solutions</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

/* -------------------------
   Styles (object)
------------------------- */
const styles = {
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#00000066", // dim overlay (glass style)
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    // glass-like panel via opacity (NO blur)
    backgroundColor: COLORS.surface || COLORS.background || "#fff",
    ...theme.SHADOWS.xl,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.08)",
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "transparent", // header uses gradient, rest inherits the drawer background
  },

  /* Header */
  headerContainer: {
    paddingBottom: SIZES.padding.md,
    paddingTop: SIZES.padding.sm,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
  },
  closeButton: {
    padding: 6,
    marginLeft: -6,
  },
  appBadge: {
    padding: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Profile area */
  profileHeader: {
    paddingHorizontal: SIZES.padding.lg,
    alignItems: "center",
    marginTop: SIZES.padding.sm,
  },
  profileCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
    ...theme.SHADOWS.md,
  },
  profileImage: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
  },
  editProfileIcon: {
    position: "absolute",
    bottom: moderateScale(6),
    right: moderateScale(6),
    backgroundColor: COLORS.primary,
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  welcomeText: {
    ...FONTS.h5,
    color: COLORS.white || COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.xs,
  },
  phoneText: {
    ...FONTS.body,
    color: "rgba(255,255,255,0.9)",
  },

  /* Menu */
  menuContainer: {
    flex: 1,
    paddingTop: SIZES.padding.md,
    backgroundColor: "transparent",
  },
  menuItem: {
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    backgroundColor: "transparent",
  },
  menuItemActive: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
    marginLeft: SIZES.padding.md,
    flex: 1,
  },

  /* Footer */
  footer: {
    paddingVertical: SIZES.padding.lg,
    alignItems: "center",
  },
  brandBadge: {
    position: "absolute",
    right: 14,
    bottom: -42,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: "flex-end",
    justifyContent: "center",

    // Subtle glass shadow
    shadowColor: "rgba(255, 255, 255, 0.7)",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    backdropFilter: "blur(4px)", // works on native iOS
  },

  brandLine1: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.7,
    fontStyle: "italic",
  },

  brandLine2: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#444",
    marginTop: -2,
    opacity: 0.85,
  },
};

export default DrawerMenu;
