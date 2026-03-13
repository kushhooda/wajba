import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Restaurant, Category, MenuItem, CartItem } from '@/types'
import { ShoppingCart, Plus, Minus, X, ChevronRight, Search, Languages } from 'lucide-react'
import { getT, Lang } from '@/lib/i18n'

// ─── Cart logic ───────────────────────────────────────────────────
const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const add = (item: MenuItem) => setCart((c) => {
    const ex = c.find((i) => i.id === item.id)
    if (ex) return c.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
    return [...c, { ...item, quantity: 1 }]
  })
  const remove = (id: string) => setCart((c) => {
    const ex = c.find((i) => i.id === id)
    if (!ex) return c
    if (ex.quantity <= 1) return c.filter((i) => i.id !== id)
    return c.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
  })
  const clear = () => setCart([])
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)
  return { cart, add, remove, clear, total, count }
}

// ─── Order modal ──────────────────────────────────────────────────
const OrderModal = ({
  cart, total, currency, restaurantId, lang, onClose, onSuccess,
}: {
  cart: CartItem[]; total: number; currency: string; restaurantId: string
  lang: Lang; onClose: () => void; onSuccess: (orderId: string) => void
}) => {
  const t = getT(lang)
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const isRtl = lang === 'ar'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { toast.error(t('namePhoneRequired')); return }
    setLoading(true)
    const items = cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
    const { data, error } = await supabase.from('orders').insert({
      restaurant_id: restaurantId,
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      items,
      total,
    }).select().single()
    setLoading(false)
    if (error) { toast.error(t('orderFailed')); return }
    onSuccess(data.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden ${isRtl ? 'font-sans' : ''}`}
        dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{t('yourDetails')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{t('nameLbl')} *</label>
            <input type="text" required placeholder={t('namePlaceholder')} value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-brand transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{t('phoneLbl')} *</label>
            <input type="tel" required placeholder={t('phonePlaceholder')} value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-brand transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{t('deliveryAddress')}</label>
            <input type="text" placeholder={t('addressPlaceholder')} value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-brand transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{t('notesLbl')}</label>
            <textarea rows={2} placeholder={t('notesPlaceholder')} value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-brand transition-colors resize-none" />
          </div>
          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.quantity}× {item.name}</span>
                <span className="font-mono">{currency} {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
              <span>{t('total')}</span>
              <span className="text-brand font-mono">{currency} {total.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base">
            {loading ? t('placingOrder') : (<>{t('placeOrder')} <ChevronRight size={18} /></>)}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Menu page ────────────────────────────────────────────────────
const MenuPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<Lang>('en')
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const { cart, add, remove, clear, total, count } = useCart()
  const t = getT(lang)
  const isRtl = lang === 'ar'

  const fetchData = useCallback(async () => {
    if (!slug) { setLoading(false); return }
    try {
      const { data: rest } = await supabase.from('restaurants').select('*').eq('slug', slug).single()
      if (!rest) { setLoading(false); return }
      setRestaurant(rest)
      const [{ data: cats }, { data: its }] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', rest.id).order('sort_order'),
        supabase.from('menu_items').select('*').eq('restaurant_id', rest.id).order('created_at'),
      ])
      if (cats) setCategories(cats)
      if (its) setItems(its)
    } catch (e) {
      console.error('Wajba fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400">
        <p className="text-lg font-bold mb-1">Restaurant not found</p>
        <p className="text-sm">This menu link doesn't exist.</p>
      </div>
    </div>
  )

  // Order success screen
  if (orderId) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">{t('orderPlaced')}</h1>
        <p className="text-gray-500 mb-6">{t('orderReceivedMsg')}</p>
        <div className="flex flex-col gap-3">
          <Link to={`/order/${orderId}`}
            className="inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-500 transition-colors">
            {t('trackOrder')}
          </Link>
          <a href={`/bill/${orderId}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            {t('viewBill')}
          </a>
        </div>
      </div>
    </div>
  )

  // Filter items by category + search
  const byCat = activeCategory === 'all' ? items : items.filter(i => i.category_id === activeCategory)
  const searchTrimmed = search.trim().toLowerCase()
  const filtered = searchTrimmed
    ? byCat.filter(i => i.name.toLowerCase().includes(searchTrimmed) || i.description?.toLowerCase().includes(searchTrimmed))
    : byCat
  const available = filtered.filter(i => i.is_available)
  const unavailable = filtered.filter(i => !i.is_available)

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-xl text-gray-900 truncate">{restaurant.name}</h1>
                <span className={`text-[10px] font-mono uppercase tracking-widest border px-2 py-0.5 rounded-full flex-shrink-0 ${
                  restaurant.is_open ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'
                }`}>
                  {restaurant.is_open ? t('open') : t('closed')}
                </span>
              </div>
              {restaurant.description && (
                <p className="text-gray-500 text-sm mt-0.5 truncate">{restaurant.description}</p>
              )}
            </div>
          </div>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 flex-shrink-0 border border-gray-200 text-gray-500 hover:border-brand hover:text-brand px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
            title="Switch language"
          >
            <Languages size={15} />
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3">
        <div className="max-w-2xl mx-auto relative">
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-300 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-brand transition-colors ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors ${isRtl ? 'left-3' : 'right-3'}`}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && !searchTrimmed && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-5 flex gap-2 overflow-x-auto py-3 scrollbar-none">
            <button onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t('all')}
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="max-w-2xl mx-auto px-5 py-6 pb-32 space-y-3">
        {searchTrimmed && (
          <p className="text-xs text-gray-400 font-mono pb-1">
            {available.length + unavailable.length} {t('items')} — &ldquo;{search}&rdquo;
          </p>
        )}

        {available.map((item) => {
          const inCart = cart.find(i => i.id === item.id)
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-center gap-4 p-4 hover:border-gray-200 transition-colors">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{item.name}</p>
                {item.description && (
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                )}
                <p className="text-brand font-bold font-mono mt-1">{restaurant.currency} {item.price.toFixed(2)}</p>
              </div>
              <div className="flex-shrink-0">
                {inCart ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-gray-900 text-sm">{inCart.quantity}</span>
                    <button onClick={() => add(item)} className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-orange-500 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => restaurant.is_open ? add(item) : toast.error(t('restaurantClosed'))}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      restaurant.is_open ? 'bg-brand text-white hover:bg-orange-500' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {unavailable.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">{t('unavailable')}</p>
            {unavailable.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 flex items-center gap-4 p-4 opacity-50">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 grayscale" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-400 line-through">{item.name}</p>
                  <p className="text-gray-400 font-mono text-sm">{restaurant.currency} {item.price.toFixed(2)}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{t('soldOut')}</span>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{searchTrimmed ? t('noSearchResults') : t('noItemsInCategory')}</p>
          </div>
        )}
      </div>

      {/* Floating cart */}
      {count > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-5 z-20">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setShowOrderModal(true)}
              className="w-full bg-brand text-white font-bold py-4 rounded-2xl flex items-center justify-between px-5 hover:bg-orange-500 transition-colors shadow-2xl shadow-brand/30">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-black">{count}</span>
                <span>{t('viewCart')}</span>
              </div>
              <span className="font-mono">{restaurant.currency} {total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Order modal */}
      {showOrderModal && (
        <OrderModal
          cart={cart} total={total} currency={restaurant.currency}
          restaurantId={restaurant.id} lang={lang}
          onClose={() => setShowOrderModal(false)}
          onSuccess={(id) => { setOrderId(id); clear(); setShowOrderModal(false) }}
        />
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 text-center z-10">
        <p className="text-[11px] text-gray-300">{t('poweredBy')} <a href="https://wajba.app" className="text-brand font-medium">Wajba</a></p>
      </div>
    </div>
  )
}

export default MenuPage
