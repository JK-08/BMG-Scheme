import { API_BASE_URL_OLD } from "../Config/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
/**
 * Get Referral Scheme List
 * @returns {Promise<Array>}
 */
export const fetchReferralSchemes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL_OLD}/account/referral-scheme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Referral Scheme API Error:", error);
    throw error;
  }
};




// --------------------------------------------------------
// 1️⃣ Get Referral Details with Enhanced Structure
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
      return { 
        success: false, 
        message: "Network error occurred",
        userReferralData: null,
        earnedHistory: []
      };
    }

    const data = await response.json();
    console.log("🟢 STEP 6: Response data →", data);
    
    // Check if data is an array and has at least one item
    if (!Array.isArray(data) || data.length === 0) {
      console.log("🟡 STEP 7: No referral data found");
      return {
        success: true,
        userReferralData: null,
        earnedHistory: [],
        totalEarnings: 0,
        totalReferrals: 0
      };
    }
    
    // First element is user's referral data
    const userReferralData = data[0];
    console.log("🟢 STEP 8: User referral data →", userReferralData);
    
    // Subsequent elements are earned history (if any)
    const earnedHistory = data.slice(1);
    console.log("🟢 STEP 9: Earned history count →", earnedHistory.length);
    
    // Calculate totals
    const totalEarnings = userReferralData?.totalCreditedAmount || 0;
    const totalReferrals = earnedHistory.length;
    
    return {
      success: true,
      userReferralData,
      earnedHistory,
      totalEarnings,
      totalReferrals,
      rawData: data // Keep raw data for debugging
    };
    
  } catch (error) {
    console.log("🔴 STEP 10: Catch error →", error);
    return { 
      success: false, 
      message: "Something went wrong",
      userReferralData: null,
      earnedHistory: []
    };
  }
};

// --------------------------------------------------------
// Helper function to format earned history data
// --------------------------------------------------------
export const formatEarnedHistory = (earnedHistory) => {
  if (!Array.isArray(earnedHistory)) return [];
  
  return earnedHistory.map(item => ({
    id: item.new_member_personal_id,
    name: item.new_member_personal_name,
    mobile: item.new_member_mobile,
    scheme: item.schemeName,
    amount: item.credited_amount,
    reward: item.new_member_reward,
    date: item.created_at,
    schemeId: item.scheme_id,
    referringPersonId: item.referring_personal_id,
    referringPersonName: item.referring_personal_name
  }));
};

// --------------------------------------------------------
// Get formatted referral summary
// --------------------------------------------------------
export const getReferralSummary = async () => {
  const result = await getReferralDetails();
  
  if (!result.success || !result.userReferralData) {
    return {
      success: false,
      message: result.message || "No referral data found",
      summary: null
    };
  }
  
  const { userReferralData, earnedHistory, totalEarnings, totalReferrals } = result;
  
  const summary = {
    // User info
    userId: userReferralData.user_id,
    username: userReferralData.username,
    contactNumber: userReferralData.contact_number,
    
    // Referral info
    referralCode: userReferralData.referral_code,
    referralLink: userReferralData.referralLink,
    playStoreLink: userReferralData.playStoreLink,
    
    // Financial info
    walletBalance: userReferralData.wallet_balance,
    totalEarnings: totalEarnings,
    totalNewMemberReward: userReferralData.totalNewMemberReward,
    
    // Stats
    totalReferrals: totalReferrals,
    recentReferrals: formatEarnedHistory(earnedHistory).slice(0, 10), // Last 10
    
    // Raw data (for reference)
    rawUserData: userReferralData,
    rawHistory: earnedHistory
  };
  
  return {
    success: true,
    summary,
    formattedHistory: formatEarnedHistory(earnedHistory)
  };
};