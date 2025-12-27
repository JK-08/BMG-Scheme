import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPhoneDetails } from "../../services/SchemeDetailsService";

const SchemeDetailsScreen = ({ route }) => {
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);

  // Load phone number from route or storage
  useEffect(() => {
    const loadPhoneNumber = async () => {
      let number = route.params?.phoneNumber;
      if (!number) {
        number = await AsyncStorage.getItem("userPhoneNumber");
      }
      setPhoneNumber(number);
    };
    loadPhoneNumber();
  }, []);

  // Fetch schemes when phoneNumber is available
  useEffect(() => {
    if (phoneNumber) fetchSchemeDetails();
  }, [phoneNumber]);

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      const data = await getPhoneDetails(phoneNumber);
      
      // Process schemes to determine payment status
      const processedSchemes = Array.isArray(data) ? data : (data ? [data] : []);
      
      // Add payment status and next due date to each scheme
      const schemesWithStatus = processedSchemes.map(scheme => {
        const { nextDueDate, paymentStatus } = calculateNextDueAndStatus(scheme);
        return {
          ...scheme,
          calculatedNextDueDate: nextDueDate,
          paymentStatus: paymentStatus
        };
      });
      
      setSchemes(schemesWithStatus);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "Failed to fetch scheme details");
    } finally {
      setLoading(false);
    }
  };

  // Calculate next due date and payment status
  const calculateNextDueAndStatus = (scheme) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    let nextDueDate = null;
    let paymentStatus = "pending";
    
    // If there's a lastPaidDate, check if it's recent
    if (scheme.lastPaidDate && scheme.lastPaidDate !== "1900-01-01 00:00:00.0") {
      const lastPaid = parseDate(scheme.lastPaidDate);
      if (!isNaN(lastPaid.getTime())) {
        const diffDays = Math.floor((today - lastPaid) / (1000 * 60 * 60 * 24));
        
        // If paid within the last 30 days, consider it paid
        if (diffDays >= 0 && diffDays <= 30) {
          paymentStatus = 'paid';
        }
      }
    }
    
    // Check remaining due dates for upcoming payments
    if (scheme.remainingDueDates && scheme.remainingDueDates.length > 0) {
      // Find the first upcoming due date
      for (const dueDateStr of scheme.remainingDueDates) {
        const dueDate = parseDate(dueDateStr);
        if (!isNaN(dueDate.getTime()) && dueDate >= today) {
          nextDueDate = dueDateStr;
          
          // If we found a future due date and payment status is not paid, set to pending
          if (paymentStatus === 'paid') {
            // Check if this due date has passed since last payment
            const lastPaid = parseDate(scheme.lastPaidDate);
            if (dueDate > lastPaid) {
              paymentStatus = 'pending';
            }
          }
          break;
        }
      }
      
      // If no future dates found, use the last one
      if (!nextDueDate && scheme.remainingDueDates.length > 0) {
        nextDueDate = scheme.remainingDueDates[scheme.remainingDueDates.length - 1];
      }
    }
    
    // Fallback to nextDueDate from API
    if (!nextDueDate) {
      nextDueDate = scheme.nextDueDate;
    }
    
    return { nextDueDate, paymentStatus };
  };

  // Parse date string (handles multiple formats)
  const parseDate = (dateString) => {
    if (!dateString) return new Date(NaN);
    
    // Clean the date string
    let cleanDateStr = dateString.toString().trim();
    
    // Remove time portion if present (for formats like "2025-08-01 00:00:00.0")
    if (cleanDateStr.includes(' ')) {
      cleanDateStr = cleanDateStr.split(' ')[0];
    }
    
    // Handle different date separators
    if (cleanDateStr.includes('-')) {
      return new Date(cleanDateStr);
    } else if (cleanDateStr.includes('/')) {
      const parts = cleanDateStr.split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    
    return new Date(cleanDateStr);
  };

  const toggleSchemeExpansion = (index) => {
    setExpandedScheme(expandedScheme === index ? null : index);
  };

  const handlePayNow = (scheme) => {
    Alert.alert(
      "Confirm Payment",
      `Do you want to pay ₹${scheme.amount} for ${scheme.schemeSummary?.schemeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Pay Now", onPress: () => processPayment(scheme) },
      ]
    );
  };

  const processPayment = async (scheme) => {
    Alert.alert("Payment", "Payment processing would be implemented here");
  };

  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not Available";
    try {
      const date = parseDate(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Helper: Format currency
  const formatCurrency = (amount) => {
    const numAmount = Number(amount || 0);
    return `₹${numAmount.toLocaleString("en-IN")}`;
  };

  // Countdown component
  const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeLeft(getTimeRemaining(targetDate));
      }, 1000);
      return () => clearInterval(interval);
    }, [targetDate]);

    return (
      <Text style={{ color: "#1976d2", fontSize: 14, fontWeight: "600" }}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
        {timeLeft.seconds}s
      </Text>
    );
  };

  const getTimeRemaining = (targetDate) => {
    const now = new Date();
    const end = parseDate(targetDate);
    const diff = end - now;

    if (isNaN(end.getTime()) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  // Render payment status indicator
  const PaymentStatusIndicator = ({ status }) => {
    return (
      <View style={[
        styles.statusIndicator,
        { backgroundColor: status === 'paid' ? '#4CAF50' : '#FF9800' }
      ]}>
        <Text style={styles.statusText}>
          {status === 'paid' ? 'PAID' : 'PENDING'}
        </Text>
      </View>
    );
  };

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.tableCell, styles.schemeCell]}>
        <Text style={styles.tableHeaderText}>Scheme Name</Text>
      </View>
      <View style={[styles.tableCell, styles.installmentCell]}>
        <Text style={styles.tableHeaderText}>Installment</Text>
      </View>
      <View style={[styles.tableCell, styles.amountCell]}>
        <Text style={styles.tableHeaderText}>Amount</Text>
      </View>
      <View style={[styles.tableCell, styles.actionCell]}>
        <Text style={styles.tableHeaderText}>Action</Text>
      </View>
    </View>
  );

  // Render table row
  const renderTableRow = (scheme, index) => {
    const isExpanded = expandedScheme === index;
    const paymentStatus = scheme.paymentStatus || 'pending';
    
    return (
      <View key={`scheme-${index}-${scheme.regNo || scheme.schemeId || index}`}>
        {/* Table Row */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.schemeCell]}>
            <View style={styles.schemeNameContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }
              ]} />
              <View style={styles.schemeTextContainer}>
                <Text style={styles.schemeName} numberOfLines={1}>
                  {scheme.schemeSummary?.schemeName || scheme.pName || "Scheme"}
                </Text>
                <Text style={styles.schemeCode} numberOfLines={1}>
                  {scheme.schemeSummary?.schemeSName || `Reg: ${scheme.regNo || "N/A"}`}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.tableCell, styles.installmentCell]}>
            <Text style={styles.installmentText}>
              {scheme.paymentHistoryList?.length || 0}/{scheme.schemeSummary?.instalment || "N/A"}
            </Text>
          </View>
          
          <View style={[styles.tableCell, styles.amountCell]}>
            <Text style={styles.amountText}>
              {formatCurrency(scheme.amount)}
            </Text>
          </View>
          
          <View style={[styles.tableCell, styles.actionCell]}>
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => toggleSchemeExpansion(index)}
            >
              <Text style={styles.showMoreButtonText}>
                {isExpanded ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Scheme Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Join Date:</Text>
                <Text style={styles.detailValue}>{formatDate(scheme.joinDate)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Due Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(scheme.calculatedNextDueDate || scheme.nextDueDate)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Maturity Date:</Text>
                <Text style={styles.detailValue}>{formatDate(scheme.maturityDate)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={styles.detailValue}>{formatCurrency(scheme.totalAmount)}</Text>
              </View>
              
              {scheme.bonusAmount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bonus Amount:</Text>
                  <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                    {formatCurrency(scheme.bonusAmount)}
                  </Text>
                </View>
              )}
            </View>

            {/* Countdown Timer */}
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Days to Redemption</Text>
              <CountdownTimer targetDate={scheme.maturityDate} />
            </View>

            {/* Payment History */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Payment History</Text>
              {scheme.paymentHistoryList && scheme.paymentHistoryList.length > 0 ? (
                scheme.paymentHistoryList.map((payment, idx) => (
                  <View key={`payment-${index}-${idx}`} style={styles.paymentItem}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentNumber}>Installment {payment.installment}</Text>
                      <Text style={styles.paymentDate}>{formatDate(payment.updateTime)}</Text>
                    </View>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noPaymentText}>No payments yet</Text>
              )}
            </View>

            {/* Pay Now Button */}
            <TouchableOpacity
              style={[
                styles.payNowButton,
                { backgroundColor: paymentStatus === 'paid' ? '#4CAF50' : '#1976d2' }
              ]}
              onPress={() => handlePayNow(scheme)}
              disabled={paymentStatus === 'paid'}
            >
              <Text style={styles.payNowButtonText}>
                {paymentStatus === 'paid' ? 'Already Paid' : `Pay ${formatCurrency(scheme.amount)} Now`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider */}
        {!isExpanded && <View style={styles.rowDivider} />}
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading scheme details...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchemeDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schemes</Text>
        <Text style={styles.headerSubtitle}>{schemes.length} scheme(s) found</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {schemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No schemes found</Text>
            <Text style={styles.emptySubtext}>
              You haven't joined any schemes yet
            </Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {schemes.map((scheme, index) => renderTableRow(scheme, index))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Updated Styles with Table Layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: "#e0e0e0" 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333" 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#666", 
    marginTop: 5 
  },
  scrollContainer: { 
    flex: 1, 
    padding: 15 
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 15,
  },
  tableCell: {
    justifyContent: "center",
  },
  schemeCell: {
    flex: 3,
  },
  installmentCell: {
    flex: 1.5,
    alignItems: "center",
  },
  amountCell: {
    flex: 1.5,
    alignItems: "flex-end",
  },
  actionCell: {
    flex: 1,
    alignItems: "flex-end",
  },
  schemeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  schemeTextContainer: {
    flex: 1,
  },
  schemeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  schemeCode: {
    fontSize: 12,
    color: "#666",
  },
  installmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  showMoreButton: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  showMoreButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976d2",
  },
  expandedDetails: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  countdownContainer: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: 10,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: "#666",
  },
  paymentAmount: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  noPaymentText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  payNowButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  payNowButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: "#666" 
  },
  errorText: { 
    fontSize: 16, 
    color: "#d32f2f", 
    textAlign: "center", 
    marginBottom: 20 
  },
  retryButton: { 
    backgroundColor: "#1976d2", 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  retryButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  emptyContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { 
    fontSize: 18, 
    color: "#666", 
    fontWeight: "600", 
    marginBottom: 10 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: "#999", 
    textAlign: "center" 
  },
  statusIndicator: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12, 
    marginBottom: 5 
  },
  statusText: { 
    color: "#fff", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
});

export default SchemeDetailsScreen;