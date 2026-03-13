-- Run this entire file in your Supabase SQL editor (supabase.com → your project → SQL Editor)

create extension if not exists "uuid-ossp";

-- ─── Tables ───────────────────────────────────────────────────────

create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  phone text,
  address text,
  currency text default 'AED',
  is_open boolean default true,
  created_at timestamptz default now()
);

create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  items jsonb not null default '[]',
  total numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed')),
  notes text,
  created_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────

alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- Restaurants
create policy "owner_all_restaurants" on public.restaurants
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Categories
create policy "owner_all_categories" on public.categories
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  ) with check (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );
create policy "public_read_categories" on public.categories
  for select using (true);

-- Menu items
create policy "owner_all_menu_items" on public.menu_items
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  ) with check (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );
create policy "public_read_menu_items" on public.menu_items
  for select using (true);

-- Orders
create policy "public_insert_orders" on public.orders
  for insert with check (true);
create policy "owner_all_orders" on public.orders
  for all using (
    restaurant_id in (select id from public.restaurants where owner_id = auth.uid())
  );
create policy "public_read_orders" on public.orders
  for select using (true);
