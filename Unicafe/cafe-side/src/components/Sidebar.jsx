import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Coffee,
  X,
  CreditCard,
  Monitor,
  LogOut,
} from "lucide-react";
import { useAuth } from "../App";
import { useState, useEffect } from "react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("UniCafé");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
            setStoreName(data.store_name || "UniCafé");
            return;
          }
        }

        // Cache expired or doesn't exist, fetch fresh data
        const response = await fetch("http://localhost:3000/api/cafe/settings");
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "UniCafé");

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

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowSignOutModal(false);
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS", href: "/pos", icon: Monitor },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-50 to-white border-r-2 border-amber-100 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b-2 border-amber-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-2.5 rounded-xl shadow-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {storeName}
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-amber-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200"
                      : "text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t-2 border-amber-100">
            <div className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-md mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || "A"}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-900">
                  {user?.name || user?.username || "Admin"}
                </p>
                <p className="text-xs font-medium text-amber-700">
                  {user?.email || "admin@unicafe.com"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSignOutModal(true)}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Sign Out</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to sign out? You'll need to log in again to
              access the cafe dashboard.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
