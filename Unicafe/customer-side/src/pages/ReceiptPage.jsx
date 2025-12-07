import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Receipt from '../components/Receipt'
import { useAuth } from '../context/AuthContext'

const fetchOrderById = async (id, token) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`http://localhost:3000/api/customer/orders/${id}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch (e) {
    console.error('Failed to fetch order', e)
    return null
  }
}

const normalizeOrder = (order) => {
  if (!order) return null;
  
  console.log('normalizeOrder input:', order)
  console.log('normalizeOrder items:', order.items)
  
  // Normalize items - handle both API response format and local format
  const normalizedItems = (order.items || []).map(item => ({
    product_id: item.product_id || item.product_id || item.id,
    product_name: item.order_item_product_name || item.product_name || item.name,
    quantity: item.order_item_quantity || item.quantity,
    price: item.order_item_price || item.price,
    id: item.order_item_id || item.id
  }))
  
  console.log('normalizedItems:', normalizedItems)
  
  const subtotal = normalizedItems.reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0)
  const total = parseFloat(order.order_total || order.total || subtotal)
  
  const result = {
    orderNumber: order.order_id || order.id || order.orderNumber,
    id: order.order_id || order.id || order.orderNumber,
    customer_name: order.user_username || order.customer_name || 'Guest',
    customer_email: order.user_email || order.customer_email || '',
    payment_method: (order.payment && (order.payment.payment_method || order.payment.method)) || order.payment_method || 'N/A',
    items: normalizedItems,
    subtotal,
    tax: order.tax || 0,
    total
  }
  
  console.log('normalizeOrder result:', result)
  return result
}

export default function ReceiptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const orderDataFromState = location.state?.orderData
  const passedOrderId = location.state?.orderId

  const [fetchedOrder, setFetchedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('ReceiptPage mounted. orderDataFromState:', orderDataFromState)
  console.log('ReceiptPage mounted. passedOrderId:', passedOrderId)

  const sessionOrder = (() => {
    try {
      const raw = sessionStorage.getItem('latestOrder')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      
      // First, try to use orderDataFromState if it exists
      if (orderDataFromState) {
        const normalized = normalizeOrder(orderDataFromState)
        if (mounted) {
          setFetchedOrder(normalized)
          setLoading(false)
        }
        return
      }
      
      // Otherwise, fetch the order by ID
      const orderId = passedOrderId || new URLSearchParams(location.search).get('orderId')
      if (!orderId) {
        if (mounted) setLoading(false)
        return
      }
      
      const data = await fetchOrderById(orderId, token)
      if (!mounted) return
      
      if (!data) {
        if (mounted) setLoading(false)
        return
      }

      const normalized = normalizeOrder(data)
      if (mounted) {
        setFetchedOrder(normalized)
        setLoading(false)
      }
    }
    
    load()
    return () => { mounted = false }
  }, [orderDataFromState, passedOrderId, location.search])

  const finalOrder = orderDataFromState ? normalizeOrder(orderDataFromState) : fetchedOrder || sessionOrder

  const handleBackToMenu = () => {
    navigate('/menu')
  }

  const handleBackHome = () => {
    navigate('/')
  }

  if (!finalOrder && loading) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">Loading receipt...</div>
    </div>
  )

  if (!finalOrder) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">No receipt available.</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50 flex items-start justify-center pt-28 pb-16 px-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl p-10 shadow-2xl text-center">
          <div className="mx-auto mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-green-200 to-green-50 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">Payment Complete</h1>
          <p className="text-gray-600 mb-6">Here's your receipt — thanks for ordering!</p>

          <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6 shadow-sm">
            <div className="text-center text-sm text-gray-500">Order Number</div>
            <div className="text-3xl font-extrabold text-orange-600 mt-2">#{finalOrder.orderNumber}</div>
          </div>

          <div className="mb-6">
            <Receipt order={finalOrder} />
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button onClick={handleBackToMenu} className="px-5 py-3 rounded-lg bg-white border text-gray-800 hover:shadow">Order More</button>
            <button onClick={handleBackHome} className="px-5 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow">Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  )
}
