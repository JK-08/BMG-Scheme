import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

const NotificationItem = ({ item, index, onDelete }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade and slide-in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) swipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -120) {
          // Swipe threshold: animate out
          Animated.timing(swipeAnim, {
            toValue: -width,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsDeleting(true);
            onDelete(item.Id);
          });
        } else {
          // Return to original position
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const getStatusColor = (status) => {
    switch (status) {
      case "SENT":
        return { bg: "#d4edda", text: "#155724" };
      case "PENDING":
        return { bg: "#fff3cd", text: "#856404" };
      case "FAILED":
        return { bg: "#f8d7da", text: "#721c24" };
      default:
        return { bg: "#e2e3e5", text: "#383d41" };
    }
  };

  if (isDeleting) return null;

  const statusColors = getStatusColor(item.Status);
  const swipeProgress = swipeAnim.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <Animated.View style={[styles.deleteAction, { opacity: swipeProgress }]}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.notificationTouchable, { transform: [{ translateX: swipeAnim }] }]}
      >
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.notificationContent}
          onPress={toggleExpand}
        >
          {item.ImageUrl ? (
            <Image source={{ uri: item.ImageUrl }} style={styles.notificationImage} />
          ) : (
            <View style={[styles.notificationImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>🔔</Text>
            </View>
          )}

          <View style={styles.notificationText}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle} numberOfLines={2}>
                {item.Title}
              </Text>
              {/* Status badge can be added back if needed */}
            </View>

            <Text 
              style={styles.notificationMessage} 
              numberOfLines={isExpanded ? undefined : 3}
            >
              {item.Message}
            </Text>

            {/* Show "Read More/Less" only if content is long enough */}
            {item.Message && item.Message.length > 150 && (
              <TouchableOpacity onPress={toggleExpand} style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>
                  {isExpanded ? "Read Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.notificationFooter}>
              {/* Date and other footer content can be added here */}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationItem: { 
    marginBottom: 12, 
    position: "relative" 
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: "#dc3545",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAction: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  deleteIcon: { 
    fontSize: 28, 
    marginBottom: 4 
  },
  deleteText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "700" 
  },
  notificationTouchable: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: { 
    flexDirection: "row", 
    padding: 16 
  },
  notificationImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 12, 
    marginRight: 14, 
    resizeMode: "cover" 
  },
  placeholderImage: { 
    backgroundColor: "#f0f0f0", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  placeholderText: { 
    fontSize: 28 
  },
  notificationText: { 
    flex: 1 
  },
  titleRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: 6 
  },
  notificationTitle: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#1a1a1a", 
    flex: 1, 
    marginRight: 8 
  },
  notificationMessage: { 
    fontSize: 15, 
    color: "#555", 
    lineHeight: 21, 
    marginBottom: 8 
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  readMoreText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  notificationFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    flexWrap: "wrap" 
  },
  dateContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  dateIcon: { 
    fontSize: 12, 
    marginRight: 4 
  },
  notificationDate: { 
    fontSize: 13, 
    color: "#888", 
    fontWeight: "500" 
  },
  sentAtText: { 
    fontSize: 11, 
    color: "#999", 
    fontStyle: "italic" 
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: 0.5 
  },
});

export default NotificationItem;