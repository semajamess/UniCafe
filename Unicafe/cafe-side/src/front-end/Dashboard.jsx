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
} from "lucide-react";
import { useState } from "react";
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
} from "recharts";

const Dashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("week");
  const [categoryPeriod, setCategoryPeriod] = useState("week");

  // Mock data for statistics
  const stats = [
    {
      name: "Total Revenue",
      value: "$48,574",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Total Orders",
      value: "1,284",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Customers",
      value: "892",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Products",
      value: "156",
      change: "-2.4%",
      trend: "down",
      icon: Package,
      color: "from-amber-500 to-amber-600",
    },
  ];

  // Revenue data by period
  const revenueDataSets = {
    week: [
      { name: "Mon", revenue: 820, orders: 24 },
      { name: "Tue", revenue: 950, orders: 28 },
      { name: "Wed", revenue: 1100, orders: 32 },
      { name: "Thu", revenue: 1050, orders: 30 },
      { name: "Fri", revenue: 1400, orders: 42 },
      { name: "Sat", revenue: 1650, orders: 48 },
      { name: "Sun", revenue: 1430, orders: 40 },
    ],
    month: [
      { name: "Week 1", revenue: 4200, orders: 120 },
      { name: "Week 2", revenue: 3800, orders: 98 },
      { name: "Week 3", revenue: 5100, orders: 145 },
      { name: "Week 4", revenue: 4600, orders: 132 },
    ],
    all: [
      { name: "Jan", revenue: 14200, orders: 420 },
      { name: "Feb", revenue: 13800, orders: 398 },
      { name: "Mar", revenue: 15100, orders: 445 },
      { name: "Apr", revenue: 14600, orders: 432 },
      { name: "May", revenue: 15900, orders: 467 },
      { name: "Jun", revenue: 16400, orders: 489 },
    ],
  };

  const revenueData = revenueDataSets[revenuePeriod];

  // Category data by period
  const categoryDataSets = {
    week: [
      { name: "Coffee", value: 450, color: "#f59e0b" },
      { name: "Pastries", value: 280, color: "#3b82f6" },
      { name: "Snacks", value: 180, color: "#10b981" },
      { name: "Beverages", value: 120, color: "#ef4444" },
    ],
    month: [
      { name: "Coffee", value: 1850, color: "#f59e0b" },
      { name: "Pastries", value: 1140, color: "#3b82f6" },
      { name: "Snacks", value: 720, color: "#10b981" },
      { name: "Beverages", value: 490, color: "#ef4444" },
    ],
    all: [
      { name: "Coffee", value: 12400, color: "#f59e0b" },
      { name: "Pastries", value: 7800, color: "#3b82f6" },
      { name: "Snacks", value: 4200, color: "#10b981" },
      { name: "Beverages", value: 2900, color: "#ef4444" },
    ],
  };

  const categoryData = categoryDataSets[categoryPeriod];

  // Top products data
  const topProducts = [
    { name: "Cappuccino", sales: 342, revenue: 1538 },
    { name: "Espresso", sales: 298, revenue: 892 },
    { name: "Latte", sales: 276, revenue: 1324 },
    { name: "Americano", sales: 234, revenue: 936 },
    { name: "Mocha", sales: 189, revenue: 945 },
  ];

  // Recent orders
  const recentOrders = [
    { id: "#1234", customer: "John Doe", product: "Cappuccino x2", amount: "$9.00", status: "completed", time: "2 min ago" },
    { id: "#1233", customer: "Jane Smith", product: "Latte x1, Mocha x1", amount: "$10.50", status: "processing", time: "5 min ago" },
    { id: "#1232", customer: "Bob Johnson", product: "Espresso x3", amount: "$8.97", status: "completed", time: "12 min ago" },
    { id: "#1231", customer: "Alice Brown", product: "Cold Brew x1", amount: "$4.50", status: "pending", time: "18 min ago" },
    { id: "#1230", customer: "Charlie Wilson", product: "Americano x2", amount: "$7.98", status: "completed", time: "25 min ago" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      processing: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-amber-50">Welcome back! Here's what's happening today.</p>
          </div>
          <button className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-amber-50">
            Download Report
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
              <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-md`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-600 mt-2">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Revenue Overview</h2>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-amber-600"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="week" className="bg-white text-slate-900">This Week</option>
              <option value="month" className="bg-white text-slate-900">This Month</option>
              <option value="all" className="bg-white text-slate-900">All Time</option>
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
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sales by Category</h2>
            <select
              value={categoryPeriod}
              onChange={(e) => setCategoryPeriod(e.target.value)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-700"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="week" className="bg-white text-slate-900">This Week</option>
              <option value="month" className="bg-white text-slate-900">This Month</option>
              <option value="all" className="bg-white text-slate-900">All Time</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #3b82f6', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Sales</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{product.sales}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">${product.revenue}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(product.sales / 342) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{order.id}</p>
                  <p className="text-xs text-slate-500 truncate">{order.product}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
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
