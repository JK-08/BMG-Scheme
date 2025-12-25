import { API_BASE_URL_OLD } from "../Config/API";
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
