import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  UserCheck,
  Banknote,
  X,
  Check,
  Coffee,
  UtensilsCrossed,
  Receipt,
  RefreshCw,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package,
  XCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/cafe";

const POS = () => {
  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);

  // Customer state
  const [customerType, setCustomerType] = useState("guest"); // 'guest' | 'registered'
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [processing, setProcessing] = useState(false);

  // Receipt/Success state
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Today's summary
  const [todaySummary, setTodaySummary] = useState(null);

  // Recent orders
  const [recentOrders, setRecentOrders] = useState([]);
  const [showRecentOrders, setShowRecentOrders] = useState(false);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    fetchTodaySummary();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.product_category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Debounced customer search
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCustomers(customerSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pos/products`);
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const response = await fetch(`${API_URL}/pos/summary/today`);
      const data = await response.json();
      setTodaySummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/pos/orders/recent`);
      const data = await response.json();
      setRecentOrders(data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const searchCustomers = async (query) => {
    try {
      setSearchingCustomer(true);
      const response = await fetch(`${API_URL}/pos/customers/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCustomerResults(data);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setSearchingCustomer(false);
    }
  };

  // Cart functions
  const addToCart = (product) => {
    if (product.product_stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.product_id);
      if (existing) {
        if (existing.quantity >= product.product_stock) return prev;
        return prev.map((item) =>
          item.productId === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.product_id,
          name: product.product_name,
          price: product.product_price,
          quantity: 1,
          maxStock: product.product_stock,
          image: product.product_image_url,
        },
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerType("guest");
    setCustomerSearch("");
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Payment functions
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validation: if customer type is "registered", must have selected a customer
    if (customerType === "registered" && !selectedCustomer) {
      alert("Please select a registered customer or switch to Guest mode.");
      return;
    }
    
    setAmountReceived("");
    setShowPaymentModal(true);
  };

  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = getCartTotal();
    return Math.max(0, received - total);
  };

  const processPayment = async () => {
    if (parseFloat(amountReceived) < getCartTotal()) {
      alert("Insufficient amount received");
      return;
    }

    try {
      setProcessing(true);

      const orderData = {
        customerId: selectedCustomer?.user_id || null,
        customerName: selectedCustomer?.user_username || "Walk-in Customer",
        customerEmail: selectedCustomer?.user_email || null,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentMethod: "cash",
        amountReceived: parseFloat(amountReceived),
        total: getCartTotal(),
      };

      const response = await fetch(`${API_URL}/pos/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process order");
      }

      setLastOrder(result);
      setShowPaymentModal(false);
      setShowReceipt(true);

      // Refresh data
      fetchProducts();
      fetchTodaySummary();
      clearCart();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Quick amount buttons for cash
  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  // Check if checkout is disabled
  const isCheckoutDisabled = () => {
    if (cart.length === 0) return true;
    if (customerType === "registered" && !selectedCustomer) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      {/* Professional Header - Light Theme */}
      <div className="bg-white border-b-2 border-amber-100 shadow-lg">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-3 rounded-xl shadow-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  Point of Sale
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                    LIVE
                  </span>
                </h1>
                <p className="text-sm text-slate-600 font-semibold">UniCafé - Walk-in Orders System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Today's Summary Cards */}
              {todaySummary && (
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-3 rounded-xl border-2 border-green-200 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg shadow-md">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-bold">Today's Revenue</p>
                        <p className="text-xl font-bold text-green-800">
                          ₱{todaySummary.total_revenue?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 px-6 py-3 rounded-xl border-2 border-blue-200 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-sky-500 p-2 rounded-lg shadow-md">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 font-bold">Orders Today</p>
                        <p className="text-xl font-bold text-blue-800">{todaySummary.total_orders || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  fetchRecentOrders();
                  setShowRecentOrders(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Clock className="w-5 h-5" />
                Recent Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-105px)]">
        {/* Products Section - Enhanced */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-50">
          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700 font-medium shadow-sm"
              />
            </div>

            <div className="flex bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
              {[
                { value: "all", label: "All Products", icon: Package },
                { value: "Drinks", label: "Beverages", icon: Coffee },
                { value: "Food", label: "Food Items", icon: UtensilsCrossed },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-3 flex items-center gap-2.5 transition-all font-semibold ${
                    selectedCategory === cat.value
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid - Professional Cards */}
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <RefreshCw className="w-12 h-12 animate-spin text-amber-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((item) => item.productId === product.product_id);
                  const isOutOfStock = product.product_stock <= 0;

                  return (
                    <button
                      key={product.product_id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`group relative bg-white rounded-2xl p-4 text-left transition-all duration-200 ${
                        isOutOfStock
                          ? "border-2 border-slate-200 opacity-60 cursor-not-allowed"
                          : inCart
                          ? "border-2 border-amber-400 shadow-xl shadow-amber-100 scale-[1.02]"
                          : "border-2 border-slate-200 hover:border-amber-300 hover:shadow-lg hover:scale-[1.02]"
                      }`}
                    >
                      {/* Stock Badge - Top Right */}
                      <div
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                          isOutOfStock
                            ? "bg-red-500 text-white"
                            : product.product_stock <= 5
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {isOutOfStock ? "OUT" : `${product.product_stock} left`}
                      </div>

                      {/* In Cart Badge - Top Left */}
                      {inCart && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg animate-pulse">
                          {inCart.quantity}
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
                        {product.product_image_url ? (
                          <img
                            src={product.product_image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {product.product_category === "Drinks" ? (
                              <Coffee className="w-16 h-16 text-slate-300" />
                            ) : (
                              <UtensilsCrossed className="w-16 h-16 text-slate-300" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-amber-600">₱{product.product_price.toFixed(2)}</p>
                          {!isOutOfStock && (
                            <Plus className={`w-5 h-5 ${inCart ? 'text-amber-500' : 'text-slate-400'} group-hover:text-amber-500`} />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Package className="w-20 h-20 mb-4" />
                <p className="text-lg font-semibold">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section - Professional Sidebar */}
        <div className="w-[420px] bg-white border-l-2 border-slate-200 flex flex-col shadow-2xl">
          {/* Customer Selection */}
          <div className="p-6 border-b-2 border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <h3 className="text-xs font-bold text-slate-500 mb-3 tracking-wider uppercase">Customer Type</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setCustomerType("guest");
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-sm ${
                  customerType === "guest"
                    ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <User className="w-5 h-5" />
                Walk-in Guest
              </button>
              <button
                onClick={() => setCustomerType("registered")}
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-sm ${
                  customerType === "registered"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <UserCheck className="w-5 h-5" />
                Registered
              </button>
            </div>

            {customerType === "registered" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                  {searchingCustomer && (
                    <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                  )}

                  {customerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-10 max-h-64 overflow-y-auto">
                      {customerResults.map((customer) => (
                        <button
                          key={customer.user_id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch("");
                            setCustomerResults([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <p className="font-bold text-slate-800">{customer.user_username}</p>
                          <p className="text-xs text-slate-500">{customer.user_email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-amber-600 font-semibold">
                              {customer.order_count} orders
                            </span>
                            <span className="text-xs text-green-600 font-semibold">
                              ₱{customer.total_spent?.toFixed(2)} spent
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!selectedCustomer && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 font-medium">
                      Please select a registered customer to continue
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedCustomer && (
              <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <p className="font-bold text-slate-800">{selectedCustomer.user_username}</p>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{selectedCustomer.user_email}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-white px-2 py-1 rounded-md text-amber-600 font-semibold">
                        {selectedCustomer.order_count} orders
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded-md text-green-600 font-semibold">
                        ₱{selectedCustomer.total_spent?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerType("guest");
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Order Items ({getCartItemCount()})
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <ShoppingCart className="w-16 h-16 text-slate-300" />
                </div>
                <p className="text-base font-semibold mb-1">Cart is empty</p>
                <p className="text-sm">Add products to start an order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="w-7 h-7 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 mb-1">₱{item.price.toFixed(2)} each</p>
                      <p className="text-amber-600 text-base font-bold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Total & Checkout - Enhanced */}
          <div className="p-6 border-t-2 border-slate-200 bg-white">
            <div className="bg-gradient-to-r from-slate-50 to-amber-50 p-4 rounded-xl mb-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Order Total</p>
                  <p className="text-3xl font-bold text-slate-800">₱{getCartTotal().toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Items</p>
                  <p className="text-2xl font-bold text-amber-600">{getCartItemCount()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled()}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform flex items-center justify-center gap-3 ${
                isCheckoutDisabled()
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-200 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <Banknote className="w-6 h-6" />
              Process Cash Payment
            </button>
            
            {isCheckoutDisabled() && cart.length > 0 && (
              <p className="text-xs text-center text-red-500 mt-2 font-medium">
                {customerType === "registered" && !selectedCustomer
                  ? "⚠️ Select a customer to continue"
                  : "Cart is empty"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal - Cash Only, Professional Design */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cash Payment</h2>
                  <p className="text-sm text-green-100">Complete the transaction</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl p-5 mb-6 border-2 border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-600 font-semibold">Total Items</span>
                  <span className="font-bold text-lg">{getCartItemCount()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-white">
                  <span className="text-slate-700 font-bold text-lg">Amount to Pay</span>
                  <span className="text-3xl font-bold text-green-600">₱{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Cash Amount Input */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-500 mb-3 tracking-wider uppercase">Cash Received</h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center border-2 border-slate-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none bg-white"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAmountReceived(amount.toString())}
                      className="py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
                    >
                      ₱{amount}
                    </button>
                  ))}
                </div>

                {/* Exact Amount Button */}
                <button
                  onClick={() => setAmountReceived(getCartTotal().toString())}
                  className="w-full mt-3 py-3 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-800 border-2 border-amber-300 rounded-xl text-sm font-bold transition-all"
                >
                  Exact Amount: ₱{getCartTotal().toFixed(2)}
                </button>

                {/* Change Display */}
                {amountReceived && parseFloat(amountReceived) >= getCartTotal() && (
                  <div className="mt-5 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 text-center shadow-sm">
                    <p className="text-sm text-green-600 font-bold mb-1 tracking-wider uppercase">Change</p>
                    <p className="text-4xl font-bold text-green-700">
                      ₱{calculateChange().toFixed(2)}
                    </p>
                  </div>
                )}

                {amountReceived && parseFloat(amountReceived) < getCartTotal() && (
                  <div className="mt-5 p-4 bg-red-50 rounded-xl border-2 border-red-200 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600 font-bold">Insufficient amount - Need ₱{(getCartTotal() - parseFloat(amountReceived)).toFixed(2)} more</p>
                  </div>
                )}
              </div>

              {/* Process Button */}
              <button
                onClick={processPayment}
                disabled={processing || parseFloat(amountReceived) < getCartTotal()}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    Complete Transaction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal - Professional */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Payment Complete!</h2>
                  <p className="text-sm text-green-100">Transaction successful</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Receipt */}
              <div className="bg-white rounded-xl p-5 mb-4 border-2 border-dashed border-slate-300">
                <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-slate-200">
                  <div className="bg-amber-500 w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <Coffee className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">UniCafé</h3>
                  <p className="text-sm text-slate-500 font-medium">Official Receipt</p>
                  <p className="text-xs text-slate-400 mt-1">Order #{lastOrder.order.order_id}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(lastOrder.order.order_created_at).toLocaleString()}
                  </p>
                </div>

                <div className="mb-4 pb-3 border-b border-dashed border-slate-200">
                  <p className="text-sm text-slate-600 font-semibold mb-1">
                    Customer: <span className="text-slate-800">{lastOrder.order.order_customer_name}</span>
                  </p>
                  {lastOrder.order.user_username && (
                    <p className="text-xs text-amber-600 font-semibold">
                      Member: {lastOrder.order.user_username}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {lastOrder.order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">
                        <span className="font-bold text-slate-900">{item.order_item_quantity}x</span> {item.order_item_product_name}
                      </span>
                      <span className="font-semibold">₱{(item.order_item_price * item.order_item_quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-slate-700">Total</span>
                    <span className="text-green-600">₱{lastOrder.payment.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Cash Received</span>
                    <span className="font-semibold">₱{lastOrder.payment.amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>Change</span>
                    <span>₱{lastOrder.payment.change.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center mt-5 pt-4 border-t-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Thank you for your purchase!</p>
                  <p className="text-xs text-slate-400 mt-1">Please come again</p>
                </div>
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Modal - Light Theme, Cash Only */}
      {showRecentOrders && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[85vh]">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Today's Walk-in Orders (Cash)
              </h2>
              <button
                onClick={() => setShowRecentOrders(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] bg-gradient-to-br from-slate-50 to-amber-50/30">
              {recentOrders.filter(order => order.payment_method === 'cash').length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="bg-slate-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Receipt className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-lg font-semibold text-slate-600">No walk-in orders today</p>
                  <p className="text-sm text-slate-500 mt-1">Cash payments will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.filter(order => order.payment_method === 'cash').map((order) => {
                    const metadata = order.payment_metadata
                      ? JSON.parse(order.payment_metadata)
                      : {};
                    return (
                      <div
                        key={order.order_id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          order.order_status === "cancelled"
                            ? "border-red-300 bg-red-50"
                            : "border-amber-200 bg-white hover:shadow-lg hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white px-3 py-1 rounded-lg font-bold shadow-md">
                              #{order.order_id}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                order.order_status === "completed"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : order.order_status === "cancelled"
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              }`}
                            >
                              {order.order_status.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-300 flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              CASH
                            </span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            ₱{order.order_total?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-700">
                              {order.user_username || order.order_customer_name || "Guest"}
                            </span>
                            {metadata.type === "walk-in" && (
                              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold border border-blue-300">
                                WALK-IN
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.order_created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
