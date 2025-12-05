# Quick Start Guide

Fast setup for Vote Com Bot. For detailed instructions, see [docs/deployment-guide.md](docs/deployment-guide.md).

## Prerequisites
- Node.js v18+ installed
- Discord bot created with token
- Supabase account (free tier)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Supabase Setup (5 minutes)

### 2.1 Create Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Name: `vote-com-bot`
   - Database Password: (generate & save)
   - Region: Southeast Asia (recommended)
5. Wait ~2 minutes for creation

### 2.2 Create Database Schema
1. In Supabase dashboard → "SQL Editor"
2. Click "New Query"
3. Copy entire content from `supabase-schema.sql` file
4. Click "Run" (bottom right)
5. Verify: "Table Editor" → should see `menus` and `orders` tables

### 2.3 Get API Credentials
1. Supabase dashboard → "Settings" → "API"
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long JWT)
3. Keep these for next step

---

## Step 3: Discord Bot Setup (5 minutes)

### 3.1 Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name: `Vote Com Bot`
4. Click "Create"

### 3.2 Create Bot User
1. In left sidebar → "Bot"
2. Click "Add Bot" → "Yes, do it!"
3. Under "Token" → "Reset Token" → "Copy"
   - ⚠️ **SAVE THIS TOKEN!**
4. Enable Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 3.3 Get Application ID
1. In left sidebar → "General Information"
2. Copy "Application ID"

### 3.4 Invite Bot to Server
1. In left sidebar → "OAuth2" → "URL Generator"
2. Select SCOPES:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select BOT PERMISSIONS:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Use Slash Commands
4. Copy generated URL → Open in browser → Select server → Authorize

---

## Step 4: Configure Environment (1 minute)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

---

## Step 5: Register Commands (1 minute)

Run this to register new Discord commands:

```bash
node deploy-commands.js
```

Expected output:
```
📦 Đang đăng ký 6 lệnh slash...
✅ Đăng ký slash command thành công!
```

---

## Step 6: Run Bot

### Option A: Development (manual restart)
```bash
node index.js
```

### Option B: Production (auto-restart with PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
# Follow the instructions shown
```

Expected output:
```
🤖 Bot đã online với tên Vote Com Bot#1234
🌐 Web server running on http://localhost:3000
```

---

## Step 7: Test Everything (5 minutes)

### Discord Commands:
1. `/dat-com` - Create menu (enter dishes, one per line)
2. Select dish from dropdown
3. `/com-them` - Re-order (change your selection)
4. `/ket-qua` - View today's results

Format example:
```
3  Gà kho sả ớt — Minh Toàn, Đắc Lê, Phương
2  Cá kho tộ — An Dev, Bình QA
```

### Web Dashboard:
1. Open browser: http://localhost:3000
2. Navigate pages:
   - `/orders` - Daily orders
   - `/debts` - Debt overview
   - `/stats` - User statistics
3. Test date navigation (prev/next buttons)

---

## Common Commands (PM2)

```bash
# View bot status
pm2 status

# View logs (live)
pm2 logs vote-com-bot

# Restart bot
pm2 restart vote-com-bot

# Stop bot
pm2 stop vote-com-bot

# Monitor resources
pm2 monit
```

---

## Troubleshooting

### Commands not showing?
```bash
node deploy-commands.js
# Wait 1-2 minutes
```

### Bot crashes?
```bash
pm2 logs vote-com-bot --err
```

### Database errors?
- Verify Supabase credentials in `.env`
- Check tables exist: Supabase Dashboard → Table Editor
- Verify RLS policies are enabled

### Port already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or change PORT in .env
PORT=3001
```

For detailed troubleshooting, see [docs/deployment-guide.md](docs/deployment-guide.md).

---

## What's Next?

### Production Deployment Options:
- **VPS** - See full guide in [docs/deployment-guide.md](docs/deployment-guide.md)
- **Heroku** - One-click deploy
- **Railway.app** - Auto-deploy from Git
- **Render.com** - Free tier available

### Monitoring:
- PM2 monitoring dashboard
- Supabase logs
- Discord bot status

---

**Total Setup Time:** ~15 minutes
**Status:** Bot running 24/7! 🎉
