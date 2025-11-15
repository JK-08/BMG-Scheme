import { Platform, ToastAndroid, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Toast function for iOS
export const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

// Common logout function to clear all user data
export const handleCompleteLogout = async (navigation) => {
  try {
    // Clear all authentication related data
    await AsyncStorage.multiRemove([
      "mpin",
      "isMpinCreated",
      "isOtpVerified",
      "userToken",
      "userData",
      "userId",
      "userProfile",
      "loginCredentials",
      "rememberMe",
    ]);

    showToast("Logged out successfully");
    // Navigate to login page
    navigation.replace("LoginPage");
  } catch (error) {
    console.error("Error during logout:", error);
    showToast("Error during logout. Please try again.");
  }
};

// Common reset MPIN function
export const handleResetMpin = async (navigation) => {
  Alert.alert(
    "Reset MPIN",
    "Are you sure you want to reset your MPIN? This will log you out and you'll need to login again.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => handleCompleteLogout(navigation),
      },
    ]
  );
};

// Forgot MPIN function with API integration
// export const handleForgotMpin = async (navigation) => {
//   Alert.alert(
//     "Forgot MPIN?",
//     "Do you want to reset your MPIN? You'll need to create a new one.",
//     [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Reset MPIN",
//         style: "destructive",
//         onPress: () => navigateToCreateMpin(navigation),
//       },
//     ]
//   );
// };

export const navigateToCreateMpin = (navigation) => {
  // Clear MPIN related data and navigate to create MPIN screen
  AsyncStorage.multiRemove(["mpin", "isMpinCreated"])
    .then(() => {
      navigation.replace("MpinScreen");
    })
    .catch(error => {
      console.error("Error clearing MPIN data:", error);
      showToast("Error resetting MPIN. Please try again.");
    });
};

// Weak MPIN validation
export const checkWeakMpin = (enteredMpin) => {
  const weakPatterns = [
    /^(\d)\1{3}$/, // All same digits (1111, 2222, etc.)
    /^1234$/, // Sequential ascending
    /^4321$/, // Sequential descending
    /^0000$/, // Common default
    /^2580$/, // Vertical line
    /^0852$/, // Vertical line reverse
  ];

  return weakPatterns.some((pattern) => pattern.test(enteredMpin));
};