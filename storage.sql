-- Run this in your Supabase SQL Editor AFTER running schema.sql
-- Sets up the storage bucket for menu item images

-- Create the bucket (public so images are accessible without auth)
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict do nothing;

-- Allow anyone to read/view images
create policy "Public can read menu-images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

-- Authenticated users (restaurant owners) can upload
create policy "Auth users can upload to menu-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

-- Authenticated users can update their uploads
create policy "Auth users can update menu-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images');

-- Authenticated users can delete their uploads
create policy "Auth users can delete from menu-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images');
