import { useState, useEffect } from "react";
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
  Loader,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = "http://localhost:3000/api/cafe";

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null); // { orderId, newStatus, orderData }
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // For consistent stats
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllOrders(); // Fetch all orders for stats on mount
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders();
      setCurrentPage(1); // Reset to page 1 when filters change
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedStatus]);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();

      const transformedOrders = data.map((order) => ({
        id: `#ORD-${order.order_id}`,
        status: order.order_status,
      }));

      setAllOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`${API_URL}/orders?${params.toString()}`);
      const data = await response.json();

      console.log("Fetched orders from backend:", data.slice(0, 2)); // Log first 2 orders

      // Transform backend data to match frontend structure
      const transformedOrders = data.map((order) => ({
        id: `#ORD-${order.order_id}`,
        customer: {
          name: order.user_username || "Guest",
          email: order.user_email || "",
          id: order.order_user_id || null,
        },
        // items array may not be included in list endpoint; use count when available
        items: order.items || [],
        itemsCount: order.item_count || (order.items ? order.items.length : 0),
        total: parseFloat(order.order_total),
        status: order.order_status,
        paymentMethod: order.payment_method || "N/A",
        date: new Date(order.order_created_at),
        notes: order.notes || "",
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    all: { label: "All Orders", color: "slate", icon: Package },
    processing: { label: "Processing", color: "blue", icon: Package },
    ready: { label: "Ready", color: "purple", icon: Truck },
    completed: { label: "Completed", color: "green", icon: CheckCircle },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    if (!config) return "bg-slate-100 text-slate-700";
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-700",
      blue: "bg-blue-100 text-blue-700",
      purple: "bg-purple-100 text-purple-700",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
    };
    return colorClasses[config.color] || "bg-slate-100 text-slate-700";
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    setStatusAction({ orderId, newStatus, orderData: order });
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!statusAction) return;
    
    try {
      const numericId = statusAction.orderId.replace("#ORD-", "");
      
      const response = await fetch(`${API_URL}/orders/${numericId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusAction.newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Failed to update status: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      console.log("Status updated successfully:", result);

      await Promise.all([fetchOrders(), fetchAllOrders()]);
      setShowStatusModal(false);
      setStatusAction(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setStatusAction(null);
  };

  const handleViewOrder = async (order) => {
    try {
      // Extract numeric ID from "#ORD-123" format
      const numericId = order.id.replace("#ORD-", "");

      // Fetch full order details with items
      const response = await fetch(`${API_URL}/orders/${numericId}`);
      const orderDetails = await response.json();

      // Transform to match frontend structure
      const transformedOrder = {
        ...order,
        items: orderDetails.items || [],
      };

      setSelectedOrder(transformedOrder);
      setShowOrderDetails(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const orderStats = {
    total: allOrders.length,
    processing: allOrders.filter((o) => o.status === "processing").length,
    ready: allOrders.filter((o) => o.status === "ready").length,
    completed: allOrders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {orderStats.total}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Processing</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {orderStats.processing}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ready</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {orderStats.ready}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {orderStats.completed}
              </p>
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Order ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Customer
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Items
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Total
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Date & Time
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-blue-600">
                     {order.id}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.customer.email}
                        {order.customer.id ? ` — ID:${order.customer.id}` : ""}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600">
                      {order.itemsCount} item{order.itemsCount > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-green-600">
                      ₱{order.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="text-slate-900">
                        {format(order.date, "MMM dd, yyyy")}
                      </p>
                      <p className="text-slate-500">
                        {format(order.date, "hh:mm a")}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
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
                      {order.status === "processing" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "ready")}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Mark as Ready"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "completed")
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Completed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 text-amber-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No orders found</p>
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(endIndex, orders.length)}</span> of{" "}
              <span className="font-semibold">{orders.length}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-amber-500 text-white"
                        : "bg-white border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Order Details
                </h2>
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
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Customer Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="text-slate-500">Name:</span>{" "}
                    <span className="font-medium text-slate-900">
                      {selectedOrder.customer.name}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Email:</span>{" "}
                    <span className="font-medium text-slate-900">
                      {selectedOrder.customer.email}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-slate-50 rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.order_item_product_name || item.product_name || item.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            Qty: {item.order_item_quantity || item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ₱{((item.order_item_price || item.price) * (item.order_item_quantity || item.quantity)).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        No items in this order
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    ₱{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="font-medium text-slate-900">
                    ₱{(selectedOrder.total * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-amber-600">
                    ₱{(selectedOrder.total * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payment Method</p>
                  <p className="font-medium text-slate-900">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Order Notes
                  </h3>
                  <p className="text-slate-600 bg-slate-50 rounded-lg p-3">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
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

      {/* Status Change Confirmation Modal */}
      {showStatusModal && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirm Status Change</h2>
                  <p className="text-sm text-amber-50">Update order status</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to change the status of order{" "}
                  <span className="font-bold">{statusAction.orderId}</span>?
                </p>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(statusAction.orderData?.status)}`}>
                      {statusConfig[statusAction.orderData?.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">New Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(statusAction.newStatus)}`}>
                      {statusConfig[statusAction.newStatus]?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelStatusChange}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
