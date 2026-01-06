// utils/AsyncStorageHelper.js
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save user data from login response with specific key names
 */
export const saveUserData = async (data) => {
  try {
    if (!data) return;

    const token = data.token || "";
    const id = data.id || "";
    const email = data.email || "";
    const username = data.username || "";
    const contactNumber = data.contactNumber || "";
    
    // For fields that might not be in your login response
    const picture = data.picture || data.profilePicture || "";
    const status = data.status || "";
    const message = data.message || "";
    
    // Use contactNumber as finalContact
    const finalContact = contactNumber;

    // Store all data using multiSet with your exact key names
    await AsyncStorage.multiSet([
      ["authToken", token],
      ["userId", String(id)],
      ["userEmail", email],
      ["username", username],
      ["userPicture", picture],
      ["userStatus", status],
      ["userMessage", message],
      ["userPhoneNumber", finalContact],
      ["userData", JSON.stringify(data)],
      ["isLoggedIn", "true"],
    ]);

    console.log("✅ User data saved successfully:", {
      userId: id,
      username,
      email,
      phoneNumber: finalContact,
      hasToken: !!token,
    });

    return data;
  } catch (error) {
    console.error("❌ Error saving user data:", error);
    throw error;
  }
};

/**
 * Update user data while preserving the token
 */
export const updateUserData = async (updates) => {
  try {
    if (!updates || Object.keys(updates).length === 0) {
      return null;
    }

    // Get existing data
    const existingData = await getUserData();

    if (!existingData) {
      // No existing data, save as new
      return await saveUserData(updates);
    }

    // IMPORTANT: Never allow token to be removed
    const token = existingData.token || (await getAuthToken());

    // Merge updates with existing data
    const mergedData = {
      ...existingData,
      ...updates,
      token: token, // Always preserve token
    };

    // Save merged data
    await AsyncStorage.setItem("userData", JSON.stringify(mergedData));

    // Also update individual fields if they exist in updates
    const updatePromises = [];
    
    if (updates.token !== undefined) {
      updatePromises.push(AsyncStorage.setItem("authToken", updates.token));
    }
    if (updates.id !== undefined) {
      updatePromises.push(AsyncStorage.setItem("userId", String(updates.id)));
    }
    if (updates.email !== undefined) {
      updatePromises.push(AsyncStorage.setItem("userEmail", updates.email));
    }
    if (updates.username !== undefined) {
      updatePromises.push(AsyncStorage.setItem("username", updates.username));
    }
    if (updates.picture !== undefined || updates.profilePicture !== undefined) {
      const picture = updates.picture || updates.profilePicture || "";
      updatePromises.push(AsyncStorage.setItem("userPicture", picture));
    }
    if (updates.status !== undefined) {
      updatePromises.push(AsyncStorage.setItem("userStatus", updates.status));
    }
    if (updates.message !== undefined) {
      updatePromises.push(AsyncStorage.setItem("userMessage", updates.message));
    }
    if (updates.contactNumber !== undefined) {
      updatePromises.push(AsyncStorage.setItem("userPhoneNumber", updates.contactNumber));
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    console.log("✅ User data updated:", {
      hasToken: !!mergedData.token,
      userId: mergedData.id,
      updatedFields: Object.keys(updates),
    });

    return mergedData;
  } catch (error) {
    console.error("❌ Error updating user data:", error);
    throw error;
  }
};

/**
 * Safely update user profile without affecting authentication data
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Define authentication fields that should NEVER be overwritten
    const PROTECTED_FIELDS = ['token', 'referralCode', 'referralLink', 'playStoreLink', 'password', 'usedReferralCode'];
    
    // Filter out protected fields from profile updates
    const safeProfileData = Object.keys(profileData).reduce((acc, key) => {
      if (!PROTECTED_FIELDS.includes(key)) {
        acc[key] = profileData[key];
      }
      return acc;
    }, {});

    // Update with safe data
    return await updateUserData(safeProfileData);
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get full user data from storage
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
 * Get auth token - checks multiple sources
 */
export const getAuthToken = async () => {
  try {
    // First check dedicated auth token storage
    let token = await AsyncStorage.getItem("authToken");
    
    if (token) {
      return token;
    }

    // Fallback to user data
    const userData = await getUserData();
    if (userData?.token) {
      // Restore to dedicated storage for consistency
      await AsyncStorage.setItem("authToken", userData.token);
      return userData.token;
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting auth token:", error);
    return null;
  }
};

/**
 * Get specific user field
 */
export const getUserField = async (fieldName) => {
  try {
    switch(fieldName) {
      case 'token':
        return await AsyncStorage.getItem("authToken");
      case 'id':
        return await AsyncStorage.getItem("userId");
      case 'email':
        return await AsyncStorage.getItem("userEmail");
      case 'username':
        return await AsyncStorage.getItem("username");
      case 'phoneNumber':
        return await AsyncStorage.getItem("userPhoneNumber");
      case 'picture':
        return await AsyncStorage.getItem("userPicture");
      case 'status':
        return await AsyncStorage.getItem("userStatus");
      case 'message':
        return await AsyncStorage.getItem("userMessage");
      case 'isLoggedIn':
        return await AsyncStorage.getItem("isLoggedIn");
      default:
        const userData = await getUserData();
        return userData?.[fieldName] || null;
    }
  } catch (error) {
    console.error(`❌ Error getting ${fieldName}:`, error);
    return null;
  }
};

/**
 * Clear all user data
 */
export const clearUserData = async () => {
  try {
    const keys = [
      "authToken", "userId", "userEmail", "username", 
      "userPicture", "userStatus", "userMessage", 
      "userPhoneNumber", "userData", "isLoggedIn"
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log("🧹 All user data cleared");
  } catch (error) {
    console.error("❌ Error clearing user data:", error);
  }
};

/**
 * Verify token exists and is valid
 */
export const verifyToken = async () => {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
    
    console.log("🔐 Token verification:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasUserData: !!userData,
      userId: userData?.id,
      isLoggedIn: isLoggedIn === "true",
    });

    return {
      hasToken: !!token,
      token: token,
      userData: userData,
      isLoggedIn: isLoggedIn === "true"
    };
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return { hasToken: false, token: null, userData: null, isLoggedIn: false };
  }
};

/**
 * Update auth token
 */
export const updateAuthToken = async (token) => {
  try {
    if (!token) {
      console.warn("⚠️ No token provided for restoration");
      return false;
    }
    
    await AsyncStorage.setItem("authToken", token);
    
    // Also ensure it's in user data
    const userData = await getUserData();
    if (userData) {
      userData.token = token;
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    }
    
    console.log("🔐 Token restored successfully");
    return true;
  } catch (error) {
    console.error("❌ Error restoring token:", error);
    return false;
  }
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = async () => {
  try {
    const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
    const token = await getAuthToken();
    
    return isLoggedIn === "true" && !!token;
  } catch (error) {
    console.error("❌ Error checking login status:", error);
    return false;
  }
};