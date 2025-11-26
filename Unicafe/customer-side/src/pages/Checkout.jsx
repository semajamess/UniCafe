import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CreditCard, User, Phone, MapPin, Mail } from 'lucide-react'
import { useCart } from '../context/CartContext'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cash'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        payment_method: formData.paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: getTotalPrice(),
        total: getTotalPrice(),
        status: 'pending'
      }

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        clearCart()
        navigate('/order-confirmation', { 
          state: { 
            orderData: {
              ...orderData,
              orderNumber: Math.floor(Math.random() * 1000000)
            }
          } 
        })
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="glass-effect rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <User className="w-5 h-5 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <Mail className="w-5 h-5 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <Phone className="w-5 h-5 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <MapPin className="w-5 h-5 inline mr-2" />
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="123 University Ave, Building A, Room 101"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-4">
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-300 cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600"
                      />
                      <span className="font-medium text-gray-700">Cash on Delivery</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-300 cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="gcash"
                        checked={formData.paymentMethod === 'gcash'}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600"
                      />
                      <span className="font-medium text-gray-700">GCash</span>
                    </label>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-xl'
                }`}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </motion.button>
            </motion.form>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-2xl p-6 shadow-lg sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-primary-600">
                      ₱{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
