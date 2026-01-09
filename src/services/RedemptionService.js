import { API_BASE_URL } from "../Config/API";

const API_URL = `${API_BASE_URL}/redemption`;

export const sendRedemption = async (redemptionData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(redemptionData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error:", responseData);
      throw new Error(responseData.message || "Redemption failed");
    }

    return responseData;
  } catch (error) {
    console.error("Fetch Error:", error.message);
    throw error;
  }
};
