import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function FloatingCart() {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, height: '200px' }}
      animate={{ 
        x: 0, 
        opacity: 1,
        height: cart.length === 0 
          ? '200px' 
          : `${Math.min(280 + (cart.length * 120), typeof window !== 'undefined' ? window.innerHeight - 64 : 600)}px`
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-4 bottom-4 bg-white shadow-2xl z-[60] flex flex-col border border-gray-200 w-72 rounded-2xl"
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
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-gray-800 w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="bg-primary-600 hover:bg-primary-700 text-white w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Remove & Subtotal */}
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => removeFromCart(item.id)}
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
            <span className="text-primary-600">{getTotalPrice().toFixed(2)}</span>
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
  )
}
