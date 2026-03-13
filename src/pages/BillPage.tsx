import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Order, Restaurant } from '@/types'
import { Printer } from 'lucide-react'

const BillPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!orderId) return
      const { data: ord } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (!ord) { setLoading(false); return }
      setOrder(ord)
      const { data: rest } = await supabase.from('restaurants').select('*').eq('id', ord.restaurant_id).single()
      if (rest) setRestaurant(rest)
      setLoading(false)
    }
    fetch()
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )

  if (!order || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <p>Order not found.</p>
    </div>
  )

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    accepted: 'text-green-600 bg-green-50',
    declined: 'text-red-600 bg-red-50',
    completed: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      {/* Print button */}
      <button onClick={() => window.print()}
        className="no-print fixed top-5 right-5 flex items-center gap-2 bg-brand text-white font-bold px-4 py-2.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg text-sm z-50">
        <Printer size={16} /> Print Bill
      </button>

      {/* Bill */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 py-6 text-center">
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover mx-auto mb-3" />
          )}
          <h1 className="text-white font-black text-2xl">{restaurant.name}</h1>
          {restaurant.address && <p className="text-white/40 text-xs mt-1">{restaurant.address}</p>}
          {restaurant.phone && <p className="text-white/40 text-xs">{restaurant.phone}</p>}
        </div>

        {/* Order details */}
        <div className="px-6 py-5 border-b border-dashed border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Order ID</span>
            <span className="font-mono text-xs text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Date</span>
            <span className="text-xs text-gray-700">{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Status</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[order.status]}`}>{order.status}</span>
          </div>
        </div>

        {/* Customer */}
        <div className="px-6 py-4 border-b border-dashed border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Customer</p>
          <p className="font-bold text-gray-900">{order.customer_name}</p>
          <p className="text-gray-500 text-sm">{order.customer_phone}</p>
          {order.customer_address && <p className="text-gray-500 text-sm mt-0.5">📍 {order.customer_address}</p>}
          {order.notes && <p className="text-gray-400 text-sm mt-1 italic">"{order.notes}"</p>}
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 text-sm font-medium">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.quantity} × {restaurant.currency} {item.price.toFixed(2)}</p>
                </div>
                <p className="font-mono text-sm text-gray-900 font-bold">{restaurant.currency} {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="px-6 py-4 bg-gray-50 border-t border-dashed border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-black text-gray-900 text-lg">Total</span>
            <span className="font-black text-brand text-xl font-mono">{restaurant.currency} {order.total.toFixed(2)}</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">Cash on delivery</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center border-t border-gray-100">
          <p className="text-gray-400 text-xs">Thank you for your order!</p>
          <p className="text-gray-300 text-[10px] mt-1">Powered by Wajba</p>
        </div>
      </div>
    </div>
  )
}

export default BillPage
