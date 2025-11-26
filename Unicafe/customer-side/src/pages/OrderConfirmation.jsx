import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Package, Coffee } from 'lucide-react'

const OrderConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const orderData = location.state?.orderData

  useEffect(() => {
    if (!orderData) {
      navigate('/')
    }
  }, [orderData, navigate])

  if (!orderData) {
    return null
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 md:p-12 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg mb-8"
          >
            Thank you for your order. We'll start preparing it right away!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Package className="w-6 h-6 text-primary-600" />
              <span className="text-gray-600 font-semibold">Order Number</span>
            </div>
            <p className="text-3xl font-bold gradient-text">
              #{orderData.orderNumber}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-left bg-white/80 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Details</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name</span>
                <span className="font-semibold text-gray-800">{orderData.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-800">{orderData.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-semibold text-gray-800">{orderData.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {orderData.payment_method}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h4 className="font-bold text-gray-800 mb-3">Items Ordered</h4>
              <div className="space-y-2 mb-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x Product #{item.id}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₱{orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">₱{orderData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary-600">₱{orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-primary-50 rounded-xl p-6 mb-8"
          >
            <Coffee className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">
              Estimated preparation time: <span className="font-bold text-primary-700">15-20 minutes</span>
            </p>
            <p className="text-sm text-gray-600">
              We'll send you an email confirmation at {orderData.customer_email}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/menu" className="flex-1">
              <button className="w-full glass-effect text-gray-700 py-3 rounded-xl font-semibold hover:bg-white/80 transition-all">
                Order More
              </button>
            </Link>
            <Link to="/" className="flex-1">
              <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                Back to Home
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderConfirmation
