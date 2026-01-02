import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  ImageBackground,
  StyleSheet,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import BottomTab from "../../components/BottomTab/BottomTab";
import { TextDefault } from "../../components";
import ProductCard from "../../ui/ProductCard/ProductCard";
import ProductCardSkeleton from "../../components/SkeletonLoader/ProductCardSkeleton";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { getPhoneDetails } from "../../services/SchemeDetailsService";
import { getAllSchemes } from "../../services/SchemeNameService";
import { COLORS } from "../../utils/Theme";
import { API_BASE_URL } from "../../Config/API";

// Add your BASE_URL
const BASE_URL = API_BASE_URL;

function DiscoverPlace({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [schemeRules, setSchemeRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced fetchRemainingDays function with date formatting
  const fetchRemainingDays = useCallback(async (schemeId, joinDate) => {
    try {
      console.log(`📡 Fetching remaining days for schemeId: ${schemeId}, joinDate: ${joinDate}`);
      
      // Format joinDate to YYYY-MM-DD if needed
      let formattedDate = joinDate;
      
      // If joinDate is not in YYYY-MM-DD format, convert it
      if (joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(joinDate)) {
        const dateObj = new Date(joinDate);
        if (!isNaN(dateObj)) {
          formattedDate = dateObj.toISOString().split('T')[0];
          console.log(`📅 Formatted date from ${joinDate} to ${formattedDate}`);
        }
      }
      
      // Format the URL
      const url = `${BASE_URL}/scheme-bonus/all_remainingDays?schemeId=${encodeURIComponent(schemeId)}&joinDate=${encodeURIComponent(formattedDate)}`;
      
      console.log(`🔗 Request URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success response for scheme ${schemeId}:`, data);
        return data.remainingDays || 0;
      } else {
        console.log(`❌ Server error ${response.status} for scheme ${schemeId}`);
        return null; // Return null to indicate API failure
      }
    } catch (error) {
      console.log(`❌ Network error for scheme ${schemeId}:`, error.message || error);
      return null; // Return null to indicate network failure
    }
  }, []);

  // Function to calculate remaining days locally as fallback
  const calculateRemainingDaysLocally = (joinDate, totalDays = 165) => {
    try {
      if (!joinDate) return totalDays;
      
      // Parse join date
      const joinDateObj = new Date(joinDate);
      if (isNaN(joinDateObj)) return totalDays;
      
      // Get current date (reset time to midnight for accurate day calculation)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate elapsed days
      const timeDiff = today.getTime() - joinDateObj.getTime();
      const elapsedDays = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      // Calculate remaining days
      const remainingDays = Math.max(0, totalDays - elapsedDays);
      
      console.log(`🧮 Local calculation: joinDate=${joinDate}, elapsedDays=${elapsedDays}, remainingDays=${remainingDays}`);
      
      return remainingDays;
    } catch (error) {
      console.log("❌ Error in local calculation:", error);
      return totalDays; // Return default total days
    }
  };

const handlePayNow = (item) => {
  const paymentData = {
    regNo: item.regno,
    groupCode: item.groupcode,
    customerName: item.pname,
    amount: item.schemeSummary?.amount || 0,
    schemeName: item.schemeSummary?.schemeName,
    schemes: productData,
  };

  console.log("🔵 handlePayNow item:", item);
  console.log("🟢 paymentData:", paymentData);

  navigation.navigate("Buy", {
    productData: item,
    paymentData,
  });
};



  // Fetch all scheme rules once
  const fetchSchemeRules = async () => {
    try {
      const allSchemes = await getAllSchemes();
      const rulesMap = {};

      allSchemes.forEach((scheme) => {
        rulesMap[scheme.schemeName?.trim()] = {
          WeightLedger: scheme.WeightLedger,
          FixedIns: scheme.FixedIns,
          Instalment: scheme.Instalment,
        };
      });

      setSchemeRules(rulesMap);
      return rulesMap;
    } catch (err) {
      console.log("Error fetching scheme rules:", err);
      return {};
    }
  };

  // Fetch remaining days for each product
  const fetchRemainingDaysForProducts = async (products) => {
    try {
      console.log(`🔄 Fetching remaining days for ${products.length} products`);
      
      // First, try to get data from API
      const apiPromises = products.map(async (product, index) => {
        try {
          // Add a small delay to avoid overwhelming the server
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Get schemeId and joinDate from product
          const schemeId = product.schemeId || 
                          product.schemeSummary?.schemeId || 
                          product.schemeSummary?.schemeid;
          
          const joinDate = product.joinDate || 
                          product.schemeSummary?.joinDate || 
                          product.schemeSummary?.Startdate ||
                          product.schemeSummary?.startdate ||
                          product.schemeSummary?.startDate;
          
          if (!schemeId || !joinDate) {
            console.log(`⚠️ Missing data for product ${product.regNo}: schemeId=${schemeId}, joinDate=${joinDate}`);
            return {
              product,
              apiResult: null,
            };
          }
          
          console.log(`📤 Calling API for product ${product.regNo}: schemeId=${schemeId}, joinDate=${joinDate}`);
          const apiResult = await fetchRemainingDays(schemeId, joinDate);
          
          return {
            product,
            apiResult,
          };
        } catch (err) {
          console.log(`❌ API error for product ${product.regNo}:`, err);
          return {
            product,
            apiResult: null,
          };
        }
      });
      
      const apiResults = await Promise.all(apiPromises);
      
      // Process results with fallback to local calculation
      const updatedProducts = apiResults.map(({ product, apiResult }) => {
        const joinDate = product.joinDate || 
                        product.schemeSummary?.joinDate || 
                        product.schemeSummary?.Startdate ||
                        product.schemeSummary?.startdate ||
                        product.schemeSummary?.startDate;
        
        let remainingDays;
        
        if (apiResult !== null && apiResult !== undefined) {
          // Use API result if successful
          remainingDays = apiResult;
          console.log(`✅ Product ${product.regNo}: API returned ${remainingDays} days`);
        } else {
          // Fallback to local calculation
          remainingDays = calculateRemainingDaysLocally(joinDate, 165);
          console.log(`🔄 Product ${product.regNo}: Using local calculation: ${remainingDays} days`);
        }
        
        return {
          ...product,
          remainingDays,
        };
      });
      
      console.log(`🎉 Finished processing remaining days for all products`);
      return updatedProducts;
    } catch (err) {
      console.log("❌ Error in fetchRemainingDaysForProducts:", err);
      // Fallback: calculate locally for all products
      return products.map(product => {
        const joinDate = product.joinDate || 
                        product.schemeSummary?.joinDate || 
                        product.schemeSummary?.Startdate ||
                        product.schemeSummary?.startdate ||
                        product.schemeSummary?.startDate;
        
        const remainingDays = calculateRemainingDaysLocally(joinDate, 165);
        
        return {
          ...product,
          remainingDays,
        };
      });
    }
  };

  const fetchPhoneSearchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setLoading(true);

      const storedPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
      if (!storedPhoneNumber) {
        setError("Phone number not found");
        return;
      }

      console.log("📱 Fetching data for phone:", storedPhoneNumber);

      // Fetch scheme rules first
      const rules = await fetchSchemeRules();

      // Then fetch account details
      const accounts = await getPhoneDetails(storedPhoneNumber);

      if (!accounts || accounts.length === 0) {
        setError("No schemes available for this account");
        setProductData([]);
        return;
      }

      const processedProducts = accounts.map((item) => {
        const currentDate = new Date();
        const maturityDate = item.maturityDate
          ? new Date(item.maturityDate)
          : null;

        const isActive = !maturityDate || currentDate < maturityDate;
        const status = isActive ? "Active" : "Deactive";

        const schemeName = item.schemeSummary?.schemeName?.trim();
        const schemeRule = rules[schemeName] || {};

        // Determine scheme type based on API rules
        const isWeightScheme = schemeRule.WeightLedger === "Y";
        const isAmountScheme =
          schemeRule.FixedIns === "Y" && schemeRule.WeightLedger !== "Y";
        const isFixedDeposit =
          schemeRule.FixedIns !== "Y" &&
          schemeRule.WeightLedger !== "Y" &&
          parseInt(schemeRule.Instalment) === 1;
        const isDigitalScheme =
          schemeRule.FixedIns !== "Y" &&
          schemeRule.WeightLedger !== "Y" &&
          parseInt(schemeRule.Instalment) > 1;

        // Extract dates for debugging
        const joinDate = item.joinDate || 
                        item.schemeSummary?.joinDate || 
                        item.schemeSummary?.Startdate ||
                        item.schemeSummary?.startdate ||
                        item.schemeSummary?.startDate;

        console.log(`📅 Product ${item.regNo} dates:`, {
          joinDate,
          maturityDate: item.maturityDate,
          schemeStartDate: item.schemeSummary?.Startdate,
        });

        return {
          ...item,
          status,
          regno: item.regNo,
          groupcode: item.groupCode,
          pname: item.pname || item.personalInfo?.pName,
          maturitydate: item.maturityDate,
          joinDate, // Store joinDate for easy access
          remainingDays: 0, // Initialize

          /* 🔥 SCHEME SUMMARY WITH API RULES */
          schemeSummary: {
            ...item.schemeSummary,
            WeightLedger:
              schemeRule.WeightLedger || item.schemeSummary?.WeightLedger,
            FixedIns: schemeRule.FixedIns || item.schemeSummary?.FixedIns,
            Instalment: schemeRule.Instalment || item.schemeSummary?.instalment,
            schemeType: {
              isWeightScheme,
              isAmountScheme,
              isFixedDeposit,
              isDigitalScheme,
            },
          },

          /* 🔥 TRANS BALANCE */
          schemaSummaryTransBalance: {
            insPaid:
              item.schemeSummary?.schemaSummaryTransBalance?.insPaid ??
              item.trans?.insPaid ??
              0,
            amtrecd:
              item.schemeSummary?.schemaSummaryTransBalance?.amtrecd ??
              item.trans?.amtrecd ??
              0,
          },
        };
      });

      // Fetch remaining days for all products
      console.log("🔄 Starting to fetch remaining days...");
      const productsWithRemainingDays = await fetchRemainingDaysForProducts(processedProducts);
      
      console.log("✅ Final products with remaining days:");
      productsWithRemainingDays.forEach(p => {
        console.log(`   - ${p.regNo}: ${p.remainingDays} days (joinDate: ${p.joinDate})`);
      });
      
      setProductData(productsWithRemainingDays);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    fetchPhoneSearchData(false);
  }, []);

  const onRefresh = () => fetchPhoneSearchData(true);

  const renderProductCard = ({ item }) => {
    console.log("🎨 Rendering ProductCard for", item.regNo, "- remainingDays:", item.remainingDays);
    
    return (
      <ProductCard
        productData={item}
        navigation={navigation}
        onPayNow={() => handlePayNow(item)}
        remainingDate={item.remainingDays || 161} // Pass the calculated remaining days
      />
    );
  };

  const renderContent = () => {
    if (initialLoad && loading) {
      return (
        <View style={localStyles.loadingContainer}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      );
    }

    if (error && productData.length === 0) {
      return (
        <View style={localStyles.errorContainer}>
          <TextDefault style={localStyles.errorText}>{error}</TextDefault>
        </View>
      );
    }

    return (
      <FlatList
        data={productData}
        renderItem={renderProductCard}
        keyExtractor={(item, index) =>
          `${item.regNo}-${item.groupCode}-${index}`
        }
        contentContainerStyle={localStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <View style={localStyles.emptyContainer}>
            <TextDefault style={localStyles.emptyText}>
              No schemes found
            </TextDefault>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.safeArea}>
          <CommonHeader title="Your Schemes" />

          <View style={localStyles.contentContainer}>{renderContent()}</View>

          <BottomTab screen="SCHEMES" />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const localStyles = StyleSheet.create({
  contentContainer: { flex: 1 },
  loadingContainer: { flex: 1, padding: 16 },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: "center",
    fontSize: 16,
  },
});

export default DiscoverPlace;