import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Order, Restaurant } from '@/types'
import { Clock, CheckCircle, XCircle, Package, Printer, ArrowLeft, ChefHat } from 'lucide-react'

const steps = [
  { key: 'pending', label: 'Order received', icon: Clock, desc: 'Waiting for the restaurant to confirm…' },
  { key: 'accepted', label: 'Being prepared', icon: ChefHat, desc: 'The restaurant is preparing your order' },
  { key: 'completed', label: 'Ready!', icon: CheckCircle, desc: 'Your order is ready. Enjoy your meal!' },
]

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    const { data: ord } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!ord) { setLoading(false); return }
    setOrder(ord as Order)
    const { data: rest } = await supabase.from('restaurants').select('*').eq('id', ord.restaurant_id).single()
    if (rest) setRestaurant(rest as Restaurant)
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    fetchOrder()
    // Real-time status updates
    const channel = supabase
      .channel(`track-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${orderId}`,
      }, () => fetchOrder())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrder, orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )

  if (!order || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center text-gray-400">
        <p className="text-lg font-bold mb-1">Order not found</p>
        <p className="text-sm">This tracking link doesn't exist.</p>
      </div>
    </div>
  )

  const isDeclined = order.status === 'declined'
  const isCompleted = order.status === 'completed'
  const currentStepIdx = isDeclined ? -1 : steps.findIndex(s => s.key === order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to={`/menu/${restaurant.slug}`}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to menu
          </Link>
          <a href={`/bill/${order.id}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand hover:text-orange-500 text-sm font-medium transition-colors">
            <Printer size={15} /> Print bill
          </a>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8 space-y-4">

        {/* Status hero card */}
        {isDeclined ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-3" />
            <h1 className="font-black text-xl text-gray-900 mb-2">Order declined</h1>
            <p className="text-gray-500 text-sm mb-4">The restaurant couldn't accept your order right now.</p>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`}
                className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-500 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                Call {restaurant.name}
              </a>
            )}
          </div>
        ) : isCompleted ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="font-black text-xl text-gray-900 mb-1">Order ready!</h1>
            <p className="text-gray-500 text-sm">Your order is ready. Enjoy your meal!</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>
            <h1 className="font-black text-xl text-gray-900 mb-1">
              {order.status === 'pending' ? 'Order received' : 'Being prepared'}
            </h1>
            <p className="text-gray-500 text-sm">
              {order.status === 'pending'
                ? 'Waiting for the restaurant to confirm…'
                : `${restaurant.name} is preparing your order`}
            </p>
            <p className="text-xs text-gray-300 mt-2 font-mono">This page updates automatically</p>
          </div>
        )}

        {/* Progress steps */}
        {!isDeclined && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-5">Order progress</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-5">
                {steps.map((step, i) => {
                  const done = i < currentStepIdx
                  const active = i === currentStepIdx
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        done ? 'bg-brand text-white' :
                        active ? 'bg-brand text-white ring-4 ring-brand/20' :
                        'bg-gray-100 text-gray-300'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className={`font-semibold text-sm ${done || active ? 'text-gray-900' : 'text-gray-300'}`}>
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                        )}
                        {done && (
                          <p className="text-xs text-green-500 mt-0.5">✓ Done</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Your order</h2>
            <span className="text-xs text-gray-400 font-mono">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
          <div className="space-y-2.5 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.quantity}× {item.name}</span>
                <span className="text-gray-500 font-mono">{restaurant.currency} {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold pt-3 border-t border-gray-100">
            <span className="text-gray-900">Total</span>
            <span className="text-brand font-mono text-lg">{restaurant.currency} {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Delivery details</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="text-gray-400 w-16 flex-shrink-0">Name</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-16 flex-shrink-0">Phone</span>
              <a href={`tel:${order.customer_phone}`} className="text-brand hover:underline">{order.customer_phone}</a>
            </div>
            {order.customer_address && (
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Address</span>
                <span>{order.customer_address}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Notes</span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 py-4">
          Powered by <a href="https://wajba.app" className="text-brand font-medium hover:underline">Wajba</a>
        </p>
      </div>
    </div>
  )
}

export default OrderTrackingPage
