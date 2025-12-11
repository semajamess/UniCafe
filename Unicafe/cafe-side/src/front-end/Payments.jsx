import { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/cafe";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPayments();
      setCurrentPage(1); // Reset to page 1 when filters change
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [search, statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (search) {
        params.append("search", search);
      }

      if (methodFilter !== "all") {
        params.append("method", methodFilter);
      }

      const res = await fetch(`${API_URL}/payments?${params.toString()}`);
      const data = await res.json();

      const formatMethod = (method) => {
        if (!method) return "N/A";
        return method
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const mapped = data.map((p) => ({
        id: p.payment_id,
        paymentRef: `#PAY-${p.payment_id}`,
        orderRef: `#ORD-${p.order_id}`,
        amount: parseFloat(p.payment_amount || 0),
        method: formatMethod(p.payment_method),
        status: p.payment_status || "pending",
        created_at: p.payment_created_at,
        customer_name: p.user_username || p.user_email || "Guest",
        order_total: p.order_total,
      }));

      setPayments(mapped);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { value: "cash", label: "Cash" },
    { value: "gcash", label: "E-Wallet" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];
  const statuses = [
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openDetails = async (paymentOrOrder) => {
    try {
      setDetailLoading(true);
      // paymentOrOrder may be the mapped payment object; prefer orderRef to fetch the order
      const orderRef =
        paymentOrOrder.orderRef || paymentOrOrder.orderRef === undefined
          ? paymentOrOrder.orderRef
          : null;
      // Extract numeric order id from orderRef (format: #ORD-<id>)
      let numericId = null;
      if (typeof paymentOrOrder === "object" && paymentOrOrder.orderRef) {
        numericId = paymentOrOrder.orderRef.replace("#ORD-", "");
      } else if (typeof paymentOrOrder === "string") {
        numericId = paymentOrOrder.replace("#ORD-", "");
      } else if (typeof paymentOrOrder === "number") {
        numericId = String(paymentOrOrder);
      }

      if (!numericId) {
        throw new Error("Order id not available");
      }

      const res = await fetch(`${API_URL}/orders/${numericId}`);
      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.error("Error loading order details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => setSelected(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 mt-1">
          All payments derived from customer orders — filter, search, and
          inspect details.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments, methods, customers..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Method</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All</option>
                {methods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
          <div className="py-12 text-center text-slate-500">
            No payments found
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-3">Payment / Order</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Method</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-4 font-medium text-blue-600">
                      {p.paymentRef || p.orderRef}
                    </td>
                    <td className="py-4">{p.customer_name}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          p.method === "Cash"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.method === "E-Wallet"
                            ? "bg-blue-100 text-blue-700"
                            : p.method === "Bank Transfer"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.method}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-green-600">
                      ₱{p.amount.toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => openDetails(p)}
                        className="px-3 py-1 bg-amber-500 text-white rounded-md"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {payments.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(endIndex, payments.length)}
                </span>{" "}
                of <span className="font-semibold">{payments.length}</span>{" "}
                payments
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    )
                  )}
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
      )}

      {/* Order details modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Order Details — #{selected.order_id}
              </h3>
              <button onClick={closeDetails} className="text-slate-600">
                Close
              </button>
            </div>

            {detailLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-semibold">
                      {selected.user_username ||
                        selected.user_email ||
                        selected.order_customer_name ||
                        "Guest"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Method</p>
                    <p className="font-semibold">
                      {selected.payment?.payment_method ||
                        selected.payment_method ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-500">Items</p>
                  <div className="mt-2">
                    {(selected.items || []).map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-medium">
                            {it.order_item_product_name ||
                              it.product_name ||
                              "Unknown Item"}
                          </div>
                          <div className="text-xs text-slate-500">
                            Qty: {it.order_item_quantity || it.quantity || 1}
                          </div>
                        </div>
                        <div className="font-semibold">
                          ₱
                          {(
                            parseFloat(it.order_item_price || it.price || 0) *
                            (it.order_item_quantity || it.quantity || 1)
                          ).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-bold">
                    ₱{parseFloat(selected.order_total || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
