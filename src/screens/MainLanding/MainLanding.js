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
import { colors1 } from "../../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCardSkeleton from "../../components/SkeletonLoader/ProductCardSkeleton";
import GoldPlansSkeleton from "../../components/SkeletonLoader/GoldPlansSkeleton";
import MainPageWithYouTube from "../Youtube/Youtube";
import MainHeader from "../../components/MainHeader/MainHeader";
import OtpModal from "../../components/VerifyPhone/VerifyPhone"; // ✅ your otp modal
import { getPhoneDetails } from "../../services/SchemeDetailsService";

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
    cardWidth = SCREEN_WIDTH * 0.9,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const onMomentumScrollEnd = (event) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / cardWidth);
      setCurrentIndex(index);
    };

    if (loading) {
      return (
        <View style={styles.swipeableContainer}>
          <FlatList
            data={Array(3).fill()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ index }) => (
              <View style={[styles.cardWrapper, { width: cardWidth }]}>
                {renderSkeleton(index)}
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      );
    }

    if (error || !data || data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <TextDefault
            textColor={colors1.error}
            style={{ textAlign: "center", marginTop: 20 }}
          >
            {error || emptyMessage || "No data available"}
          </TextDefault>
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
                        ? colors1.primary
                        : colors1.lightGray,
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
    <TextDefault textColor={colors1.primaryText} style={styles.titletext}>
      {title}
    </TextDefault>
    <TouchableOpacity onPress={onViewAll}>
      <TextDefault textColor={colors1.primary} H5 style={styles.viewAllText}>
        View All
      </TextDefault>
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
  const [showOtpModal, setShowOtpModal] = useState(false);

  // ------------------- FETCH SCHEMES -------------------
  const fetchSchemes = useCallback(async () => {
    try {
      setSchemesLoading(true);
      const schemesData = [
        { schemeId: "1", schemeName: "BMG AMOUNT SCHEME", description: "BAS" },
        { schemeId: "2", schemeName: "BMG DIGI SILVER", description: "BDS" },
        { schemeId: "3", schemeName: "BMG FIXED DEPOSIT", description: "BFD" },
      ];
      setSchemes(schemesData);
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setSchemesError("Failed to fetch Gold Plans");
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  // ------------------- FETCH PRODUCT DATA -------------------
  const fetchProductData = useCallback(async () => {
    setProductLoading(true);
    setProductError(null);
    try {
      const storedPhone = await AsyncStorage.getItem("userPhoneNumber");
      if (!storedPhone) {
        console.log("❌ Phone not verified. Showing OTP modal.");
        setShowOtpModal(true);
        setProductLoading(false);
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
      console.error("Error fetching product data:", err);
      setProductError("Failed to fetch schemes data");
    } finally {
      setProductLoading(false);
    }
  }, []);

  // ------------------- OTP VERIFIED CALLBACK -------------------
  const handleOtpVerified = useCallback(() => {
    setShowOtpModal(false);
    showToast("Phone number verified");
    fetchProductData();
  }, [fetchProductData]);

  // ------------------- INITIAL LOAD -------------------
  useEffect(() => {
    fetchSchemes();
    (async () => {
      const storedPhone = await AsyncStorage.getItem("userPhoneNumber");
      if (storedPhone) {
        console.log("✅ Verified phone found:", storedPhone);
        fetchProductData();
      } else {
        console.log("🔒 No verified phone found, showing OTP modal...");
        setShowOtpModal(true);
      }
    })();
  }, [fetchSchemes, fetchProductData]);

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

        <View style={styles.contentWrapper}>
          <Text style={styles.contentText}>Welcome to BMG Jewellers</Text>
          <Text style={styles.contentText1}>
            Join a savings scheme and save to buy your dream jewels!
          </Text>
        </View>

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
            title="Gold Plans"
            onViewAll={() => navigation.navigate("GoldPlanScreen")}
          />
          <SwipeableCards
            data={schemes}
            loading={schemesLoading}
            error={schemesError}
            renderItem={(scheme) => (
              <GoldPlan
                schemeId={scheme.schemeId}
                schemeName={scheme.schemeName}
                description={scheme.description}
                styles={styles.itemCardContainer}
              />
            )}
            renderSkeleton={(index) => <GoldPlansSkeleton key={index} />}
            cardWidth={SCREEN_WIDTH * 0.75}
          />
        </View>

        <View style={styles.youtubeContainer}>
          <View style={styles.youtubeWrapper}>
            <TextDefault
              textColor={colors1.primaryText}
              style={styles.titletext}
            >
              Promotions & Offers
            </TextDefault>
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
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeaderContent}
            data={[]}
            renderItem={null}
          />

          {/* ✅ OTP Modal */}
          <OtpModal
            visible={showOtpModal}
            onClose={() => setShowOtpModal(false)}
            onVerified={handleOtpVerified}
            showToast={showToast}
          />
        </SafeAreaView>
      </ImageBackground>

      <BottomTab screen="HOME" />
    </View>
  );
}

export default MainLanding;
