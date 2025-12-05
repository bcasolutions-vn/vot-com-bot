# Cloudflare Deployment Guide

**Last Updated:** 2025-12-05

Complete guide to deploy Vote Com Bot using Cloudflare services.

---

## Architecture Overview

### Hybrid Deployment Strategy

Due to Discord bot requirements (persistent WebSocket connections), we use a hybrid approach:

```
┌─────────────────────────────────────────┐
│         Cloudflare Pages                │
│  - Web Dashboard (Static + SSR)         │
│  - API Routes (Serverless Functions)    │
│  - CDN + Edge Caching                   │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         Supabase Database               │
│  - PostgreSQL (menus, orders)           │
│  - Row Level Security                   │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│      VPS/Server (Discord Bot)           │
│  - Persistent WebSocket connection      │
│  - PM2 process manager                  │
│  - Auto-restart on crash                │
└─────────────────────────────────────────┘
```

**Why Hybrid?**
- ✅ Web dashboard on Cloudflare Pages (free, fast, global CDN)
- ✅ Discord bot on VPS (requires persistent connection, not suitable for serverless)
- ✅ Shared database (Supabase)

---

## Option 1: Cloudflare Pages (Web Dashboard Only)

Deploy the web dashboard to Cloudflare Pages with serverless API routes.

### Prerequisites

- Cloudflare account (free tier available)
- GitHub/GitLab repository
- Supabase database setup completed

### Step 1: Prepare Project for Cloudflare Pages

Create `functions` directory for serverless API routes:

```bash
mkdir -p functions/api
```

### Step 2: Convert Express Routes to Cloudflare Functions

Cloudflare Pages uses file-based routing. We need to convert our Express API routes.

**Create `functions/api/orders.js`:**

```javascript
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Create `functions/api/debts.js`:**

```javascript
export async function onRequest(context) {
  const { env } = context;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('paid', false)
      .order('date', { ascending: false });

    if (error) throw error;

    const debts = data.reduce((acc, order) => {
      const key = order.user_id;
      if (!acc[key]) {
        acc[key] = {
          user_id: order.user_id,
          user_name: order.user_name,
          total: 0,
          orders: []
        };
      }
      acc[key].total += order.price;
      acc[key].orders.push(order);
      return acc;
    }, {});

    return new Response(JSON.stringify(Object.values(debts)), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Create `functions/api/stats.js`:**

```javascript
export async function onRequest(context) {
  const { env } = context;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = data.reduce((acc, order) => {
      const key = order.user_id;
      if (!acc[key]) {
        acc[key] = {
          user_id: order.user_id,
          user_name: order.user_name,
          total_orders: 0,
          total_spent: 0,
          unpaid_count: 0,
          unpaid_amount: 0
        };
      }
      acc[key].total_orders++;
      acc[key].total_spent += order.price;
      if (!order.paid) {
        acc[key].unpaid_count++;
        acc[key].unpaid_amount += order.price;
      }
      return acc;
    }, {});

    return new Response(JSON.stringify(Object.values(stats)), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Step 3: Create Build Configuration

**Create `package.json` build script:**

```json
{
  "scripts": {
    "build": "echo 'No build needed for static site'",
    "dev": "wrangler pages dev public --compatibility-date=2023-01-01"
  }
}
```

### Step 4: Deploy to Cloudflare Pages

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Cloudflare Pages configuration"
   git push origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to https://dash.cloudflare.com
   - Click **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select your repository
   - Configure build settings:
     - **Build command:** (leave empty)
     - **Build output directory:** `public`
     - **Root directory:** (leave empty)

3. **Add Environment Variables:**
   - In Cloudflare Pages dashboard → **Settings** → **Environment variables**
   - Add:
     - `SUPABASE_URL` = your Supabase URL
     - `SUPABASE_KEY` = your Supabase anon key

4. **Deploy:**
   - Click **Save and Deploy**
   - Wait 2-3 minutes
   - Your site will be live at `https://your-project.pages.dev`

#### Option B: Wrangler CLI (Manual)

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Create `.dev.vars` for local development:**
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Deploy:**
   ```bash
   wrangler pages deploy public --project-name=vote-com-bot
   ```

5. **Set Environment Variables:**
   ```bash
   wrangler pages secret put SUPABASE_URL
   wrangler pages secret put SUPABASE_KEY
   ```

### Step 5: Custom Domain (Optional)

1. Go to Cloudflare Pages dashboard → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `vote.yourdomain.com`)
4. Follow DNS configuration instructions

**Your web dashboard is now live!** 🎉

---

## Option 2: Discord Bot on VPS (Required)

Discord bots require persistent WebSocket connections, so they must run on a VPS/server.

### Recommended VPS Providers

1. **DigitalOcean** - $6/month (1GB RAM)
2. **Vultr** - $5/month (1GB RAM)
3. **Linode** - $5/month (1GB RAM)
4. **Hetzner** - €4/month (2GB RAM)
5. **Oracle Cloud** - Free tier (1GB RAM)

### Setup on VPS

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone your repository
git clone https://github.com/your-username/vote-com-bot.git
cd vote-com-bot

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Paste your credentials:
# TOKEN=your_discord_bot_token
# CLIENT_ID=your_discord_client_id
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_KEY=your_supabase_anon_key
# PORT=3000

# 6. Register Discord commands
node deploy-commands.js

# 7. Install PM2
npm install -g pm2

# 8. Start bot with PM2
pm2 start ecosystem.config.js

# 9. Save PM2 configuration
pm2 save

# 10. Setup auto-start on reboot
pm2 startup
# Follow the command shown
```

### Monitoring

```bash
# View bot status
pm2 status

# View logs
pm2 logs vote-com-bot

# Restart bot
pm2 restart vote-com-bot
```

---

## Option 3: Cloudflare Workers (Advanced)

⚠️ **Not Recommended for Discord Bots** - Cloudflare Workers have 30-second execution limits and don't support persistent connections.

However, you can use Workers for:
- API endpoints
- Webhook handlers
- Scheduled tasks (Cron Triggers)

### Example: Scheduled Task to Clean Old Data

**Create `functions/scheduled/cleanup.js`:**

```javascript
export async function onRequest(context) {
  const { env } = context;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    // Delete orders older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const { error } = await supabase
      .from('orders')
      .delete()
      .lt('date', cutoffDate.toISOString().split('T')[0]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Add Cron Trigger in `wrangler.toml`:**

```toml
[triggers]
crons = ["0 0 * * 0"]  # Every Sunday at midnight
```

---

## Complete Deployment Architecture

### Final Setup

```
┌──────────────────────────────────────────────┐
│  Cloudflare Pages (Global CDN)               │
│  ├─ Static Files (HTML, CSS, JS)             │
│  ├─ API Functions (/api/orders, /api/debts)  │
│  └─ Custom Domain: vote.yourdomain.com       │
└──────────────────────────────────────────────┘
               ↕ HTTPS
┌──────────────────────────────────────────────┐
│  Supabase Database                           │
│  ├─ menus table                              │
│  ├─ orders table                             │
│  └─ Real-time subscriptions                  │
└──────────────────────────────────────────────┘
               ↕ PostgreSQL Protocol
┌──────────────────────────────────────────────┐
│  VPS (DigitalOcean/Vultr)                    │
│  ├─ Discord Bot (PM2)                        │
│  ├─ WebSocket Gateway                        │
│  └─ Auto-restart on crash                    │
└──────────────────────────────────────────────┘
               ↕ Discord Gateway
┌──────────────────────────────────────────────┐
│  Discord API                                 │
│  └─ Slash Commands, Interactions             │
└──────────────────────────────────────────────┘
```

### Benefits

✅ **Web Dashboard:**
- Global CDN (fast loading worldwide)
- Automatic SSL certificates
- DDoS protection
- Free bandwidth (up to 500K requests/month)
- Zero-downtime deployments

✅ **Discord Bot:**
- Persistent connection
- Auto-restart on crash
- Full control over resources
- Can run long-running tasks

✅ **Database:**
- Managed PostgreSQL
- Automatic backups
- Real-time subscriptions
- Row Level Security

---

## Costs Breakdown

### Cloudflare Pages
- **Free Tier:**
  - 500 builds/month
  - Unlimited bandwidth
  - Unlimited requests
  - 100K reads/day per function

### VPS (Discord Bot)
- **DigitalOcean:** $6/month (1GB RAM)
- **Vultr:** $5/month (1GB RAM)
- **Oracle Cloud:** Free (1GB RAM, limited availability)

### Supabase
- **Free Tier:**
  - 500MB database
  - 1GB file storage
  - 2GB bandwidth/month
  - 50K monthly active users

**Total Monthly Cost:** $5-6 (or free with Oracle Cloud)

---

## Environment Variables Management

### Cloudflare Pages

Set in dashboard: **Settings** → **Environment variables**

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### VPS (Discord Bot)

Create `.env` file:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

---

## Deployment Checklist

### Web Dashboard (Cloudflare Pages)

- [ ] Create Cloudflare account
- [ ] Push code to GitHub/GitLab
- [ ] Connect repository to Cloudflare Pages
- [ ] Set environment variables (SUPABASE_URL, SUPABASE_KEY)
- [ ] Deploy and verify
- [ ] (Optional) Configure custom domain

### Discord Bot (VPS)

- [ ] Rent VPS (DigitalOcean/Vultr/Oracle)
- [ ] SSH into VPS
- [ ] Install Node.js v18+
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Create `.env` file
- [ ] Register Discord commands
- [ ] Install PM2
- [ ] Start bot with PM2
- [ ] Configure auto-start on boot
- [ ] Verify bot is online in Discord

### Database (Supabase)

- [ ] Create Supabase project
- [ ] Run SQL migration from `supabase-schema.sql`
- [ ] Verify tables exist (menus, orders)
- [ ] Get API credentials
- [ ] Configure RLS policies

---

## Monitoring & Logs

### Cloudflare Pages

View logs in dashboard: **Pages** → **Your Project** → **Functions**

### VPS Bot Logs

```bash
# Real-time logs
pm2 logs vote-com-bot

# Last 100 lines
pm2 logs vote-com-bot --lines 100

# Error logs only
pm2 logs vote-com-bot --err
```

---

## Troubleshooting

### Cloudflare Pages Issues

**Build Failed:**
- Check build command in dashboard
- Verify `public` directory exists
- Check environment variables are set

**Functions Not Working:**
- Verify function file path: `functions/api/*.js`
- Check environment variables
- View function logs in dashboard

**CORS Errors:**
Add CORS headers to function responses:

```javascript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
});
```

### VPS Bot Issues

**Bot Not Starting:**
```bash
# Check logs
pm2 logs vote-com-bot --err

# Check .env file
cat .env

# Restart bot
pm2 restart vote-com-bot
```

**Commands Not Working:**
```bash
# Re-register commands
node deploy-commands.js

# Check bot has correct permissions in Discord server
```

---

## Updating Your Deployment

### Update Web Dashboard

**With GitHub integration:**
```bash
git add .
git commit -m "Update dashboard"
git push origin main
# Cloudflare auto-deploys
```

**With Wrangler CLI:**
```bash
wrangler pages deploy public --project-name=vote-com-bot
```

### Update Discord Bot

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd vote-com-bot

# Pull latest changes
git pull

# Install new dependencies (if any)
npm install

# Re-register commands (if commands changed)
node deploy-commands.js

# Restart bot
pm2 restart vote-com-bot
```

---

## Summary

**Best Deployment Strategy:**

1. **Web Dashboard** → Cloudflare Pages (free, fast, global)
2. **Discord Bot** → VPS with PM2 ($5-6/month or free with Oracle)
3. **Database** → Supabase (free tier)

**Total Cost:** $5-6/month (or free with Oracle Cloud)

**Benefits:**
- ⚡ Fast global CDN for web dashboard
- 🔒 Automatic SSL certificates
- 🛡️ DDoS protection
- 🔄 Auto-restart for Discord bot
- 💾 Managed database with backups
- 📊 Easy monitoring and logs

Your bot is production-ready! 🚀
