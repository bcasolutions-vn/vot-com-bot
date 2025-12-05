# Database Migration: Add Menus Table

**Date:** 2025-12-05
**Purpose:** Fix `/com-them` command not finding menu after `/dat-com` creates vote

## Problem

The `/com-them` command was querying the `orders` table for menu items, but `/dat-com` only saves orders AFTER the vote period ends. This caused `/com-them` to show "Chưa có menu nào hôm nay!" even after creating a vote.

## Solution

Create a separate `menus` table to store daily menu items independently from user orders.

## Migration Steps

### 1. Run SQL Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create menus table (stores daily menu items)
CREATE TABLE IF NOT EXISTS menus (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  dish_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(date);

-- Enable Row Level Security (RLS)
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Create public read/write policy (no authentication required)
CREATE POLICY "Public Access Menus" ON menus
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 2. Verify Table Creation

Run this query to verify:

```sql
SELECT * FROM menus LIMIT 10;
```

You should see an empty table with columns: `id`, `date`, `dish_name`, `price`, `created_at`.

### 3. Restart Discord Bot

```bash
# Stop the bot (Ctrl+C if running in terminal)
# Restart the bot
node index.js
```

## Changes Made

### Code Changes

1. **index.js** (Lines 60-81)
   - Added menu saving logic when `/dat-com` modal is submitted
   - Deletes old menu for today, inserts new menu items
   - Saves to `menus` table immediately (not waiting for vote to end)

2. **commands/com-them.js** (Lines 18-40, 95-98)
   - Changed query from `orders` table to `menus` table
   - Uses price directly from `menus` table instead of extracting from dish name
   - More reliable and faster

3. **supabase-schema.sql**
   - Added `menus` table schema
   - Added indexes and RLS policies

## Testing

After migration, test the flow:

1. Run `/dat-com` in Discord
2. Enter menu items and time
3. **Immediately** run `/com-them` (don't wait for vote to end)
4. You should now see the menu items ✅

## Rollback (if needed)

If something goes wrong, you can rollback:

```sql
DROP TABLE IF EXISTS menus CASCADE;
```

Then restore the old code from git history.

## Benefits

- ✅ Menu available immediately after creation
- ✅ `/com-them` works even with zero votes
- ✅ Cleaner separation of concerns (menu vs orders)
- ✅ Better performance (smaller table, focused queries)
- ✅ No duplicate menu items in database
