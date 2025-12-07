import { Menu, Bell, Search } from "lucide-react";
import { useState } from "react";

const Header = ({ setSidebarOpen, sidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      text: "New order #1234 received",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      text: "Product stock low: Espresso Beans",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      text: "New customer registration",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-gradient-to-r from-white via-amber-50/30 to-white border-b-2 border-amber-100 px-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between h-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all transform hover:scale-110"
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
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-600 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all transform hover:scale-110"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-amber-100 z-50 animate-scale-in overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500">
                  <h3 className="text-sm font-bold text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-slate-100 hover:bg-amber-50 cursor-pointer transition-all ${
                        notification.unread
                          ? "bg-amber-50/70 border-l-4 border-l-orange-500"
                          : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {notification.text}
                      </p>
                      <p className="text-xs text-amber-600 mt-1 font-semibold">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t-2 border-amber-100 bg-amber-50">
                  <button className="text-sm text-amber-700 hover:text-amber-900 font-bold">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
