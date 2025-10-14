// PaymentDetailScreen.js - Enhanced version
import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  ImageBackground,
} from "react-native";
import {
  COLORS,
  SIZES,
  FONTS,
  moderateScale,
  verticalScale,
} from "../../utils/Theme";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const PaymentDetailScreen = ({ navigation, route }) => {
  const { payment, accountDetails, schemeName, productdata, schemeType } = route.params;

  console.log("Payment Detail Screen Data:", {
    payment,
    productdata,
    schemeType
  });

  if (!payment) {
    navigation.goBack();
    return null;
  }

  // Use productdata as primary data source (new API structure)
  const schemeData = productdata || accountDetails;
  const paymentHistory = schemeData?.paymentHistoryList || [];

  const formatDateTimeWithTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      // Handle both date formats: "2025-10-11 10:52:00.0" and ISO format
      const dateString = dateTimeString.includes(' ') 
        ? dateTimeString.replace(' ', 'T').replace(/\.\d+$/, '')
        : dateTimeString;
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Calculate statistics using useMemo for better performance
  const paymentStats = useMemo(() => {
    const totalSchemeAmount = parseFloat(schemeData?.schemeSummary?.schemaSummaryTransBalance?.amtrecd || 0);
    const installmentsPaid = parseInt(schemeData?.schemeSummary?.schemaSummaryTransBalance?.insPaid || paymentHistory.length);
    const totalInstallments = parseInt(schemeData?.schemeSummary?.instalment || "11");
    const totalSilverWeight = parseFloat(schemeData?.schemeSummary?.totalWeight || 0);

    return {
      totalSchemeAmount,
      installmentsPaid,
      totalInstallments,
      totalSilverWeight
    };
  }, [schemeData, paymentHistory]);

  // Get customer information
  const customerInfo = useMemo(() => {
    const customerName = schemeData?.personalInfo?.pName || schemeData?.pname || "Customer Name";
    const personalId = schemeData?.personalInfo?.personalId || "N/A";
    const mobile = schemeData?.personalInfo?.mobile || "N/A";
    const address = schemeData?.personalInfo?.address1 || "N/A";

    return { customerName, personalId, mobile, address };
  }, [schemeData]);

  // Get scheme information
  const schemeInfo = useMemo(() => {
    const schemeName = schemeData?.schemeSummary?.schemeName?.trim() || "BMG Scheme";
    const schemeSName = schemeData?.schemeSummary?.schemeSName?.trim() || "";
    const groupCode = schemeData?.groupCode || schemeData?.groupcode || "N/A";
    const regNo = schemeData?.regNo || schemeData?.regno || "N/A";

    return { schemeName, schemeSName, groupCode, regNo };
  }, [schemeData]);

  // Amount in words function
  const getAmountInWords = (amount) => {
    const num = parseInt(amount);
    if (isNaN(num)) return "Rupees Zero Only";
    
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return "Rupees Zero Only";
    if (num < 10) return `Rupees ${units[num]} Only`;
    if (num < 20) return `Rupees ${teens[num - 10]} Only`;
    if (num < 100) return `Rupees ${tens[Math.floor(num / 10)]} ${units[num % 10]} Only`;
    
    // For larger amounts, use a simplified version
    return `Rupees ${num.toLocaleString("en-IN").replace(/,/g, " ")} Only`;
  };

  // Generate receipt HTML
  const generateReceiptHTML = (payment) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const isSilverScheme = schemeType === "DIGI_SILVER";
    const paymentTime = formatDateTimeWithTime(payment.updateTime);
    const timeOnly = paymentTime.includes(",") ? paymentTime.split(",")[1]?.trim() : "00:00:00";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .receipt-container { max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 20px; background-color: #fff; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .company-name { font-size: 22px; font-weight: bold; margin-bottom: 5px; color: #2c5aa0; }
          .address { font-size: 14px; margin-bottom: 10px; }
          .receipt-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #ccc; }
          .detail-label { font-weight: bold; flex: 1; }
          .detail-value { flex: 1; text-align: left; }
          .amount-section { background-color: #f5f5f5; padding: 12px; margin: 16px 0; border-radius: 6px; text-align: center; }
          .amount { font-size: 20px; font-weight: bold; color: #2c5aa0; }
          .silver-info { background-color: #e8f5e8; padding: 8px; margin: 8px 0; border-radius: 4px; text-align: center; }
          .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px solid #000; font-style: italic; }
          .timestamp { font-size: 12px; color: #666; text-align: center; margin-bottom: 10px; }
          .scheme-type { background-color: #2c5aa0; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="company-name">BMG JEWELLERS PVT LTD</div>
            <div class="address">Madurai-625001</div>
          </div>
          <div class="receipt-title">PAYMENT RECEIPT - CUSTOMER COPY</div>
          <div class="timestamp">Generated on: ${formattedDate} at ${formattedTime}</div>
          
          <div class="detail-row">
            <span class="detail-label">SCHEME TYPE:</span>
            <span class="detail-value">
              <span class="scheme-type">${schemeInfo.schemeName}</span>
            </span>
          </div>
          
          <div class="detail-row"><span class="detail-label">DATE:</span><span class="detail-value">${formatDate(payment.updateTime)}</span></div>
          <div class="detail-row"><span class="detail-label">TIME:</span><span class="detail-value">${timeOnly}</span></div>
          <div class="detail-row"><span class="detail-label">RECEIPT NO:</span><span class="detail-value">${payment.receiptNo || "N/A"}</span></div>
          <div class="detail-row"><span class="detail-label">CUSTOMER NAME:</span><span class="detail-value">${customerInfo.customerName}</span></div>
          <div class="detail-row"><span class="detail-label">PERSONAL ID:</span><span class="detail-value">${customerInfo.personalId}</span></div>
          <div class="detail-row"><span class="detail-label">MOBILE:</span><span class="detail-value">${customerInfo.mobile}</span></div>
          <div class="detail-row"><span class="detail-label">SCHEME CODE:</span><span class="detail-value">${schemeInfo.groupCode}</span></div>
          <div class="detail-row"><span class="detail-label">REGISTRATION NO:</span><span class="detail-value">${schemeInfo.regNo}</span></div>
          
          ${isSilverScheme ? `
            <div class="detail-row"><span class="detail-label">PAYMENT TYPE:</span><span class="detail-value">Silver Purchase</span></div>
          ` : `
            <div class="detail-row"><span class="detail-label">INSTALLMENT NO:</span><span class="detail-value">${payment.installment || "N/A"}</span></div>
          `}

          <div class="amount-section">
            <div>${isSilverScheme ? 'SILVER PURCHASE AMOUNT' : 'INSTALLMENT AMOUNT'}</div>
            <div class="amount">₹ ${parseFloat(payment.amount).toLocaleString("en-IN")}/-</div>
            <div>(${getAmountInWords(payment.amount)})</div>
          </div>

          ${isSilverScheme && parseFloat(payment.weight) > 0 ? `
            <div class="silver-info">
              <div>SILVER WEIGHT: ${parseFloat(payment.weight).toFixed(3)} grams</div>
              <div>RATE: ₹ ${(parseFloat(payment.amount) / parseFloat(payment.weight)).toFixed(2)}/g</div>
            </div>
          ` : ''}

          <div class="detail-row"><span class="detail-label">TOTAL SCHEME AMOUNT:</span><span class="detail-value">₹ ${paymentStats.totalSchemeAmount.toLocaleString("en-IN")}/-</span></div>
          
          ${isSilverScheme ? `
            <div class="detail-row"><span class="detail-label">TOTAL SILVER WEIGHT:</span><span class="detail-value">${paymentStats.totalSilverWeight.toFixed(3)}g</span></div>
          ` : `
            <div class="detail-row"><span class="detail-label">INSTALLMENTS PAID:</span><span class="detail-value">${paymentStats.installmentsPaid}/${paymentStats.totalInstallments}</span></div>
          `}

          <div class="footer">For BMG JEWELLERS PVT LTD</div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintReceipt = async (payment) => {
    try {
      const html = generateReceiptHTML(payment);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Receipt",
        });
      } else {
        Alert.alert("Success", "Receipt generated successfully!");
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
      Alert.alert("Error", "Failed to generate receipt");
    }
  };

  const DetailRow = ({ label, value, highlight }) => (
    <View style={[styles.detailRow, highlight && styles.highlightRow]}>
      <Text style={[styles.detailLabel, highlight && styles.highlightText]}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.highlightText]}>{value}</Text>
    </View>
  );

  const isSilverScheme = schemeType === "DIGI_SILVER";
  const hasSilverWeight = isSilverScheme && parseFloat(payment.weight) > 0;

  return (
    <ImageBackground
      source={require("../../assets/bg4.jpg")}
      style={styles.mainBackground}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
        <CommonHeader
          title="Payment Details"
          showBack
          backIconName="arrow-back"
          backIconColor={COLORS.white}
          backgroundColor="transparent"
          textColor={COLORS.black}
          transparent
          centerTitle
          rightComponent={
            <TouchableOpacity
              onPress={() => handlePrintReceipt(payment)}
              style={styles.actionButton}
            >
              <MaterialIcons name="print" size={22} color={COLORS.white} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.receiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.companyName}>BMG JEWELLERS PVT LTD</Text>
              <Text style={styles.companyAddress}>Madurai-625001</Text>
            </View>
            
            <View style={styles.schemeTypeBadge}>
              <Text style={styles.schemeTypeText}>
                {schemeInfo.schemeName}
              </Text>
            </View>
            
            <Text style={styles.receiptTitle}>Customer Payment Copy</Text>
            
            <View style={styles.detailsGrid}>
              <DetailRow label="CUSTOMER NAME" value={customerInfo.customerName} />
              <DetailRow label="PERSONAL ID" value={customerInfo.personalId} />
              <DetailRow label="MOBILE" value={customerInfo.mobile} />
              <DetailRow label="SCHEME CODE" value={schemeInfo.groupCode} />
              <DetailRow label="REGISTRATION NO" value={schemeInfo.regNo} />
              <DetailRow label="DATE" value={formatDate(payment.updateTime)} />
              <DetailRow 
                label="TIME" 
                value={
                  formatDateTimeWithTime(payment.updateTime).includes(",") 
                    ? formatDateTimeWithTime(payment.updateTime).split(",")[1]?.trim() 
                    : "00:00:00"
                } 
              />
              <DetailRow label="RECEIPT NO" value={payment.receiptNo || "N/A"} />
              
              {isSilverScheme ? (
                <DetailRow label="PAYMENT TYPE" value="Silver Purchase" />
              ) : (
                <DetailRow label="INSTALLMENT NO" value={payment.installment || "N/A"} />
              )}
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>
                {isSilverScheme ? 'SILVER PURCHASE AMOUNT' : 'INSTALLMENT AMOUNT'}
              </Text>
              <Text style={styles.amountValue}>
                ₹ {parseFloat(payment.amount).toLocaleString("en-IN")}
              </Text>
              <Text style={styles.amountInWords}>
                ({getAmountInWords(payment.amount)})
              </Text>
            </View>

            {/* Silver Information for DIGI_SILVER */}
            {hasSilverWeight && (
              <View style={styles.silverInfoSection}>
                <DetailRow 
                  label="SILVER WEIGHT" 
                  value={`${parseFloat(payment.weight).toFixed(3)}g`} 
                  highlight 
                />
                <DetailRow 
                  label="SILVER RATE" 
                  value={`₹ ${(parseFloat(payment.amount) / parseFloat(payment.weight)).toFixed(2)}/g`} 
                  highlight 
                />
              </View>
            )}

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <DetailRow 
                label="TOTAL SCHEME AMOUNT" 
                value={`₹ ${paymentStats.totalSchemeAmount.toLocaleString("en-IN")}`} 
              />
              
              {isSilverScheme ? (
                <DetailRow 
                  label="TOTAL SILVER WEIGHT" 
                  value={`${paymentStats.totalSilverWeight.toFixed(3)}g`} 
                />
              ) : (
                <DetailRow 
                  label="INSTALLMENTS PAID" 
                  value={`${paymentStats.installmentsPaid}/${paymentStats.totalInstallments}`} 
                />
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>For BMG JEWELLERS PVT LTD</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.printButton}
              onPress={() => handlePrintReceipt(payment)}
            >
              <MaterialIcons name="print" size={20} color={COLORS.white} />
              <Text style={styles.printButtonText}>Print Receipt</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  mainBackground: { flex: 1 },
  safeArea: { flex: 1 },
  backgroundImageStyle: { opacity: 0.7 },
  actionButton: { 
    padding: moderateScale(8),
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(20),
  },
  modalContent: { 
    flex: 1, 
    padding: moderateScale(16) 
  },
  receiptContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius_lg,
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  receiptHeader: {
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: moderateScale(12),
    marginBottom: moderateScale(16),
  },
  companyName: {
    ...FONTS.heading,
    fontSize: SIZES.h5,
    textAlign: "center",
    marginBottom: moderateScale(4),
    color: COLORS.primary,
    fontWeight: "700",
  },
  companyAddress: {
    ...FONTS.body1,
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: SIZES.fontSm,
  },
  schemeTypeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    marginBottom: moderateScale(12),
  },
  schemeTypeText: {
    ...FONTS.body1,
    color: COLORS.white,
    fontWeight: "600",
    fontSize: SIZES.fontSm,
  },
  receiptTitle: {
    ...FONTS.body1,
    fontSize: SIZES.h6,
    textAlign: "center",
    marginBottom: moderateScale(20),
    color: COLORS.primary,
    fontWeight: "600",
  },
  detailsGrid: { 
    gap: moderateScale(8), 
    marginBottom: moderateScale(16) 
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    borderStyle: "dashed",
  },
  detailLabel: {
    ...FONTS.subheading,
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
    fontWeight: "600",
  },
  detailValue: {
    ...FONTS.body1,
    color: COLORS.text,
    flex: 1,
    textAlign: "left",
    fontWeight: "500",
    
  },
  highlightRow: {
    backgroundColor: COLORS.successLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: moderateScale(8),
    borderBottomWidth: 0,
  },
  highlightText: {
    color: COLORS.success,
    fontWeight: "700",
  },
  amountSection: {
    backgroundColor: COLORS.primaryLight,
    padding: moderateScale(16),
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  amountLabel: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: moderateScale(8),
  },
  amountValue: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: moderateScale(4),
  },
  amountInWords: {
    ...FONTS.subheading,
    color: COLORS.textLight,
    textAlign: "center",
    fontStyle: "italic",
  },
  silverInfoSection: {
    backgroundColor: COLORS.successLight,
    padding: moderateScale(12),
    borderRadius: SIZES.radius,
    marginBottom: moderateScale(16),
  },
  summarySection: {
    gap: moderateScale(8),
    marginBottom: moderateScale(16),
  },
  footer: {
    alignItems: "center",
    marginTop: moderateScale(16),
    paddingTop: moderateScale(12),
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  footerText: {
    ...FONTS.body1,
    fontStyle: "italic",
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: "600",
  },
  actionContainer: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginBottom: moderateScale(20),
  },
  printButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: moderateScale(16),
    borderRadius: SIZES.radius,
    gap: moderateScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  printButtonText: { 
    ...FONTS.body1, 
    color: COLORS.white, 
    fontWeight: "600" 
  },
});

export default PaymentDetailScreen;