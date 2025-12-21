// services/DigiLockerService.js (Updated with better flow)
import { API_BASE_URL } from "../Config/API";

const CLIENT_ID = "CF1134840D52IN743AJJC738HCF6G";
const CLIENT_SECRET = "cfsk_ma_prod_dbfedf7ea6516d592b9c5538f716b561_34b0b176";

const DIGILOCKER_HEADERS = {
  "Content-Type": "application/json",
  "x-client-id": CLIENT_ID,
  "x-client-secret": CLIENT_SECRET,
};

/**
 * STEP 1️⃣ Create DigiLocker Redirect URL
 */
async function createDigiLockerUrl(payload) {
  const response = await fetch(
    `${API_BASE_URL}/digilocker/create-url`,
    {
      method: "POST",
      headers: DIGILOCKER_HEADERS,
      body: JSON.stringify(payload),
    }
  );
   
  console.log("Create URL payload:", payload);
  console.log("Create URL Response:", response);

if (!response.ok) {
  const errText = await response.text();
  console.error("Create URL error:", errText);
  throw new Error("Failed to create DigiLocker URL");
}


  return response.json();
}

/**
 * STEP 2️⃣ Check DigiLocker Verification Status
 */
async function getDigiLockerStatus(verificationId) {
  const response = await fetch(
    `${API_BASE_URL}/digilocker/status?verification_id=${verificationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Status error:", errText);
    throw new Error("Failed to fetch DigiLocker status");
  }

  return response.json();
}

/**
 * STEP 3️⃣ Fetch Aadhaar Document
 */
async function getAadhaarDocument(verificationId) {
  const response = await fetch(
    `${API_BASE_URL}/digilocker/document/AADHAAR?verification_id=${verificationId}`,
    {
      method: "GET",
      headers: DIGILOCKER_HEADERS,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Document error:", errText);
    throw new Error("Failed to fetch Aadhaar document");
  }

  return response.json();
}

/**
 * 🚀 START DIGILOCKER FLOW
 */
export async function startDigiLockerFlow({
  verificationId,
  redirectUrl,
  userFlow = "signup",
}) {
  try {
    const urlRes = await createDigiLockerUrl({
      verification_id: verificationId,
      document_requested: ["AADHAAR"],
      redirect_url: redirectUrl,
      user_flow: userFlow,
    });

    return {
      step: "URL_CREATED",
      url: urlRes.url,
      verificationId,
    };
  } catch (error) {
    console.error("DigiLocker Flow Error:", error);
    return {
      step: "FAILED",
      error: error.message,
    };
  }
}

/**
 * 🔄 Complete Verification and Data Fetching
 */
export async function verifyAndFetchAadhaarData(verificationId) {
  try {
    // Step 1: Check verification status
    const statusRes = await getDigiLockerStatus(verificationId);
    console.log("Verification Status:", statusRes);

    if (statusRes.status === "AUTHENTICATED") {
      // Step 2: Fetch Aadhaar data
      const aadhaarData = await getAadhaarDocument(verificationId);
      console.log("Aadhaar Data:", aadhaarData);
      
      return {
        step: "SUCCESS",
        data: aadhaarData,
        status: statusRes.status,
      };
    } else if (statusRes.status === "FAILED" || statusRes.status === "EXPIRED") {
      return {
        step: "FAILED",
        status: statusRes.status,
        error: statusRes.message || "Verification failed",
      };
    } else {
      return {
        step: "PENDING",
        status: statusRes.status,
        message: statusRes.message || "",
      };
    }
  } catch (error) {
    console.error("Verify Aadhaar Error:", error);
    return {
      step: "ERROR",
      error: error.message,
    };
  }
}