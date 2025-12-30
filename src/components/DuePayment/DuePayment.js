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
  StatusBar,
  RefreshControl,
} from "react-native";
import CommonHeader from "../CommonHeader/CommonHeader";
import BottomTab from "../BottomTab/BottomTab";
import { useNavigation } from "@react-navigation/native";
import { getAllSchemes } from "../../services/SchemeNameService";

const SchemeDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [schemes, setSchemes] = useState([]);
  const [schemeRules, setSchemeRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Phone number from your API endpoint
  const phoneNumber = "7603905056";
  const API_URL = `https://scheme.bmgjewellers.com/v1/api/account/phone_details?phoneNo=${phoneNumber}`;

  // Fetch scheme rules
  const fetchSchemeRules = async () => {
    try {
      const allSchemes = await getAllSchemes();
      const rulesMap = {};

      allSchemes.forEach((scheme) => {
        rulesMap[scheme.schemeName?.trim()] = {
          WeightLedger: scheme.WeightLedger,
          FixedIns: scheme.FixedIns,
          Instalment: scheme.Instalment,
          SchemeId: scheme.SchemeId,
        };
      });

      console.log("Scheme rules fetched:", rulesMap);
      setSchemeRules(rulesMap);
      return rulesMap;
    } catch (err) {
      console.log("Error fetching scheme rules:", err);
      return {};
    }
  };

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching data from:", API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      // Fetch scheme rules first
      const rules = await fetchSchemeRules();

      // Process schemes with scheme rules
      const processedSchemes = data.map(scheme => {
        const rowColor = getRowColor(scheme);
        const statusText = getStatusText(rowColor);
        
        const schemeName = scheme.schemeSummary?.schemeName?.trim();
        const schemeRule = rules[schemeName] || {};
        
        // Determine scheme type based on API rules
        const isWeightScheme = schemeRule.WeightLedger === "Y";
        const isAmountScheme = schemeRule.FixedIns === "Y" && schemeRule.WeightLedger !== "Y";
        const isFixedDeposit = schemeRule.FixedIns !== "Y" && schemeRule.WeightLedger !== "Y" && parseInt(schemeRule.Instalment) === 1;
        const isDigitalScheme = schemeRule.FixedIns !== "Y" && schemeRule.WeightLedger !== "Y" && parseInt(schemeRule.Instalment) > 1;

        return {
          ...scheme,
          regNo: scheme.regNo || scheme.regno,
          groupCode: scheme.groupCode || scheme.groupcode,
          pname: scheme.pName || scheme.pname,
          amount: scheme.amount || scheme.schemeAmount || "0",
          rowColor,
          statusText,
          
          /* 🔥 CRITICAL: Add schemeSummary with proper rules */
          schemeSummary: {
            ...(scheme.schemeSummary || {}),
            schemeId: schemeRule.SchemeId || scheme.schemeSummary?.schemeId,
            schemeName: schemeName || "BMG Scheme",
            instalment: schemeRule.Instalment || scheme.schemeSummary?.instalment || "0",
            WeightLedger: schemeRule.WeightLedger || scheme.schemeSummary?.WeightLedger || "N",
            FixedIns: schemeRule.FixedIns || scheme.schemeSummary?.FixedIns || "N",
            
            // Add transaction balance data
            schemaSummaryTransBalance: {
              insPaid: scheme.schemeSummary?.schemaSummaryTransBalance?.insPaid || 
                      scheme.trans?.insPaid || "0",
              amtrecd: scheme.schemeSummary?.schemaSummaryTransBalance?.amtrecd || 
                       scheme.trans?.amtrecd || "0",
            },
            
            // Add scheme type info (for debugging)
            schemeType: {
              isWeightScheme,
              isAmountScheme,
              isFixedDeposit,
              isDigitalScheme,
            }
          },
          
          // Add personalInfo for consistency
          personalInfo: {
            pName: scheme.pName || scheme.pname,
            mobile: scheme.mobile || phoneNumber,
          },
          
          // Add accountDetails
          accountDetails: {
            regNo: scheme.regNo || scheme.regno,
            groupCode: scheme.groupCode || scheme.groupcode,
          }
        };
      });

      // Sort by row color priority: Red > Yellow > Green
      processedSchemes.sort((a, b) => {
        const priority = { red: 1, yellow: 2, green: 3 };
        return priority[a.rowColor] - priority[b.rowColor];
      });
      
      setSchemes(processedSchemes);
      console.log("Fetched", processedSchemes.length, "schemes");
      console.log("Sample scheme data for BuyPage:", {
        weightLedger: processedSchemes[0]?.schemeSummary?.WeightLedger,
        fixedIns: processedSchemes[0]?.schemeSummary?.FixedIns,
        amount: processedSchemes[0]?.amount
      });

    } catch (err) {
      console.error("Error fetching schemes:", err);
      setError(err.message || "Failed to fetch scheme details");
      Alert.alert("Error", "Failed to load scheme details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchemeDetails();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchemeDetails();
  };

  const getRowColor = (scheme) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get next due date directly from API
    const nextDueDateStr = scheme.nextDueDate;
    
    // Parse next due date
    const nextDue = parseDate(nextDueDateStr);
    
    // Check if next due date is valid
    if (nextDueDateStr && nextDueDateStr !== "1900-01-01" && !isNaN(nextDue.getTime())) {
      const nextDueYear = nextDue.getFullYear();
      const nextDueMonth = nextDue.getMonth();
      const nextDueDay = nextDue.getDate();
      const nextDueAtMidnight = new Date(nextDueYear, nextDueMonth, nextDueDay, 0, 0, 0);
      
      // Compare dates
      if (today.getTime() > nextDueAtMidnight.getTime()) {
        return "red";
      } 
      else if (today.getTime() < nextDueAtMidnight.getTime()) {
        return "green";
      }
      else {
        return "yellow";
      }
    }
    
    // Default: Show as green if no valid next due date
    return "green";
  };

  const getStatusText = (rowColor) => {
    switch(rowColor) {
      case "red":
        return "Overdue";
      case "yellow":
        return "Due Today";
      case "green":
        return "Paid";
      default:
        return "Active";
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return new Date(NaN);
    
    let cleanDateStr = dateString.toString().trim();
    
    // Handle different date formats
    if (cleanDateStr.includes(' ')) {
      cleanDateStr = cleanDateStr.split(' ')[0];
    }
    
    if (cleanDateStr.includes('T')) {
      cleanDateStr = cleanDateStr.split('T')[0];
    }
    
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    return new Date(cleanDateStr);
  };

  const formatDate = (dateInput) => {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      if (!dateInput || dateInput === "1900-01-01" || dateInput === "1900-01-01 00:00:00.0") {
        return "N/A";
      }
      date = parseDate(dateInput);
    }
    
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'red': return '#FFEBEE';
      case 'yellow': return '#FFF8E1';
      case 'green': return '#E8F5E9';
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = (status) => {
    switch(status) {
      case 'red': return '#F44336';
      case 'yellow': return '#FF9800';
      case 'green': return '#4CAF50';
      default: return '#E0E0E0';
    }
  };

  const getStatusTextColor = (status) => {
    switch(status) {
      case 'red': return '#D32F2F';
      case 'yellow': return '#F57C00';
      case 'green': return '#388E3C';
      default: return '#757575';
    }
  };

  const handlePayNow = (scheme) => {
    console.log("🟢 Navigating to Buy with scheme:", {
      schemeName: scheme.schemeSummary?.schemeName,
      weightLedger: scheme.schemeSummary?.WeightLedger,
      fixedIns: scheme.schemeSummary?.FixedIns,
      amount: scheme.amount,
      regNo: scheme.regNo,
      groupCode: scheme.groupCode
    });

    navigation.navigate("Buy", {
      productData: scheme,
    });
  };

  const renderSchemeRow = (scheme, index) => {
    const schemeName = scheme.schemeSummary?.schemeName || "BMG Scheme";
    const paidInstallments = scheme.schemeSummary?.schemaSummaryTransBalance?.insPaid || "0";
    const totalInstallments = scheme.schemeSummary?.instalment || "0";
    const amount = scheme.amount || "0";
    const nextDueDate = formatDate(scheme.nextDueDate);
    const lastPaidDate = formatDate(scheme.lastPaidDate);
    const rowColor = scheme.rowColor || "red";
    const statusText = scheme.statusText || "Pending";

    // Debug info
    const schemeType = scheme.schemeSummary?.schemeType;
    const schemeTypeText = schemeType?.isAmountScheme ? "Fixed Amount" : 
                         schemeType?.isWeightScheme ? "Weight Ledger" :
                         schemeType?.isFixedDeposit ? "Fixed Deposit" :
                         schemeType?.isDigitalScheme ? "Digital Scheme" : "Standard";

    return (
      <View 
        key={index} 
        style={[
          styles.schemeRow,
          { 
            backgroundColor: getStatusColor(rowColor),
            borderLeftWidth: 4,
            borderLeftColor: getBorderColor(rowColor)
          }
        ]}
      >
        <View style={styles.rowContent}>
          {/* Left Section - Scheme Info */}
          <View style={styles.leftSection}>
            <Text style={styles.schemeName} numberOfLines={1}>
              {schemeName}
            </Text>
            <Text style={styles.schemeId}>
              Reg: {scheme.regNo} | Group: {scheme.groupCode}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getBorderColor(rowColor) }]} />
              <Text style={[styles.statusText, { color: getStatusTextColor(rowColor) }]}>
                {statusText}
              </Text>
            </View>
          </View>

          {/* Middle Section - Installment Info */}
          <View style={styles.middleSection}>
            <Text style={styles.installmentCount}>
              {paidInstallments}/{totalInstallments}
            </Text>
            <Text style={styles.installmentLabel}>Installments</Text>
          </View>

          {/* Right Section - Amount & Date */}
          <View style={styles.rightSection}>
            <Text style={styles.amountText}>
              {formatCurrency(amount)}
            </Text>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>
                {rowColor === 'green' ? 'Last Paid:' : 'Next Due:'}
              </Text>
              <Text style={[
                styles.dateValue, 
                { color: rowColor === 'red' ? '#D32F2F' : rowColor === 'yellow' ? '#F57C00' : '#388E3C' }
              ]}>
                {rowColor === 'green' ? lastPaidDate : nextDueDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button - Show for RED and YELLOW status */}
        {(rowColor === 'red' || rowColor === 'yellow') && (
          <TouchableOpacity
            style={[
              styles.payButton,
              { 
                backgroundColor: rowColor === 'red' ? '#D32F2F' : '#FF9800',
                marginTop: 10
              }
            ]}
            onPress={() => handlePayNow(scheme)}
          >
            <Text style={styles.payButtonText}>
              Pay {formatCurrency(amount)}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Show next due info for Green (Paid) rows */}
        {rowColor === 'green' && scheme.nextDueDate && (
          <View style={styles.paidInfo}>
            <Text style={styles.paidText}>
              Next due: {nextDueDate}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading your schemes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSchemeDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <CommonHeader title="My Pending Payments" />

      {/* Summary Bar - Red, Yellow, and Green */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.summaryText}>Overdue</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.summaryText}>Due Today</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.summaryText}>Paid</Text>
        </View>
      </View>

      {/* Scheme List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {schemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No schemes found</Text>
            <Text style={styles.emptySubtext}>
              You haven't joined any schemes yet
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Browse Schemes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.schemesList}>
            {schemes.map((scheme, index) => renderSchemeRow(scheme, index))}
          </View>
        )}
      </ScrollView>

      <BottomTab screen="DuePayment" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
  },
  schemesList: {
    padding: 15,
  },
  schemeRow: {
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 2.5,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  schemeId: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  schemeType: {
    fontSize: 10,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
  },
  installmentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  installmentLabel: {
    fontSize: 10,
    color: '#666',
  },
  rightSection: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  paidInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  paidText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  totalSummary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  totalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalCount: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
});

export default SchemeDetailsScreen;