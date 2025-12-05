# Unified Deployment Guide - Bot + Web Together

**Last Updated:** 2025-12-05

Deploy **both** Discord bot and web dashboard on a **single platform**.

---

## Option 1: Railway.app (Easiest - One-Click Deploy)

### Why Railway?
- ✅ **All-in-one**: Bot + Web on same service
- ✅ **One-click deploy** from GitHub
- ✅ **Free tier**: $5 credit/month (~550 hours)
- ✅ **Auto-deploy** on Git push
- ✅ **Built-in domain**: `*.railway.app`
- ✅ **Environment variables** UI
- ✅ **Logs** and monitoring built-in

### Cost
- **Free tier**: $5/month credit (enough for small teams)
- **After free tier**: ~$10/month for bot + web

---

### Step 1: Prepare Your Project

**Create `Procfile`** (tells Railway what to run):

```procfile
web: node index.js
```

**Update `package.json`** with start script:

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

---

### Step 2: Deploy to Railway

#### Method A: One-Click Deploy (Fastest)

1. **Click this button** (after pushing to GitHub):

   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

2. **Connect GitHub repository**
3. **Add environment variables:**
   - `TOKEN` = your Discord bot token
   - `CLIENT_ID` = your Discord client ID
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_KEY` = your Supabase anon key
   - `PORT` = 3000

4. **Deploy** - Railway auto-detects Node.js and deploys

5. **Register Discord commands:**
   ```bash
   # SSH into Railway container (or run locally)
   node deploy-commands.js
   ```

#### Method B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub repo (optional)
railway link

# Add environment variables
railway variables set TOKEN=your_token
railway variables set CLIENT_ID=your_client_id
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_KEY=your_key
railway variables set PORT=3000

# Deploy
railway up

# Open in browser
railway open
```

---

### Step 3: Access Your Deployment

**Bot:** Automatically starts and connects to Discord
**Web Dashboard:** `https://your-project.up.railway.app`

**Custom Domain (Optional):**
1. Go to Railway dashboard → **Settings** → **Domains**
2. Click **Generate Domain** or add custom domain
3. Update DNS if using custom domain

---

### Step 4: Monitor & Manage

```bash
# View logs
railway logs

# Restart service
railway restart

# Check status
railway status
```

**In Railway Dashboard:**
- View real-time logs
- Monitor CPU/memory usage
- Manage environment variables
- Configure auto-deploy settings

---

## Option 2: Render.com (Free Tier Available)

### Why Render?
- ✅ **Free tier** (with limitations)
- ✅ **Background worker** for Discord bot
- ✅ **Web service** for dashboard
- ✅ **Auto-deploy** from GitHub
- ✅ **SSL certificates** included

### Cost
- **Free tier**: Both services free (with sleep on inactivity)
- **Paid tier**: $7/month for web + $7/month for worker = $14/month

---

### Setup on Render

#### 1. Create Web Service

1. Go to https://render.com → **Dashboard** → **New Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name**: `vote-com-bot-web`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables:**
     - `TOKEN`, `CLIENT_ID`, `SUPABASE_URL`, `SUPABASE_KEY`, `PORT=3000`

4. Click **Create Web Service**

Your web dashboard will be live at: `https://vote-com-bot-web.onrender.com`

#### 2. Keep Bot Running (Background Worker)

**Option A: Use same web service (simplest)**
The web service runs `node index.js` which starts both bot and web server.

**Option B: Separate background worker**
1. Create **Background Worker** service
2. **Build Command**: `npm install`
3. **Start Command**: `node -e "require('./index.js')"`
4. Add same environment variables

---

### Free Tier Limitations

⚠️ **Render Free Tier:**
- Service **sleeps** after 15 min inactivity
- **50GB bandwidth/month**
- Shared resources

**Solution:** Upgrade to paid tier ($7/month) for always-on service

---

## Option 3: VPS - Single Server (Best Value)

### Why VPS?
- ✅ **Best price/performance**: $5-6/month
- ✅ **Full control**: Run bot + web on same machine
- ✅ **No sleep**: Always running
- ✅ **PM2**: Manage both processes
- ✅ **Flexible**: Add more services later

### Recommended Providers
- **Hetzner**: €4/month (2GB RAM) - Best value
- **Vultr**: $5/month (1GB RAM)
- **DigitalOcean**: $6/month (1GB RAM)
- **Oracle Cloud**: FREE (1GB RAM, limited availability)

---

### VPS Setup - Complete Guide

#### Step 1: Rent VPS

Choose provider → Create Droplet/Instance with Ubuntu 22.04

#### Step 2: Initial Setup

```bash
# SSH into VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node -v  # Should show v18.x.x
npm -v
```

#### Step 3: Install Git and Clone Project

```bash
# Install Git
apt install -y git

# Clone your repository
git clone https://github.com/your-username/vote-com-bot.git
cd vote-com-bot

# Install dependencies
npm install
```

#### Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

**Add your credentials:**
```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

Save: `Ctrl+X` → `Y` → `Enter`

#### Step 5: Register Discord Commands

```bash
node deploy-commands.js
```

Expected output:
```
📦 Đang đăng ký 6 lệnh slash...
✅ Đăng ký slash command thành công!
```

#### Step 6: Install and Configure PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start bot + web with PM2
pm2 start ecosystem.config.js

# Expected output:
# ┌────┬────────────────┬─────────────┬─────────┬─────────┬──────────┐
# │ id │ name           │ mode        │ ↺       │ status  │ cpu      │
# ├────┼────────────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0  │ vote-com-bot   │ fork        │ 0       │ online  │ 0%       │
# └────┴────────────────┴─────────────┴─────────┴─────────┴──────────┘

# Save PM2 configuration
pm2 save

# Setup auto-start on server reboot
pm2 startup
# Copy and run the command shown
```

#### Step 7: Configure Nginx (Optional - For Custom Domain)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/vote-com-bot
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/vote-com-bot /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### Step 8: Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

### VPS Management Commands

```bash
# View bot status
pm2 status

# View logs (live)
pm2 logs vote-com-bot

# View last 100 lines
pm2 logs vote-com-bot --lines 100

# Restart bot
pm2 restart vote-com-bot

# Stop bot
pm2 stop vote-com-bot

# Monitor resources
pm2 monit

# Update bot code
cd vote-com-bot
git pull
npm install
node deploy-commands.js  # If commands changed
pm2 restart vote-com-bot
```

---

## Comparison Table

| Feature | Railway | Render | VPS |
|---------|---------|--------|-----|
| **Setup Time** | 5 min | 10 min | 15 min |
| **Cost (Free)** | $5 credit/mo | Limited free | Oracle only |
| **Cost (Paid)** | ~$10/mo | $14/mo | $5-6/mo |
| **Auto-deploy** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Custom Domain** | ✅ Easy | ✅ Easy | ✅ Nginx |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Certbot |
| **Sleep Mode** | ❌ No | ⚠️ Free tier | ❌ No |
| **Monitoring** | ✅ Built-in | ✅ Built-in | ⚙️ PM2 |
| **Control** | ⚙️ Medium | ⚙️ Medium | ✅ Full |
| **Scalability** | ✅ Easy | ✅ Easy | ⚙️ Manual |

---

## Recommended Choice

### For Beginners:
**Railway.app** - Easiest setup, one-click deploy

### For Budget-Conscious:
**VPS (Hetzner €4/mo)** - Best value, full control

### For Free Tier:
**Render.com** - Free but sleeps after inactivity

### For Production:
**VPS with PM2** - Most reliable, best performance

---

## Deployment Checklist

### Railway.app
- [ ] Push code to GitHub
- [ ] Connect repository to Railway
- [ ] Add environment variables
- [ ] Deploy
- [ ] Register Discord commands
- [ ] Test bot and web dashboard
- [ ] (Optional) Add custom domain

### VPS
- [ ] Rent VPS
- [ ] SSH into server
- [ ] Install Node.js v18
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Create .env file
- [ ] Register Discord commands
- [ ] Install PM2
- [ ] Start with PM2
- [ ] Configure auto-start
- [ ] (Optional) Setup Nginx + SSL
- [ ] Test bot and web dashboard

---

## Troubleshooting

### Railway Issues

**Build Failed:**
- Check logs in Railway dashboard
- Verify `package.json` has `start` script
- Ensure all dependencies are in `package.json`

**Bot Not Starting:**
- Check environment variables are set
- View logs: `railway logs`
- Verify TOKEN and CLIENT_ID are correct

**Commands Not Working:**
```bash
# Run locally or in Railway shell
node deploy-commands.js
```

### VPS Issues

**Can't SSH:**
```bash
# Check VPS is running in provider dashboard
# Verify IP address is correct
# Check SSH key is added (if using key auth)
```

**Bot Crashes:**
```bash
# Check logs
pm2 logs vote-com-bot --err

# Check .env file
cat .env

# Restart
pm2 restart vote-com-bot
```

**Port 3000 in use:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

---

## Summary

**Easiest:** Railway.app (5 minutes, one-click)
**Cheapest:** VPS Hetzner (€4/month, full control)
**Free:** Render.com (with limitations)
**Best Value:** VPS with PM2 ($5-6/month)

All options run **both bot and web** on the **same platform**! 🚀
