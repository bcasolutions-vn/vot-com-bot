# Deployment Guide - Vote Com Bot

**Last Updated:** 2025-12-05

Complete guide to deploy and run the Discord bot and web dashboard 24/7.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Discord Bot Setup](#discord-bot-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running Locally](#running-locally)
7. [Production Deployment](#production-deployment)
8. [Process Management (PM2)](#process-management-pm2)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Node.js (v18 or higher)
node --version  # Should show v18.x.x or higher

# npm (comes with Node.js)
npm --version

# Git (optional, for version control)
git --version
```

### Required Accounts

- **Discord Developer Account** - https://discord.com/developers/applications
- **Supabase Account** - https://supabase.com (free tier available)

---

## Initial Setup

### 1. Clone/Download Project

```bash
# If using Git
git clone <your-repo-url>
cd vote-com-bot

# Or download ZIP and extract
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `discord.js` - Discord bot framework
- `@supabase/supabase-js` - Database client
- `express` - Web server
- `ejs` - Template engine
- `dotenv` - Environment variables

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign in / Sign up
3. Click **"New Project"**
4. Fill in:
   - **Name:** vote-com-bot
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
5. Wait 2-3 minutes for project creation

### 2. Run SQL Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire content from `supabase-schema.sql`:

```sql
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
```

4. Click **"Run"**
5. Verify: Should see "Success. No rows returned"

### 3. Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

---

## Discord Bot Setup

### 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: `Vote Com Bot`
4. Click **"Create"**

### 2. Create Bot User

1. In left sidebar, click **"Bot"**
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Under **"Token"**, click **"Reset Token"** → **"Copy"**
   - ⚠️ **SAVE THIS TOKEN!** You can't see it again
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 3. Get Application ID

1. In left sidebar, click **"General Information"**
2. Copy **"Application ID"**

### 4. Invite Bot to Server

1. In left sidebar, click **"OAuth2"** → **"URL Generator"**
2. Select **SCOPES**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select **BOT PERMISSIONS**:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Use Slash Commands
4. Copy the generated URL at bottom
5. Open URL in browser → Select your server → **"Authorize"**

---

## Environment Configuration

### 1. Create `.env` File

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env  # or use your text editor
```

### 2. Fill in Credentials

```env
# Discord Bot Token (from Discord Developer Portal → Bot → Token)
TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE

# Discord Application ID (from Discord Developer Portal → General Information)
CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE

# Supabase Configuration (from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# Web Server Port (default: 3000)
PORT=3000
```

### 3. Register Discord Commands

```bash
node deploy-commands.js
```

Expected output:
```
📦 Đang đăng ký 6 lệnh slash...
✅ Đăng ký slash command thành công!
```

---

## Running Locally

### Start the Bot

```bash
node index.js
```

Expected output:
```
🤖 Bot đã online với tên Vote Com Bot#1234
🌐 Web server running on http://localhost:3000
```

### Access Web Dashboard

Open browser: http://localhost:3000

Available pages:
- `/orders` - Daily orders
- `/debts` - Debt overview
- `/stats` - User statistics

### Test Discord Commands

In Discord server:
1. `/dat-com` - Create menu
2. `/com-them` - Re-order from menu
3. `/ket-qua` - View results

---

## Production Deployment

### Option 1: VPS/Server (Recommended)

**Requirements:**
- Ubuntu 20.04+ / Debian 10+ / CentOS 8+
- 1GB RAM minimum
- Node.js v18+

**Setup:**

```bash
# 1. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone project
git clone <your-repo-url>
cd vote-com-bot

# 3. Install dependencies
npm install

# 4. Setup .env file
cp .env.example .env
nano .env  # Fill in credentials

# 5. Register commands
node deploy-commands.js

# 6. Install PM2 (Process Manager)
sudo npm install -g pm2

# 7. Start bot with PM2
pm2 start index.js --name vote-com-bot

# 8. Save PM2 configuration
pm2 save

# 9. Setup auto-start on boot
pm2 startup
# Follow the instructions shown
```

### Option 2: Cloud Platforms

#### Heroku

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create vote-com-bot

# 4. Set environment variables
heroku config:set TOKEN=your_token
heroku config:set CLIENT_ID=your_client_id
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
heroku config:set PORT=3000

# 5. Deploy
git push heroku main
```

Create `Procfile`:
```
web: node index.js
```

#### Railway.app

1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically

#### Render.com

1. Create new Web Service
2. Connect repository
3. Add environment variables
4. Deploy

#### Cloudflare Pages + VPS (Recommended)

**Best for production:** Web dashboard on Cloudflare (free, global CDN) + Discord bot on VPS

See detailed guide: [docs/cloudflare-deployment.md](cloudflare-deployment.md)

**Quick Steps:**

1. **Deploy Web Dashboard to Cloudflare Pages:**
   - Push code to GitHub
   - Connect to Cloudflare Pages
   - Set environment variables (SUPABASE_URL, SUPABASE_KEY)
   - Auto-deploy on every commit
   - Free tier: Unlimited bandwidth, global CDN

2. **Deploy Discord Bot to VPS:**
   - Rent VPS ($5-6/month or free with Oracle Cloud)
   - Install Node.js + PM2
   - Run bot with auto-restart
   - See [Cloudflare Deployment Guide](cloudflare-deployment.md) for full instructions

**Benefits:**
- ⚡ Global CDN for web dashboard
- 🆓 Free web hosting on Cloudflare
- 🔒 Automatic SSL certificates
- 🛡️ DDoS protection
- 🔄 Auto-restart for bot
- 💰 Total cost: $5-6/month (or free)

---

## Process Management (PM2)

### Install PM2

```bash
npm install -g pm2
```

### Start Bot

```bash
# Start
pm2 start index.js --name vote-com-bot

# Start with environment file
pm2 start index.js --name vote-com-bot --env production
```

### Manage Bot

```bash
# View status
pm2 status

# View logs (live)
pm2 logs vote-com-bot

# View last 100 lines
pm2 logs vote-com-bot --lines 100

# Stop bot
pm2 stop vote-com-bot

# Restart bot
pm2 restart vote-com-bot

# Delete from PM2
pm2 delete vote-com-bot

# View detailed info
pm2 info vote-com-bot
```

### Auto-Restart on Changes

```bash
# Start with watch mode (auto-restart on file changes)
pm2 start index.js --name vote-com-bot --watch

# Ignore certain files
pm2 start index.js --name vote-com-bot --watch --ignore-watch="node_modules logs"
```

### Startup on Boot

```bash
# Generate startup script
pm2 startup

# Save current PM2 processes
pm2 save

# Verify after reboot
sudo reboot
# Wait for server to restart, then:
pm2 status  # Should show bot running
```

### PM2 Configuration File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'vote-com-bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
```

Start with config:
```bash
pm2 start ecosystem.config.js
```

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring dashboard
pm2 monit

# Web dashboard (PM2 Plus - free for 1 server)
pm2 link <secret> <public>
```

### View Logs

```bash
# Live logs (all apps)
pm2 logs

# Live logs (specific app)
pm2 logs vote-com-bot

# Error logs only
pm2 logs vote-com-bot --err

# Last 200 lines
pm2 logs vote-com-bot --lines 200

# Clear logs
pm2 flush
```

### Log Files

If using `ecosystem.config.js`, logs saved to:
- `./logs/err.log` - Error logs
- `./logs/out.log` - Standard output

```bash
# Create logs directory
mkdir -p logs

# View error logs
tail -f logs/err.log

# View output logs
tail -f logs/out.log
```

### Health Checks

```bash
# Check bot status
curl http://localhost:3000

# Check if process is running
pm2 status vote-com-bot

# Check memory usage
pm2 info vote-com-bot | grep memory

# Restart if memory exceeds 500MB (automatic)
# Add to ecosystem.config.js:
# max_memory_restart: '500M'
```

---

## Troubleshooting

### Bot Not Starting

**Symptom:** Bot crashes immediately after starting

**Check:**
```bash
# View error logs
pm2 logs vote-com-bot --err

# Common issues:
```

1. **Missing TOKEN**
   ```
   Error: An invalid token was provided
   ```
   Fix: Check `.env` file, ensure `TOKEN` is correct

2. **Missing CLIENT_ID**
   ```
   Error: Cannot read property 'id' of undefined
   ```
   Fix: Add `CLIENT_ID` to `.env`

3. **Supabase Connection Failed**
   ```
   Error: Invalid Supabase URL
   ```
   Fix: Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`

### Commands Not Appearing

**Symptom:** Slash commands don't show in Discord

**Fix:**
```bash
# 1. Re-register commands
node deploy-commands.js

# 2. Wait 1-2 minutes for Discord to update

# 3. If still not working, check bot permissions
# Bot needs "Use Slash Commands" permission
```

### Database Errors

**Symptom:** "Error saving menu" or "Error inserting order"

**Check:**
1. Verify Supabase credentials:
   ```bash
   # Test connection
   node -e "const {createClient} = require('@supabase/supabase-js'); const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); s.from('menus').select('count').then(r => console.log('✅ Connected:', r))"
   ```

2. Verify tables exist:
   - Go to Supabase Dashboard → Table Editor
   - Should see `menus` and `orders` tables

3. Verify RLS policies:
   - Go to Supabase Dashboard → Authentication → Policies
   - Should see "Public Access Menus" and "Public Access Orders"

### Web Dashboard Not Loading

**Symptom:** http://localhost:3000 shows error

**Check:**
```bash
# 1. Verify port is not in use
lsof -i :3000

# 2. Change port in .env
PORT=3001

# 3. Restart bot
pm2 restart vote-com-bot
```

### Bot Crashes Randomly

**Symptom:** Bot stops working after some time

**Fix:**
```bash
# 1. Enable auto-restart with PM2
pm2 start index.js --name vote-com-bot --exp-backoff-restart-delay=100

# 2. Set memory limit
pm2 start index.js --name vote-com-bot --max-memory-restart 500M

# 3. Check logs for errors
pm2 logs vote-com-bot --err --lines 100
```

### Permission Errors

**Symptom:** "Missing Permissions" in Discord

**Fix:**
1. Check bot has these permissions in server:
   - Send Messages
   - Embed Links
   - Use Slash Commands
2. Re-invite bot with correct permissions (see Discord Bot Setup)

---

## Quick Reference

### Daily Commands

```bash
# View bot status
pm2 status

# View logs
pm2 logs vote-com-bot

# Restart bot
pm2 restart vote-com-bot

# View web dashboard
http://localhost:3000
```

### Update Bot Code

```bash
# 1. Pull latest code
git pull

# 2. Install new dependencies (if any)
npm install

# 3. Re-register commands (if commands changed)
node deploy-commands.js

# 4. Restart bot
pm2 restart vote-com-bot
```

### Backup Database

```bash
# Supabase automatic backups (free tier: daily)
# Manual export: Supabase Dashboard → Database → Backups
```

---

## Support

### Logs Location
- PM2 logs: `~/.pm2/logs/`
- Custom logs: `./logs/` (if using ecosystem.config.js)

### Check Bot Health
```bash
# CPU & Memory
pm2 info vote-com-bot

# Uptime
pm2 status vote-com-bot

# Restart count
pm2 info vote-com-bot | grep restart
```

### Emergency Restart
```bash
# Force restart
pm2 restart vote-com-bot --force

# Stop and start fresh
pm2 stop vote-com-bot
pm2 delete vote-com-bot
pm2 start index.js --name vote-com-bot
```

---

## Summary

✅ **Complete Setup Checklist:**

- [ ] Node.js installed (v18+)
- [ ] Supabase project created
- [ ] Database tables created (ran `supabase-schema.sql`)
- [ ] Discord bot created
- [ ] Bot invited to server
- [ ] `.env` file configured with all credentials
- [ ] Commands registered (`node deploy-commands.js`)
- [ ] Bot running (`pm2 start index.js --name vote-com-bot`)
- [ ] PM2 startup configured (`pm2 startup && pm2 save`)
- [ ] Web dashboard accessible (http://localhost:3000)
- [ ] Discord commands working (`/dat-com`, `/com-them`, `/ket-qua`)

**Bot is now running 24/7!** 🎉
