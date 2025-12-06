import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, LogOut, Edit2, Check, X, AlertCircle, Package, ChevronDown, ChevronUp, Receipt, Coffee, Calendar } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import { motion } from 'framer-motion'

const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    preparing: "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  const statusIcons = {
    preparing: <Coffee className="w-4 h-4" />,
    ready: <Check className="w-4 h-4" />,
    completed: <Check className="w-4 h-4" />,
    pending: <AlertCircle className="w-4 h-4" />
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {statusIcons[status] || statusIcons.pending}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Order #{order.order_id}</h4>
              <p className="text-xs text-gray-500">{formatDate(order.order_created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-amber-600">₱{parseFloat(order.order_total).toFixed(2)}</p>
              <OrderStatusBadge status={order.order_status} />
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-100 bg-gray-50 p-4"
        >
          <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Order Items
          </h5>
          <div className="space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-semibold text-sm">
                      {item.order_item_quantity || item.quantity}x
                    </div>
                    <span className="font-medium text-gray-700">
                      {item.order_item_product_name || item.product_name || item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    ₱{(
                      parseFloat(item.order_item_price || item.price) *
                      (item.order_item_quantity || item.quantity)
                    ).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No items in this order</p>
            )}
          </div>
          {order.payment_method && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span>Payment Method: </span>
                <span className="font-medium capitalize">{order.payment_method?.replace("_", " ")}</span>
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const Profile = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setFormData({
      username: user.username || '',
      phone: user.phone || '',
      password: '',
      confirmPassword: ''
    })
    
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [user, navigate, activeTab])

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await fetch('http://localhost:3000/api/customer/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const sortedOrders = data.sort(
          (a, b) => new Date(b.order_created_at) - new Date(a.order_created_at)
        )
        setOrders(sortedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // Validation
      if (formData.username && formData.username.length < 3) {
        setError('Username must be at least 3 characters')
        setLoading(false)
        return
      }

      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
      }

      if (formData.phone) {
        const phoneRegex = /^(\+63|0)?9\d{9}$/
        const normalizedPhone = formData.phone.replace(/[\s-]/g, '')
        if (!phoneRegex.test(normalizedPhone)) {
          setError('Invalid phone number. Use format: 09XXXXXXXXX or +639XXXXXXXXX')
          setLoading(false)
          return
        }
      }

      const updateData = {}
      if (formData.username !== user.username) updateData.username = formData.username
      if (formData.password) updateData.password = formData.password
      if (formData.phone && formData.phone !== (user.phone || '')) updateData.phone = formData.phone

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:3000/api/customer/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        // Update local storage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        })
        // Reload user data after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccess('')
    setFormData({
      username: user?.username || '',
      phone: user?.phone || '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const isGoogleUser = user.google_id && (!user.password || user.password === '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-20 pb-12">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 sm:px-8">
            <div className="flex items-center gap-4">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                <p className="text-amber-50">{isGoogleUser ? 'Google Account' : 'UniCafé Member'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-4 h-4 inline-block mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'orders'
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Package className="w-4 h-4 inline-block mr-2" />
                Orders
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
            <>
            {isEditing ? (
              // Edit Form
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username
                    </div>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 09XXXXXXXXX</p>
                </div>

                {/* Password */}
                {!isGoogleUser && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          New Password (optional)
                        </div>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {isGoogleUser && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You're using a Google account. Avatar changes are disabled to maintain system consistency.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-6">
                {/* Username */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="text-lg font-semibold text-gray-900">{user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.phone || 'Not added'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
            </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin">
                      <Package className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No orders yet</p>
                    <p className="text-gray-400">Start ordering from the menu!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderCard key={order.order_id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
