# Setup Instructions - Steps 1 & 2

## ✅ Step 1: Setup Supabase Database (5 minutes)

### A. Run SQL Schema

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com
   - Log in to your account
   - Select your project: `dlqilrohtjshvtmwzqjd`

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Run the SQL Schema:**
   - Open the file: `supabase-schema.sql` (in project root)
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click **"Run"** button (bottom right)

4. **Verify Table Creation:**
   - Go to **"Table Editor"** (left sidebar)
   - You should see `orders` table
   - Click on it to verify columns:
     - id (bigserial)
     - date (date)
     - user_id (text)
     - user_name (text)
     - dish_name (text)
     - price (integer)
     - paid (boolean)
     - created_at (timestamptz)

### B. Enable Realtime (CRITICAL!)

1. **Go to Database Replication:**
   - Click **"Database"** in left sidebar
   - Click **"Replication"** submenu

2. **Enable Realtime for orders table:**
   - Find `orders` table in the list
   - Click the toggle switch to **"Enable"**
   - Click **"Save"** if prompted

3. **Verify:**
   - The `orders` table should show as "Enabled" for Realtime
   - This allows instant web updates when data changes

---

## ✅ Step 2: Deploy Discord Commands (1 minute)

### Run the Deployment Script

Open terminal in your project folder and run:

```bash
node deploy-commands.js
```

**Expected Output:**
```
📦 Đang đăng ký 4 lệnh slash...
✅ Đăng ký slash command thành công!
```

**This registers these commands:**
- `/dat_com` (existing - now saves to database)
- `/debt` (new - personal debt check)
- `/debtlist` (new - public debt list)
- `/markpaid` (new - mark orders paid)

**Note:** Wait 1-2 minutes for Discord to sync commands globally.

---

## ✅ Step 3: Start the Bot + Web Server

```bash
node index.js
```

**Expected Output:**
```
🌐 Web server running on http://localhost:3000
🤖 Bot đã online với tên YourBot#1234
```

**If you see errors:**
- Check `.env` file has all variables
- Check Supabase URL and KEY are correct
- Check Discord TOKEN is valid

---

## 🧪 Quick Test

### Test Discord Bot:
1. Go to your Discord server
2. Type `/` to see commands
3. You should see: `/dat_com`, `/debt`, `/debtlist`, `/markpaid`

### Test Web Dashboard:
1. Open browser: http://localhost:3000
2. Should redirect to: http://localhost:3000/orders
3. Click navigation links: Orders, Debts, Statistics

### Create Test Order:
```
/dat_com
Menu:
Ếch rim mắm tỏi (42k)
Mực xào rau củ
Time: 1
```
- Vote for a dish
- Wait 1 minute
- Check Supabase Table Editor → `orders` table
- Should see your order saved

---

## ❗ Troubleshooting

### "Cannot find module './supabase-client'"
```bash
# Check file exists
ls -la supabase-client.js

# If missing, the implementation didn't complete
# Contact support
```

### "Supabase insert error"
```bash
# Check environment variables
cat .env

# Verify SUPABASE_URL and SUPABASE_KEY are set
# Check RLS policy in Supabase (should allow public access)
```

### Commands not showing in Discord
```bash
# Re-run deployment
node deploy-commands.js

# Wait 2 minutes, then restart bot
node index.js
```

### Web pages show errors
```bash
# Check views folder exists
ls -la views/

# Should see: layout.ejs, orders.ejs, debts.ejs, stats.ejs
```

---

## 📁 Files Created

Your project now has:

```
vote-com-bot/
├── .env                        ✅ Updated with TOKEN
├── supabase-schema.sql         ✅ SQL to run in Supabase
├── supabase-client.js          ✅ Database connection
├── utils/price-extractor.js    ✅ Price parsing
├── commands/
│   ├── dat_com.js              ✅ Existing
│   ├── debt.js                 ✅ New
│   ├── debtlist.js             ✅ New
│   └── markpaid.js             ✅ New
├── routes/api.js               ✅ REST API
├── views/
│   ├── layout.ejs              ✅ Base template
│   ├── orders.ejs              ✅ Orders page
│   ├── debts.ejs               ✅ Debts page
│   └── stats.ejs               ✅ Stats page
└── public/js/app.js            ✅ Realtime client
```

---

## ✅ Next Steps After Setup

1. **Test creating orders** with `/dat_com`
2. **Check debts** with `/debt` and `/debtlist`
3. **Mark as paid** with `/markpaid`
4. **View web dashboard** at http://localhost:3000
5. **Test real-time updates** (mark paid → watch web update)

---

**Status:** Ready to run after completing Steps 1 & 2! 🚀
