// services/bannerService.js
const API_BASE_URL = 'https://app.bmgjewellers.com/api/v1';

export const bannerService = {
  async getBanners() {
    try {
      const response = await fetch(`${API_BASE_URL}/App_banner2/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched banners:", data.length);
      return data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }
};

// Fallback data in case API fails
export const fallbackBanners = [
  {
    "id": 2,
    "title": "Start Your Digital Gold Journey",
    "image_path": "/uploads/app_banners1/bdbf42f5-a290-4da4-ae0b-206676733219_10567.jpg",
    "subtitle": "Discover how easy it is to buy and store pure 24K gold securely online"
  },
  {
    "id": 3,
    "title": "Invest Smart, Anytime",
    "image_path": "/uploads/app_banners1/3e96dbeb-1ced-4bc2-a345-dccceb435876_10567.jpg",
    "subtitle": "Buy or sell gold instantly — no minimum amount, no hidden fees."
  },
  {
    "id": 4,
    "title": "Build Wealth with Confidence",
    "image_path": "/uploads/app_banners1/5c8c88df-2503-496c-b160-8b6e7d878d1b_10567.jpg",
    "subtitle": "Track your gold value in real-time and grow your savings effortlessly."
  }
];