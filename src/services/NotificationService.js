const API_BASE_URL = 'https://scheme.bmgjewellers.com/api/v1';

class NotificationService {
  // Get all notifications for a user
  async getUserNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data: data.data || data.notifications || [],
        message: 'Fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        code: 500,
        data: [],
        message: error.message,
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data,
        message: 'Marked as read successfully',
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete a single notification by ID
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/notification/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications for a user
  async deleteAllNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        code: 200,
        data,
        message: 'All notifications deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  // Format date for display
  formatNotificationDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Filter notifications by status
  filterNotificationsByStatus(notifications, status) {
    return notifications.filter(n => n.Status === status);
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
