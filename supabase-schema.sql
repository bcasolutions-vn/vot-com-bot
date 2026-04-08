-- =====================================================
-- Supabase Database Schema for Lunch Order Bot
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create menus table (stores daily menu items)
CREATE TABLE IF NOT EXISTS menus (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  dish_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  extra_rice BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add extra_rice column if upgrading from existing schema
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS extra_rice BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(date);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_paid ON orders(paid);
CREATE INDEX IF NOT EXISTS idx_orders_paid_user ON orders(paid, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if exist
DROP POLICY IF EXISTS "Public Access Menus" ON menus;
DROP POLICY IF EXISTS "Public Access Orders" ON orders;

-- Create public read/write policies (no authentication required)
CREATE POLICY "Public Access Menus" ON menus
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public Access Orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification Queries (optional - run after table creation)
-- =====================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'orders';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'orders';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
