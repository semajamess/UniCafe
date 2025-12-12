import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Loader,
  Download,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const Dashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("week");
  const [categoryPeriod, setCategoryPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const API_URL = "http://localhost:3000/api/cafe";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stats/dashboard?period=all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Dashboard data received:", data);
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Failed to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform backend data for stats cards
  const stats = [
    {
      name: "Total Revenue",
      value: `₱${dashboardData.stats.revenue.value.toFixed(2)}`,
      change: `${dashboardData.stats.revenue.change >= 0 ? "+" : ""}${
        dashboardData.stats.revenue.change
      }%`,
      trend: dashboardData.stats.revenue.trend,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Total Orders",
      value: dashboardData.stats.orders.value.toString(),
      change: `${dashboardData.stats.orders.change >= 0 ? "+" : ""}${
        dashboardData.stats.orders.change
      }%`,
      trend: dashboardData.stats.orders.trend,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Customers",
      value: dashboardData.stats.customers.value.toString(),
      change: `${dashboardData.stats.customers.change >= 0 ? "+" : ""}${
        dashboardData.stats.customers.change
      }%`,
      trend: dashboardData.stats.customers.trend,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Products",
      value: dashboardData.stats.products.value.toString(),
      change: `${dashboardData.stats.products.change >= 0 ? "+" : ""}${
        dashboardData.stats.products.change
      }%`,
      trend: dashboardData.stats.products.trend,
      icon: Package,
      color: "from-amber-500 to-amber-600",
    },
  ];

  // Transform revenue over time data
  const revenueData = dashboardData.revenueOverTime.map((item, index) => ({
    name: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    revenue: parseFloat(item.revenue),
    orders: item.orders,
  }));

  // Transform category data with colors
  const categoryColors = {
    Drinks: "#f59e0b",
    Food: "#3b82f6",
    Snacks: "#10b981",
    Beverages: "#ef4444",
  };

  // Top products (limit to 5)
  const topProducts = dashboardData.topProducts.slice(0, 5).map((p) => ({
    name: p.name,
    sales: parseInt(p.sales) || 0,
    revenue: parseFloat(p.revenue) || 0,
  }));

  console.log("Top Products data:", topProducts);

  // Top 5 customers
  const topCustomers =
    dashboardData.topCustomers?.map((c) => ({
      name: c.name,
      value: parseFloat(c.totalSpent),
      orders: c.orders,
      type: c.type,
    })) || [];

  console.log("Top Customers for chart:", topCustomers);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Recent orders
  const recentOrders = dashboardData.recentOrders.map((o) => ({
    id: `#${o.id}`,
    customer: o.user_username || "Guest",
    product: `${o.item_count} item${o.item_count > 1 ? "s" : ""}`,
    amount: `₱${parseFloat(o.total).toFixed(2)}`,
    status: o.status,
    time: new Date(o.created_at).toLocaleString(),
  }));

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      processing: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Download Report Function
  const downloadReport = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build CSV content
    let csvContent = "";

    // Report Header
    csvContent += "UNICAFE SALES REPORT\n";
    csvContent += `Generated on: ${today}\n\n`;

    // Summary Statistics
    csvContent += "=== SUMMARY STATISTICS ===\n";
    csvContent += `Total Revenue,${dashboardData.stats.revenue.value.toFixed(
      2
    )}\n`;
    csvContent += `Total Orders,${dashboardData.stats.orders.value}\n`;
    csvContent += `Total Customers,${dashboardData.stats.customers.value}\n`;
    csvContent += `Total Products,${dashboardData.stats.products.value}\n\n`;

    // Revenue Over Time
    csvContent += "=== REVENUE OVER TIME ===\n";
    csvContent += "Date,Revenue,Orders\n";
    dashboardData.revenueOverTime.forEach((item) => {
      csvContent += `${item.date},${parseFloat(item.revenue).toFixed(2)},${
        item.orders
      }\n`;
    });
    csvContent += "\n";

    // Top Products
    csvContent += "=== TOP PRODUCTS ===\n";
    csvContent += "Product Name,Units Sold,Revenue\n";
    dashboardData.topProducts.slice(0, 10).forEach((product) => {
      csvContent += `"${product.name}",${product.sales},${parseFloat(
        product.revenue
      ).toFixed(2)}\n`;
    });
    csvContent += "\n";

    // Top Customers
    if (dashboardData.topCustomers && dashboardData.topCustomers.length > 0) {
      csvContent += "=== TOP CUSTOMERS ===\n";
      csvContent += "Customer Name,Total Spent,Orders\n";
      dashboardData.topCustomers.forEach((customer) => {
        csvContent += `"${customer.name}",${parseFloat(
          customer.totalSpent
        ).toFixed(2)},${customer.orders}\n`;
      });
      csvContent += "\n";
    }

    // Recent Orders
    csvContent += "=== RECENT ORDERS ===\n";
    csvContent += "Order ID,Customer,Items,Amount,Status,Date\n";
    dashboardData.recentOrders.forEach((order) => {
      csvContent += `#${order.id},"${order.user_username || "Guest"}",${
        order.item_count
      },${parseFloat(order.total).toFixed(2)},${order.status},"${new Date(
        order.created_at
      ).toLocaleString()}"\n`;
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `UniCafe_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-amber-50">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-amber-50 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:border-amber-200 transition-all duration-300 card-hover transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-md`}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {stat.value}
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-2">
              {stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Revenue Overview
            </h2>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-amber-600"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="week" className="bg-white text-slate-900">
                This Week
              </option>
              <option value="month" className="bg-white text-slate-900">
                This Month
              </option>
              <option value="all" className="bg-white text-slate-900">
                All Time
              </option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                style={{ fontSize: "12px", fontWeight: 600 }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: "12px", fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #f59e0b",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue (₱)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={0}
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Customers */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Top 5 Customers
            </h2>
          </div>
          {topCustomers && topCustomers.length > 0 ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={topCustomers}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topCustomers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₱${value.toFixed(2)}`,
                      "Total Spent",
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #3b82f6",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <p className="text-slate-400">No customer data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Top 5 Selling Products
            </h2>
            <span className="text-xs font-semibold text-slate-600 uppercase">
              Units Sold
            </span>
          </div>
          <div className="flex gap-4">
            {/* Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    width={100}
                    style={{ fontSize: "11px" }}
                  />
                  <Tooltip
                    formatter={(value) => `₱${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #10b981",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    name="Revenue (₱)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Units Sold Column */}
            <div
              className="w-20 flex flex-col"
              style={{
                height: "300px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              <div className="flex-1 flex flex-col justify-around">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center"
                    style={{ height: `${100 / topProducts.length}%` }}
                  >
                    <div className="bg-blue-100 px-3 py-1.5 rounded-lg">
                      <span className="text-base font-bold text-blue-600">
                        {product.sales}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {order.id}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {order.product}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-500">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
