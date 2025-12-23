
import { API_BASE_URL_OLD } from "../Config/API";

export const getAadhaarMode = async () => {
  try {
    const response = await fetch(`${API_BASE_URL_OLD}/account/aadhaar_mode`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // If API returns plain text like: AADHAR
    const result = await response.text();

    return result; // "AADHAR"
  } catch (error) {
    console.error("❌ Aadhaar Mode API Error:", error);
    throw error;
  }
};
