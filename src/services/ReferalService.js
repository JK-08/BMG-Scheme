import { API_BASE_URL_OLD,API_BASE_URL } from "../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --------------------------------------------------------
// 1️⃣ Get Referral Details (existing function)
// --------------------------------------------------------
export const getReferralDetails = async () => {
  console.log("🟢 [getReferralDetails] STEP 1: Function started");

  const userId = await AsyncStorage.getItem("userId");
  console.log("🟢 STEP 2: UserId from storage →", userId);

  try {
    const url = `${API_BASE_URL_OLD}/account/referrals/${userId}`;
    console.log("🟢 STEP 3: API URL →", url);

    const response = await fetch(url);
    console.log("🟢 STEP 4: Response status →", response.status);

    if (!response.ok) {
      console.log("🔴 STEP 5: Response NOT OK");
      return { success: false, message: "Network error occurred" };
    }

    const data = await response.json();
    console.log("🟢 STEP 6: Response data →", data);
    console.log("🟢 STEP 7: Referral count →", data.length);

    return { success: true, data };
  } catch (error) {
    console.log("🔴 STEP 8: Catch error →", error);
    return { success: false, message: "Something went wrong" };
  }
};


// --------------------------------------------------------
// 2️⃣ Check Applied Referral Status (NEW FUNCTION)
// --------------------------------------------------------
export const getAppliedReferralStatus = async () => {
  console.log("🟡 [getAppliedReferralStatus] STEP 1: Function started");

  try {
    const userId = await AsyncStorage.getItem("userId");
    console.log("🟡 STEP 2: UserId →", userId);

    if (!userId) {
      console.log("🔴 STEP 3: User not logged in");
      return { success: false, hasAppliedReferral: false };
    }

    const url = `${API_BASE_URL}/referral/logs/${userId}`;
    console.log("🟡 STEP 4: API URL →", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("🟡 STEP 5: Response status →", response.status);

    if (!response.ok) {
      console.log("🔴 STEP 6: Failed API call");
      return { success: false, hasAppliedReferral: false };
    }

    const data = await response.json();
    console.log("🟡 STEP 7: Response data →", data);

    const hasAppliedReferral = Array.isArray(data) && data.length > 0;
    console.log("🟡 STEP 8: hasAppliedReferral →", hasAppliedReferral);

    if (hasAppliedReferral) {
      console.log("🟢 STEP 9: Applied referral data →", data[0]);
    }

    return {
      success: true,
      hasAppliedReferral,
      appliedReferralData: hasAppliedReferral ? data[0] : null,
    };
  } catch (error) {
    console.log("🔴 STEP 10: Catch error →", error);
    return { success: false, hasAppliedReferral: false };
  }
};


// --------------------------------------------------------
// 3️⃣ Apply Friend's Referral Code
// --------------------------------------------------------
export const applyReferralCode = async (referralCode) => {
  try {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      return { success: false, message: "User not logged in" };
    }

    if (!referralCode || referralCode.trim() === "") {
      return { success: false, message: "Invalid referral code" };
    }

    const cleanReferralCode = referralCode.trim().toUpperCase();

    const url = `${API_BASE_URL}/referral/check?userId=${userId}&referralCode=${cleanReferralCode}`;

    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    // ✅ HANDLE BACKEND STATUS
    if (response.ok && data.status === "allowed") {
      return {
        success: true,
        message: data.message || "Referral applied successfully",
        data,
      };
    }

    // ❌ BACKEND REJECTION (your case)
    return {
      success: false,
      message: data.message || "Referral code is invalid",
      status: data.status,
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};


// --------------------------------------------------------
// 4️⃣ Validate Referral Code Format (Helper Function)
// --------------------------------------------------------
export const validateReferralCode = (code) => {
  console.log("🟣 [validateReferralCode] STEP 1: Code received →", code);

  if (!code || code.trim() === "") {
    console.log("🔴 STEP 2: Code empty");
    return { valid: false };
  }

  const cleanCode = code.trim();
  console.log("🟣 STEP 3: Cleaned code →", cleanCode);

  if (cleanCode.length < 3) {
    console.log("🔴 STEP 4: Code too short");
    return { valid: false };
  }

  if (cleanCode.length > 20) {
    console.log("🔴 STEP 5: Code too long");
    return { valid: false };
  }

  console.log("🟢 STEP 6: Code is valid");
  return { valid: true };
};
