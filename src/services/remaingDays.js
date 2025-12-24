import { API_BASE_URL } from "../Config/API";

export const getRemainingDays = async ({schemeId ,joinDate}) => {
    const queryParams = new URLSearchParams({
        schemeId: schemeId,
        joinDate:joinDate,
    }).toString();

    console.log(queryParams, 'queryParams')

    try {
        const response = await fetch(`${API_BASE_URL}/scheme-bonus/all_remainingDays?${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching remaining days:", error);
        return null;
    }
};
