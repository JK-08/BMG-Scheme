import { API_BASE_URL_OLD } from "../Config/API";

export const getPhoneDetails = async (userPhoneNumber) => {
    console.log("Fetching phone details for:", userPhoneNumber);
    try {
        const response = await fetch(
            `${API_BASE_URL_OLD}/account/phone_details?phoneNo=${encodeURIComponent(userPhoneNumber)}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Error fetching phone details:", error);
        throw error;
    }
};
