import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
  Text,
} from "react-native";
import { getAppBanners } from "../../services/SliderService";
import theme from "../../utils/AppTheme";

const { COLORS, SIZES, FONTS, moderateScale, verticalScale } = theme;
const { width } = Dimensions.get("window");

// ---------------- SKELETON ----------------
const SkeletonCard = React.memo(() => {
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.sliderItem}>
      <View style={styles.imageContainer}>
        <View style={styles.skeletonBackground} />
        <Animated.View
          style={[styles.skeletonOverlay, { transform: [{ translateX }] }]}
        />
      </View>
    </View>
  );
});

// ---------------- SLIDER ----------------
export default function EnhancedSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const fetchedRef = useRef(false); // Render only once
  const isScrolling = useRef(false);

  // ---------- Fetch banners only once ----------
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const data = await getAppBanners();
        if (Array.isArray(data)) setBanners(data);
      } catch {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- Safe Scroll ----------
  const safeScroll = useCallback((index) => {
    if (!flatListRef.current) return;

    flatListRef.current.scrollToOffset({
      offset: index * width,
      animated: true,
    });
  }, []);

  // ---------- Auto Scroll (runs ONCE) ----------
  useEffect(() => {
    if (!banners.length) return;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (isScrolling.current) return;

      setCurrentIndex((prev) => {
        const next = prev === banners.length - 1 ? 0 : prev + 1;
        safeScroll(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [banners.length, safeScroll]);

  // ---------- Render each slider item ----------
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.sliderItem}
        onPress={() => Linking.openURL('https://app.bmgjewellers.com')}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.sliderImage}
            source={{
              uri: `https://scheme.bmgjewellers.com${item.image_path}`,
            }}
          />
          <View style={styles.overlay} />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item, index) => item.id?.toString() || index.toString(),
    []
  );

  // ---------- Pagination (Memo) ----------
  const dots = useMemo(() => {
    return (
      <View style={styles.paginationContainer}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.paginationDot,
              i === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  }, [banners.length, currentIndex]);

  // ---------- Scroll listeners ----------
  const onScrollEnd = useCallback(({ nativeEvent }) => {
    const idx = Math.round(nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
    isScrolling.current = false;
  }, []);

  return loading ? (
    <FlatList
      data={[1, 2, 3]}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, i) => i.toString()}
      renderItem={() => <SkeletonCard />}
    />
  ) : !banners.length ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No banners available</Text>
      <SkeletonCard />
    </View>
  ) : (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={() => (isScrolling.current = true)}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      {dots}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    marginVertical:  verticalScale(5),
    marginTop: verticalScale(30),
  },

  sliderItem: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    width: "95%",
    height: moderateScale(200),
    // borderRadius: SIZES.radius.md,
    overflow: "hidden",
    // backgroundColor: COLORS.gray200,
  },

  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode:"contain"
  },

  // overlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   backgroundColor: COLORS.blackOpacity10,
  // },

  skeletonBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gray300,
  },

  skeletonOverlay: {
    flex: 1,
    backgroundColor: COLORS.whiteOpacity50,
    opacity: 0.6,
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.padding.md,
  },

  paginationDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SIZES.xs,
  },

  paginationDotActive: {
    width: moderateScale(20),
    backgroundColor: COLORS.primary,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
});
