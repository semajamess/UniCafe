import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, Mail, Phone, Lock, LogOut, Edit2, Check, X, AlertCircle, Package, ChevronDown, ChevronUp, Receipt, UtensilsCrossed, RefreshCw, Camera, Trash2, Search } from 'lucide-react'
import CafeBackground from '../components/CafeBackground'
import { motion } from 'framer-motion'

const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoon' },
  { id: 'bottts', name: 'Robots' },
  { id: 'pixel-art', name: 'Pixel Art' },
  { id: 'lorelei', name: 'Lorelei' },
  { id: 'notionists', name: 'Notionists' },
  { id: 'open-peeps', name: 'Open Peeps' },
];

const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusIcons = {
    processing: <UtensilsCrossed className="w-4 h-4" />,
    ready: <Check className="w-4 h-4" />,
    completed: <Check className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
        statusStyles[status] || statusStyles.processing
      }`}
    >
      {statusIcons[status] || statusIcons.processing}
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
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile')
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('avataaars')
  const [avatarSeed, setAvatarSeed] = useState(Date.now().toString())
  const [avatarOptions, setAvatarOptions] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('')
  const [showDeactivatedSuccessModal, setShowDeactivatedSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    currentPassword: '',
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
      currentPassword: '',
      password: '',
      confirmPassword: ''
    })
    
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [user, navigate, activeTab])

  useEffect(() => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const seed = `${avatarSeed}-${i}`;
      options.push({
        id: i,
        seed: seed,
        url: `https://api.dicebear.com/7.x/${selectedAvatarStyle}/svg?seed=${seed}`
      });
    }
    setAvatarOptions(options);
  }, [selectedAvatarStyle, avatarSeed]);

  useEffect(() => {
    if (orders.length === 0) return;

    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_id.toString().includes(query) ||
        order.items?.some(item =>
          (item.order_item_product_name || item.product_name || item.name || '')
            .toLowerCase()
            .includes(query)
        )
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

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
        setFilteredOrders(sortedOrders)
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
        if (!formData.currentPassword) {
          setError('Please enter your current password to change it')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          setError('New password must be at least 6 characters')
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
      if (formData.password) {
        updateData.password = formData.password
        updateData.currentPassword = formData.currentPassword
      }
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
          currentPassword: '',
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
      currentPassword: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleChangeAvatar = () => {
    setShowAvatarModal(true)
    setAvatarSeed(Date.now().toString())
  }

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      setError('Please select an avatar')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/customer/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_image: selectedAvatar.url
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setShowAvatarModal(false)
        setSuccess('Profile picture updated successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError(data.error || 'Failed to update profile picture')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Error updating avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Token before delete:', token ? 'exists' : 'missing')
      
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      const response = await fetch('http://localhost:3000/api/customer/settings/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Delete response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      // Account deleted successfully, show success modal
      setShowDeleteModal(false)
      setDeactivateConfirmText('')
      setShowDeactivatedSuccessModal(true)
    } catch (err) {
      console.error('Delete account error:', err)
      setError(err.message)
      setShowDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const isGoogleUser = user.google_id && (!user.password || user.password === '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-20 pb-12">
      <CafeBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user.username}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <User className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                )}
                <button
                  onClick={handleChangeAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-white text-amber-600 rounded-full shadow-lg hover:bg-amber-50 transition-all flex items-center justify-center group-hover:scale-110"
                  title="Change avatar"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{user.username}</h1>
                <p className="text-amber-50 text-sm sm:text-base">{isGoogleUser ? 'Google Account' : 'UniCafé Member'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Tabs */}
            <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
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
                className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
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
                          Current Password
                        </div>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Required to change password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your current password to change it</p>
                    </div>

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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>

                {/* Delete Account Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-6 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate Account
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    This will deactivate your account
                  </p>
                </div>
              </div>
            )}
            </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {/* Search and Filter Bar */}
                <div className="mb-6 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders by ID or item name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Status Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'processing', 'ready', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                          statusFilter === status
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

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
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No orders found</p>
                    <p className="text-gray-400">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.order_id} order={order} />
                    ))}
                    {/* Order count */}
                    <div className="text-center text-gray-500 text-sm pt-2">
                      Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Change Profile Picture</h2>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Avatar Style Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Avatar Style</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedAvatarStyle(style.id)}
                      className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedAvatarStyle === style.id
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Options Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Select Avatar</label>
                  <button
                    onClick={() => setAvatarSeed(Date.now().toString())}
                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                        selectedAvatar?.id === avatar.id
                          ? 'border-amber-500 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={`Avatar option ${avatar.id + 1}`}
                        className="w-full h-full object-cover bg-gray-50"
                      />
                      {selectedAvatar?.id === avatar.id && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {selectedAvatar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-50 rounded-xl flex items-center gap-4"
                >
                  <img
                    src={selectedAvatar.url}
                    alt="Selected avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{user?.username}</p>
                    <p className="text-xs sm:text-sm text-gray-600">This will be your new profile picture</p>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  disabled={loading || !selectedAvatar}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Avatar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Deactivate Account?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to deactivate your account? This action will prevent you from logging in and accessing your data.
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Type <span className="font-bold text-red-600">DEACTIVATE</span> to confirm
              </p>
              <input
                type="text"
                value={deactivateConfirmText}
                onChange={(e) => setDeactivateConfirmText(e.target.value)}
                placeholder="Type DEACTIVATE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeactivateConfirmText('')
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deactivateConfirmText !== 'DEACTIVATE'}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Deactivating...'
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deactivation Success Modal */}
      {showDeactivatedSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Account Successfully Deactivated</h3>
              <p className="text-gray-600 mb-6">
                Your account has been deactivated. You can reactivate it anytime by logging in again.
              </p>
              <button
                onClick={() => {
                  setShowDeactivatedSuccessModal(false)
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Profile
