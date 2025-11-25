import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock orders data
  const [orders, setOrders] = useState([
    {
      id: "#ORD-1234",
      customer: { name: "John Doe", email: "john@example.com", phone: "+1 234 567 8900" },
      items: [
        { name: "Cappuccino", quantity: 2, price: 4.50 },
        { name: "Croissant", quantity: 1, price: 3.50 },
      ],
      total: 12.50,
      status: "pending",
      paymentMethod: "Credit Card",
      date: new Date(2024, 10, 25, 10, 30),
      notes: "Extra foam please",
    },
    {
      id: "#ORD-1233",
      customer: { name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 8901" },
      items: [
        { name: "Latte", quantity: 1, price: 4.79 },
        { name: "Espresso", quantity: 2, price: 2.99 },
      ],
      total: 10.77,
      status: "processing",
      paymentMethod: "Cash",
      date: new Date(2024, 10, 25, 10, 15),
      notes: "",
    },
    {
      id: "#ORD-1232",
      customer: { name: "Bob Johnson", email: "bob@example.com", phone: "+1 234 567 8902" },
      items: [
        { name: "Iced Latte", quantity: 2, price: 4.99 },
        { name: "Muffin", quantity: 2, price: 3.00 },
      ],
      total: 15.98,
      status: "completed",
      paymentMethod: "Debit Card",
      date: new Date(2024, 10, 25, 9, 45),
      notes: "No sugar",
    },
    {
      id: "#ORD-1231",
      customer: { name: "Alice Brown", email: "alice@example.com", phone: "+1 234 567 8903" },
      items: [
        { name: "Americano", quantity: 3, price: 3.99 },
      ],
      total: 11.97,
      status: "ready",
      paymentMethod: "Mobile Pay",
      date: new Date(2024, 10, 25, 9, 20),
      notes: "",
    },
    {
      id: "#ORD-1230",
      customer: { name: "Charlie Wilson", email: "charlie@example.com", phone: "+1 234 567 8904" },
      items: [
        { name: "Caramel Macchiato", quantity: 1, price: 5.49 },
        { name: "Cookie", quantity: 3, price: 2.50 },
      ],
      total: 12.99,
      status: "cancelled",
      paymentMethod: "Credit Card",
      date: new Date(2024, 10, 25, 8, 50),
      notes: "Customer cancelled",
    },
  ]);

  const statusConfig = {
    all: { label: "All Orders", color: "slate", icon: Package },
    pending: { label: "Pending", color: "yellow", icon: Clock },
    processing: { label: "Processing", color: "blue", icon: Package },
    ready: { label: "Ready", color: "purple", icon: Truck },
    completed: { label: "Completed", color: "green", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "red", icon: XCircle },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-700",
      blue: "bg-blue-100 text-blue-700",
      purple: "bg-purple-100 text-purple-700",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
    };
    return colorClasses[config.color];
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{orderStats.total}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{orderStats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Processing</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{orderStats.processing}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{orderStats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center space-x-2 ${
                  selectedStatus === key
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <config.icon className="w-4 h-4" />
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Items</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Total</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date & Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-900">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-900">{order.customer.name}</p>
                      <p className="text-sm text-slate-500">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="text-slate-900">{format(order.date, "MMM dd, yyyy")}</p>
                      <p className="text-slate-500">{format(order.date, "hh:mm a")}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "processing")}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Accept Order"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {(order.status === "pending" || order.status === "processing") && (
                        <button
                          onClick={() => handleStatusChange(order.id, "cancelled")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Order"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
                <p className="text-slate-500 mt-1">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="text-slate-500">Name:</span>{" "}
                    <span className="font-medium text-slate-900">{selectedOrder.customer.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Email:</span>{" "}
                    <span className="font-medium text-slate-900">{selectedOrder.customer.email}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Phone:</span>{" "}
                    <span className="font-medium text-slate-900">{selectedOrder.customer.phone}</span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="font-medium text-slate-900">${(selectedOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-amber-600">${(selectedOrder.total * 1.1).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payment Method</p>
                  <p className="font-medium text-slate-900">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Order Notes</h3>
                  <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                {selectedOrder.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, "processing");
                        setShowOrderDetails(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, "cancelled");
                        setShowOrderDetails(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject Order
                    </button>
                  </>
                )}
                {selectedOrder.status === "processing" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "ready");
                      setShowOrderDetails(false);
                    }}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Mark as Ready
                  </button>
                )}
                {selectedOrder.status === "ready" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "completed");
                      setShowOrderDetails(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
