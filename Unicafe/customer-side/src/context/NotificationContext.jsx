import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const SOCKET_URL = "http://localhost:3000";
const API_URL = "http://localhost:3000/api/customer/notifications";

export const NotificationProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect and cleanup if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("🔌 Customer connected to notification server");
      setIsConnected(true);
      // Join customer's personal room using their user ID
      console.log(`👤 Joining room customer-${user.id}`);
      newSocket.emit("join-customer", { userId: user.id });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Customer disconnected from notification server");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Listen for customer-specific notifications
    newSocket.on("customer-notification", (notification) => {
      console.log("🔔 New customer notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play notification sound
      playNotificationSound();

      // Show browser notification if permitted
      showBrowserNotification(notification);
    });

    // Listen for order status updates
    newSocket.on("order-status-update", (data) => {
      console.log("📦 Order status update:", data);
      // This will trigger a notification through the customer-notification event
    });

    setSocket(newSocket);

    // Cleanup on unmount or when user changes
    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user?.id]);

  // Fetch initial notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, token]);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      console.log("📡 Fetching notifications...");
      const response = await fetch(`${API_URL}?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("📬 Notifications fetched:", data.length, "items");
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      console.log("📡 Fetching unread count...");
      const response = await fetch(`${API_URL}/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("🔢 Unread count:", data.count);
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/${notificationId}/read`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.notification_id === notificationId
                ? { ...n, notification_is_read: 1 }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, notification_is_read: 1 }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [token]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/${notificationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const notification = notifications.find(
            (n) => n.notification_id === notificationId
          );
          setNotifications((prev) =>
            prev.filter((n) => n.notification_id !== notificationId)
          );
          if (notification && !notification.notification_is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [token, notifications]
  );

  const clearAllNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [token]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log("Notification sound not available");
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.notification_title, {
        body: notification.notification_message,
        icon: "/coffee-icon.png",
        tag: `notification-${notification.notification_id}`,
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  };

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order_placed":
        return "📝";
      case "order_preparing":
        return "👨‍🍳";
      case "order_ready":
        return "✅";
      case "order_completed":
        return "🎉";
      case "order_cancelled":
        return "❌";
      case "promo":
        return "🎁";
      case "welcome":
        return "👋";
      default:
        return "🔔";
    }
  };

  // Refresh all notification data
  const refreshNotifications = async () => {
    await fetchNotifications();
    await fetchUnreadCount();
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    formatTime,
    getNotificationIcon,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
