import { API_BASE_URL_OLD } from "../Config/API";

export const companyDetails = {
  async getCompanyDetails() {
    try {
      const response = await fetch(`${API_BASE_URL_OLD}/company`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

    return data;
    } catch (error) {
      console.error("Error fetching scheme banners:", error);
      throw error;
    }
  },
};
