const API_BASE_URL = "https://scheme.bmgjewellers.com/api/v1";

class NotificationService {
  // Get all notifications for a user
  async getUserNotifications(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${userId}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data: data.data || data.notifications || [],
        message: "Fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        code: 500,
        data: [],
        message: error.message,
      };
    }
  }

  // 👉 SEND WELCOME MESSAGE (POST)
  async sendWelcomeNotification(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/sendMessage/6/user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      return {
        code: 200,
        data: result,
        message: "Welcome notification sent",
      };
    } catch (error) {
      console.error("🔥 Error sending welcome notification:", error);
      return {
        code: 500,
        data: null,
        message: error.message,
      };
    }
  }

  // Delete a single notification by ID
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/notification/${notificationId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Delete all notifications for a user
  async deleteAllNotifications(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data,
        message: "All notifications deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  }

  // 👉 SEND CUSTOM SCHEME JOIN NOTIFICATION
  // 👉 SEND SCHEME JOIN NOTIFICATION (AUTO MESSAGE)
  async sendSchemeJoinNotification({ userId, schemeName, amount, imageUrl }) {
    try {
      const message =
        `You have successfully enrolled in the ${schemeName}. ` +
        `Your monthly installment amount is ₹${amount}. ` +
        `Payments can be made anytime before the due date each month.`;

      const payload = {
        userId: String(userId),
        title: `${schemeName} Joined`,
        message,
        imageUrl,
      };

      console.log("[NotificationService] Sending payload:", payload);

      const response = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      console.log("[NotificationService] Join notification result:", result);

      return {
        code: 200,
        data: result,
        message: "Scheme join notification sent",
      };
    } catch (error) {
      console.error("🔥 Error sending scheme join notification:", error);
      return {
        code: 500,
        data: null,
        message: error.message,
      };
    }
  }

  // Format date for display
  formatNotificationDate(dateString) {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Filter notifications by status
  filterNotificationsByStatus(notifications, status) {
    return notifications.filter((n) => n.Status === status);
  }

  // Sort notifications by date (newest first by default)
  sortNotificationsByDate(notifications, ascending = false) {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.CreatedAt);
      const dateB = new Date(b.CreatedAt);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}

export default new NotificationService();
