import { API_BASE_URL_OLD,API_BASE_URL } from "../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --------------------------------------------------------
// 1️⃣ Get Referral Details (existing function)
// --------------------------------------------------------
export const getReferralDetails = async () => {
  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await fetch(`${API_BASE_URL_OLD}/account/referrals/${userId}`);

    if (!response.ok) {
      return {
        success: false,
        message: "Network error occurred",
      };
    }

    const data = await response.json();
    console.log("Referral Details Data:", data.length);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Referral fetch error:", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

// --------------------------------------------------------
// 2️⃣ Check Applied Referral Status (NEW FUNCTION)
// --------------------------------------------------------
export const getAppliedReferralStatus = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in",
        hasAppliedReferral: false,
      };
    }

    // Fetch applied referral logs
    const response = await fetch(
      `${API_BASE_URL}/referral/logs/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    console.log("Applied referral status response:", response.status);

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch referral status",
        hasAppliedReferral: false,
      };
    }

    const data = await response.json();
    console.log("Applied referral data:", data);

    // Check if user has applied any referral code
    const hasAppliedReferral = Array.isArray(data) && data.length > 0;
    
    return {
      success: true,
      hasAppliedReferral: hasAppliedReferral,
      appliedReferralData: hasAppliedReferral ? data[0] : null,
      message: hasAppliedReferral 
        ? "Referral code already applied" 
        : "No referral code applied yet",
    };

  } catch (error) {
    console.error("Check applied referral error:", error);
    return {
      success: false,
      message: "Network error",
      hasAppliedReferral: false,
    };
  }
};

// --------------------------------------------------------
// 3️⃣ Apply Friend's Referral Code
// --------------------------------------------------------
export const applyReferralCode = async (referralCode) => {
  try {
    // Get current user ID
    const userId = await AsyncStorage.getItem("userId");
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in. Please login again.",
      };
    }

    if (!referralCode || referralCode.trim() === "") {
      return {
        success: false,
        message: "Please enter a valid referral code",
      };
    }

    // Clean the referral code
    const cleanReferralCode = referralCode.trim().toUpperCase();

    // Construct the URL
    const url = `${API_BASE_URL}/referral/check?userId=${userId}&referralCode=${cleanReferralCode}`;

    console.log("Applying referral code:", {
      url: url,
      userId: userId,
      referralCode: cleanReferralCode
    });

    // Make POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("Response status:", response.status);

    // Parse response
    let responseData;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const textResponse = await response.text();
      console.log("Non-JSON response:", textResponse);
      return {
        success: false,
        message: "Server returned unexpected response format",
      };
    }

    console.log("Response data:", responseData);

    // Check for successful response
    if (response.ok) {
      return {
        success: true,
        message: responseData.message || "Referral code applied successfully!",
        data: responseData,
      };
    } else {
      // Handle error responses
      return {
        success: false,
        message: responseData.message || responseData.error || "Failed to apply referral code",
        data: responseData,
      };
    }

  } catch (error) {
    console.error("Apply referral code error:", error);
    
    // Handle specific error types
    if (error.message.includes("Network request failed")) {
      return {
        success: false,
        message: "Network error. Please check your internet connection.",
      };
    }
    
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

// --------------------------------------------------------
// 4️⃣ Validate Referral Code Format (Helper Function)
// --------------------------------------------------------
export const validateReferralCode = (code) => {
  if (!code || code.trim() === "") {
    return {
      valid: false,
      message: "Referral code cannot be empty",
    };
  }

  const cleanCode = code.trim();
  
  // Check length (adjust as per your requirements)
  if (cleanCode.length < 3) {
    return {
      valid: false,
      message: "Referral code is too short",
    };
  }

  if (cleanCode.length > 20) {
    return {
      valid: false,
      message: "Referral code is too long",
    };
  }

  // Check for special characters (optional)
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (specialCharRegex.test(cleanCode)) {
    return {
      valid: false,
      message: "Referral code contains invalid characters",
    };
  }

  return {
    valid: true,
    message: "Valid referral code",
  };
};