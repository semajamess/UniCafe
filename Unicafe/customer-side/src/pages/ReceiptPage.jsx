import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Receipt from '../components/Receipt'
import { useCart } from '../context/CartContext'

const fetchOrderById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/${id}`)
    if (!res.ok) return null
    const data = await res.json()
    return data
  } catch (e) {
    console.error('Failed to fetch order', e)
    return null
  }
}

export default function ReceiptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const orderDataFromState = location.state?.orderData
  const passedOrderId = location.state?.orderId

  const [fetchedOrder, setFetchedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

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
      if (!orderDataFromState) {
        const orderId = passedOrderId || new URLSearchParams(location.search).get('orderId')
        if (!orderId) {
          setLoading(false)
          return
        }
        const data = await fetchOrderById(orderId)
        if (!mounted) return
        if (!data) {
          setLoading(false)
          return
        }

        const items = data.items || []
        const subtotal = items.reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0)
        const total = parseFloat(data.total || subtotal)
        const built = {
          orderNumber: data.id,
          id: data.id,
          customer_name: data.customer_name || data.username || 'Guest',
          customer_email: data.customer_email || data.user_email || '',
          payment_method: (data.payment && data.payment.method) || data.payment_method || 'N/A',
          items,
          subtotal,
          tax: data.tax || 0,
          total
        }
        setFetchedOrder(built)
        setLoading(false)
        return
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [orderDataFromState, passedOrderId, location.search])

  const finalOrder = orderDataFromState || fetchedOrder || sessionOrder

  const handleBackToMenu = () => {
    clearCart()
    navigate('/menu')
  }

  const handleBackHome = () => {
    clearCart()
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
