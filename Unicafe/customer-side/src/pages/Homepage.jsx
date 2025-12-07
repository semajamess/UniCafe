import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, ShoppingCart, Star, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import AnimatedBackground from "../components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user, isAuthenticated, needsPhoneNumber } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();

    // Auto-sync: refetch products when they are updated by admin
    const syncProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/customer/products?mostOrdered=true"
        );
        if (response.ok) {
          const products = await response.json();
          setFeaturedProducts(products);
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

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/customer/products?mostOrdered=true"
      );
      if (response.ok) {
        const products = await response.json();
        setFeaturedProducts(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!isAuthenticated) {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/login");
      }, 1400);
      return;
    }
    addToCart(product);
    // Navigate to menu page after adding to cart
    navigate("/menu");
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-orange-50 to-amber-100 opacity-70"></div>

        <AnimatedBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
              <span className="ml-2 text-primary-700 font-semibold uppercase tracking-wider text-sm">
                Premium Coffee Experience
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Welcome to UniCafé
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Your campus destination for artisanal coffee, delicious treats,
              and unforgettable moments
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-effect text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-white/80 transition-all"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-10 opacity-20"
          >
            <Coffee className="w-32 h-32 text-primary-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 left-10 opacity-20"
          >
            <Coffee className="w-24 h-24 text-primary-600" />
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Discover our handpicked selection of premium beverages and treats
            </p>
          </motion.div>

          {/* Modal for unauthenticated users */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <h2 className="text-lg font-bold mb-1">
                  Please sign up first!
                </h2>
                <p className="text-sm text-gray-600">
                  You must log in to add items.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="glass-effect rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-64 bg-gradient-to-br from-primary-100 to-orange-100 overflow-hidden">
                      {product.product_image_url ? (
                        <img
                          src={product.product_image_url}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="w-24 h-24 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span>Popular</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.product_description ||
                          "Delicious and freshly made"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary-600">
                          ₱{product.product_price.toFixed(2)}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          type="button"
                          className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-effect px-8 py-3 rounded-full font-semibold text-primary-700 hover:bg-white/80 transition-all inline-flex items-center space-x-2"
              >
                <span>View Full Menu</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Why Choose UniCafé?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Coffee className="w-12 h-12" />,
                title: "Premium Quality",
                description:
                  "Sourced from the finest coffee beans, freshly roasted daily",
              },
              {
                icon: <Star className="w-12 h-12" />,
                title: "Customer Friendly",
                description:
                  "Affordable prices and a cozy atmosphere perfect for everyone",
              },
              {
                icon: <Sparkles className="w-12 h-12" />,
                title: "Fast Service",
                description:
                  "Quick ordering and preparation for your busy lifestyle",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="glass-effect rounded-2xl p-8 text-center hover:shadow-xl transition-all"
              >
                <div className="text-primary-600 flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
