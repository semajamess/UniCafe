import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShoppingCart className="w-32 h-32 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
            <Link to="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center space-x-2 shadow-lg hover:bg-primary-700 transition-colors"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          Shopping Cart ({getTotalItems()} items)
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-12 h-12 text-primary-600" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                      {item.description || 'Delicious item'}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      ₱{parseFloat(item.price || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    
                    <span className="text-lg font-bold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="bg-primary-600 hover:bg-primary-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-xl font-bold text-gray-800">
                      ₱{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-2xl p-6 shadow-lg sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-primary-600">
                      ₱{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link to="/menu">
                <button className="w-full mt-4 glass-effect text-gray-700 py-3 rounded-xl font-semibold hover:bg-white/80 transition-all">
                  Continue Shopping
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
