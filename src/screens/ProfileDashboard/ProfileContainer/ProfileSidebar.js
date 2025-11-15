import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { TextDefault } from "../../../components";
import { COLORS, FONTS } from "../../../utils/Theme";
import { getUserData, clearUserData } from "../../../utils/AsynchStorageHelper";

const { width } = Dimensions.get("window");

const DrawerMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const slideAnim = useState(new Animated.Value(width * 0.8))[0];

  // Fetch user data from AsyncStorage helper
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUserData();
        if (data) setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserDetails();
  }, []);

  // Slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await clearUserData();
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

  const menuItems = [
    { label: "My Scheme", icon: "list", route: "MyScheme" },
    { label: "Help Center", icon: "help-center", route: "HelpCenter" },
    { label: "Privacy Policy", icon: "privacy-tip", route: "PrivacyPolicy" },
    { label: "Terms & Conditions", icon: "description", route: "TermsandCondition" },
    // { label: "Delete Account", icon: "delete", route: "DeleteButton" },
    { label: "About", icon: "info", route: "AboutPage" },
    { label: "FAQ", icon: "support-agent", route: "FAQPage" },
  ];

  const handleMenuItemPress = (route) => {
    onClose();
    navigation.navigate(route);
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.drawerContent}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileCircle}>
                {userData.picture ? (
                  <Image
                    source={{ uri: userData.picture }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                ) : (
                  <MaterialIcons name="account-circle" size={80} color={COLORS.color1} />
                )}
              </View>
              <TextDefault style={styles.welcomeText}>
                Welcome, {userData.username || "User"}
              </TextDefault>
              <TextDefault style={styles.phoneText}>
                {userData.contactNumber || ""}
              </TextDefault>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.route)}
                >
                  <View style={styles.menuItemContent}>
                    <MaterialIcons name={item.icon} size={24} color={COLORS.primary} />
                    <TextDefault style={styles.menuItemText}>{item.label}</TextDefault>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Logout */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={styles.menuItemContent}>
                  <MaterialIcons name="logout" size={24} color={COLORS.primary} />
                  <TextDefault style={styles.menuItemText}>Logout</TextDefault>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)" },
  overlayTouchable: { flex: 1 },
  drawer: { width: width * 0.8, backgroundColor: "#fff", elevation: 16 },
  drawerContent: { flex: 1 },
  profileHeader: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: { fontSize: 20, color: "#333", ...FONTS.heading },
  phoneText: { fontSize: 16, color: "#666", ...FONTS.body1 },
  menuContainer: { flex: 1, paddingTop: 10 },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  menuItemContent: { flexDirection: "row", alignItems: "center" },
  menuItemText: { fontSize: 16, color: "#333", marginLeft: 15, ...FONTS.body1 },
};

export default DrawerMenu;
