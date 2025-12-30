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
  ActivityIndicator,
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
import * as ImagePicker from "expo-image-picker";
import memberPhotoService from "../../../services/UserProfileService";

const { COLORS, SIZES, FONTS, moderateScale } = theme;
const { width } = Dimensions.get("window");

// Add your  base URL here
const IMAGE_BASE_URL = "https://scheme.bmgjewellers.com"; // Replace with your actual  base URL

const DrawerMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [activeRoute, setActiveRoute] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for settings submenu

  // Animated values
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const profileY = useRef(new Animated.Value(20)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(0)).current; // Animation for settings submenu

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
      
      // Close settings submenu when drawer closes
      setShowSettings(false);
    }
  }, [isVisible]);

  // Animate settings submenu
  useEffect(() => {
    Animated.timing(settingsAnim, {
      toValue: showSettings ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Height animation requires non-native driver
    }).start();
  }, [showSettings]);

  /* -------------------------
     PanResponder: swipe-left to close
  ------------------------- */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        const isHorizontal =
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 60;
        return isHorizontal && gesture.dx < 0;
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          const newTranslate = Math.min(width, -gesture.dx);
          slideAnim.setValue(newTranslate);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const closeThreshold = 80;
        if (-gesture.dx > closeThreshold) {
          Animated.timing(slideAnim, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
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
     Image Picker Functions
  ------------------------- */
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need permission to access your photo library to set profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera permission to take a photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    setUploading(true);
    try {
      const image = {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || "image/jpeg",
        fileName: imageAsset.fileName || `profile_${Date.now()}.jpg`,
      };

      console.log("Starting upload with image:", {
        uri: image.uri.substring(0, 50) + "...",
        type: image.type,
        fileName: image.fileName,
      });

      const response = await memberPhotoService.uploadPhoto(image);
      
      console.log("Upload response:", response);

      if (response.photoPath) {
        let fullImageUrl;
        
        if (response.photoPath.startsWith('http')) {
          fullImageUrl = response.photoPath;
        } else if (response.photoPath.startsWith('/')) {
          fullImageUrl = `${IMAGE_BASE_URL}${response.photoPath}`;
        } else {
          fullImageUrl = `${IMAGE_BASE_URL}/uploads/${response.photoPath}`;
        }
        
        console.log("Full image URL:", fullImageUrl);
        
        setUserData(prev => ({ ...prev, picture: fullImageUrl }));
        
        await AsyncStorage.setItem("userProfilePicture", fullImageUrl);
        
        Alert.alert("Success", response.message || "Profile picture updated successfully!");
      } else {
        Alert.alert("Warning", "Upload completed but no photo path returned. Please check with support.");
      }
    } catch (error) {
      console.error("Upload error details:", error);
      Alert.alert(
        "Upload Failed", 
        error.message || "Failed to upload profile picture. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    Alert.alert(
      "Delete Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setUploading(true);
              await memberPhotoService.deletePhoto();
              
              setUserData(prev => ({ ...prev, picture: null }));
              
              await AsyncStorage.removeItem("userProfilePicture");
              
              Alert.alert("Success", "Profile picture removed successfully!");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete profile picture.");
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  const handleProfilePictureUpdate = () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhotoWithCamera,
        },
        {
          text: "Choose from Gallery",
          onPress: pickImageFromGallery,
        },
        ...(userData.picture ? [{
          text: "Remove Current Photo",
          onPress: deleteProfilePicture,
          style: "destructive",
        }] : []),
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

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
      navigation.navigate(route);
    }, 220);
  };

  const handleShareApp = async () => {
    try {
      const url = `https://play.google.com/store/apps/details?id=com.bmg.bmgscheme`;
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
    const androidUrl = `market://details?id=com.bmg.bmgscheme`;
    const webUrl = `https://play.google.com/store/apps/details?id=com.bmg.bmgscheme`;
    try {
      if (Platform.OS === "android") {
        const canOpen = await Linking.canOpenURL(androidUrl);
        if (canOpen) {
          return Linking.openURL(androidUrl);
        }
      }
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        return Linking.openURL(webUrl);
      }
      Alert.alert("Can't open store", "Unable to open the store URL.");
    } catch (err) {
      console.error("RateUs error", err);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  /* -------------------------
     Menu items
  ------------------------- */
  const menuItems = [
    {
      label: "Register MySelf",
      icon: "description",
      route: "UserRegisterForm",
    },
    {
      label: "My Redeemption",
      icon: "card-giftcard",
      route: "SchemeListPage",
    },
    { label: "About", icon: "info", route: "AboutPage" },
    { label: "Privacy Policy", icon: "privacy-tip", route: "PrivacyPolicy" },
    {
      label: "Terms & Conditions",
      icon: "description",
      route: "TermsandCondition",
    },
    { label: "Help Center", icon: "help-center", route: "HelpCenter" },
    { label: "FAQ", icon: "support-agent", route: "FAQPage" },
  ];

  const settingsItems = [
    {
      label: "Update Profile Picture",
      icon: "photo-camera",
      action: handleProfilePictureUpdate,
    },
    {
      label: "Reset MPIN",
      icon: "lock-reset",
      route: "ResetMpin",
    },
    {
      label: "Account Delete",
      icon: "delete",
      route: "DeleteButton",
    },
  ];

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
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
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
                onPress={handleProfilePictureUpdate}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="large" color={COLORS.white} />
                ) : userData.picture ? (
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
                <View style={styles.editProfileIcon}>
                  <MaterialIcons
                    name="edit"
                    size={moderateScale(12)}
                    color={COLORS.white}
                  />
                </View>
              </TouchableOpacity>

              <TextDefault style={styles.welcomeText}>
                Welcome, {userData.username || "User"}
              </TextDefault>
              <TextDefault style={styles.phoneText}>
                {userData.contactNumber || ""}
              </TextDefault>
            </Animated.View>
          </LinearGradient>

          {/* Menu list - Using contentContainerStyle for proper scrolling */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
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

            {/* Settings Item with expandable submenu */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleSettings}
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons
                    name={showSettings ? "settings" : "settings"}
                    size={moderateScale(22)}
                    color={COLORS.textPrimary}
                  />
                  <TextDefault style={styles.menuItemText}>
                    Settings
                  </TextDefault>
                  <MaterialIcons
                    name={showSettings ? "expand-less" : "expand-more"}
                    size={moderateScale(22)}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Settings Submenu */}
              <Animated.View
                style={[
                  styles.submenuContainer,
                  {
                    maxHeight: settingsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 180], // Adjust based on number of items
                    }),
                    opacity: settingsAnim,
                  },
                ]}
              >
                {settingsItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.submenuItem}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.route) {
                        handleMenuNavigate(item.route);
                      }
                    }}
                  >
                    <View style={styles.submenuItemContent}>
                      <MaterialIcons
                        name={item.icon}
                        size={moderateScale(18)}
                        color={COLORS.textPrimary}
                        style={styles.submenuIcon}
                      />
                      <TextDefault style={styles.submenuItemText}>
                        {item.label}
                      </TextDefault>
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>

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

            {/* Footer section inside ScrollView */}
            <View style={styles.footer}>
              <TextDefault style={styles.versionText}>
                Version {Application.nativeApplicationVersion}
              </TextDefault>
              
              {/* Company Branding - Now inside ScrollView */}
              <View style={styles.brandBadge}>
                <Text style={styles.brandLine1}>BrightechSoftware</Text>
                <Text style={styles.brandLine2}>Solutions</Text>
              </View>
            </View>
            
            {/* Extra padding at bottom for safe area */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

/* -------------------------
   Styles
------------------------- */
const styles = {
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#00000066",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: COLORS.surface || COLORS.background || "#fff",
    ...theme.SHADOWS.xl,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.08)",
  },
  drawerContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add padding at bottom
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

  /* Settings Container */
  settingsContainer: {
    // borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },

  /* Submenu Styles */
  submenuContainer: {
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.padding.sm,
  },
  submenuItem: {
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  submenuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SIZES.padding.md,
  },
  submenuIcon: {
    marginRight: SIZES.padding.md,
  },
  submenuItemText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },

  /* Footer */
  footer: {
    marginTop: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xl,
    alignItems: "center",
    position: "relative", // Changed from absolute
  },
  versionText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding.md,
  },
  brandBadge: {
    // backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginLeft: 120
  },
  brandLine1: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.7,
    fontStyle: "italic",
  },
  brandLine2: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#444",
    marginTop: -2,
    opacity: 0.85,
  },
};

export default DrawerMenu;