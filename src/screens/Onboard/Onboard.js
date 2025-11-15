// screens/OnboardingScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { bannerService, fallbackBanners } from "../../services/OnboardService";
import appTheme from "../../utils/MainTheme";

const { width, height } = Dimensions.get("window");

const OnboardingScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadBanners = async () => {
    try {
      const data = await bannerService.getBanners();
      setBanners([...data].reverse());
    } catch (error) {
      console.log("Using fallback banners");
      setBanners([...fallbackBanners].reverse());
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentIndex(Math.round(index));
  };

  const getImageUrl = (imagePath) => {
    return imagePath.startsWith("http")
      ? imagePath
      : `https://app.bmgjewellers.com${imagePath}`;
  };

  const navigateSlide = (direction) => {
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < banners.length) {
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
    navigation.replace("LoginPage");
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: getImageUrl(item.image_path) }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.topContentContainer}>
        <View style={styles.contentBackground}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>

      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={[
            styles.arrowButton,
            currentIndex === 0 && styles.arrowDisabled,
          ]}
          onPress={() => navigateSlide("prev")}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.arrowText,
              currentIndex === 0 && styles.arrowTextDisabled,
            ]}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.arrowButton,
            currentIndex === banners.length - 1 && styles.arrowDisabled,
          ]}
          onPress={() => navigateSlide("next")}
          disabled={currentIndex === banners.length - 1}
        >
          <Text
            style={[
              styles.arrowText,
              currentIndex === banners.length - 1 && styles.arrowTextDisabled,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleFinishOnboarding}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Banner Slides */}
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Get Started Button (only on last slide) */}
      {currentIndex === banners.length - 1 && (
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.COLORS.background,
  },
  skipContainer: {
    position: "absolute",
    top: appTheme.verticalScale(appTheme.SIZES.xl),
    right: appTheme.SIZES.padding.md,
    zIndex: 10,
    backgroundColor: appTheme.COLORS.accentLight,
    borderRadius: appTheme.SIZES.radius.sm,
    paddingHorizontal: appTheme.SIZES.padding.sm,
    paddingVertical: appTheme.SIZES.xs,
    ...appTheme.SHADOWS.sm,
  },
  skipButton: {
    padding: appTheme.SIZES.xs,
  },
  skipText: {
    ...appTheme.FONTS.bodySmall,
    fontSize: appTheme.SIZES.font.sm,
    color: appTheme.COLORS.textPrimary,
    fontWeight: "600",
  },
  slide: {
    width: appTheme.SIZES.screen.width,
    height: appTheme.SIZES.screen.height,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topContentContainer: {
    position: "absolute",
    top: appTheme.verticalScale(appTheme.SIZES.xxl * 3),
    left: 0,
    right: 0,
    paddingHorizontal: appTheme.SIZES.padding.md,
  },
  contentBackground: {
    paddingHorizontal: appTheme.SIZES.lg,
    paddingVertical: appTheme.SIZES.md,
    // backgroundColor: appTheme.COLORS.overlay,
    borderRadius: appTheme.SIZES.radius.lg,
  },
  title: {
    ...appTheme.FONTS.h3,
    fontSize: appTheme.SIZES.heading.h3,
    color: appTheme.COLORS.textInverse,
    textAlign: "center",
    marginBottom: appTheme.SIZES.sm,
    lineHeight: appTheme.SIZES.heading.h3 * 1.3,
  },
  subtitle: {
    ...appTheme.FONTS.bodyLarge,
    fontSize: appTheme.SIZES.font.lg,
    color: appTheme.COLORS.textInverse,
    textAlign: "center",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: appTheme.verticalScale(appTheme.SIZES.xxl),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: appTheme.SIZES.padding.md * 2,
  },
  arrowButton: {
    width: appTheme.SIZES.button.md,
    height: appTheme.SIZES.button.md,
    borderRadius: appTheme.SIZES.radius.full,
    backgroundColor: appTheme.COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...appTheme.SHADOWS.md,
    marginBottom: 45,
  },
  arrowDisabled: {
    backgroundColor: appTheme.COLORS.textDisabled,
  },
  arrowText: {
    fontSize: appTheme.SIZES.heading.h4,
    color: appTheme.COLORS.primary,
    fontWeight: "bold",
  },
  arrowTextDisabled: {
    color: appTheme.COLORS.textDisabled,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: appTheme.SIZES.xs,
    height: appTheme.SIZES.xs,
    borderRadius: appTheme.SIZES.radius.full,
    backgroundColor: appTheme.COLORS.borderLight,
    marginHorizontal: appTheme.SIZES.xs,
  },
  activeDot: {
    backgroundColor: appTheme.COLORS.white,
    width: appTheme.SIZES.sm,
  },
  buttonContainer: {
    position: "absolute",
    bottom: appTheme.verticalScale(appTheme.SIZES.xxl * 3),
    alignSelf: "center",
    width: appTheme.moderateScale(200),
    height: appTheme.SIZES.button.lg,
  },
  button: {
    backgroundColor: appTheme.COLORS.secondary,
    paddingVertical: appTheme.SIZES.sm,
    borderRadius: appTheme.SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...appTheme.SHADOWS.lg,
  },
  buttonText: {
    ...appTheme.FONTS.h5,
    fontSize: appTheme.SIZES.font.xl,
    color: appTheme.COLORS.textInverse,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: appTheme.COLORS.background,
  },
  loadingText: {
    ...appTheme.FONTS.body,
    fontSize: appTheme.SIZES.font.md,
    color: appTheme.COLORS.textPrimary,
  },
});

export default OnboardingScreen;
