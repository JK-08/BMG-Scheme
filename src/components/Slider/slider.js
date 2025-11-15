import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'react-native';

import { getAppBanners } from '../../services/SliderService';
import { COLORS } from '../../utils/Theme';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#CD865C',
  primaryLight: '#E8B79D',
  background: '#FFF9F6',
  shadow: 'rgba(179, 95, 52, 0.3)',
};

// ▪ Skeleton Loader
const SkeletonCard = () => {
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
        <Animated.View
          style={[styles.skeletonOverlay, { transform: [{ translateX }] }]}
        />
      </View>
    </View>
  );
};

export default function EnhancedSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isUserScrolling = useRef(false);

  // ▪ Load from service
  useEffect(() => {
    (async () => {
      try {
        const data = await getAppBanners();

        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else {
          setBanners([]);
        }
      } catch {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ▪ Auto scroll
  useEffect(() => {
    if (!banners.length || !isAutoScrolling) return;

    intervalRef.current = setInterval(() => {
      if (!isUserScrolling.current) {
        const nextIndex =
          currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
        scrollToIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [banners.length, currentIndex, isAutoScrolling]);

  const scrollToIndex = useCallback((index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, []);

  const onScrollEnd = useCallback(
    (event) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      isUserScrolling.current = false;
    },
    [currentIndex]
  );

  const onScrollBeginDrag = () => {
    isUserScrolling.current = true;
    setIsAutoScrolling(false);
    clearInterval(intervalRef.current);
  };

  const onScrollEndDrag = () => {
    setTimeout(() => {
      isUserScrolling.current = false;
      setIsAutoScrolling(true);
    }, 2500);
  };

  // ▪ Open subtitle URL
  const handleBannerPress = useCallback((subtitle) => {
    if (!subtitle) return;
    Linking.openURL(subtitle).catch((err) =>
      console.error('Unable to open URL:', err)
    );
  }, []);

  // ▪ Render Slider Image
  const renderSliderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.sliderItem}
        activeOpacity={0.9}
        onPress={() => handleBannerPress(item.subtitle)}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.sliderImage}
            source={{
              uri:
                item.image_path?.startsWith('/uploads')
                  ? `https://app.bmgjewellers.com${item.image_path}`
                  : item.image_path,
            }}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </View>
      </TouchableOpacity>
    ),
    [handleBannerPress]
  );

  // ▪ Pagination
  const renderPaginationDots = () => (
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

  // ▪ When loading → Only Skeleton Loader
  if (loading) {
    return (
      <FlatList
        data={[1, 2, 3]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={() => <SkeletonCard />}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      />
    );
  }

  // ▪ When API fails → show "No banners available" + skeleton look
  if (!loading && banners.length === 0) {
    return (
      <View style={{ paddingVertical: 10, alignItems: 'center' }}>
        <Text style={{ color: COLORS.textDark, fontSize: 16 }}>
          No banners available
        </Text>

        <View style={{ marginTop: 10 }}>
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // ▪ Main UI
  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderSliderItem}
        keyExtractor={(item) => item.id?.toString()}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />

      {banners.length > 1 && renderPaginationDots()}
    </View>
  );
}

// (Styles remain unchanged)
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sliderItem: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '95%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    backgroundColor: COLORS.textLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  skeletonOverlay: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 16,
    borderRadius: 8,
  },
});
