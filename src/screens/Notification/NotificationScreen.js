import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import NotificationService from "../../services/NotificationService";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { getUserData } from "../../utils/AsynchStorageHelper";
import NotificationItem from "./NotificationItem"; // Keep your swipeable item separate
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTab } from "../../components";
const NotificationsPage = () => {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserData();
      if (user?.id) setUserId(user.id);
      else {
        setError("User not found. Please log in again.");
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setError(null);
      setLoading(true);
      const response = await NotificationService.getUserNotifications(userId);
      if (response.code === 200) {
        const sorted = NotificationService.sortNotificationsByDate(
          response.data
        );
        setNotifications(sorted);
      } else {
        setError("Failed to fetch notifications.");
      }
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Delete single notification
  // Delete a single notification immediately (no alert)
  const handleDeleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.Id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };


  // Delete all notifications for this user
  const handleDeleteAllNotifications = () => {
    if (!userId) return;
    Alert.alert(
      "Delete All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await NotificationService.deleteAllNotifications(userId);
              setNotifications([]);
            } catch (err) {
              Alert.alert("Error", "Failed to delete all notifications.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchNotifications}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CommonHeader
        title="Notifications"
        rightComponent={
          notifications.length > 0 && (
           <MaterialCommunityIcons name="delete" size={25} color="#e98e17ff" onPress={handleDeleteAllNotifications} />
          )
        }
      />

      <FlatList
        data={notifications}
        renderItem={({ item, index }) => (
          <NotificationItem
            item={item}
            index={index}
            onDelete={handleDeleteNotification}
          />
        )}
        keyExtractor={(item) => item.Id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  <BottomTab />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff" },
  listContainer: { padding: 16, flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: { color: "#fff", fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyStateText: { fontSize: 20, fontWeight: "700", color: "#666" },
});

export default NotificationsPage;
