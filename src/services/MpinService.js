import { getAuthToken } from "../utils/AsynchStorageHelper";
import { API_BASE_URL_2 } from "../Config/API";

/**
 * 🔹 Helper: Get API headers with Bearer token
 */
const getHeaders = async () => {
  try {
    const token = await getAuthToken();
    console.log("🟢 Retrieved token:", token);

    if (!token) console.warn("⚠️ No auth token found in AsyncStorage!");

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token.trim()}` : "",
    };
  } catch (error) {
    console.error("❌ Error fetching headers:", error);
    return { "Content-Type": "application/json" };
  }
};

/**
 * 🔹 Helper: Parse API response (text or JSON)
 */
const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text; // fallback if plain text
  }
};

/**
 * 🔹 Create MPIN
 * Endpoint: POST /api/v1/mpin/create?mpin=1234
 */
export const createMpinApi = async (mpin) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Create MPIN Request Headers:", headers);

    const response = await fetch(
      `${API_BASE_URL_2}/create?mpin=${encodeURIComponent(mpin)}`,
      { method: "POST", headers }
    );

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = resultText;
    }
    console.log("📩 Create MPIN Response:", result);

    // ✅ Handle 409 Conflict
    if (response.status === 409) {
      return { alreadyExists: true, message: result?.message || result };
    }

    if (!response.ok) {
      throw new Error(result?.message || result || "Error creating MPIN");
    }

    return result;
  } catch (error) {
    console.error("❌ Create MPIN API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Verify MPIN
 * Endpoint: POST /api/v1/mpin/verify?enteredMpin=1234
 */
export const verifyMpinApi = async (mpin) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Verify MPIN Request Headers:", headers);

    const response = await fetch(
      `${API_BASE_URL_2}/verify?enteredMpin=${encodeURIComponent(mpin)}`,
      { method: "POST", headers }
    );

    const result = await parseResponse(response);
    console.log("📩 Verify MPIN Response:", result);

    // ✅ Handle different response cases gracefully
    if (typeof result === "string") {
      if (result.includes("MPIN not found for this user")) {
        return { success: false, code: "NOT_FOUND", message: result };
      }
      if (result.toLowerCase().includes("incorrect")) {
        return { success: false, code: "INCORRECT", message: result };
      }
    }

    if (!response.ok) throw new Error(result?.message || result || "MPIN verification failed");
    return { success: true, message: result };
  } catch (error) {
    console.error("❌ Verify MPIN API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Reset MPIN (Existing - without old MPIN)
 * Endpoint: POST /api/v1/mpin/reset?newMpin=1234
 */
export const resetMpinApi = async (newMpin) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Reset MPIN Request Headers:", headers);

    const response = await fetch(
      `${API_BASE_URL_2}/reset?newMpin=${encodeURIComponent(newMpin)}`,
      { method: "POST", headers }
    );

    const result = await parseResponse(response);
    console.log("📩 Reset MPIN Response:", result);

    if (!response.ok) throw new Error(result?.message || result || "Failed to reset MPIN");
    return result;
  } catch (error) {
    console.error("❌ Reset MPIN API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Reset MPIN with Old MPIN (NEW SERVICE - FIXED)
 * Endpoint: POST /api/v1/mpin/reset?oldMpin=1709&newMpin=1708
 */
export const resetMpinWithOldApi = async (oldMpin, newMpin) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Reset MPIN Request Headers:", headers);

    // FIXED: Use the correct endpoint structure
    const url = `${API_BASE_URL_2}/resetMpin?oldMpin=${encodeURIComponent(oldMpin)}&newMpin=${encodeURIComponent(newMpin)}`;
    console.log("📤 Reset MPIN URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    const result = await parseResponse(response);

    console.log("📩 Response Status:", response.status);
    console.log("📩 Response Body:", result);

    // Handle 400 Bad Request - Old MPIN incorrect or same as new
    if (response.status === 400) {
      const errorMsg = typeof result === 'string' ? result : 
                      (result?.message || result?.error || "Old MPIN is incorrect or new MPIN cannot be same as old MPIN.");
      throw new Error(errorMsg);
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorMsg = typeof result === 'string' ? result : 
                      (result?.message || result?.error || "Failed to reset MPIN");
      throw new Error(errorMsg);
    }

    // Handle success (200 OK)
    if (response.status === 200) {
      const successMsg = typeof result === 'string' ? result : 
                        (result?.message || "MPIN reset successfully.");
      return successMsg;
    }

    return result;

  } catch (error) {
    console.error("❌ Reset MPIN API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Increment Failed Attempts
 * Endpoint: POST /api/v1/mpin/increment-failed-attempts?contactNumber=XXXXXXXXXX
 */
export const incrementFailedAttemptsApi = async (contactNumber) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Increment Failed Attempts Headers:", headers);

    const response = await fetch(
      `${API_BASE_URL_2}/increment-failed-attempts?contactNumber=${encodeURIComponent(contactNumber)}`,
      { method: "POST", headers }
    );

    const result = await parseResponse(response);
    console.log("📩 Increment Failed Attempts Response:", result);

    if (!response.ok) throw new Error(result?.message || result || "Failed to increment attempts");
    return result;
  } catch (error) {
    console.error("❌ Increment Failed Attempts API Error:", error);
    throw error;
  }
};

/**
 * 🔹 Reset Failed Attempts
 * Endpoint: POST /api/v1/mpin/reset-failed-attempts?contactNumber=XXXXXXXXXX
 */
export const resetFailedAttemptsApi = async (contactNumber) => {
  try {
    const headers = await getHeaders();
    console.log("📤 Reset Failed Attempts Headers:", headers);

    const response = await fetch(
      `${API_BASE_URL_2}/reset-failed-attempts?contactNumber=${encodeURIComponent(contactNumber)}`,
      { method: "POST", headers }
    );

    const result = await parseResponse(response);
    console.log("📩 Reset Failed Attempts Response:", result);

    if (!response.ok) throw new Error(result?.message || result || "Failed to reset attempts");
    return result;
  } catch (error) {
    console.error("❌ Reset Failed Attempts API Error:", error);
    throw error;
  }
};