// utils/AsyncStorageHelper.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: "userData",
  AUTH_TOKEN: "authToken",
  USER_ID: "userId",
  USER_EMAIL: "userEmail",
  USERNAME: "username",
  USER_PHONE: "userPhoneNumber",
  IS_LOGGED_IN: "isLoggedIn",
};

/**
 * Save user data with token preservation
 */
export const saveUserData = async (data) => {
  try {
    if (!data) return;

    // Always store token separately for safety
    if (data.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    }

    // Store complete user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));

    // Store individual fields for quick access
    const updatePromises = [];
    
    if (data.id) {
      updatePromises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_ID, String(data.id)));
    }
    if (data.email) {
      updatePromises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.email));
    }
    if (data.username) {
      updatePromises.push(AsyncStorage.setItem(STORAGE_KEYS.USERNAME, data.username));
    }
    if (data.contactNumber) {
      updatePromises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE, data.contactNumber));
    }
    
    updatePromises.push(AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true"));

    await Promise.all(updatePromises);

    console.log("✅ User data saved successfully");
    return data;
  } catch (error) {
    console.error("❌ Error saving user data:", error);
    throw error;
  }
};

/**
 * Update user profile data without affecting authentication fields
 */
export const updateUserProfile = async (profileData) => {
  try {
    if (!profileData || Object.keys(profileData).length === 0) {
      return null;
    }

    // Get existing user data
    const existingData = await getUserData();
    
    if (!existingData) {
      // No existing data, save as new
      return await saveUserData(profileData);
    }

    // Define fields that should NEVER be overwritten during profile updates
    const PROTECTED_FIELDS = [
      'token',
      'referralCode', 
      'referralLink',
      'playStoreLink',
      'password',
      'usedReferralCode'
    ];

    // Create safe update object by filtering out protected fields
    const safeProfileData = { ...profileData };
    PROTECTED_FIELDS.forEach(field => {
      delete safeProfileData[field];
    });

    // Merge with existing data while preserving token
    const mergedData = {
      ...existingData,
      ...safeProfileData,
      // CRITICAL: Ensure token is never removed
      token: existingData.token,
    };

    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mergedData));

    console.log("✅ User profile updated safely:", {
      hasToken: !!mergedData.token,
      userId: mergedData.id,
      updatedFields: Object.keys(safeProfileData)
    });

    return mergedData;
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update complete user data (for login scenarios)
 */
export const updateUserData = async (updates) => {
  try {
    if (!updates) return null;

    // For complete updates, merge everything
    const existingData = await getUserData();
    
    if (!existingData) {
      return await saveUserData(updates);
    }

    const mergedData = {
      ...existingData,
      ...updates,
      // Only update token if explicitly provided
      token: updates.token || existingData.token,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mergedData));
    
    return mergedData;
  } catch (error) {
    console.error("❌ Error updating user data:", error);
    throw error;
  }
};

/**
 * Get complete user data
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return null;
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = async () => {
  try {
    // Priority 1: Get from dedicated authToken storage
    let token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      return token;
    }

    // Priority 2: Get from userData
    const userData = await getUserData();
    if (userData?.token) {
      // Restore to dedicated storage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, userData.token);
      return userData.token;
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting auth token:", error);
    return null;
  }
};

/**
 * Update only the auth token
 */
export const updateAuthToken = async (token) => {
  try {
    if (!token) return;

    // Update in dedicated storage
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    
    // Also update in userData
    const existingData = await getUserData();
    if (existingData) {
      existingData.token = token;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(existingData));
    }
    
    console.log("✅ Auth token updated");
  } catch (error) {
    console.error("❌ Error updating auth token:", error);
  }
};

/**
 * Clear all user data
 */
export const clearUserData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log("🧹 All user data cleared");
  } catch (error) {
    console.error("❌ Error clearing user data:", error);
  }
};

/**
 * Debug function to check token status
 */
export const verifyTokenStatus = async () => {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    
    return {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasUserData: !!userData,
      userId: userData?.id,
      userDataKeys: userData ? Object.keys(userData) : []
    };
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return { hasToken: false, token: null };
  }
};