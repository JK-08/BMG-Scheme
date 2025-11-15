import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

class PaymentReceiptPDF {
  // ✅ Save folder permission and reuse next time
  static async getDirectoryUri() {
    try {
      const savedUri = await AsyncStorage.getItem("BMG_DOWNLOAD_DIR");
      if (savedUri) {
        return savedUri;
      }

      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        await AsyncStorage.setItem("BMG_DOWNLOAD_DIR", permissions.directoryUri);
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
    await AsyncStorage.removeItem("BMG_DOWNLOAD_DIR");
    Alert.alert("Reset", "Download folder permission has been reset.");
  }

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
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim() + ' Rupees Only';
  }

  // ✅ NEW: Extract data from API response structure
  static extractDataFromResponse(responseData) {
    try {
      // Extract data from the nested response structure
      const schemeData = responseData?.schemeData || {};
      const personalInfo = schemeData?.personalInfo || {};
      
      return {
        payment: {
          amount: responseData?.payment?.amount || "0",
          weight: responseData?.payment?.weight || "0.0",
          receiptNo: responseData?.payment?.receiptNo || "0",
          updateTime: responseData?.payment?.updateTime || new Date().toISOString(),
          installment: responseData?.payment?.installment || "1"
        },
        customerInfo: {
          customerName: responseData?.customerInfo?.customerName || personalInfo?.pName || "N/A",
          mobile: responseData?.customerInfo?.mobile || personalInfo?.mobile || "N/A",
          address1: personalInfo?.doorNo ? `${personalInfo.doorNo}, ${personalInfo.address1}` : personalInfo?.address1 || "N/A",
          address2: personalInfo?.pinCode ? `${personalInfo.pinCode}, Tamil Nadu` : "Tamil Nadu",
          personalId: personalInfo?.personalId || "N/A"
        },
        schemeInfo: {
          schemeName: schemeData?.schemeSummary?.schemeName || responseData?.schemeInfo?.schemeName || "BMG SCHEME",
          groupCode: responseData?.schemeInfo?.groupCode || schemeData?.groupCode || "N/A",
          regNo: responseData?.schemeInfo?.regNo || schemeData?.regNo || "N/A",
          joinDate: schemeData?.joinDate || null,
          maturityDate: schemeData?.maturityDate || null,
          lastPaidDate: schemeData?.lastPaidDate || null,
          totalInstallment: schemeData?.schemeSummary?.instalment || "0",
          status: schemeData?.status || "Active"
        }
      };
    } catch (error) {
      console.error("Error extracting data from response:", error);
      throw new Error("Invalid response data structure");
    }
  }

  static generateReceiptHTML({ payment, schemeInfo, customerInfo }) {
    const date = this.formatDate(payment.updateTime);
    const goldType = "22K (916)";
    const amount = this.formatAmount(payment.amount);
    const amountNumber = parseFloat(payment.amount || 0);
    const quantity =
      payment.weight && parseFloat(payment.weight) > 0
        ? `${parseFloat(payment.weight).toFixed(3)} gram`
        : "—";

    const customerName = customerInfo?.customerName || "N/A";
    const address = customerInfo?.address1 || "N/A";
    const address2 = customerInfo?.address2 || "Tamil Nadu";
    const mobile = customerInfo?.mobile || "N/A";
    const personalId = customerInfo?.personalId || "";
    
    const schemeName = schemeInfo?.schemeName || "BMG SCHEME";
    const groupCode = schemeInfo?.groupCode || "N/A";
    const regNo = schemeInfo?.regNo || "N/A";
    const receiptNo = payment?.receiptNo || "0000";
    const installmentNo = payment?.installment || "1";
    const totalInstallment = schemeInfo?.totalInstallment || "N/A";
    const status = schemeInfo?.status || "Active";

    const goldLocked = `${groupCode}-${regNo}`;
    const totalAmountWords = this.numberToWords(Math.floor(amountNumber));

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page { 
    size: A4; 
    margin: 15mm; 
  }
  
  body {
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 11pt;
    color: #000;
    background: #fff;
    line-height: 1.4;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 0;
  }
  
  .receipt-container { 
    width: 100%; 
    max-width: 180mm;
    margin: 0 auto;
    border: 2px solid #1F3A6F; 
    border-radius: 8px; 
    padding: 20px;
    background: #fff;
  }
  
  .top-header {
    text-align: center;
    border-bottom: 3px solid #1F3A6F;
    padding-bottom: 12px;
    margin-bottom: 15px;
  }
  
  .company-title {
    font-size: 18pt;
    font-weight: 700;
    color: #1F3A6F;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .scheme-name {
    font-size: 12pt;
    font-weight: 600;
    color: #FFD700;
    background: #1F3A6F;
    padding: 6px 15px;
    display: inline-block;
    border-radius: 4px;
    margin-top: 5px;
  }
  
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start;
    border-bottom: 2px solid #e0e0e0; 
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  
  .left-section {
    flex: 1;
    max-width: 48%;
  }
  
  .logo { 
    width: 100px; 
    height: auto;
    display: block;
    margin-bottom: 10px;
  }
  
  .company-info {
    font-size: 9pt;
    line-height: 1.5;
  }
  
  .company-info p { 
    margin: 3px 0;
  }
  
  .company-info strong {
    font-size: 10pt;
    color: #1F3A6F;
  }
  
  .right-section { 
    flex: 1;
    max-width: 48%;
    text-align: right;
  }
  
  .customer-details {
    font-size: 9pt;
    line-height: 1.6;
  }
  
  .customer-details p {
    margin: 3px 0;
  }
  
  .customer-details strong {
    font-size: 10pt;
    color: #1F3A6F;
  }
  
  .receipt-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
  }

  .installment-badge {
    background: #FFD700;
    color: #1F3A6F;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    display: inline-block;
    margin-top: 5px;
  }
  
  .section-title { 
    font-weight: 700; 
    font-size: 11pt; 
    color: #1F3A6F; 
    margin-bottom: 12px;
    margin-top: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 20px 0;
    font-size: 10pt;
  }
  
  thead {
    background: #1F3A6F;
  }
  
  th { 
    background: #1F3A6F; 
    color: white; 
    padding: 12px 8px; 
    text-align: center;
    font-weight: 600;
    font-size: 10pt;
    border: 1px solid #1F3A6F;
  }
  
  td { 
    border: 1px solid #ddd; 
    padding: 10px 8px; 
    text-align: center;
    background: #fff;
  }
  
  tbody tr:hover {
    background: #f8f9fa;
  }
  
  .total-section { 
    margin: 20px 0 10px 0; 
    background: #1F3A6F; 
    color: #fff; 
    font-weight: 700; 
    display: flex; 
    justify-content: space-between; 
    padding: 12px 15px; 
    border-radius: 6px;
    font-size: 11pt;
  }
  
  .amount-words { 
    font-weight: 600; 
    margin: 15px 0; 
    font-size: 10pt;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #FFD700;
  }
  
  .footer { 
    margin-top: 40px; 
    font-size: 9pt; 
    color: #666; 
    text-align: center; 
    border-top: 2px solid #FFD700; 
    padding-top: 20px;
    line-height: 1.8;
  }
  
  .footer p {
    margin: 5px 0;
  }
  
  .footer strong {
    color: #1F3A6F;
    font-size: 10pt;
  }

  @media print {
    body {
      width: 210mm;
      height: 297mm;
    }
    .receipt-container {
      border: 2px solid #1F3A6F;
      page-break-inside: avoid;
    }
  }
</style>
</head>
<body>
  <div class="receipt-container">
    <!-- Top Header -->
    <div class="top-header">
      <div class="company-title">BMG Jewellers Pvt Ltd</div>
      <div class="scheme-name">${schemeName}</div>
    </div>

    <!-- Main Header with Company and Customer Details -->
    <div class="header">
      <div class="left-section">
        <img src="https://app.bmgjewellers.com/uploads/companyLogo/66e09be6-0a3d-4a93-a7a1-5a07f69817b0_logo4.png" class="logo" alt="BMG Logo" />
        <div class="company-info">
          <p><strong>Company Details</strong></p>
          <p>160, Melamasi Street</p>
          <p>Madurai - 625001, Tamil Nadu</p>
          <p>📞 +91 95143 33601</p>
          <p>📞 +91 95143 33609</p>
          <p>✉ Contact@bmgjewellers.in</p>
        </div>
      </div>
      <div class="right-section">
        <div class="customer-details">
          <p><strong>Customer Details</strong></p>
          <p>${customerName}</p>
          ${personalId ? `<p>ID: ${personalId}</p>` : ''}
          <p>${address}</p>
          <p>${address2}</p>
          <p>📱 ${mobile}</p>
        </div>
        <div class="receipt-info">
          <p><strong>Receipt No:</strong> ${receiptNo}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Group Code:</strong> ${goldLocked}</p>
          <p><strong>Status:</strong> <span style="color: ${status === 'Active' ? '#28a745' : '#dc3545'}">${status}</span></p>
          <div class="installment-badge">Installment: ${installmentNo} / ${totalInstallment}</div>
        </div>
      </div>
    </div>

    <!-- Transaction Details -->
    <div class="section-title">Transaction Details</div>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">S.No</th>
          <th style="width: 18%;">Group Code</th>
          <th style="width: 18%;">Gold Type</th>
          <th style="width: 18%;">Quantity</th>
          <th style="width: 18%;">Rate (₹)</th>
          <th style="width: 20%;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${goldLocked}</td>
          <td>${goldType}</td>
          <td>${quantity}</td>
          <td>—</td>
          <td><strong>₹${amount}</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- Total Amount -->
    <div class="total-section">
      <div>Total Amount Paid</div>
      <div>₹${amount}</div>
    </div>

    <!-- Amount in Words -->
    <div class="amount-words">
      <strong>Amount in Words:</strong> ${totalAmountWords}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Thank you for your business with BMG Jewellers!</strong></p>
      <p>This is a computer-generated receipt. No signature required.</p>
      <p>Please preserve this receipt for future reference and gold redemption.</p>
    </div>
  </div>
</body>
</html>
`;
  }

  // ✅ UPDATED: Now accepts raw API response
  static async generatePDF(responseData) {
    try {
      Alert.alert("Downloading", "Generating PDF receipt...");

      // Extract data from the response structure
      const { payment, schemeInfo, customerInfo } = this.extractDataFromResponse(responseData);

      const html = this.generateReceiptHTML({ payment, schemeInfo, customerInfo });
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `BMG_Receipt_${payment.receiptNo || "Receipt"}_${timestamp}.pdf`;

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

        Alert.alert("Success ✅", `PDF saved successfully!\nFile: ${fileName}`);
      } else {
        const newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        Alert.alert("Saved ✅", `Receipt saved.\nFile: ${fileName}`);
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Alert.alert("Error ❌", `Failed to generate receipt: ${error.message}`);
    }
  }
}

export default PaymentReceiptPDF;