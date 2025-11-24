// services/bannerService.js

const API_BASE_URL = "https://scheme.bmgjewellers.com/api/v1";

export const bannerService = {
  async getBanners() {
    try {
      const response = await fetch(`${API_BASE_URL}/schemebanner/all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API returns: { banners: [ ... ] }
      const banners = data.banners || [];

      console.log("Fetched scheme banners:", banners.length);

      // Normalize data
      return banners.map((b) => ({
        id: b.BannerId,
        title: b.title || "",
        image_path: b.image_path,
      }));
    } catch (error) {
      console.error("Error fetching scheme banners:", error);
      throw error;
    }
  },
};
