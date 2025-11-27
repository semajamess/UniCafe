import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Coffee, ShoppingCart, Filter } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import FloatingCart from '../components/FloatingCart'

// Separate ProductCard component to ensure isolated scope
const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Adding to cart:', product.name, 'ID:', product.id)
    onAddToCart(product)
  }, [product, onAddToCart])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="glass-effect rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-orange-100 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coffee className="w-20 h-20 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}
          {(product.category || product.category_name) && (
            <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
              {product.category || product.category_name}
            </div>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
            {product.description || 'Freshly made and delicious'}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-primary-600">
              ₱{product.price.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const Menu = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  // Google-only users have google_id and no local password
  const isGoogleOnly = user && user.google_id && (!user.password || user.password === '')

  const handleAddToCart = useCallback((product) => {
    console.log('Menu - Add attempt:', product.name, 'ID:', product.id)
    if (!isAuthenticated) {
      setShowModal(true)
      setTimeout(() => {
        setShowModal(false)
        navigate('/login')
      }, 1400)
      return
    }

    if (isGoogleOnly) {
      // Allow Google-only users to add to cart, but encourage completion
      console.log('Google-only user adding to cart; prompting to complete signup')
      addToCart(product)
      setShowModal(true)
      // keep modal short and do not navigate automatically to avoid disrupting flow
      setTimeout(() => {
        setShowModal(false)
      }, 1600)
      return
    }

    addToCart(product)
  }, [addToCart, isAuthenticated, isGoogleOnly, navigate])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products')
      if (response.ok) {
        const data = await response.json()
        const availableProducts = data.filter(p => p.is_available === 1)
        setProducts(availableProducts)
        setFilteredProducts(availableProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => {
        const productCategory = p.category_name || p.category || ''
        return productCategory.toLowerCase() === selectedCategory.toLowerCase()
      })
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredProducts(filtered)
  }

  const categories = ['all', 'food', 'drinks']

  return (
    <div className="min-h-screen">
      {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              {!isAuthenticated ? (
                <>
                  <h2 className="text-lg font-bold mb-1">Please sign up first!</h2>
                  <p className="text-sm text-gray-600">You must log in to add items.</p>
                </>
              ) : isGoogleOnly ? (
                <>
                  <h2 className="text-lg font-bold mb-1">Signed in with Google</h2>
                  <p className="text-sm text-gray-600">You're signed in via Google. Items were added to your cart — complete your profile for faster checkout.</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-1">Please complete your signup first!</h2>
                  <p className="text-sm text-gray-600">Finish signup to start ordering.</p>
                </>
              )}
            </div>
          </div>
      )}
      <FloatingCart />
      
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'glass-effect text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-8 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden pb-32">
        <AnimatedBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pr-80 z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <span className="font-semibold">{filteredProducts.length}</span> products found
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
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
  )
}

export default Menu
