import { useState } from "react";
import { Search, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      location: "New York, USA",
      totalOrders: 42,
      totalSpent: 487.50,
      lastOrder: new Date(2024, 10, 25),
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
      location: "Los Angeles, USA",
      totalOrders: 38,
      totalSpent: 412.30,
      lastOrder: new Date(2024, 10, 24),
      status: "active",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 234 567 8902",
      location: "Chicago, USA",
      totalOrders: 25,
      totalSpent: 298.75,
      lastOrder: new Date(2024, 10, 23),
      status: "active",
    },
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Customer</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Contact</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Total Orders</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Total Spent</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {customer.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 flex items-center">
                      <Mail className="w-3 h-3 mr-2" />
                      {customer.email}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center">
                      <Phone className="w-3 h-3 mr-2" />
                      {customer.phone}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-slate-900">{customer.totalOrders}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-green-600">${customer.totalSpent.toFixed(2)}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-600">{format(customer.lastOrder, "MMM dd, yyyy")}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
