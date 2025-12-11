import {
  Menu,
  Bell,
  Search,
  Check,
  Trash2,
  CheckCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

const Header = ({ setSidebarOpen, sidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    formatTime,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_order":
        return "🛒";
      case "order_status":
        return "📦";
      case "pos_sale":
        return "💳";
      case "low_stock":
        return "⚠️";
      case "new_customer":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <header className="h-16 bg-gradient-to-r from-white via-amber-50/30 to-white border-b-2 border-amber-100 px-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between h-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-600 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all transform hover:scale-110"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="pl-10 pr-4 py-2 w-80 border-2 border-amber-100 bg-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-600 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all transform hover:scale-110"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-amber-100 z-[9999] animate-scale-in overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No notifications yet</p>
                      <p className="text-sm">
                        New notifications will appear here
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        className={`p-4 border-b border-slate-100 hover:bg-amber-50 cursor-pointer transition-all group ${
                          !notification.notification_is_read
                            ? "bg-amber-50/70 border-l-4 border-l-orange-500"
                            : ""
                        }`}
                        onClick={() =>
                          !notification.notification_is_read &&
                          markAsRead(notification.notification_id)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">
                            {getNotificationIcon(
                              notification.notification_type
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {notification.notification_title}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                              {notification.notification_message}
                            </p>
                            <p className="text-xs text-amber-600 mt-1 font-semibold">
                              {formatTime(notification.notification_created_at)}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.notification_is_read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.notification_id);
                                }}
                                className="p-1 hover:bg-green-100 rounded text-green-600"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(
                                  notification.notification_id
                                );
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 text-center border-t-2 border-amber-100 bg-amber-50">
                    <p className="text-xs text-slate-500">
                      Showing {notifications.length} notification
                      {notifications.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
