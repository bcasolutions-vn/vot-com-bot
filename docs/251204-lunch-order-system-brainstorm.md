# Lunch Order Bot Payment Tracking System - Brainstorming Summary

**Date:** December 4, 2025
**Project:** vote-com-bot
**Type:** Feature Enhancement - Payment Tracking System

---

## Problem Statement

**Current State:**
- Discord bot for lunch ordering (25 dishes)
- Runs locally on localhost
- Users vote via Discord select menu (1 dish per user)
- Voting sessions on Mon/Wed/Fri
- **NO payment tracking** - all order data lost after results posted

**Core Problem:**
Need system to track:
1. Who ordered what dish (daily)
2. Dish prices (default 32,000₫, some 37k-42k)
3. Payment status (paid/unpaid)
4. Accumulated debt per user
5. Public web dashboard for transparency

---

## Requirements Summary

### Payment Tracking
- Track per day: user, dish, price, paid status
- Default price: 32,000₫
- Custom prices in dish name: "Ếch rim mắm tỏi (42k)" → 42,000₫
- Accumulate debt across multiple orders
- Keep data forever (historical records)

### Bot Commands
1. `/dat_com` (existing) - Start voting, save results to DB
2. `/debt` (NEW) - Check personal debt (private)
3. `/debtlist` (NEW) - View all debts (public)
4. `/markpaid` (NEW) - Self-service payment marking

### Web Dashboard
- **Public access** (no authentication)
- **3 pages:**
  1. Daily orders view (filterable by date)
  2. Debt overview (unpaid users)
  3. User statistics (total orders/money)
- **Modern design** (Tailwind CSS)
- **Real-time updates** (via Supabase Realtime)

### Technical Constraints
- Continue running on localhost
- No auth/login system needed
- Small scale (<50 users)
- Honor system for payments

---

## Evaluated Solutions

### Approach 1: SQLite + Express (Simple)
**Stack:** SQLite file DB + Express web server + polling updates

**Pros:**
- Zero external dependencies
- Maximum speed (1ms local queries)
- Simple single-file database
- Works offline

**Cons:**
- Manual backups needed
- 30s polling delay for web updates
- Local only (can't access remotely)
- Migration pain if scale grows

**Verdict:** ❌ Rejected - lacks real-time updates, harder to deploy publicly

---

### Approach 2: PostgreSQL + Next.js (Over-engineered)
**Stack:** PostgreSQL instance + Next.js React framework + Vercel hosting

**Pros:**
- Production-grade database
- Modern React framework
- Scalable architecture

**Cons:**
- Massive overkill for lunch orders
- Complex PostgreSQL setup
- 3-4x development time
- Violates YAGNI principle

**Verdict:** ❌ Rejected - unnecessary complexity

---

### Approach 3: Supabase + Express + Tailwind ✅ RECOMMENDED
**Stack:** Supabase (PostgreSQL) + Express + Tailwind CSS + Realtime subscriptions

**Pros:**
- ✅ Real-time updates (no polling lag)
- ✅ Cloud PostgreSQL (automatic backups)
- ✅ REST API + SDK (less backend code)
- ✅ Free tier sufficient (500MB DB)
- ✅ Built-in dashboard for data management
- ✅ Easy public deployment (Vercel/Netlify)
- ✅ Multi-device access
- ✅ Professional infrastructure

**Cons:**
- ⚠️ Network dependency (fails if internet down)
- ⚠️ 50-100ms API latency (vs 1ms local)
- ⚠️ Free tier pauses after 7 days inactivity (easy fix: visit dashboard)

**Why This Wins:**
1. **Real-time UX:** User marks paid → everyone sees instantly (no 30s wait)
2. **Public access:** Easy to deploy dashboard publicly
3. **Scalability:** PostgreSQL handles growth without migration
4. **Professional:** Production-grade database with backups
5. **DX:** Supabase SDK simplifies backend code
6. **KISS:** Free tier + simple setup + minimal config

**Cost:** $0/month (free tier) - sufficient for lunch orders

---

## Final Solution Architecture

### Tech Stack
**Backend:**
- Supabase (PostgreSQL database)
- Express.js (web server)
- Discord.js v14 (existing)
- `@supabase/supabase-js` SDK

**Frontend:**
- Tailwind CSS (utility-first styling)
- Vanilla JavaScript (no React overhead)
- Supabase Realtime (WebSocket subscriptions)

**Hosting:**
- Bot: Localhost (as required)
- Database: Supabase cloud
- Web Dashboard: Can deploy to Vercel (optional)

---

## Database Schema

```sql
-- Table: orders
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id TEXT NOT NULL,           -- Discord user ID
  user_name TEXT NOT NULL,         -- Display name
  dish_name TEXT NOT NULL,
  price INTEGER NOT NULL,          -- In VND (32000, 42000, etc)
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_date ON orders(date);
CREATE INDEX idx_user_id ON orders(user_id);
CREATE INDEX idx_paid ON orders(paid);

-- Row Level Security (public access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON orders FOR ALL USING (true);
```

---

## Price Extraction Logic

**Regex Pattern:**
```javascript
function extractPrice(dishName) {
  const match = dishName.match(/\(?\s*(\d+)k\s*\)?/i);
  if (match) {
    return parseInt(match[1]) * 1000; // "42k" → 42000
  }
  return 32000; // Default price
}
```

**Examples:**
- "Ếch rim mắm tỏi (42k)" → 42,000₫
- "Mực trứng rim nước mắm ( 37k )" → 37,000₫
- "Mực xào rau củ" → 32,000₫

---

## Bot Commands Specification

### 1. `/dat_com` - MODIFIED (Existing Command)
**Changes:**
- After vote collection ends, save results to Supabase
- Extract price from dish name via regex
- Insert orders into `orders` table

**Flow:**
```
User runs /dat_com
→ Modal opens (menu + time)
→ Vote collector starts
→ Users select dishes
→ Collector ends
→ Save to Supabase ← NEW
→ Post results embed
```

---

### 2. `/debt` - NEW (Personal Debt Check)
**Visibility:** Ephemeral (private reply)

**Output:**
```
📊 Your Debt Summary
Total Unpaid: 96,000₫

2024-12-02: Ếch rim mắm tỏi (42k) - 42,000₫
2024-12-03: Mực xào rau củ - 32,000₫
2024-12-04: Thịt luộc - 32,000₫

Use /markpaid to clear your debt
```

**Query:**
```javascript
SELECT * FROM orders
WHERE user_id = ${userId} AND paid = false
ORDER BY date DESC
```

---

### 3. `/debtlist` - NEW (Public Debt List)
**Visibility:** Public channel message

**Output:**
```
💰 Outstanding Debts (As of Dec 4, 2024)

📊 Total Unpaid: 256,000₫

┌─────────────────────────────────┐
│ Alice        │ 3 orders │ 96,000₫ │
│ Bob          │ 2 orders │ 64,000₫ │
│ Charlie      │ 3 orders │ 96,000₫ │
└─────────────────────────────────┘

✅ All paid: Garru, Dave, Emma

Use /debt to check your own debt
Use /markpaid to clear your debt
```

**Features:**
- Sorted by debt amount (highest first)
- Shows paid users separately (positive reinforcement)
- Social pressure motivator

**Query:**
```javascript
SELECT user_id, user_name, COUNT(*) as order_count, SUM(price) as total_debt
FROM orders
WHERE paid = false
GROUP BY user_id
ORDER BY total_debt DESC
```

---

### 4. `/markpaid` - NEW (Self-Service Payment)
**Visibility:** Ephemeral (private reply)

**Flow:**
```
User: /markpaid
Bot: 💰 Payment Options
     [Button] Pay All (96,000₫)
     [Button] Pay by Date

User clicks "Pay All"
Bot: ✅ Marked 3 orders as paid (96,000₫)
```

**Update Query:**
```javascript
UPDATE orders
SET paid = true
WHERE user_id = ${userId} AND paid = false
```

**No admin override** - honor system (users mark themselves paid)

---

## Web Dashboard Design

### Page 1: Daily Orders (`/orders?date=2024-12-04`)

**Layout:**
- Date navigation (prev/next day buttons)
- Summary: Total orders + total revenue
- Table: User | Dish | Price | Paid Status
- Color coding: ✅ green (paid) / ❌ red (unpaid)
- Auto-refresh via Supabase Realtime (instant updates)

**Features:**
- Default to today's date
- Mobile responsive (card view on small screens)
- Filter by paid/unpaid status

---

### Page 2: Debt Overview (`/debts`)

**Layout:**
- Header: Total unpaid amount
- Table: User | Order Count | Total Debt
- Sorted by debt amount (highest first)
- Color indicators:
  - Red: >100,000₫
  - Yellow: 50,000-100,000₫
  - Green: <50,000₫

**Features:**
- Only shows users with unpaid orders
- Optional: Pie chart for visual debt distribution

---

### Page 3: User Statistics (`/stats`)

**Layout:**
- Table: User | Total Orders | Total Spent | Avg Price | Payment Rate
- Payment rate: (paid orders / total orders) × 100%
- Sortable columns
- Search/filter by username

**Features:**
- Shows all-time statistics
- Payment rate indicator (encourages good behavior)
- Exportable to CSV (future enhancement)

---

## Real-time Updates Architecture

**Supabase Realtime Subscription:**
```javascript
// Frontend: public/js/app.js
supabase
  .channel('orders-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order updated:', payload);
      refreshUI(); // Update page instantly
    }
  )
  .subscribe();
```

**User Experience:**
1. Alice opens web dashboard
2. Bob runs `/markpaid` on Discord
3. Alice's page updates **instantly** (green checkmark appears)
4. No page refresh or 30s polling delay

---

## Modern UI Design Specs

**Color Palette:**
- Primary: `#10b981` (green - food theme)
- Secondary: `#3b82f6` (blue)
- Danger: `#ef4444` (red - unpaid)
- Background: `#f9fafb` (light gray)
- Card: `#ffffff` with `shadow-md`

**Typography:**
- Font: Inter (Google Fonts)
- Headers: `text-2xl font-bold`
- Body: `text-base`
- Tables: `text-sm`

**Components:**
- Rounded cards (`rounded-lg`)
- Hover effects on table rows
- Status badges (pill-shaped with colors)
- Smooth transitions (`transition-all duration-200`)

**Responsive Breakpoints:**
- Desktop: 3-column grid
- Tablet: 2-column grid
- Mobile: Stacked cards

---

## File Structure

```
vote-com-bot/
├── index.js                    # Bot + Web server (combined)
├── supabase-client.js          # NEW - Supabase SDK config
├── utils/
│   └── price-extractor.js      # NEW - Price parsing logic
├── commands/
│   ├── dat_com.js              # MODIFIED - Save to Supabase
│   ├── debt.js                 # NEW - Personal debt check
│   ├── debtlist.js             # NEW - Public debt list
│   └── markpaid.js             # NEW - Self-service payment
├── routes/
│   ├── orders.js               # NEW - Daily orders API
│   ├── debts.js                # NEW - Debt overview API
│   └── stats.js                # NEW - User stats API
├── public/
│   ├── css/
│   │   └── tailwind.min.css    # Tailwind CDN or build
│   └── js/
│       └── app.js              # Frontend logic + Realtime
├── views/
│   ├── layout.ejs              # Base template
│   ├── orders.ejs              # Daily orders page
│   ├── debts.ejs               # Debt overview page
│   └── stats.ejs               # User stats page
├── .env                        # UPDATED - Add Supabase keys
└── package.json                # UPDATED - Add dependencies
```

**Modularization Strategy:**
- `kebab-case` naming for all files
- Separate concerns: routes, utils, commands
- Shared Supabase client instance
- Reusable price extraction function

---

## Implementation Phases

### Phase 1: Supabase Setup (0.5 hours)
1. Create Supabase project at https://supabase.com
2. Run SQL schema to create `orders` table
3. Copy `SUPABASE_URL` + `SUPABASE_ANON_KEY`
4. Update `.env` file
5. Install `@supabase/supabase-js` package
6. Test connection

### Phase 2: Bot Commands (2 hours)
1. Create `supabase-client.js` singleton
2. Create `utils/price-extractor.js` with regex
3. Modify `dat_com.js` to save votes to Supabase
4. Implement `/debt` command
5. Implement `/debtlist` command with embed
6. Implement `/markpaid` command with buttons
7. Test all commands

### Phase 3: Web Server Setup (1.5 hours)
1. Integrate Express server into `index.js`
2. Setup EJS view engine
3. Create route handlers (orders, debts, stats)
4. Connect routes to Supabase queries
5. Serve static files from `public/`
6. Test API endpoints

### Phase 4: Frontend UI (2 hours)
1. Create base `layout.ejs` with Tailwind CDN
2. Build `orders.ejs` with date navigation
3. Build `debts.ejs` with debt table
4. Build `stats.ejs` with sortable columns
5. Add responsive mobile styles
6. Style tables, cards, badges

### Phase 5: Real-time Integration (1 hour)
1. Add Supabase client to frontend
2. Setup Realtime channel subscription
3. Implement auto-refresh on data changes
4. Test real-time updates (mark paid → instant UI update)

### Phase 6: Testing & Polish (0.5 hours)
1. Test edge cases (no orders, all paid, etc)
2. Test mobile responsiveness
3. Test real-time updates across devices
4. Fix any bugs
5. Deploy web dashboard (optional)

**Total Estimated Time: ~7.5 hours**

---

## Dependencies

**New packages to install:**
```json
{
  "dependencies": {
    "discord.js": "^14.21.0",        // existing
    "dotenv": "^17.2.0",              // existing
    "@supabase/supabase-js": "^2.45.0", // NEW
    "express": "^4.21.2",              // NEW
    "ejs": "^3.1.10"                   // NEW
  }
}
```

**Installation:**
```bash
npm install @supabase/supabase-js express ejs
```

---

## Risk Assessment & Mitigations

### Risk 1: Internet Dependency
**Impact:** Bot fails if internet connection down
**Probability:** Low (localhost usually has stable internet)
**Mitigation:**
- Graceful error handling (show user-friendly message)
- Retry logic with exponential backoff
- Rare issue in practice

### Risk 2: Supabase Free Tier Pause
**Impact:** Database paused after 7 days inactivity
**Probability:** Medium (if forgotten)
**Mitigation:**
- Visit Supabase dashboard weekly
- Setup GitHub Actions cron to ping DB daily
- Upgrade to $25/month if needed (no pause)

### Risk 3: Price Parsing Errors
**Impact:** Wrong price extracted (e.g., "42kg" parsed as 42k)
**Probability:** Low (dish names follow consistent format)
**Mitigation:**
- Strict regex: must have "k" suffix
- Manual edit feature in web UI (Phase 7)
- Log unparseable dish names for review

### Risk 4: Concurrent Payment Updates
**Impact:** Race condition if 2+ users mark paid simultaneously
**Probability:** Very Low (small team, rare timing)
**Mitigation:**
- PostgreSQL handles ACID transactions
- Row-level locking in Supabase
- Non-issue in practice

### Risk 5: API Rate Limits
**Impact:** Bot/web blocked by Supabase rate limits
**Probability:** Very Low (free tier sufficient for lunch orders)
**Mitigation:**
- Free tier: No strict limits for small scale
- Paid tier: Even higher limits
- Monitor usage in Supabase dashboard

---

## Success Metrics

**Technical:**
- ✅ Zero data loss (orders persisted to DB)
- ✅ Real-time updates <500ms latency
- ✅ 99% uptime (Supabase reliability)
- ✅ Mobile responsive (all screen sizes)

**User Experience:**
- ✅ Users can check debt anytime (`/debt`)
- ✅ Transparent debt visibility (`/debtlist`, web dashboard)
- ✅ Self-service payment (no admin bottleneck)
- ✅ Instant UI updates (real-time)

**Business:**
- ✅ Increased payment rate (transparency + social pressure)
- ✅ Reduced admin overhead (self-service)
- ✅ Historical data for analysis
- ✅ Scalable to 50+ users without changes

---

## Future Enhancements (Out of Scope)

**Phase 7+ (Post-MVP):**
1. **Admin dashboard:**
   - Manual price editing
   - Mark user paid (admin override)
   - Export data to CSV/Excel

2. **Payment integrations:**
   - Bank transfer QR code generation
   - E-wallet integration (Momo, ZaloPay)
   - Auto-mark paid via webhook

3. **Analytics:**
   - Most popular dishes
   - Weekly/monthly spending trends
   - User ordering patterns

4. **Notifications:**
   - Discord DM reminders for unpaid orders
   - Weekly debt summary to channel
   - Payment confirmation messages

5. **Menu management:**
   - Store menu in database
   - Admin command to update menu
   - Seasonal/special dishes

**Guiding Principle:** YAGNI - only build when actually needed

---

## Implementation Considerations

### Modularization Strategy
- **Functions:** Extract reusable logic (price parsing, formatting)
- **Routes:** Separate files per endpoint (orders, debts, stats)
- **Commands:** One file per Discord command
- **Utils:** Shared helpers (Supabase client, formatters)
- **Naming:** `kebab-case` for files (e.g., `price-extractor.js`)

### Code Quality
- JSDoc comments for complex functions
- Error handling on all Supabase calls
- Input validation for user commands
- Consistent code style (Prettier recommended)

### Security
- **No authentication needed** (public data by design)
- Row Level Security (RLS) enabled on Supabase
- Sanitize user inputs (Discord display names)
- Rate limiting via Discord (built-in)
- No sensitive data stored (only orders/prices)

### Performance
- Supabase indexes on common queries (date, user_id, paid)
- Frontend caching of static data
- Lazy loading for historical data
- Pagination if order history grows large (future)

---

## Design Principles Applied

### YAGNI (You Aren't Gonna Need It)
- ❌ Skipped: Admin auth system (not needed now)
- ❌ Skipped: Payment gateway integration (manual for now)
- ❌ Skipped: Complex analytics (basic stats sufficient)
- ✅ Built only: Core payment tracking + transparency

### KISS (Keep It Simple, Stupid)
- ✅ Supabase SDK (vs raw SQL connections)
- ✅ Tailwind CSS (vs custom CSS framework)
- ✅ Vanilla JS (vs React/Vue complexity)
- ✅ Combined bot + web in one process

### DRY (Don't Repeat Yourself)
- ✅ Shared Supabase client instance
- ✅ Reusable price extraction function
- ✅ Base EJS template for layout
- ✅ Consistent query patterns

---

## Decision Log

### Decision 1: Supabase vs SQLite
**Chosen:** Supabase
**Rationale:** Real-time updates, easier public deployment, better scalability, professional infrastructure
**Trade-off:** Internet dependency (acceptable for localhost use)

### Decision 2: Express vs Next.js
**Chosen:** Express
**Rationale:** Simpler for backend-focused app, no need for React complexity, faster development
**Trade-off:** Less modern than Next.js (but sufficient for use case)

### Decision 3: Tailwind vs Custom CSS
**Chosen:** Tailwind
**Rationale:** Fast modern design, responsive out-of-box, small learning curve
**Trade-off:** Utility class verbosity (acceptable for small codebase)

### Decision 4: Self-Service vs Admin Payment
**Chosen:** Self-Service
**Rationale:** Reduces admin bottleneck, honor system acceptable for small team
**Trade-off:** Potential dishonesty (mitigated by transparency)

### Decision 5: Realtime vs Polling
**Chosen:** Realtime (Supabase)
**Rationale:** Better UX, instant updates, no polling overhead
**Trade-off:** Slightly more complex setup (worth it for UX gain)

---

## Unresolved Questions

None! All requirements clarified during brainstorming:
- ✅ Price extraction: Regex auto-detection
- ✅ Payment workflow: Self-service via `/markpaid`
- ✅ Admin access: No admin needed (honor system)
- ✅ Data retention: Keep forever
- ✅ UI design: Modern with Tailwind
- ✅ Database: Supabase (PostgreSQL)
- ✅ Real-time: Yes via Supabase Realtime
- ✅ Commands: `/debt`, `/debtlist`, `/markpaid` confirmed

---

## Next Steps

1. **Review this document** - Confirm alignment on solution
2. **Setup Supabase project** - Create account + database
3. **Create implementation plan** - Detailed step-by-step tasks
4. **Begin development** - Start with Phase 1 (Supabase setup)

**Ready to implement!** 🚀

---

## Appendix: Quick Reference

### Environment Variables
```env
TOKEN=your_discord_bot_token
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
```

### Supabase Setup SQL
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_date ON orders(date);
CREATE INDEX idx_user_id ON orders(user_id);
CREATE INDEX idx_paid ON orders(paid);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON orders FOR ALL USING (true);
```

### Price Extraction Regex
```javascript
/\(?\s*(\d+)k\s*\)?/i
```

### VND Formatting Function
```javascript
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
```

---

**Document Version:** 1.0
**Last Updated:** December 4, 2025
**Status:** Ready for Implementation
