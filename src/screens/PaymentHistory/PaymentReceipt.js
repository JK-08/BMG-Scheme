import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { API_BASE_URL_OLD } from "../../Config/API";

class PaymentReceiptPDF {
  // Constants
  static STORAGE_KEYS = {
    DOWNLOAD_DIR: "BMG_DOWNLOAD_DIR",
    COMPANY_DATA: "BMG_COMPANY_DATA"
  };

  static ASSETS = {
    BACKGROUND: require("../../assets/bg12.jpg"),
    LOGO: require("../../assets/image/final-logo.jpg")
  };

  static API_ENDPOINTS = {
    COMPANY: `${API_BASE_URL_OLD}/company`
  };

  // ---------------------------------------------------------------------------
  // COMPANY DATA MANAGEMENT - IMPROVED ERROR HANDLING
  // ---------------------------------------------------------------------------
  static async getCompanyData() {
    try {
      console.log("🔄 Fetching company data...");
      console.log("📡 API Endpoint:", this.API_ENDPOINTS.COMPANY);

      // Try to get cached company data first
      const cachedData = await AsyncStorage.getItem(this.STORAGE_KEYS.COMPANY_DATA);
      if (cachedData) {
        console.log("📦 Found cached company data");
        const parsedData = JSON.parse(cachedData);
        if (this.isCompanyDataValid(parsedData)) {
          console.log("✅ Using valid cached company data");
          return parsedData;
        }
        console.log("⚠️ Cached data invalid, fetching fresh...");
      }

      // Fetch fresh data from API with timeout
      console.log("🌐 Making API request...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(this.API_ENDPOINTS.COMPANY, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);

        console.log("📊 Response Status:", response.status);
        console.log("📊 Response OK:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API Error Response:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const apiResponse = await response.json();
        console.log("📥 API Response:", JSON.stringify(apiResponse, null, 2));

        if (!apiResponse.success) {
          console.warn("⚠️ API reported failure:", apiResponse.message);
          throw new Error(`API Error: ${apiResponse.message || "Unknown error"}`);
        }

        let companyData;
        
        // Handle different response structures
        if (apiResponse.message && Array.isArray(apiResponse.message) && apiResponse.message.length > 0) {
          companyData = apiResponse.message[0];
        } else if (apiResponse.data) {
          companyData = apiResponse.data;
        } else if (typeof apiResponse.message === 'object') {
          companyData = apiResponse.message;
        } else {
          console.warn("⚠️ Unexpected API response structure:", apiResponse);
          throw new Error("Invalid API response structure");
        }

        console.log("✅ Company data extracted:", companyData);

        // Cache the company data
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.COMPANY_DATA, 
          JSON.stringify(companyData)
        );

        console.log("💾 Company data cached successfully");
        return companyData;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error("⏰ API request timeout");
          throw new Error("API request timeout (10 seconds)");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("❌ getCompanyData Error:", {
        message: error.message,
        stack: error.stack,
        endpoint: this.API_ENDPOINTS.COMPANY
      });
      
      // Try to get company data from AsyncStorage even if API fails
      try {
        const fallbackData = await AsyncStorage.getItem(this.STORAGE_KEYS.COMPANY_DATA);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          if (this.isCompanyDataValid(parsed)) {
            console.log("🔄 Using previously cached data as fallback");
            return parsed;
          }
        }
      } catch (storageError) {
        console.error("❌ Fallback data retrieval failed:", storageError);
      }
      
      console.log("🔄 Returning default company data");
      return this.getDefaultCompanyData();
    }
  }

  static isCompanyDataValid(companyData) {
    if (!companyData) {
      console.log("❌ Company data is null/undefined");
      return false;
    }
    
    const isValid = companyData && 
           companyData.cname && 
           typeof companyData.cname === 'string' &&
           companyData.cname.trim().length > 0;
    
    return isValid;
  }

  static getDefaultCompanyData() {
    console.log("📄 Using default company data");
    return {
      companyId: "BMG",
      cname: "BMG JEWELLERS PVT LMT",
      cAddress1: "160, West Masi Street",
      cAddress2: "Madurai",
      cAddress3: "",
      cAddress4: "",
      cPhone: "7094670946",
      cPincode: "",
      cEmail: "contact@bmgjewellers.in",
      cFax: "0452 2900925",
      companyLogo: "",
      contReceiptNo: "N",
      startReceiptNo: 59,
      jCompId: "BMG",
      tinNo: "",
      cstNo: "",
      gstNo: "33AAICB0416C1ZG",
      stateId: 24
    };
  }

  static async clearCachedCompanyData() {
    await AsyncStorage.removeItem(this.STORAGE_KEYS.COMPANY_DATA);
    console.log("🗑️ Cleared cached company data");
  }

  // ---------------------------------------------------------------------------
  // DEBUG API ENDPOINT MANUALLY
  // ---------------------------------------------------------------------------
  static async testAPIEndpoint() {
    try {
      console.log("🧪 Testing API Endpoint...");
      console.log("🔗 URL:", this.API_ENDPOINTS.COMPANY);
      
      const response = await fetch(this.API_ENDPOINTS.COMPANY);
      console.log("📊 Response Status:", response.status);
      
      const text = await response.text();
      console.log("📝 Raw Response (first 500 chars):", text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log("📦 Parsed JSON:", JSON.stringify(json, null, 2));
        return { success: response.ok, status: response.status, data: json };
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        return { success: false, status: response.status, rawText: text };
      }
    } catch (error) {
      console.error("❌ Test Failed:", error);
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------------------------
  // REST OF THE CODE REMAINS THE SAME (with minor improvements)
  // ---------------------------------------------------------------------------
  static async getDirectoryUri() {
    try {
      const savedUri = await AsyncStorage.getItem(this.STORAGE_KEYS.DOWNLOAD_DIR);
      if (savedUri) return savedUri;

      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.DOWNLOAD_DIR, permissions.directoryUri);
        return permissions.directoryUri;
      } else {
        Alert.alert("Permission Needed", "Please allow access to save files.");
        throw new Error("Storage permission not granted");
      }
    } catch (error) {
      console.error("getDirectoryUri Error:", error);
      throw error;
    }
  }

  static async resetDownloadFolder() {
    await AsyncStorage.removeItem(this.STORAGE_KEYS.DOWNLOAD_DIR);
    Alert.alert("Reset", "Download folder permission has been reset.");
  }

  static async assetToBase64(moduleAsset) {
    const asset = Asset.fromModule(moduleAsset);
    
    try {
      await asset.downloadAsync();
    } catch (e) {
      // Asset might already be available
    }

    const sourceUri = asset.localUri || asset.uri;
    if (!sourceUri) throw new Error("Asset URI not available");

    if (sourceUri.startsWith("data:")) {
      return sourceUri.substring(sourceUri.indexOf(",") + 1);
    }

    try {
      return await FileSystem.readAsStringAsync(sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (readErr) {
      return await this.handleAssetFallback(sourceUri, asset);
    }
  }

  static async handleAssetFallback(sourceUri, asset) {
    try {
      const fileName = asset.name || `tmp_asset_${Date.now()}`;
      const dest = FileSystem.cacheDirectory + fileName;

      await FileSystem.copyAsync({ from: sourceUri, to: dest });
      return await FileSystem.readAsStringAsync(dest, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (copyErr) {
      try {
        const response = await fetch(sourceUri);
        const buffer = await response.arrayBuffer();
        return this.arrayBufferToBase64(buffer);
      } catch (fetchErr) {
        console.error("assetToBase64: all fallbacks failed", { copyErr, fetchErr });
        throw new Error("Unable to convert asset to base64");
      }
    }
  }

  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const binary = String.fromCharCode(...bytes);
    
    if (typeof btoa === "function") return btoa(binary);
    if (typeof Buffer !== "undefined") return Buffer.from(binary, "binary").toString("base64");
    
    return global.btoa ? global.btoa(binary) : null;
  }

  static formatDate(dateString) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  static formatAmount(amount) {
    return parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  static numberToWords(num) {
    if (!num || isNaN(num) || num === 0) return "Zero Rupees Only";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    const toWords = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }
      return ones[Math.floor(n / 100)] + " Hundred " + (n % 100 ? toWords(n % 100) : "");
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = "";
    if (crore) result += toWords(crore) + " Crore ";
    if (lakh) result += toWords(lakh) + " Lakh ";
    if (thousand) result += toWords(thousand) + " Thousand ";
    if (remainder) result += toWords(remainder);

    return result.trim() + " Rupees Only";
  }

  // ---------------------------------------------------------------------------
  // UPDATED DATA EXTRACTION METHOD
  // ---------------------------------------------------------------------------
  static extractDataFromResponse(responseData) {
    try {
      console.log("📥 Raw response data for extraction:", JSON.stringify(responseData, null, 2));

      // Extract data from the array structure
      const schemeData = responseData?.[0] || {};
      const personalInfo = schemeData?.personalInfo || {};
      const schemeSummary = schemeData?.schemeSummary || {};
      const paymentHistoryList = schemeData?.paymentHistoryList || [];
      
      // Get the latest payment (last in the array)
      const latestPayment = paymentHistoryList.length > 0 
        ? paymentHistoryList[paymentHistoryList.length - 1] 
        : {};

      console.log("🔍 Latest payment data:", latestPayment);

      return {
        payment: {
          amount: latestPayment.amount || "0",
          weight: latestPayment.weight || "0.0",
          receiptNo: latestPayment.receiptNo || "",
          updateTime: latestPayment.updateTime || new Date().toISOString(),
          paymentMode: latestPayment.chqBank || "",
          paymentSubMode: latestPayment.chqBranch || "",
          transactionId: latestPayment.chq_CardNo || "",
          installment: latestPayment.installment || "",
        },

        customerInfo: {
          customerName: schemeData?.pName || personalInfo?.pName || "",
          mobile: personalInfo?.mobile || "",
          address1: personalInfo?.doorNo 
            ? `${personalInfo.doorNo}, ${personalInfo.address1 || ""}`.trim()
            : personalInfo?.address1 || "",
          address2: personalInfo?.pinCode || "",
        },

        schemeInfo: {
          schemeName: schemeSummary?.schemeName || "",
          hsnCode: "", // Not available in the response
        },
      };
    } catch (error) {
      console.error("❌ Error extracting data:", error);
      console.error("Error stack:", error.stack);
      throw new Error("Invalid response structure");
    }
  }

  static generateReceiptHTML({ payment, customerInfo, schemeInfo, companyData, bgBase64, logoBase64 }) {
    // Build company address dynamically - show empty if no data
    const companyAddress = [
      companyData.cAddress1 || "",
      companyData.cAddress2 || "",
      companyData.cAddress3 || "",
      companyData.cAddress4 || "",
      companyData.cPincode ? `PIN: ${companyData.cPincode}` : ""
    ].filter(Boolean).join(", ");

    // Format phone numbers for display
    const formatPhone = (phone) => {
      if (!phone) return "";
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
      return phone;
    };

    const companyPhone = formatPhone(companyData.cPhone);
    const customerPhone = formatPhone(customerInfo.mobile);

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Receipt - ${payment.receiptNo || 'N/A'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #333;
    margin: 0; 
    padding: 0; 
    line-height: 1.1;
  }
  @page { size: A4; margin: 0; }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 12mm 15mm;
    background-image: url('data:image/jpeg;base64,${bgBase64}');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
  }
  .top-bar {
    height: 8px;
    background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
    margin-bottom: 12px;
  }
  .receipt-title {
    font-size: 38px;
    font-weight: bold;
    color: #4a2c1f;
    margin: 8px 0 15px 0;
    line-height: 1.1;
  }
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .left-info { flex: 1; }
  .receipt-info {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
  .receipt-info div { margin: 4px 0; }
  .company-section { margin-top: 15px; }
  .company-name { 
    font-size: 14px; 
    font-weight: bold; 
    margin-bottom: 6px;
    line-height: 1.3;
  }
  .company-details { 
    font-size: 13px; 
    line-height: 1.5;
  }
  .company-details div { margin: 3px 0; }
  .customer-address {
    font-size: 13px;
    line-height: 1.5;
    color: #333;
    text-align: left;
  }
  .customer-address div { margin: 3px 0; }
  .payment-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: rgba(255,255,255,0.9);
    font-size: 13px;
    line-height: 1.4;
  }
  .payment-table thead {
    border-top: 1px solid #999;
    border-bottom: 1px solid #999;
  }
  .payment-table th, .payment-table td {
    padding: 8px 6px;
    vertical-align: top;
  }
  .payment-table th:last-child, .payment-table td:last-child {
    text-align: right;
    font-weight: bold;
  }
  .amount-words { 
    margin: 18px 0;
    font-size: 13px; 
    line-height: 1.5;
    padding: 8px 0;
    min-height: 40px;
  }
  .total-bar {
    margin: 5px 0 0 0;
    padding: 12px 15px;
    background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    font-size: 15px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1.3;
  }
  .footer-note {
    text-align: center;
    font-size: 11px;
    color: #666;
    margin-top: 20px;
    line-height: 1.4;
    padding: 8px 0;
  }
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .logo-header {
    width: 160px;
    height: auto;
    margin-top: 5px;
  }
  .receipt-title {
    font-size: 38px;
    font-weight: bold;
    color: #4a2c1f;
    line-height: 1.1;
    margin: 0;
  }
  .payment-table th,
  .payment-table td {
    padding: 8px 6px;
    text-align: center !important;
    vertical-align: middle;
  }
  .payment-table thead {
    border-top: 1px solid #999;
    border-bottom: 1px solid #999;
  }
  .label { 
    font-weight: bold; 
    min-width: 120px;
    display: inline-block;
  }
  .value { 
    word-break: break-word;
  }
  .empty-field {
    color: #999;
    font-style: italic;
  }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar"></div>
  <div class="top-header">
    <h1 class="receipt-title">Advance<br/>Receipt Voucher</h1>
    <img class="logo-header" src="data:image/jpeg;base64,${logoBase64}" alt="BMG Logo" />
  </div>
  <div class="header-container">
    <div class="left-info">
      <div class="receipt-info">
        <div><span class="label">Receipt Number :</span> <span class="value">${payment.receiptNo || '<span class="empty-field">Not available</span>'}</span></div>
        <div><span class="label">Receipt Date :</span> <span class="value">${this.formatDate(payment.updateTime) || '<span class="empty-field">Not available</span>'}</span></div>
      </div>
      <div class="company-section">
        <div class="company-name">${companyData.cname || 'BMG Jewellers'}</div>
        <div class="company-details">
          <div>${companyAddress || '<span class="empty-field">Address not available</span>'}</div>
          <div>${companyData.cEmail || '<span class="empty-field">Email not available</span>'}</div>
          <div>${companyPhone || '<span class="empty-field">Phone not available</span>'}</div>
          <div>GSTIN : ${companyData.gstNo || '<span class="empty-field">Not available</span>'}</div>
        </div>
      </div>
    </div>
    <div class="customer-address">
      <div><span class="label">Name :</span> <span class="value">${customerInfo.customerName || '<span class="empty-field">Not available</span>'}</span></div>
      <div><span class="label">Mobile :</span> <span class="value">${customerPhone || '<span class="empty-field">Not available</span>'}</span></div>
      <div><span class="label">Transaction ID :</span> <span class="value">${payment.transactionId || '<span class="empty-field">Not available</span>'}</span></div>
      <div><span class="label">Transaction Mode :</span> <span class="value">${payment.paymentMode || ''}${payment.paymentSubMode ? ' - ' + payment.paymentSubMode : ''}</span></div>
      <div><span class="label">Address :</span> <span class="value">${customerInfo.address1 || ''}${customerInfo.address2 ? ', ' + customerInfo.address2 : ''}</span></div>
    </div>
  </div>
  <table class="payment-table">
    <thead>
      <tr>
        <th style="width: 8%;">S.No</th>
        <th style="width: 40%;">Description</th>
        <th style="width: 15%;">HSN Code</th>
        <th style="width: 25%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${schemeInfo.schemeName || '<span class="empty-field">Scheme name not available</span>'}</td>
        <td>${schemeInfo.hsnCode || '<span class="empty-field">-</span>'}</td>
        <td>₹ ${payment.amount ? this.formatAmount(payment.amount) : '0.00'}</td>
      </tr>
    </tbody>
  </table>
  <div class="amount-words">
    Amount in words: ${payment.amount ? this.numberToWords(Number(payment.amount)) : 'Zero Rupees Only'}
  </div>
  <div class="total-bar">
    <span>Total Amount Paid</span>
    <span>₹ ${payment.amount ? this.formatAmount(payment.amount) : '0.00'}</span>
  </div>
  <div class="footer-note">
    * This is a computer generated invoice and does not require a physical signature *
  </div>
</div>
</body>
</html>`;
  }

  static async generatePDF(responseData) {
    try {
      console.log("🔄 Starting PDF generation...");
      const { payment, customerInfo, schemeInfo } = this.extractDataFromResponse(responseData);

      console.log("📥 Extracted data:", { 
        receiptNo: payment.receiptNo,
        amount: payment.amount,
        customerName: customerInfo.customerName,
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId
      });

      // Load assets and company data in parallel
      console.log("🖼️ Loading assets...");
      const [bgBase64, logoBase64, companyData] = await Promise.all([
        this.assetToBase64(this.ASSETS.BACKGROUND),
        this.assetToBase64(this.ASSETS.LOGO),
        this.getCompanyData()
      ]);

      console.log("✅ Assets loaded, company data:", {
        companyName: companyData.cname,
        source: companyData.companyId === "BMG" ? "Default" : "API/Cache"
      });

      const html = this.generateReceiptHTML({
        payment,
        customerInfo,
        schemeInfo,
        companyData,
        bgBase64,
        logoBase64,
      });

      console.log("📄 Generating PDF from HTML...");
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
      });

      const fileName = `BMG_Receipt_${payment.receiptNo || 'N/A'}_${Date.now()}.pdf`;
      console.log("💾 PDF generated, saving as:", fileName);

      if (Platform.OS === "android") {
        const directoryUri = await this.getDirectoryUri();
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          "application/pdf"
        );

        await FileSystem.writeAsStringAsync(newUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log("✅ PDF saved to:", newUri);
      } else {
        const newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        console.log("✅ PDF saved to:", newUri);
      }

      Alert.alert("Success ✓", `Receipt saved successfully!\n\nFile: ${fileName}`, [
        { text: "OK", style: "default" }
      ]);

      return { success: true, fileName, uri };
    } catch (error) {
      console.error("❌ PDF Generation Error:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      Alert.alert("Error", `Failed to generate PDF: ${error.message}`, [
        { text: "OK", style: "cancel" },
      ]);
      return { success: false, error: error.message };
    }
  }

  static async sharePDF(responseData) {
    try {
      const result = await this.generatePDF(responseData);
      if (result.success && result.uri) {
        console.log("✅ PDF ready to share:", result.uri);
      }
      return result;
    } catch (error) {
      console.error("❌ Share PDF Error:", error);
      return { success: false, error: error.message };
    }
  }

  static async refreshCompanyData() {
    await this.clearCachedCompanyData();
    const data = await this.getCompanyData();
    console.log("🔄 Company data refreshed:", data.cname);
    return data;
  }
}

export default PaymentReceiptPDF;