import { API_BASE_URL_1 } from "../Config/API";

export async function getAppBanners() {
  try {
    const response = await fetch(`${API_BASE_URL_1}/App_banner1/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch banners");
    }

    const data = await response.json();
    console.log("Fetched banners:", data.length);
    return data; // returns array of banners
    console
  } catch (error) {
    console.error("Banner API Error:", error);
    return []; // return empty to avoid crashes
  }
}
