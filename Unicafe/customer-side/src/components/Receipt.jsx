import React from 'react'

/**
 * Receipt component: renders a simple, accessible receipt for an order.
 * Props:
 * - order: { orderNumber, customer_name, customer_email, payment_method, items, subtotal, tax, total }
 */
export default function Receipt({ order }) {
  if (!order) return null

  const items = Array.isArray(order.items) ? order.items : []

  const calcSubtotal = () => {
    if (typeof order.subtotal === 'number' && !isNaN(order.subtotal)) return Number(order.subtotal)
    return items.reduce((s, i) => s + (Number(i.price || 0) * Number(i.quantity || 0)), 0)
  }

  const subtotal = calcSubtotal()
  const tax = Number(order.tax || 0)
  const total = Number(order.total || subtotal + tax)

  return (
    <section aria-labelledby="receipt-heading" className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 id="receipt-heading" className="text-2xl font-bold text-gray-800">Receipt</h2>
        <div className="text-right text-sm text-gray-500">
          <div>Order <span className="font-semibold">#{order.orderNumber || order.id}</span></div>
          <div className="mt-1">{order.customer_name || 'Guest'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 text-sm text-gray-600">
        <div className="space-y-2">
          <div><span className="font-medium text-gray-700">Customer</span></div>
          <div className="text-gray-500">{order.customer_name || 'Guest'}</div>
          <div className="text-gray-500">{order.customer_email || ''}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-gray-700">Payment</div>
          <div className="text-gray-500">{(order.payment_method && String(order.payment_method)) || (order.payment && order.payment.method) || 'N/A'}</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
        <ul className="divide-y divide-gray-100">
          {items.length === 0 && <li className="py-3 text-sm text-gray-600">No items</li>}
          {items.map((it, idx) => {
            const qty = Number(it.quantity || it.qty || 1)
            const price = Number(it.price || it.unit_price || 0)
            const name = it.product_name || it.name || `Product #${it.product_id || it.id}`
            return (
              <li key={idx} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-gray-800">{name}</div>
                  <div className="text-gray-500 text-xs">Qty: {qty}</div>
                </div>
                <div className="font-semibold text-gray-800">₱{(price * qty).toFixed(2)}</div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Subtotal</span>
          <span className="font-medium">₱{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Tax</span>
          <span className="font-medium">₱{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-3 items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="text-orange-600 font-extrabold text-2xl">₱{total.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
