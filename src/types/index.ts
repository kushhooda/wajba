export interface Restaurant {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  phone: string | null
  address: string | null
  currency: string
  is_open: boolean
  created_at: string
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  items: OrderItem[]
  total: number
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  notes: string | null
  created_at: string
}

export interface CartItem extends MenuItem {
  quantity: number
}
