import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CafeBackground from "../components/CafeBackground";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-amber-50/30 overflow-hidden relative">
      {/* Animated cafe background */}
      <CafeBackground />

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header - needs highest z-index for notifications dropdown */}
        <div className="relative z-50">
          <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
