-- Munchies Database Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- URL: https://supabase.com/dashboard/project/wpxuydfourdzanmvnhvs/sql/new

-- ═══════════════════════════════════════
-- 1. Create Products Table
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(10, 2),
  description TEXT,
  image_url TEXT,
  variants_json TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add the optional sale-price column to existing products tables. Safe to re-run.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2);

-- ═══════════════════════════════════════
-- 2. Create Orders Table
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT NOT NULL,
  class TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  payment_method TEXT NOT NULL,
  payment_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If the orders table already exists from an older setup, make sure the
-- columns the app needs are present. These are safe to run repeatedly.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- ═══════════════════════════════════════
-- 3. Disable RLS (for development)
-- ═══════════════════════════════════════
-- This allows all operations from the frontend using the anon key.
-- For production, replace these with proper RLS policies.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read products"
  ON public.products FOR SELECT
  USING (true);

-- Allow public insert/update/delete on products (for admin dashboard)
CREATE POLICY "Allow public insert products"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update products"
  ON public.products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete products"
  ON public.products FOR DELETE
  USING (true);

-- Allow public read access to orders
CREATE POLICY "Allow public read orders"
  ON public.orders FOR SELECT
  USING (true);

-- Allow public insert on orders (for student checkout)
CREATE POLICY "Allow public insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════
-- 4. Create Storage Bucket (optional, for image uploads)
-- ═══════════════════════════════════════
-- If you want to upload images directly, create a storage bucket named "products"
-- Go to Storage > Create Bucket > Name: "products" > Public: true

-- Done! Your tables are ready.
