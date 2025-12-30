// services/SchemeBonusService.js

import { API_BASE_URL } from "../Config/API";
export const getRemainingDaysData = async (schemeId, joinDate) => {
  try {
    const response = await fetch(
        `${API_BASE_URL}/scheme-bonus/all_remainingDays?schemeId=${schemeId}&joinDate=${joinDate}`
        );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching remaining days data:', error);
    throw error;
  }
};