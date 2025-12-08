import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Coffee,
  ShoppingCart,
  Filter,
  Phone,
  CheckCircle,
  X,
  SortDesc,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CafeBackground from "../components/CafeBackground";
import FloatingCart from "../components/FloatingCart";

// Separate ProductCard component to ensure isolated scope
const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.product_stock === 0 || product.product_stock < 1;

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock) return;
      console.log(
        "Adding to cart:",
        product.product_name,
        "ID:",
        product.product_id
      );
      onAddToCart(product);
    },
    [product, onAddToCart, isOutOfStock]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      whileHover={!isOutOfStock ? { y: -8 } : {}}
      className={`group ${isOutOfStock ? "opacity-60" : ""}`}
    >
      <div
        className={`glass-effect rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${
          isOutOfStock ? "border-2 border-red-300" : ""
        }`}
      >
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-primary-100 to-orange-100 overflow-hidden">
          {product.product_image_url ? (
            <img
              src={product.product_image_url}
              alt={product.product_name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                isOutOfStock ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coffee
                className={`w-20 h-20 group-hover:scale-110 transition-transform duration-300 ${
                  isOutOfStock ? "text-gray-400" : "text-primary-600"
                }`}
              />
            </div>
          )}
          {product.product_category && (
            <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
              {product.product_category}
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex-grow flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-1">
            {product.product_name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-grow">
            {product.product_description || "Freshly made and delicious"}
          </p>

          <div className="mb-3 flex items-center gap-2">
            <div
              className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                product.product_stock > 5
                  ? "bg-green-100 text-green-700"
                  : product.product_stock > 0
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Stock: {product.product_stock} available
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">
              ₱{parseFloat(product.product_price).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-full transition-colors shadow-lg ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();
  const { user, isAuthenticated, needsPhoneNumber, updatePhone, token } =
    useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showPhoneSuccess, setShowPhoneSuccess] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Check if phone modal should be shown on mount - fetch fresh user data first
  useEffect(() => {
    const checkUserPhone = async () => {
      if (!isAuthenticated || !token) return;

      // If user already has phone in local state, don't show modal
      if (user?.phone) {
        setShowPhoneModal(false);
        return;
      }

      // Only check for Google-only users who might need phone
      if (!needsPhoneNumber) {
        setShowPhoneModal(false);
        return;
      }

      // Fetch fresh profile data to check if phone exists in DB
      setCheckingPhone(true);
      try {
        const response = await fetch(
          "http://localhost:3000/api/customer/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const profileData = await response.json();
          // If user already has phone in database, don't show modal
          if (profileData.phone) {
            // Update local storage with phone data
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              userData.phone = profileData.phone;
              localStorage.setItem("user", JSON.stringify(userData));
            }
            setShowPhoneModal(false);
          } else {
            // User doesn't have phone, show modal
            setShowPhoneModal(true);
          }
        }
      } catch (error) {
        console.error("Error checking user phone:", error);
        // Fall back to original logic if check fails
        if (needsPhoneNumber) {
          setShowPhoneModal(true);
        }
      } finally {
        setCheckingPhone(false);
      }
    };

    checkUserPhone();
  }, [isAuthenticated, needsPhoneNumber, token, user?.phone]);

  const handleAddToCart = useCallback(
    (product) => {
      console.log(
        "Menu - Add attempt:",
        product.product_name,
        "ID:",
        product.product_id
      );
      if (!isAuthenticated) {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate("/login");
        }, 1400);
        return;
      }

      addToCart(product);
    },
    [addToCart, isAuthenticated, navigate]
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products, sortBy]);

  // Auto-sync products on interval and window focus
  useEffect(() => {
    const syncProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/customer/products"
        );
        if (response.ok) {
          const data = await response.json();
          const availableProducts = data.filter(
            (p) => p.product_is_available === 1
          );
          setProducts(availableProducts);
        }
      } catch (error) {
        console.error("Error syncing products:", error);
      }
    };

    // Sync on window focus (when user switches back to tab)
    const handleFocus = () => {
      syncProducts();
    };

    // Sync every 15 seconds
    const interval = setInterval(syncProducts, 15000);

    window.addEventListener("focus", handleFocus);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/customer/products"
      );
      if (response.ok) {
        const data = await response.json();
        const availableProducts = data.filter(
          (p) => p.product_is_available === 1
        );
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => {
        const productCategory = p.product_category || "";
        return productCategory.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.product_description &&
            p.product_description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter out products with 0 stock
    filtered = filtered.filter((p) => p.product_stock > 0);

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.product_price) - parseFloat(b.product_price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.product_price) - parseFloat(a.product_price));
        break;
      case "name-az":
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case "name-za":
        filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      default:
        // Default: keep original order (most ordered if available)
        break;
    }

    setFilteredProducts(filtered);
  };

  const categories = ["all", "food", "drinks"];

  const validatePhoneNumber = (phone) => {
    // Philippine mobile number format: 09XXXXXXXXX (11 digits starting with 09)
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setPhoneError("");

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError(
        "Please enter a valid Philippine mobile number (09XXXXXXXXX)"
      );
      return;
    }

    setPhoneLoading(true);
    const result = await updatePhone(phoneNumber);
    setPhoneLoading(false);

    if (result.success) {
      setShowPhoneModal(false);
      setShowPhoneSuccess(true);
      setTimeout(() => {
        setShowPhoneSuccess(false);
      }, 2500);
    } else {
      setPhoneError(result.error || "Failed to update phone number");
    }
  };

  return (
    <div className="min-h-screen">
      {showModal && !isAuthenticated && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <h2 className="text-lg font-bold mb-1">Please sign up first!</h2>
            <p className="text-sm text-gray-600">
              You must log in to add items.
            </p>
          </div>
        </div>
      )}

      {/* Phone Number Modal for Google Users */}
      {showPhoneModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Add Your Phone Number
              </h2>
              <p className="text-sm text-gray-600">
                To use E-Wallet payments, we need your phone number for SMS
                verification.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit}>
              {phoneError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {phoneError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="09XXXXXXXXX"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Philippine mobile number format
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {phoneLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Phone Success Modal */}
      {showPhoneSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Phone Added!
            </h2>
            <p className="text-sm text-gray-600">
              Your phone number has been saved. You can now use E-Wallet
              payments.
            </p>
          </motion.div>
        </motion.div>
      )}

      <FloatingCart />

      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters and Sort Row */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              {/* Sort Dropdown - Right Side */}
              <div className="flex items-center gap-2 sm:order-2">
                <SortDesc className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                </select>
              </div>
              
              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto sm:order-1">
                <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-primary-600 text-white shadow-lg"
                          : "glass-effect text-gray-700 hover:bg-white/80"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-8 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden pb-8">
        <CafeBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-72 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Coffee className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-700">
                <span className="font-semibold">{filteredProducts.length}</span>{" "}
                products found
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAddToCart={(prod) => handleAddToCart(prod)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Menu;
