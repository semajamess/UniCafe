import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CreditCard, User, Mail } from 'lucide-react'
import Receipt from '../components/Receipt'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [otpModal, setOtpModal] = useState({ open: false, requestId: null })
  const [otpValue, setOtpValue] = useState('')
  const [successModal, setSuccessModal] = useState({ open: false, orderData: null, orderId: null })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'cash'
  })

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }))
    }
  }, [isAuthenticated, user])

  // Require authentication to place orders (standard practice)
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect user to login and return back to checkout after auth
      navigate('/login', { state: { returnTo: window.location.pathname } })
    }
  }, [isAuthenticated, navigate])

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

      if (formData.paymentMethod === 'cash') {
        // Cash: create order directly
        const response = await fetch('http://localhost:3000/api/customer/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ ...orderData })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Create order response (cash):', data)
          let orderData = data.order || data
          console.log('orderData before normalization:', orderData)
          console.log('orderData.items:', orderData.items)
          
          // Normalize items from API response - API returns order_item_* prefixed columns
          if (orderData && orderData.items && Array.isArray(orderData.items)) {
            console.log('Normalizing items...')
            orderData = {
              ...orderData,
              items: orderData.items.map(item => ({
                product_id: item.order_item_product_id || item.product_id,
                product_name: item.order_item_product_name || item.product_name || item.name,
                quantity: item.order_item_quantity || item.quantity,
                price: item.order_item_price || item.price,
                id: item.order_item_id || item.id
              }))
            }
            console.log('Normalized items:', orderData.items)
          }
          
          console.log('Final orderData to navigate:', orderData)
          // Navigate to confirmation first, then clear the cart so this component
          // doesn't redirect to /cart during the navigation render.
          navigate('/order-confirmation', {
            state: { orderData, orderId: (data.order && (data.order.order_id || data.order.id)) || data.order_id || data.id }
          })
        } else {
          let msg = 'Failed to place order. Please try again.'
          try {
            const err = await response.json()
            if (err && err.error) msg = err.error
          } catch (e) {}
          if (response.status === 401) {
            alert(msg + ' Please log in again.')
            navigate('/login')
          } else {
            alert(msg)
          }
        }
      } else {
        // Non-cash: use OTP-backed initiation so DB insert happens after OTP confirmation
        const returnUrl = window.location.origin + '/order-confirmation'
        const initiateResp = await fetch('http://localhost:3000/api/customer/payments/initiate-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ items: orderData.items, return_url: returnUrl, method_hint: formData.paymentMethod })
        })

        if (!initiateResp.ok) {
          let msg = 'Failed to initiate payment. Please try again.'
          try { const err = await initiateResp.json(); if (err && err.error) msg = err.error } catch (e) {}
          alert(msg)
          setLoading(false)
          return
        }

        const initData = await initiateResp.json()
        // show OTP modal to the user
        setOtpModal({ open: true, requestId: initData.requestId })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otpModal.requestId) return
    setLoading(true)
    try {
      const resp = await fetch('http://localhost:3000/api/customer/payments/confirm-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ requestId: otpModal.requestId, otp: otpValue })
      })

        if (!resp.ok) {
        let msg = 'Invalid OTP or confirmation failed.'
        try { const err = await resp.json(); if (err && err.error) msg = err.error } catch(e){}
        alert(msg)
        setLoading(false)
        return
      }

      const data = await resp.json()
      console.log('Confirm OTP response:', data)
      console.log('data.order:', data.order)
      console.log('data.order.items:', data.order?.items)
      
      // Accept multiple response shapes: { order }, { orderData }, or direct order
      let orderData = data.order || data.orderData || (typeof data === 'object' && Object.keys(data).length ? data : null)
      console.log('orderData extracted:', orderData)
      console.log('orderData.items before normalization:', orderData?.items)

      // Normalize items from API response if present
      if (orderData && orderData.items && Array.isArray(orderData.items)) {
        console.log('Normalizing OTP items...')
        orderData = {
          ...orderData,
          items: orderData.items.map(item => ({
            product_id: item.order_item_product_id || item.product_id,
            product_name: item.order_item_product_name || item.product_name || item.name,
            quantity: item.order_item_quantity || item.quantity,
            price: item.order_item_price || item.price,
            id: item.order_item_id || item.id
          }))
        }
        console.log('Normalized OTP items:', orderData.items)
      }

      console.log('Final orderData for OTP flow:', orderData)

      // If backend returned only an orderId, fetch canonical order before navigating
      const resolvedOrderId = data.orderId || (orderData && (orderData.order_id || orderData.id || orderData.orderNumber))
      if (!orderData && resolvedOrderId) {
        try {
          const fetchResp = await fetch(`http://localhost:3000/api/customer/orders/${resolvedOrderId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          })
          if (fetchResp.ok) {
            const fetched = await fetchResp.json()
            console.log('Fetched canonical order for receipt fallback:', fetched)
            // Build a lightweight shape matching OrderConfirmation expectations
            const items = (fetched.items || []).map(item => ({
              product_id: item.order_item_product_id || item.product_id,
              product_name: item.order_item_product_name || item.product_name || item.name,
              quantity: item.order_item_quantity || item.quantity,
              price: item.order_item_price || item.price,
              id: item.order_item_id || item.id
            }))
            const subtotal = items.reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0)
            const total = parseFloat(fetched.order_total || fetched.total || subtotal)
            orderData = {
              orderNumber: fetched.order_id || fetched.id,
              id: fetched.order_id || fetched.id,
              customer_name: fetched.user_username || fetched.customer_name || 'Guest',
              customer_email: fetched.user_email || fetched.customer_email || '',
              payment_method: (fetched.payment && (fetched.payment.payment_method || fetched.payment.method)) || fetched.payment_method || 'N/A',
              items,
              subtotal,
              tax: fetched.tax || 0,
              total
            }
          }
        } catch (e) {
          console.warn('Failed to fetch order for receipt fallback:', e)
        }
      }

      // Close OTP modal
      setOtpModal({ open: false, requestId: null })
      setOtpValue('')

      // Persist the order receipt in sessionStorage as a durable fallback
      try {
        if (orderData) sessionStorage.setItem('latestOrder', JSON.stringify(orderData))
        else if (resolvedOrderId) sessionStorage.removeItem('latestOrder')
      } catch (e) {
        console.warn('sessionStorage not available for receipt fallback', e)
      }

      // Close OTP modal and navigate directly to the full receipt page so the
      // user sees the Order Confirmation (receipt) immediately.
      setOtpModal({ open: false, requestId: null })
      setOtpValue('')
      const finalOrderId = resolvedOrderId || (orderData && (orderData.id || orderData.orderNumber))
      console.log('FINAL NAVIGATION - orderData:', orderData)
      console.log('FINAL NAVIGATION - orderData.items:', orderData?.items)
      console.log('FINAL NAVIGATION - orderId:', finalOrderId)
      
      // Test: create a simple object to verify navigation state works
      const testState = { 
        orderData: orderData ? JSON.parse(JSON.stringify(orderData)) : null, 
        orderId: finalOrderId 
      }
      console.log('TEST STATE BEING SENT:', testState)
      console.log('TEST STATE items:', testState.orderData?.items)
      
      navigate('/order-confirmation', { state: testState })
    } catch (err) {
      console.error('OTP confirm error:', err)
      alert('An error occurred verifying OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handlers for the success modal shown after OTP confirmation
  const handleViewReceipt = () => {
    const od = successModal.orderData
    const oid = successModal.orderId
    setSuccessModal({ open: false, orderData: null, orderId: null })
    navigate('/order-confirmation', { state: { orderData: od, orderId: oid } })
  }

  const handleModalContinue = () => {
    setSuccessModal({ open: false, orderData: null, orderId: null })
    navigate('/')
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
      {/* OTP Modal */}
      {otpModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Enter OTP</h3>
            <p className="mb-4 text-sm text-gray-600">We sent a one-time code to your email. Enter it below to complete payment.</p>
            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
                placeholder="Enter OTP"
                required
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setOtpModal({ open: false, requestId: null })} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary-600 text-white">{loading ? 'Verifying...' : 'Verify OTP'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Success Modal (shown after OTP confirmation) */}
      {successModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
            <h3 className="text-xl font-bold mb-2">Payment Verified</h3>
            <p className="text-sm text-gray-600 mb-4">Your payment was confirmed successfully. Below is your receipt.</p>

            <div className="mb-4">
              {successModal.orderData ? (
                <Receipt order={successModal.orderData} />
              ) : (
                <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">Loading receipt...</div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setSuccessModal({ open: false, orderData: null, orderId: null })} className="px-4 py-2 rounded-lg bg-gray-200">Close</button>
              <button onClick={handleViewReceipt} className="px-4 py-2 rounded-lg bg-primary-600 text-white">Open Full Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
