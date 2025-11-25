import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

class PaymentReceiptPDF {
  // Constants
  static STORAGE_KEYS = {
    DOWNLOAD_DIR: "BMG_DOWNLOAD_DIR"
  };

  static ASSETS = {
    BACKGROUND: require("../../assets/bg12.jpg"),
    LOGO: require("../../assets/image/final-logo.jpg")
  };

  // ---------------------------------------------------------------------------
  // SAVE DIRECTORY FOR ANDROID
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

  // ---------------------------------------------------------------------------
  // ASSET TO BASE64 - OPTIMIZED
  // ---------------------------------------------------------------------------
  static async assetToBase64(moduleAsset) {
    const asset = Asset.fromModule(moduleAsset);
    
    try {
      await asset.downloadAsync();
    } catch (e) {
      // Asset might already be available
    }

    const sourceUri = asset.localUri || asset.uri;
    if (!sourceUri) throw new Error("Asset URI not available");

    // Return data URI directly if already in that format
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
      // Final fallback: fetch via network
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

  // ---------------------------------------------------------------------------
  // FORMATTERS
  // ---------------------------------------------------------------------------
  static formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }

  static formatAmount(amount) {
    return parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  static numberToWords(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";

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
  // RESPONSE DATA MAPPING - OPTIMIZED
  // ---------------------------------------------------------------------------
  static extractDataFromResponse(responseData) {
    try {
      const schemeData = responseData?.schemeData || {};
      const personalInfo = schemeData?.personalInfo || {};
      const paymentData = responseData?.payment || {};

      return {
        payment: {
          amount: paymentData.amount || "0",
          weight: paymentData.weight || "0.0",
          receiptNo: paymentData.receiptNo || "0",
          updateTime: paymentData.updateTime || new Date().toISOString(),
          paymentMode: paymentData.chqBank || "N/A",
          paymentSubMode: paymentData.chqBranch || "N/A",
          transactionId: paymentData.chq_CardNo || "N/A",
          installment: paymentData.installment || "1",
        },

        customerInfo: {
          customerName: responseData?.customerInfo?.customerName || personalInfo?.pName || "N/A",
          mobile: responseData?.customerInfo?.mobile || personalInfo?.mobile || "N/A",
          address1: personalInfo?.doorNo 
            ? `${personalInfo.doorNo}, ${personalInfo.address1}`
            : personalInfo?.address1 || "N/A",
          address2: personalInfo?.pinCode ? `${personalInfo.pinCode}` : "Tamil Nadu",
        },

        schemeInfo: {
          schemeName: schemeData?.schemeSummary?.schemeName || 
                     responseData?.schemeInfo?.schemeName || 
                     "BMG Scheme",
        },
      };
    } catch (error) {
      console.error("Error extracting data:", error);
      throw new Error("Invalid response structure");
    }
  }

  // ---------------------------------------------------------------------------
  // HTML TEMPLATE (Styles preserved)
  // ---------------------------------------------------------------------------
  static generateReceiptHTML({ payment, customerInfo, schemeInfo, bgBase64, logoBase64 }) {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Receipt - ${payment.receiptNo}</title>
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
  .logo-address-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: 20px;
    margin-top: -30px;
  }
  .logo-top {
    width: 180px;
    height: auto;
    display: block;
    margin-bottom: 10px;
  }
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
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 10px;
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
  .label { font-weight: bold; }
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
        <div><span class="label">Receipt Number :</span> ${payment.receiptNo}</div>
        <div><span class="label">Receipt Date :</span> ${this.formatDate(payment.updateTime)}</div>
      </div>
      <div class="company-section">
        <div class="company-name">BMG Jewellers pvt. ltd.,</div>
        <div class="company-details">
          <div>160, West Masi Street, Near Pothys, Madurai - 625 001</div>
          <div>contact@bmgjewellers.in</div>
          <div>70946 70946</div>
          <div>GSTIN :</div>
        </div>
      </div>
    </div>
    <div class="customer-address">
      <div><span class="label">Name :</span> ${customerInfo.customerName}</div>
      <div><span class="label">Mobile :</span> ${customerInfo.mobile}</div>
      <div><span class="label">Transaction ID :</span> ${payment.transactionId}</div>
      <div><span class="label">Transaction Mode :</span> ${payment.paymentMode}-${payment.paymentSubMode}</div>
      <div><span class="label">Address :</span> ${customerInfo.address1}${customerInfo.address2 ? ", " + customerInfo.address2 : ""}</div>
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
        <td>Advance Payment</td>
        <td></td>
        <td>₹ ${this.formatAmount(payment.amount)}</td>
      </tr>
    </tbody>
  </table>
  <div class="amount-words">
    Amount in words: ${this.numberToWords(Number(payment.amount))}
  </div>
  <div class="total-bar">
    <span>Total Amount Paid</span>
    <span>₹ ${this.formatAmount(payment.amount)}</span>
  </div>
  <div class="footer-note">
    * This is a computer generated invoice and does not require a physical signature *
  </div>
</div>
</body>
</html>`;
  }

  // ---------------------------------------------------------------------------
  // PDF GENERATION - OPTIMIZED
  // ---------------------------------------------------------------------------
  static async generatePDF(responseData) {
    try {
      const { payment, customerInfo, schemeInfo } = this.extractDataFromResponse(responseData);

      // Load assets in parallel
      const [bgBase64, logoBase64] = await Promise.all([
        this.assetToBase64(this.ASSETS.BACKGROUND),
        this.assetToBase64(this.ASSETS.LOGO)
      ]);

      const html = this.generateReceiptHTML({
        payment,
        customerInfo,
        schemeInfo,
        bgBase64,
        logoBase64,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
      });

      const fileName = `BMG_Receipt_${payment.receiptNo}_${Date.now()}.pdf`;

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
      } else {
        const newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: uri, to: newUri });
      }

      Alert.alert("Success ✓", `Receipt saved successfully!\n\nFile: ${fileName}`, [
        { text: "OK", style: "default" }
      ]);

      return { success: true, fileName, uri };
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Alert.alert("Error", `Failed to generate PDF: ${error.message}`, [
        { text: "OK", style: "cancel" },
      ]);
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------------------------
  // SHARE PDF
  // ---------------------------------------------------------------------------
  static async sharePDF(responseData) {
    try {
      const result = await this.generatePDF(responseData);
      if (result.success && result.uri) {
        console.log("PDF ready to share:", result.uri);
      }
      return result;
    } catch (error) {
      console.error("Share PDF Error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default PaymentReceiptPDF;