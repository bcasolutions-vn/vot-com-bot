# Vote Com Bot 🍚

Discord bot + Web dashboard for managing daily lunch orders and payments.

## Features

### Discord Bot Commands
- `/dat-com` - Create daily menu (persistent selection, no timeout)
- `/com-them` - Re-order from today's menu
- `/ket-qua` - View today's results in clean format

### Web Dashboard
- **Daily Orders** (`/orders`) - View all orders by date
- **Debt Overview** (`/debts`) - Track unpaid orders
- **Statistics** (`/stats`) - User order history and stats

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database (see QUICK-START.md)
# 3. Configure .env file
# 4. Register commands
node deploy-commands.js

# 5. Run bot
node index.js
```

**For detailed setup:** See [QUICK-START.md](QUICK-START.md)

## Documentation

- **[QUICK-START.md](QUICK-START.md)** - Fast 15-minute setup guide
- **[docs/deployment-guide.md](docs/deployment-guide.md)** - Complete deployment guide with PM2, troubleshooting
- **[docs/database-migration-menus-table.md](docs/database-migration-menus-table.md)** - Database migration instructions
- **[docs/design-guidelines.md](docs/design-guidelines.md)** - UI/UX design system

## Tech Stack

- **Bot:** Discord.js v14
- **Database:** Supabase (PostgreSQL)
- **Web:** Express + EJS
- **Process Management:** PM2

## Database Schema

### Tables
- `menus` - Daily menu items (created when `/dat-com` is run)
- `orders` - User orders (created when users select dishes)

### Key Features
- Automatic price extraction from dish names
- Date-based filtering
- Debt tracking (paid/unpaid status)

## Commands Overview

### `/dat-com` - Create Menu
- Modal input for menu items (one per line)
- Automatically saves to database
- Creates persistent selection dropdown
- Users can order anytime (no timeout)

### `/com-them` - Re-order
- Shows today's menu
- Allows changing your selection
- Updates order in database
- Ephemeral (private) messages

### `/ket-qua` - View Results
- Displays today's orders grouped by dish
- Format: `<count> <dish> — <user1>, <user2>, ...`
- Shows total orders, dishes, and amount

## Web Dashboard

### Orders Page
- Filter by date
- View all orders for selected day
- Stat cards showing totals
- Clean flat design

### Debts Page
- See all unpaid orders
- Color-coded by amount (low/medium/high)
- Total unpaid amount highlighted

### Stats Page
- Sortable table of user statistics
- Total orders, total spent, average price per user
- Filter and sort capabilities

## Environment Variables

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
```

### Unified Deployment (Bot + Web Together)
- **Railway.app** - Easiest, one-click deploy - [Guide](docs/unified-deployment.md)
- **VPS with PM2** - Best value ($5-6/mo), full control - [Guide](docs/unified-deployment.md)
- **Render.com** - Free tier with limitations - [Guide](docs/unified-deployment.md)

### Split Deployment (Web Separate from Bot)
- **Cloudflare Pages + VPS** - Best performance (web on CDN) - [Guide](docs/cloudflare-deployment.md)
- **Heroku** - Legacy platform

See [docs/deployment-guide.md](docs/deployment-guide.md) for detailed instructions.

## Development

```bash
# Install dependencies
npm install

# Run in development
node index.js

# Register/update commands
node deploy-commands.js

# View logs (with PM2)
pm2 logs vote-com-bot
```

## Project Structure

```
vote-com-bot/
├── commands/           # Discord slash commands
│   ├── dat_com.js     # Create menu command
│   ├── com-them.js    # Re-order command
│   └── ket-qua.js     # View results command
├── routes/            # Express API routes
│   └── api.js         # API endpoints
├── views/             # EJS templates
│   ├── layout.ejs     # Base template
│   ├── orders.ejs     # Orders page
│   ├── debts.ejs      # Debts page
│   └── stats.ejs      # Statistics page
├── utils/             # Utility functions
│   └── price-extractor.js  # Extract price from text
├── docs/              # Documentation
├── index.js           # Main bot + web server
├── supabase-client.js # Database client
└── ecosystem.config.js # PM2 configuration
```

## Troubleshooting

### Commands not showing in Discord?
```bash
node deploy-commands.js
# Wait 1-2 minutes
```

### Bot crashes?
```bash
pm2 logs vote-com-bot --err
```

### Database connection failed?
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check Supabase project is running
- Verify tables exist in Supabase Dashboard

For more troubleshooting, see [docs/deployment-guide.md](docs/deployment-guide.md#troubleshooting).

## Recent Updates

### 2025-12-05
- ✅ Added `menus` table for persistent menu storage
- ✅ Fixed `/com-them` not finding menu issue
- ✅ Removed auto-results and timeout from `/dat-com`
- ✅ Updated `/ket-qua` display format
- ✅ Added price display to dropdown menus
- ✅ Simplified design to clean flat aesthetic

## License

ISC

## Support

For issues or questions:
1. Check [QUICK-START.md](QUICK-START.md)
2. Review [docs/deployment-guide.md](docs/deployment-guide.md)
3. Check Supabase Dashboard → Table Editor
4. View bot logs: `pm2 logs vote-com-bot`
