import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = "http://localhost:3000/api/cafe";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        fetchCustomers(searchTerm);
      } else {
        fetchCustomers();
      }
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`${API_URL}/customers${params}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-500 mt-1">Manage your customer base</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 text-amber-500 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No customers found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                    Total Orders
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                    Total Spent
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.user_id || customer.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {customer.user_profile_image ? (
                          <img
                            src={customer.user_profile_image}
                            alt={customer.user_username || customer.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold">
                            {customer.user_username || customer.username
                              ? (customer.user_username || customer.username)
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.user_username ||
                              customer.username ||
                              "Unknown"}
                            {customer.user_deleted_at && (
                              <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                                Deactivated
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Member since{" "}
                            {format(
                              new Date(
                                customer.user_created_at || customer.created_at
                              ),
                              "MMM yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center">
                          <Mail className="w-3 h-3 mr-2" />
                          {customer.user_email || customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">
                        {customer.totalOrders || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-600">
                        ₱{parseFloat(customer.totalSpent || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600">
                        {customer.lastOrder
                          ? format(new Date(customer.lastOrder), "MMM dd, yyyy")
                          : "No orders"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {customers.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(endIndex, customers.length)}
                  </span>{" "}
                  of <span className="font-semibold">{customers.length}</span>{" "}
                  customers
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
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
