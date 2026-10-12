# Digital Heroes — Golf Performance & Charity Draw Platform
> **Edition 2026 · Level 1 PRD Implementation**  
> Prepared for trainee selection process · [digitalheroes.co.in](https://digitalheroes.co.in)

---

## 🌟 Overview
Digital Heroes is a subscription-driven web platform combining **golf performance tracking** (Stableford 1–45 rolling scores), **charity fundraising** (minimum 10% pledge up to voluntary tiers + direct giving), and **monthly draw-based reward pools** (5-match jackpot with rollover, 4-match, 3-match) — designed with an emotion-driven, modern editorial aesthetic that avoids traditional golf clichés.

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Verify PRD Business Logic
Run the automated business logic test suite:
```bash
node scripts/verify-prd.mjs
```

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Demo Personas & Fast-Track Testing (§ 15 Mandatory Deliverables)

An unobtrusive **Demo Role Switcher** is located at the **bottom-right** of every page, allowing instant switching between all user roles (§ 03):

| Persona | Role | Email | Features & State |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | Subscriber | `sarah@digitalheroes.test` | Active Monthly ($19/mo) · 5 rolling scores · Won **$5,600** (4-match) pending verification |
| **David Miller** | Subscriber | `david@digitalheroes.test` | Active Annual ($190/yr) · 5 rolling scores · Won $2,000 (Paid) |
| **Marcus Vance** | Subscriber | `marcus@digitalheroes.test` | **Lapsed** subscription · Demonstrates restricted access state (§ 04) |
| **Alex Rivera** | Administrator | `admin@digitalheroes.test` | Full platform control across all 5 admin surfaces (§ 11) |
| **Public Visitor** | Guest | *(Logged out)* | Anonymous browsing, marketing, charity directory & calculator |

---

## 📋 PRD Feature Mapping & Checklist (§ 16.1)

### § 01 & § 12: Feel, Not Fairway
- Emotion-driven design leading with charitable impact.
- Avoids plaid, fairways, and cliparts; features rich charcoal `#0b0e14`, terracotta `#e0633b`, and amber accents.
- Motion-enhanced interface, interactive impact calculator, live jackpot tickers, and responsive layouts.

### § 04: Subscription & Payment Engine
- Monthly plan ($19/mo) and discounted Annual plan ($190/yr, saving 17%).
- Stripe PCI-compliant simulation with renewal and cancellation handling.
- Real-time subscription state enforcement: active, inactive, lapsed.

### § 05: Score Management System
- **1–45 Stableford validation**: strictly enforced.
- **Single score per date**: duplicate date detection and prevention.
- **Rolling 5 retention**: new round automatically evicts the oldest chronological round.
- Reverse chronological display with date, points, course, and notes.

### § 06 & § 07: Custom Draw Engine & Prize Pool
- **Draw Logic**: Random (standard lottery) and Algorithmic (frequency-weighted by player scores).
- **Monthly Cadence**: Admin-controlled simulation before publish.
- **Prize Allocation**:
  - 5-Number match: **40% + Rollover Jackpot**
  - 4-Number match: **35%** (split equally among tier winners)
  - 3-Number match: **25%** (split equally among tier winners)
- **Jackpot Rollover**: Unclaimed 5-match jackpot carries forward to the following month.

### § 08: Charity System
- **Contribution Model (§ 08.1)**:
  - Users select charity at signup.
  - Minimum 10% pledge enforced; customizable up to 50%.
  - Independent one-time direct donation option not tied to gameplay.
- **Directory Features (§ 08.2)**:
  - Filterable directory by cause (Youth, Veterans, Environment, Health, Community).
  - Dedicated Profile modal with impact metrics and upcoming Charity Golf Days.
  - Homepage Spotlight carousel.

### § 09: Winner Verification System
- Verification workflow exclusively for winning golfers.
- Scorecard proof screenshot upload with live image preview.
- Admin review queue with Approve / Reject actions and audit notes.
- Payout state lifecycle: `Pending` ➔ `Paid`.

### § 10: User Dashboard
- Subscription status (status badge, billing cycle, renewal date, plan switcher).
- Rolling 5-score manager with interactive add, edit, and delete.
- Selected charity partner with live percentage slider.
- Participation summary (upcoming draw countdown, active 5-number ticket).
- Winnings overview (total won, payment status, scorecard upload trigger).

### § 11: Comprehensive Admin Dashboard (5 Surfaces)
1. **User Management**: View user profiles, edit golf scores, override subscription states.
2. **Draw Management**: Toggle Random vs. Algorithmic, run live simulations, publish results.
3. **Charity Management**: Add/edit/delete charities, manage events, toggle homepage spotlight.
4. **Winners Management**: Audit scorecard screenshots, approve/reject, mark payouts as paid.
5. **Reports & Analytics**: High-level KPI metrics (active subscribers, jackpot rollover pool, charity totals).

---

## 🗄️ Database Schema & Supabase Setup (§ 15 & § 15.1)
The production schema is located at:
📁 [`supabase/schema.sql`](supabase/schema.sql)

### Supabase Deployment:
1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of `supabase/schema.sql`.
4. Copy your project URL and keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 🚀 Vercel Deployment (§ 15.1)
1. Push repository to GitHub or import directly into a new Vercel account.
2. Configure the environment variables from `.env.example`.
3. Deploy! Next.js 16 with Turbopack builds automatically.
