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
import theme from "../../utils/AppTheme"; // Changed from appTheme to theme

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
      setBanners([...data].reverse()); // most recent first
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
    if (!imagePath) return null;

    return imagePath.startsWith("http")
      ? imagePath
      : `https://scheme.bmgjewellers.com${imagePath}`;
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

      {/* <View style={styles.topContentContainer}>
        <View style={styles.contentBackground}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View> */}

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

// ------------------ Updated Styles using new theme system ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  skipContainer: {
    position: "absolute",
    top: theme.verticalScale(theme.SIZES.xxl),
    right: theme.SIZES.padding.lg,
    zIndex: 10,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.SIZES.radius.md,
    paddingHorizontal: theme.SIZES.padding.md,
    paddingVertical: theme.SIZES.padding.xs,
    // ...theme.SHADOWS.sm,
    borderWidth: 1,
    borderColor: theme.COLORS.whiteOpacity50,
  },
  skipButton: {
    padding: theme.SIZES.xs,
  },
  skipText: {
    ...theme.FONTS.bodyMedium,
    fontSize: theme.SIZES.font.sm,
    color: theme.COLORS.textInverse,
    letterSpacing: 0.5,
  },
  slide: {
    width: theme.SIZES.screen.width,
    height: theme.SIZES.screen.height,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topContentContainer: {
    position: "absolute",
    top: theme.verticalScale(theme.SIZES.xxxl * 2),
    left: 0,
    right: 0,
    paddingHorizontal: theme.SIZES.padding.xl,
  },
  contentBackground: {
    paddingHorizontal: theme.SIZES.padding.xl,
    paddingVertical: theme.SIZES.padding.lg,
    // backgroundColor: theme.COLORS.blackOpacity30,
    borderRadius: theme.SIZES.radius.lg,
    // ...theme.SHADOWS.md,
  },
  title: {
    ...theme.FONTS.h2,
    fontSize: theme.SIZES.heading.h2,
    color: theme.COLORS.textInverse,
    textAlign: "center",
    marginBottom: theme.SIZES.sm,
    textShadowColor: theme.COLORS.blackOpacity50,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    ...theme.FONTS.bodyLarge,
    fontSize: theme.SIZES.font.lg,
    color: theme.COLORS.textInverse,
    textAlign: "center",
    textShadowColor: theme.COLORS.blackOpacity50,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: theme.verticalScale(theme.SIZES.xxl * 2),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.SIZES.padding.xl,
  },
  arrowButton: {
    width: theme.SIZES.button.lg,
    height: theme.SIZES.button.lg,
    borderRadius: theme.SIZES.radius.full,
    backgroundColor: theme.COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...theme.SHADOWS.lg,
  },
  arrowDisabled: {
    backgroundColor: theme.COLORS.textDisabled,
    ...theme.SHADOWS.none,
  },
  arrowText: {
    fontSize: theme.SIZES.heading.h3,
    color: theme.COLORS.primary,
    fontWeight: "bold",
    marginTop: -2, // Visual adjustment for arrow alignment
  },
  arrowTextDisabled: {
    color: theme.COLORS.textDisabled,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.COLORS.blackOpacity20,
    borderRadius: theme.SIZES.radius.full,
    paddingHorizontal: theme.SIZES.padding.sm,
    paddingVertical: theme.SIZES.padding.xs,
  },
  dot: {
    width: theme.SIZES.xs,
    height: theme.SIZES.xs,
    borderRadius: theme.SIZES.radius.full,
    backgroundColor: theme.COLORS.whiteOpacity50,
    marginHorizontal: theme.SIZES.xs,
  },
  activeDot: {
    backgroundColor: theme.COLORS.white,
    width: theme.SIZES.sm,
    height: theme.SIZES.sm,
    ...theme.SHADOWS.xs,
  },
  buttonContainer: {
    position: "absolute",
    bottom: theme.verticalScale(theme.SIZES.xxl * 2.4),
    alignSelf: "center",
    width: theme.moderateScale(200),
  },
  button: {
    backgroundColor: theme.COLORS.secondary,
    paddingVertical: theme.SIZES.padding.lg,
    paddingHorizontal: theme.SIZES.padding.xxl,
    borderRadius: theme.SIZES.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.SHADOWS.lg,
    borderWidth: 2,
    borderColor: theme.COLORS.white,
  },
  buttonText: {
    ...theme.FONTS.button,
    fontSize: theme.SIZES.font.xl,
    color: theme.COLORS.textPrimary,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    ...theme.FONTS.body,
    fontSize: theme.SIZES.font.lg,
    color: theme.COLORS.textSecondary,
  },
});

export default OnboardingScreen;
