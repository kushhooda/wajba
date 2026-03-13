import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Restaurant, Category, MenuItem, Order } from '@/types'
import ImageUpload from '@/components/ImageUpload'
import {
  ShoppingBag, UtensilsCrossed, Settings, LogOut, Plus, Trash2,
  Check, X, ExternalLink, ToggleLeft, ToggleRight, Printer, Clock,
  ChevronDown, ChevronUp, History, TrendingUp,
} from 'lucide-react'

// ─── Shared UI ────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs text-white/40 uppercase tracking-widest font-mono mb-1.5">{children}</label>
)
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors ${props.className ?? ''}`} />
)
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors resize-none ${props.className ?? ''}`} />
)

// ─── Status badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const map = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
    declined: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return (
    <span className={`text-[10px] font-mono uppercase tracking-widest border px-2 py-0.5 rounded-full ${map[status]}`}>
      {status}
    </span>
  )
}

// ─── Order card (shared between OrdersTab & HistoryTab) ───────────
const OrderCard = ({ order, restaurant, onUpdate, showActions }: {
  order: Order; restaurant: Restaurant; onUpdate: () => void; showActions: boolean
}) => {
  const [expanded, setExpanded] = useState(false)

  const updateStatus = async (status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (error) { toast.error('Failed to update order'); return }
    toast.success(`Order ${status}`)
    onUpdate()
  }

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">{order.customer_name}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/30 font-mono">
              <Clock size={11} />
              {new Date(order.created_at).toLocaleString()}
              <span>·</span>
              <span>{restaurant.currency} {order.total.toFixed(2)}</span>
              <span>·</span>
              <span>{order.customer_phone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {showActions && order.status === 'pending' && (
            <>
              <button onClick={() => updateStatus('accepted')}
                className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors">
                <Check size={13} /> Accept
              </button>
              <button onClick={() => updateStatus('declined')}
                className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">
                <X size={13} /> Decline
              </button>
            </>
          )}
          {showActions && order.status === 'accepted' && (
            <button onClick={() => updateStatus('completed')}
              className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors">
              <Check size={13} /> Complete
            </button>
          )}
          <Link to={`/bill/${order.id}`} target="_blank"
            className="flex items-center gap-1.5 bg-white/5 text-white/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
            <Printer size={13} /> Bill
          </Link>
          <button onClick={() => setExpanded(!expanded)}
            className="text-white/30 hover:text-white transition-colors p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-5 py-4 bg-[#0d0d0d]">
          <div className="space-y-2 mb-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{item.quantity}× {item.name}</span>
                <span className="text-white/50 font-mono">{restaurant.currency} {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-brand font-mono">{restaurant.currency} {order.total.toFixed(2)}</span>
            </div>
          </div>
          {order.customer_address && (
            <p className="text-xs text-white/30 font-mono">📍 {order.customer_address}</p>
          )}
          {order.notes && (
            <p className="text-xs text-white/30 mt-1">📝 {order.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Orders tab ───────────────────────────────────────────────────
const OrdersTab = ({ restaurant }: { restaurant: Restaurant }) => {
  const [orders, setOrders] = useState<Order[]>([])

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data as Order[])
  }, [restaurant.id])

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `restaurant_id=eq.${restaurant.id}`,
      }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-white/20">
      <ShoppingBag size={40} className="mb-4 opacity-30" />
      <p className="font-mono text-sm">No active orders</p>
      <p className="text-xs mt-1">Pending and accepted orders will show here</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} restaurant={restaurant} onUpdate={fetchOrders} showActions />
      ))}
    </div>
  )
}

// ─── History tab ──────────────────────────────────────────────────
type DateFilter = 'today' | 'week' | 'all'

const HistoryTab = ({ restaurant }: { restaurant: Restaurant }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<DateFilter>('today')
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .in('status', ['completed', 'declined'])
      .order('created_at', { ascending: false })

    if (filter === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      query = query.gte('created_at', start.toISOString())
    } else if (filter === 'week') {
      const start = new Date(); start.setDate(start.getDate() - 7)
      query = query.gte('created_at', start.toISOString())
    }

    const { data } = await query
    if (data) setOrders(data as Order[])
    setLoading(false)
  }, [restaurant.id, filter])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const completed = orders.filter(o => o.status === 'completed')
  const revenue = completed.reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total orders', value: orders.length },
          { label: 'Completed', value: completed.length },
          { label: `Revenue (${restaurant.currency})`, value: revenue.toFixed(2) },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-white/10 rounded-xl p-4">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-white/30 font-mono mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex gap-2">
        {(['today', 'week', 'all'] as DateFilter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-brand text-white' : 'bg-[#1a1a1a] text-white/40 hover:text-white/70 border border-white/10'
            }`}>
            {f === 'today' ? 'Today' : f === 'week' ? 'This week' : 'All time'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/20">
          <TrendingUp size={40} className="mb-4 opacity-30" />
          <p className="font-mono text-sm">No order history yet</p>
          <p className="text-xs mt-1">Completed and declined orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} restaurant={restaurant} onUpdate={fetchHistory} showActions={false} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Menu tab ─────────────────────────────────────────────────────
const MenuTab = ({ restaurant }: { restaurant: Restaurant }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [newCat, setNewCat] = useState('')
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', category_id: '', image_url: '', is_available: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchMenu = useCallback(async () => {
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('categories').select('*').eq('restaurant_id', restaurant.id).order('sort_order'),
      supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id).order('created_at'),
    ])
    if (cats) setCategories(cats)
    if (its) setItems(its)
  }, [restaurant.id])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const addCategory = async () => {
    if (!newCat.trim()) return
    const { error } = await supabase.from('categories').insert({
      restaurant_id: restaurant.id, name: newCat.trim(), sort_order: categories.length,
    })
    if (error) { toast.error('Failed to add category'); return }
    setNewCat('')
    fetchMenu()
  }

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    fetchMenu()
    toast.success('Category removed')
  }

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_available: item.is_available,
    })
    setShowItemForm(true)
  }

  const resetForm = () => {
    setEditingItem(null)
    setItemForm({ name: '', description: '', price: '', category_id: '', image_url: '', is_available: true })
    setShowItemForm(false)
  }

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemForm.name.trim() || !itemForm.price) { toast.error('Name and price required'); return }
    setSaving(true)

    const payload = {
      restaurant_id: restaurant.id,
      category_id: itemForm.category_id || null,
      name: itemForm.name.trim(),
      description: itemForm.description.trim() || null,
      price: parseFloat(itemForm.price),
      image_url: itemForm.image_url.trim() || null,
      is_available: itemForm.is_available,
    }

    if (editingItem) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id)
      setSaving(false)
      if (error) { toast.error('Failed to update item'); return }
      toast.success('Item updated!')
    } else {
      const { error } = await supabase.from('menu_items').insert(payload)
      setSaving(false)
      if (error) { toast.error('Failed to add item'); return }
      toast.success('Item added!')
    }

    resetForm()
    fetchMenu()
  }

  const toggleAvailability = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    fetchMenu()
  }

  const deleteItem = async (id: string) => {
    await supabase.from('menu_items').delete().eq('id', id)
    fetchMenu()
    toast.success('Item removed')
  }

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-white font-bold mb-4">Categories</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5">
              <span className="text-sm text-white">{cat.name}</span>
              <button onClick={() => deleteCategory(cat.id)} className="text-white/30 hover:text-red-400 transition-colors ml-1">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input placeholder="e.g. Burgers, Drinks, Desserts" value={newCat} onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
          <button onClick={addCategory} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Menu Items ({items.length})</h3>
          <button onClick={() => { resetForm(); setShowItemForm(!showItemForm) }}
            className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors">
            <Plus size={15} /> Add Item
          </button>
        </div>

        {/* Add / Edit item form */}
        {showItemForm && (
          <form onSubmit={saveItem} className="bg-[#111] border border-white/10 rounded-xl p-5 mb-4 space-y-4">
            <h4 className="text-white font-bold text-sm">{editingItem ? 'Edit Item' : 'New Menu Item'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Chicken Shawarma" value={itemForm.name}
                  onChange={(e) => setItemForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea rows={2} placeholder="What's in it?" value={itemForm.description}
                  onChange={(e) => setItemForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Price ({restaurant.currency}) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={itemForm.price}
                  onChange={(e) => setItemForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div>
                <Label>Category</Label>
                <select value={itemForm.category_id} onChange={(e) => setItemForm(f => ({ ...f, category_id: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand appearance-none">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Photo</Label>
                <ImageUpload
                  value={itemForm.image_url}
                  onChange={(url) => setItemForm(f => ({ ...f, image_url: url }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="avail" checked={itemForm.is_available}
                  onChange={(e) => setItemForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="accent-brand w-4 h-4" />
                <label htmlFor="avail" className="text-sm text-white/60">Available now</label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="bg-brand text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-orange-500 transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Item'}
              </button>
              <button type="button" onClick={resetForm}
                className="border border-white/10 text-white/50 px-5 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-mono">No items yet. Add your first menu item above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-[#111] border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${item.is_available ? 'text-white' : 'text-white/30 line-through'}`}>
                      {item.name}
                    </p>
                    <p className="text-white/30 font-mono text-xs">
                      {restaurant.currency} {item.price.toFixed(2)}
                      {item.category_id && categories.find(c => c.id === item.category_id) && (
                        <span className="ml-2 text-brand/60">{categories.find(c => c.id === item.category_id)?.name}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button onClick={() => openEditForm(item)}
                    className="text-white/20 hover:text-white transition-colors px-2 py-1 text-xs font-mono border border-white/10 rounded-lg hover:border-white/20">
                    Edit
                  </button>
                  <button onClick={() => toggleAvailability(item)} title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                    className="text-white/30 hover:text-brand transition-colors">
                    {item.is_available ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Settings tab ─────────────────────────────────────────────────
const SettingsTab = ({ restaurant, onUpdate }: { restaurant: Restaurant; onUpdate: () => void }) => {
  const { signOut } = useAuth()
  const [form, setForm] = useState({
    name: restaurant.name,
    description: restaurant.description || '',
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    currency: restaurant.currency,
    is_open: restaurant.is_open,
  })
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('restaurants').update(form).eq('id', restaurant.id)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    toast.success('Settings saved!')
    onUpdate()
  }

  return (
    <form onSubmit={save} className="space-y-5 max-w-lg">
      <div><Label>Restaurant Name</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div>
        <Label>Your Menu URL</Label>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white/40 text-sm font-mono">
          wajba.app/menu/<span className="text-brand">{restaurant.slug}</span>
        </div>
        <p className="text-white/20 text-xs mt-1">URL slug cannot be changed after creation</p>
      </div>
      <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        <div>
          <Label>Currency</Label>
          <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand appearance-none">
            {['AED', 'KWD', 'SAR', 'QAR', 'BHD', 'OMR'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} /></div>
      <div className="flex items-center gap-3 py-2">
        <button type="button" onClick={() => setForm(f => ({ ...f, is_open: !f.is_open }))}>
          {form.is_open ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-white/30" />}
        </button>
        <div>
          <p className="text-sm font-medium text-white">{form.is_open ? 'Restaurant is Open' : 'Restaurant is Closed'}</p>
          <p className="text-xs text-white/30">Customers can{form.is_open ? '' : "'t"} place orders right now</p>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-brand text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-orange-500 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={signOut}
          className="flex items-center gap-2 border border-white/10 text-white/50 px-5 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </form>
  )
}

// ─── Dashboard shell ──────────────────────────────────────────────
type Tab = 'orders' | 'history' | 'menu' | 'settings'

const DashboardPage = () => {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tab, setTab] = useState<Tab>('orders')
  const [loading, setLoading] = useState(true)

  const fetchRestaurant = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).single()
    setRestaurant(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchRestaurant() }, [fetchRestaurant])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <p className="text-white/50 mb-4">Restaurant not found</p>
        <Link to="/onboarding" className="text-brand hover:underline text-sm">Set up your restaurant →</Link>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'history', label: 'History', icon: History },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="border-b border-white/10 px-5 md:px-10 py-4 flex items-center justify-between">
        <div>
          <span className="text-white/20 font-mono text-[10px] uppercase tracking-widest block">Wajba Dashboard</span>
          <h1 className="text-white font-black text-lg">{restaurant.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-white/40 font-mono hidden sm:block">{restaurant.is_open ? 'Open' : 'Closed'}</span>
          </div>
          <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-white/10 text-white/50 hover:text-brand hover:border-brand/30 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors">
            <ExternalLink size={13} /> Menu link
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/10 px-5 md:px-10 flex gap-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'text-brand border-brand' : 'text-white/30 border-transparent hover:text-white/60'
            }`}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 md:px-10 py-8 max-w-4xl">
        {tab === 'orders' && <OrdersTab restaurant={restaurant} />}
        {tab === 'history' && <HistoryTab restaurant={restaurant} />}
        {tab === 'menu' && <MenuTab restaurant={restaurant} />}
        {tab === 'settings' && <SettingsTab restaurant={restaurant} onUpdate={fetchRestaurant} />}
      </div>
    </div>
  )
}

export default DashboardPage
