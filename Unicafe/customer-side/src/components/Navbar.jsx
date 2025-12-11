import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Coffee,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  AlertTriangle,
  Bell,
  Check,
  Trash2,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [storeName, setStoreName] = useState("UniCafe");
  const notificationRef = useRef(null);
  const { getTotalItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    formatTime,
    getNotificationIcon,
    requestNotificationPermission,
    refreshNotifications,
  } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  // Refresh notifications when route changes (e.g., after placing an order)
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    }
  }, [location.pathname, isAuthenticated]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch and cache store settings with 5-minute TTL
  useEffect(() => {
    const CACHE_KEY = "storeSettings";
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    const fetchStoreSettings = async () => {
      try {
        // Check if cache exists and is still valid
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;

          if (cacheAge < CACHE_TTL) {
            // Cache is still valid, use it
            setStoreName(data.store_name || "UniCafe");
            return;
          }
        }

        // Cache expired or doesn't exist, fetch fresh data
        const response = await fetch(
          "http://localhost:3000/api/customer/settings"
        );
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "UniCafe");

          // Save to cache with timestamp
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: data,
              timestamp: Date.now(),
            })
          );
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };

    fetchStoreSettings();

    // Only fetch on window focus (no polling)
    const handleFocus = () => {
      fetchStoreSettings();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <Coffee className="h-8 w-8 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span className="text-2xl font-bold gradient-text">
                {storeName}
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-gray-700 hover:text-amber-600 transition-colors font-medium ${
                    location.pathname === link.path ? "text-amber-600" : ""
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-600"
                    />
                  )}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              {isAuthenticated && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      if (!showNotifications) {
                        // Refresh notifications when opening the dropdown
                        refreshNotifications();
                      }
                      setShowNotifications(!showNotifications);
                    }}
                    className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.notification_id}
                                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                  !notification.notification_is_read
                                    ? "bg-amber-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">
                                    {getNotificationIcon(
                                      notification.notification_type
                                    )}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm">
                                      {notification.notification_title}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                                      {notification.notification_message}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                      {formatTime(
                                        notification.notification_created_at
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!notification.notification_is_read && (
                                      <button
                                        onClick={() =>
                                          markAsRead(
                                            notification.notification_id
                                          )
                                        }
                                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                        title="Mark as read"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        deleteNotification(
                                          notification.notification_id
                                        )
                                      }
                                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <Link
                                to="/orders"
                                onClick={() => setShowNotifications(false)}
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                              >
                                View Orders
                              </Link>
                              <button
                                onClick={clearAllNotifications}
                                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-500"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-amber-600"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2 px-4 rounded-lg ${
                      location.pathname === link.path
                        ? "bg-amber-100 text-amber-600 font-semibold"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-4 rounded-lg text-gray-700 hover:bg-amber-50"
                  >
                    <span>Cart</span>
                    {getTotalItems() > 0 && (
                      <span className="bg-amber-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                )}

                {/* Mobile Notifications */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full py-2 px-4 rounded-lg text-gray-700 hover:bg-amber-50"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 py-2 px-4 rounded-lg text-gray-700 hover:bg-amber-50"
                    >
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-amber-500"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="font-semibold">{user?.username}</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left py-2 px-4 rounded-lg text-gray-700 hover:bg-amber-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-4 rounded-lg bg-amber-600 text-white text-center font-semibold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={handleLogoutCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout? You'll need to sign in again
                  to place orders.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogoutCancel}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
