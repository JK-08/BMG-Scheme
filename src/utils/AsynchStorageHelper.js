// utils/AsyncStorageHelper.js
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save full user details to AsyncStorage (unified structure for all logins)
 */
export const saveUserData = async (data) => {
  try {
    const {
      token,
      id,
      email,
      username,
      picture,
      message,
      status,
      contactNumber,
       contact, // added for normal login
    } = data;

     const finalContact = contactNumber || contact || "";

    await AsyncStorage.multiSet([
      ["authToken", token || ""],
      ["userId", String(id || "")],
      ["userEmail", email || ""],
      ["username", username || ""],
      ["userPicture", picture || ""],
      ["userStatus", status || ""],
      ["userMessage", message || ""],
      ["userPhoneNumber", finalContact || ""],
      ["userData", JSON.stringify(data)],
      ["isLoggedIn", "true"],
    ]);

    console.log("✅ User data saved successfully to AsyncStorage", data);
  } catch (error) {
    console.error("❌ Error saving user data:", error);
  }
};

/**
 * Get full user details from AsyncStorage
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return null;
  }
};

/**
 * Clear all user-related data from AsyncStorage
 */
export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove([
      "authToken",
      "userId",
      "userEmail",
      "username",
      "userPicture",
      "userStatus",
      "userMessage",
      "userPhoneNumber",
      "userData",
      "isLoggedIn",
    ]);
    console.log("🧹 User data cleared from AsyncStorage");
  } catch (error) {
    console.error("❌ Error clearing user data:", error);
  }
};

/**
 * Get stored auth token (for API requests)
 */
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("❌ Error getting auth token:", error);
    return null;
  }
};
