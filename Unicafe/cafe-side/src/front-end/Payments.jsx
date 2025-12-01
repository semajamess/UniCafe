import { useEffect, useState } from 'react'
import { CreditCard, Search, DollarSign, Filter } from 'lucide-react'

const API_URL = 'http://localhost:3000/api/cafe'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/orders`)
      const data = await res.json()

      const mapped = data.map(o => ({
        // Use payment_id when available so the Payments table shows the payment reference
        id: o.payment_id || o.id,
        paymentRef: o.payment_id ? `#PAY-${o.payment_id}` : null,
        orderRef: `#ORD-${o.id}`,
        amount: parseFloat(o.total || 0),
        method: (o.payment_method || 'N/A'),
        status: (o.status || 'pending'),
        created_at: o.created_at,
        customer_name: (o.user_username || o.user_email || 'Guest')
      }))

      setPayments(mapped)
    } catch (err) {
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const methods = Array.from(new Set(payments.map(p => (p.method || 'N/A'))))
  const statuses = Array.from(new Set(payments.map(p => (p.status || 'pending'))))

  const filtered = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (methodFilter !== 'all' && p.method !== methodFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        p.orderRef.toLowerCase().includes(s) ||
        (p.method || '').toLowerCase().includes(s) ||
        p.customer_name.toLowerCase().includes(s)
      )
    }
    return true
  })

  const openDetails = async (paymentOrOrder) => {
    try {
      setDetailLoading(true)
      // paymentOrOrder may be the mapped payment object; prefer orderRef to fetch the order
      const orderRef = paymentOrOrder.orderRef || paymentOrOrder.orderRef === undefined ? paymentOrOrder.orderRef : null
      // Extract numeric order id from orderRef (format: #ORD-<id>)
      let numericId = null
      if (typeof paymentOrOrder === 'object' && paymentOrOrder.orderRef) {
        numericId = paymentOrOrder.orderRef.replace('#ORD-', '')
      } else if (typeof paymentOrOrder === 'string') {
        numericId = paymentOrOrder.replace('#ORD-', '')
      } else if (typeof paymentOrOrder === 'number') {
        numericId = String(paymentOrOrder)
      }

      if (!numericId) {
        throw new Error('Order id not available')
      }

      const res = await fetch(`${API_URL}/orders/${numericId}`)
      const data = await res.json()
      setSelected(data)
    } catch (err) {
      console.error('Error loading order details:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetails = () => setSelected(null)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 mt-1">All payments derived from customer orders — filter, search, and inspect details.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments, methods, customers..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="all">All</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Method</span>
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="all">All</option>
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-3">Payment / Order</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Method</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                          {filtered.map(p => (
                            <tr key={p.id} className="border-t">
                              <td className="py-4">{p.paymentRef || p.orderRef}</td>
                    <td className="py-4">{p.customer_name}</td>
                    <td className="py-4">{p.method}</td>
                    <td className="py-4 font-semibold">₱{p.amount.toFixed(2)}</td>
                    <td className="py-4">{p.status}</td>
                    <td className="py-4">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="py-4">
                      <button onClick={() => openDetails(p)} className="px-3 py-1 bg-amber-500 text-white rounded-md">View Order</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order details modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Order Details — #{selected.id}</h3>
              <button onClick={closeDetails} className="text-slate-600">Close</button>
            </div>

            {detailLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-semibold">{selected.customer_name || selected.customer_email || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Method</p>
                    <p className="font-semibold">{selected.payment_method || 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-500">Items</p>
                  <div className="mt-2">
                    {(selected.items || []).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{it.product_name}</div>
                          <div className="text-xs text-slate-500">Qty: {it.quantity}</div>
                        </div>
                        <div className="font-semibold">₱{parseFloat(it.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-bold">{parseFloat(selected.total || 0).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments
