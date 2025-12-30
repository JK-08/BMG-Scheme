import React, { useEffect, useState } from "react";
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

function DiscoverPlace({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [schemeRules, setSchemeRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const fetchPhoneSearchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setLoading(true);

      const storedPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
      if (!storedPhoneNumber) {
        setError("Phone number not found");
        return;
      }

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

        return {
          ...item,
          status,
          regno: item.regNo,
          groupcode: item.groupCode,
          pname: item.pname || item.personalInfo?.pName,
          maturitydate: item.maturityDate,

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

      console.log("Processed Products:", processedProducts);
      setProductData(processedProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
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
  console.log("Rendering ProductCard for", item.regNo, "- remainingDays:", item.remainingDays);
  
  return (
    <ProductCard
      productData={item}
      navigation={navigation}
      onPayNow={() => handlePayNow(item)}
      remainingDate={item.remainingDays || 0} // This is what you need to add
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