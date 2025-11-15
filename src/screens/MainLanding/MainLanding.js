import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ToastAndroid,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BottomTab, TextDefault, Slider } from "../../components";
import GoldPlan from "../../ui/ProductCard/GoldPlans";
import ProductCard from "../../ui/ProductCard/ProductCard";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import appTheme from "../../utils/MainTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCardSkeleton from "../../components/SkeletonLoader/ProductCardSkeleton";
import GoldPlansSkeleton from "../../components/SkeletonLoader/GoldPlansSkeleton";
import MainPageWithYouTube from "../Youtube/Youtube";
import MainHeader from "../../components/MainHeader/MainHeader";
import { getPhoneDetails } from "../../services/SchemeDetailsService";
import { getUserData } from "../../utils/AsynchStorageHelper";
import { getAllSchemes } from "../../services/SchemeNameService";

const { COLORS, SIZES, FONTS } = appTheme;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

// ------------------- SWIPEABLE CARDS COMPONENT -------------------
const SwipeableCards = React.memo(
  ({
    data,
    loading,
    error,
    renderItem,
    renderSkeleton,
    emptyMessage,
    cardWidth = SCREEN_WIDTH,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const onMomentumScrollEnd = (event) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / cardWidth);
      setCurrentIndex(index);
    };

    // Show skeleton when loading
    if (loading) {
      // Create dummy data for skeleton (3 items)
      const skeletonData = Array.from({ length: 3 }, (_, index) => ({
        id: index,
      }));

      return (
        <View style={styles.swipeableContainer}>
          <FlatList
            data={skeletonData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            renderItem={({ item, index }) => (
              <View style={[styles.cardWrapper, { width: cardWidth }]}>
                {renderSkeleton ? (
                  renderSkeleton(index)
                ) : (
                  <View style={styles.skeletonPlaceholder}>
                    <Text>Loading...</Text>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            decelerationRate="fast"
            snapToInterval={cardWidth}
            snapToAlignment="center"
          />
        </View>
      );
    }

    if (error || !data || data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {error || emptyMessage || "No data available"}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.swipeableContainer}>
        <FlatList
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item, index }) => (
            <View style={[styles.cardWrapper, { width: cardWidth }]}>
              {renderItem(item, index)}
            </View>
          )}
          keyExtractor={(item, index) =>
            item.regNo && item.groupCode
              ? `${item.regNo}-${item.groupCode}-${index}`
              : item.schemeId
              ? `${item.schemeId}-${index}`
              : index.toString()
          }
          decelerationRate="fast"
          snapToInterval={cardWidth}
          snapToAlignment="center"
        />

        {data.length > 1 && (
          <View style={styles.paginationContainer}>
            {data.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? COLORS.secondary
                        : COLORS.borderLight,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

// ------------------- SECTION HEADER COMPONENT -------------------
const SectionHeader = React.memo(({ title, onViewAll }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.titleText}>{title}</Text>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={styles.viewAllText}>View All</Text>
    </TouchableOpacity>
  </View>
));

// ------------------- MAIN LANDING COMPONENT -------------------
function MainLanding() {
  const navigation = useNavigation();

  const [schemes, setSchemes] = useState([]);
  const [productData, setProductData] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [schemesError, setSchemesError] = useState(null);
  const [productError, setProductError] = useState(null);

  // ------------------- FETCH SCHEMES -------------------
  /* -----------------------------------------
                FETCH SAVING SCHEMES
  ------------------------------------------ */
  const fetchSchemes = useCallback(async () => {
    setSchemesLoading(true);
    setSchemesError(null);

    try {
      const result = await getAllSchemes();

      if (!result?.length) {
        return setSchemesError("No saving schemes found");
      }

      setSchemes(result);
    } catch {
      setSchemesError("Failed to load saving schemes");
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  // ------------------- FETCH PRODUCT DATA -------------------
  const fetchProductData = useCallback(async () => {
    setProductLoading(true);
    setProductError(null);

    try {
      // ✅ Get full user data (instead of individual key)
      const user = await getUserData();

      if (!user) {
        console.log("❌ No user data found in storage");
        setProductError("Please complete your registration to view schemes");
        setProductData([]);
        return;
      }

      const storedPhone = user.contactNumber || user.phoneNumber;
      if (!storedPhone) {
        console.log("❌ Phone number missing in stored user data");
        setProductError("Please complete your registration to view schemes");
        setProductData([]);
        return;
      }

      console.log("📱 Fetching products for phone:", storedPhone);
      const accounts = await getPhoneDetails(storedPhone);

      if (!accounts || accounts.length === 0) {
        setProductError("No Schemes available for this account");
        setProductData([]);
        return;
      }

      const processed = accounts.map((item) => ({
        ...item,
        status: "Active",
        regno: item.regNo,
        groupcode: item.groupCode,
        pname: item.personalInfo?.pName,
      }));

      setProductData(processed);
    } catch (err) {
      console.error("❌ Error fetching product data:", err);
      setProductError("Failed to fetch schemes data");
    } finally {
      setProductLoading(false);
    }
  }, []);

  // ------------------- INITIAL LOAD -------------------
  useEffect(() => {
    fetchSchemes();
    fetchProductData();
  }, [fetchSchemes, fetchProductData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProductData();
    }, [fetchProductData])
  );

  const handlePayNow = useCallback(
    (item) => {
      navigation.navigate("Buy", {
        productData: item,
        paymentData: {
          regNo: item.regNo,
          groupCode: item.groupCode,
          customerName: item.pname,
          amount: item.amount,
          schemeName: item.schemeSummary?.schemeName,
        },
      });
    },
    [navigation]
  );

  const renderHeaderContent = useCallback(
    () => (
      <>
        <MainHeader />
        <Slider />

        {/* Your Schemes */}
        <View style={styles.titleSpacer}>
          <SectionHeader
            title="Your Schemes"
            onViewAll={() => navigation.navigate("MyScheme")}
          />
          <SwipeableCards
            data={productData}
            loading={productLoading}
            error={productError}
            emptyMessage="No Schemes available"
            renderItem={(item) => (
              <ProductCard
                productData={item}
                loading={false}
                status={item.status}
                navigation={navigation}
                onPayNow={() => handlePayNow(item)}
              />
            )}
            renderSkeleton={(index) => <ProductCardSkeleton key={index} />}
          />
        </View>

        {/* Gold Plans */}
        <View style={styles.contentWrapper}>
          <Text style={styles.contentText}>Our Customized Plans for You</Text>
          <Text style={styles.contentText1}>
            Choose from a range of Our Scheme Plans with unique benefits.
          </Text>
        </View>

        <View style={[styles.titleSpacer, { flex: 1 }]}>
          <SectionHeader
            title="Saving Schemes"
            onViewAll={() => navigation.navigate("GoldPlanScreen")}
          />
          <SwipeableCards
            data={schemes}
            loading={schemesLoading}
            error={schemesError}
            emptyMessage="No saving schemes available"
            renderItem={(scheme) => (
              <GoldPlan
                key={scheme.SchemeId}
                schemeId={scheme.SchemeId}
                schemeName={scheme.schemeName}
                description={scheme.description || ""}
                styles={styles.itemCardContainer}
              />
            )}
            renderSkeleton={(index) => <GoldPlansSkeleton key={index} />}
            cardWidth={SCREEN_WIDTH * 0.9}
          />
        </View>

        <View style={styles.youtubeContainer}>
          <View style={styles.youtubeWrapper}>
            <Text style={styles.titleText}>Promotions & Offers</Text>
          </View>
          <MainPageWithYouTube />
        </View>
      </>
    ),
    [
      navigation,
      productData,
      productLoading,
      productError,
      schemes,
      schemesLoading,
      schemesError,
      handlePayNow,
    ]
  );

  return (
    <View style={[styles.flex, styles.safeAreaStyle]}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.safeArea}>
          <FlatList
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeaderContent}
            data={[]}
            renderItem={null}
          />
        </SafeAreaView>
      </ImageBackground>

      <BottomTab screen="HOME" />
    </View>
  );
}

export default MainLanding;
