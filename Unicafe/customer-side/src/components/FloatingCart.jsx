import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function FloatingCart() {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } =
    useCart();
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [showMobileCart, setShowMobileCart] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, item });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.item) {
      removeFromCart(deleteModal.item.id);
    }
    setDeleteModal({ show: false, item: null });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, item: null });
  };

  return (
    <>
      {/* Mobile Cart Button - Shows on mobile/tablet only */}
      {cart.length > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setShowMobileCart(true)}
          className="xl:hidden fixed bottom-4 right-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-full shadow-2xl z-50 flex items-center space-x-2"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{getTotalItems()}</span>
        </motion.button>
      )}

      {/* Mobile Cart Modal - Full screen on mobile/tablet */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="xl:hidden fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowMobileCart(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              {/* Mobile Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <div>
                    <h2 className="text-lg font-bold">My Cart</h2>
                    <p className="text-xs text-primary-100">{getTotalItems()} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Cart Items */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <ShoppingCart className="w-20 h-20 mb-4" />
                    <p className="text-lg font-semibold">Your cart is empty</p>
                    <p className="text-sm">Add some items to get started!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-xl p-3 shadow-sm"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-orange-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="w-10 h-10 text-primary-600" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base">
                            {item.name}
                          </h3>
                          <p className="text-primary-600 font-bold text-lg">
                            ₱{item.price.toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3 mt-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-base font-bold text-gray-800 w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="bg-primary-600 hover:bg-primary-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove & Subtotal */}
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <p className="text-sm font-bold text-gray-700">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Mobile Footer with Total & Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-3 bg-white rounded-b-3xl">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-primary-600">
                      ₱{getTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  <Link to="/checkout" onClick={() => setShowMobileCart(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-red-50 p-4 flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Remove Item
                  </h3>
                  <p className="text-gray-600 text-xs">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-3">
                  Remove{" "}
                  <span className="font-semibold">
                    "{deleteModal.item?.name}"
                  </span>{" "}
                  from your cart?
                </p>

                {/* Item Preview */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {deleteModal.item?.image_url ? (
                      <img
                        src={deleteModal.item.image_url}
                        alt={deleteModal.item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {deleteModal.item?.name}
                    </p>
                    <p className="text-primary-600 font-bold text-xs">
                      ₱{parseFloat(deleteModal.item?.price || 0).toFixed(2)} ×{" "}
                      {deleteModal.item?.quantity}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: 400, opacity: 0, height: "200px" }}
        animate={{
          x: 0,
          opacity: 1,
          height:
            cart.length === 0
              ? "200px"
              : `${Math.min(
                  280 + cart.length * 120,
                  typeof window !== "undefined" ? window.innerHeight - 64 : 600
                )}px`,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden xl:flex fixed right-4 bottom-4 bg-white shadow-2xl z-[60] flex-col border border-gray-200 w-72 rounded-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 flex items-center space-x-2 rounded-t-2xl">
          <ShoppingCart className="w-4 h-4" />
          <div>
            <h2 className="text-base font-bold">My Cart</h2>
            <p className="text-xs text-primary-100">{getTotalItems()} items</p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-20 h-20 mb-4" />
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-sm">Add some items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-effect rounded-xl p-3 shadow-md"
              >
                <div className="flex items-start space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-orange-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-primary-600" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-primary-600 font-bold text-sm">
                      {item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="bg-primary-600 hover:bg-primary-700 text-white w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove & Subtotal */}
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-bold text-gray-700">
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer with Total & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between text-base font-bold text-gray-800">
              <span>Total</span>
              <span className="text-primary-600">
                {getTotalPrice().toFixed(2)}
              </span>
            </div>

            <Link to="/checkout">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
}
