# KabadMandu — Product Requirements Document
### Hackathon MVP — One Day Build

---

## 1. Problem

Nepal's informal waste/recycling economy (kabadiwalas) has almost no digital infrastructure. Households don't know fair scrap prices and can't easily book pickup. Collectors have no income record, no way to prove earnings for credit, and no discoverability. KabadMandu digitizes this loop and turns the collector's transaction history into a "finance-ready" income record.

**Inspiration / positioning:** Similar in mechanics to EcoKabadi (an existing live Nepali scrap-pickup service), but KabadMandu's differentiator is the collector-side income ledger — a record a collector could eventually use toward credit access. Frame the pitch around this, not as a straight clone.

---

## 2. Goal for the Hackathon

Build a working, live demo of one clean loop:

**Household requests pickup → Collector accepts → Collector completes with actual weight → Receipt + ledger update automatically.**

Everything else is nice-to-have or pitch-only talk.

---

## 3. Users & Interfaces

| Interface | User | Job to be done |
|---|---|---|
| Household (User) | Person with scrap to sell | See fair prices, request pickup, track status, get receipt |
| Collector (Buyer) | Kabadiwala / scrap collector | See nearby matching requests, accept, complete, view income ledger |
| Admin | You (operator) | Manage prices, view all activity, reset/seed demo data |

---

## 4. Feature List (Prioritized)

**P0 = must work live in the demo. P1 = build if time allows. P2 = cut without guilt.**

### 4.1 Household

| ID | Feature | Priority |
|---|---|---|
| U-1 | Sign up / login (Supabase Auth, email+password) | P0 |
| U-2 | View live rates page (paper, plastic, metal, e-waste) | P0 |
| U-3 | Book a pickup: material(s), estimated weight, address/area, time slot | P0 |
| U-4 | View request status: Requested → Accepted → Completed | P0 |
| U-5 | View receipt after completion (material, weight, rate, total paid, collector) | P0 |
| U-6 | View past pickup history | P1 |
| U-7 | Nepali/English toggle | P1 |
| U-8 | Rate the collector | P2 |

### 4.2 Collector (Buyer)

| ID | Feature | Priority |
|---|---|---|
| B-1 | Sign up / login + profile (name, phone, materials handled, service area) | P0 |
| B-2 | See incoming requests filtered to their materials + area | P0 |
| B-3 | Accept a request | P0 |
| B-4 | Complete a request: enter actual weight → system computes payout | P0 |
| B-5 | Personal ledger: all completed transactions + running totals (income, kg, count) | P0 |
| B-6 | Shareable ledger summary ("finance-ready work history") | P1 |
| B-7 | Decline a request | P2 |

### 4.3 Admin

| ID | Feature | Priority |
|---|---|---|
| A-1 | Login (single hardcoded/seeded admin account) | P0 |
| A-2 | Manage rate table (add/edit price per material) | P0 |
| A-3 | View global transaction ledger (all activity) | P0 |
| A-4 | Seed/reset demo data | P0 |
| A-5 | View all registered households and collectors | P1 |
| A-6 | Basic stats: total transactions, total kg, total payout | P1 |

### 4.4 Out of Scope (pitch-only — do not build)

- Real credit-scoring / lender integration
- Payments (eSewa/Khalti) — talk about it, don't wire it
- Certified e-waste handler routing
- Collector KYC/verification
- Multi-city support, real maps/GPS

---

## 5. Site Structure (public-facing, inspired by EcoKabadi's layout)

| Page | Purpose |
|---|---|
| Home | Short hero + "Book a pickup" CTA |
| Rates | Live prices, pulled from the `prices` table |
| Book a Pickup | The request form (this is your core conversion action) |
| Collector Dashboard | Buyer's queue, accept/complete, ledger |
| Admin Panel | Rates, global ledger, seed/reset |

Skip marketing sections (testimonials, "our journey", stats banners) — not worth hackathon time.

---

## 6. Core User Flow (Demo Script)

1. Household logs in → opens Rates page → sees plastic = रु18/kg
2. Household books pickup: plastic, ~5kg, Baneshwor, this evening
3. Collector (who handles plastic + serves Baneshwor) logs in → sees this request in their queue → accepts
4. Collector marks completed → enters actual weight (5.2kg) → system calculates रु93.60 → transaction saved
5. Household sees status flip to Completed + receipt appears
6. Collector's ledger updates: new transaction shown, running total increases
7. **Pitch beat:** Open collector's ledger summary → "this is what a microfinance officer would see — a real, verifiable income history for someone who's never had one."

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite), role-based routes: `/household`, `/collector`, `/admin` |
| UI components | Tailwind CSS + shadcn/ui — gives polished, pre-built components (buttons, cards, forms) fast, without custom CSS work |
| Backend | Supabase handles almost everything directly from React. Only 1-2 small serverless functions (Supabase Edge Functions) needed for: computing payout on completion, and the seed/reset action |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Access control | Supabase Row Level Security (household sees own requests; collector sees only matching requests) |
| Realtime (bonus, cut first if behind) | Supabase Realtime — ledger/status updates live without refresh |
| Hosting | Vercel (frontend) + Supabase (managed) |
| Linting | ESLint (Vite default) — left as-is, not a demo-day priority |

**No separate complex backend is required.** Supabase covers storage, auth, and access rules. Keep custom logic to the bare minimum: computing the payout amount and the demo seed script.

---

## 8. Data Model

```
profiles
- id, name, phone, role [household|collector|admin], area, created_at

collector_profiles
- user_id, materials_handled (list), service_area, active

prices
- material [paper|plastic|metal|ewaste], rate_per_kg, updated_at

pickup_requests
- id, household_id, materials, estimated_qty, area, time_window,
  status [requested|accepted|completed], collector_id, created_at, completed_at

transactions
- id, request_id, household_id, collector_id, material,
  actual_weight, rate_applied, total_paid, timestamp
```

Receipts are just a formatted view of a `transactions` row — no separate table needed.

**Seed the `prices` table now** with rough real Kathmandu rates so it doesn't look empty or fake:

| Material | रु/kg |
|---|---|
| Paper (mixed) | 12 |
| Plastic (PET) | 18-20 |
| Metal (iron) | 35-42 |
| E-waste | 50 (or per-piece for phones/CPUs if time allows) |

---

## 9. Project Setup Checklist (do once, at the start)

- [ ] Create Supabase project → create `profiles`, `prices`, `pickup_requests`, `transactions` tables
- [ ] Seed the `prices` table with rough Kathmandu rates
- [ ] Enable Supabase Auth (Email provider, on by default)
- [ ] Copy Project URL + anon key from Supabase API settings
- [ ] `npm create vite@latest KabadMandu -- --template react` (choose ESLint, JavaScript)
- [ ] `cd KabadMandu && npm install`
- [ ] `npm install @supabase/supabase-js react-router-dom`
- [ ] Install Tailwind: `npm install tailwindcss @tailwindcss/vite`, wire into `vite.config.js` and `index.css`
- [ ] Set up `@/*` path alias (`jsconfig.json` + `vite.config.js`)
- [ ] `npx shadcn@latest init`, then `npx shadcn@latest add button` to confirm it works
- [ ] Create `src/supabaseClient.js` with Project URL + anon key
- [ ] `npm run dev` → confirm local server loads in browser
- [ ] Build out folder structure inside `src/` (see §12)

## 10. Build Order (1 Day)

| Time | Task |
|---|---|
| Hr 0-1 | Supabase setup (tables, RLS, auth) + React scaffold with routing |
| Hr 1-2 | Rates page (quick win — build this first) + seed prices |
| Hr 2-4 | Household: booking form + status view |
| Hr 4-6 | Collector: filtered queue, accept, complete + payout calc, ledger |
| Hr 6-7 | Admin: rate editor, global ledger, seed/reset button |
| Hr 7-8 | Receipt view + ledger summary polish |
| Hr 8-9 | Deploy, bilingual toggle if time, bug fixes |
| Hr 9-10 | Rehearse demo script, buffer |

**Deploy early (by hour 3-4) as a throwaway test**, not at the end — avoids last-minute Vercel/env surprises.

---

## 11. Demo-Day Risk Checklist

- [ ] Prices look real, not "TBD"
- [ ] Collector queue visibly filters (show one request they shouldn't see, to prove matching works)
- [ ] Ledger has a few pre-seeded past transactions so it isn't empty on first load
- [ ] Seed/reset run immediately before your demo slot
- [ ] One rehearsed sentence ready for "how does this become a credit product"

---

## 12. Folder Structure

```
KabadMandu/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── supabaseClient.js
│   ├── index.css
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Rates.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   │
│   │   ├── household/
│   │   │   ├── BookPickup.jsx
│   │   │   ├── MyRequests.jsx
│   │   │   └── Receipt.jsx
│   │   │
│   │   ├── collector/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CompleteRequest.jsx
│   │   │   └── Ledger.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminPanel.jsx
│   │       ├── ManagePrices.jsx
│   │       └── GlobalLedger.jsx
│   │
│   ├── components/
│   │   ├── ui/              (shadcn components live here)
│   │   ├── Navbar.jsx
│   │   ├── PriceCard.jsx
│   │   ├── RequestCard.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   └── lib/
│       └── helpers.js       (e.g. payout calculation)
│
├── package.json
├── vite.config.js
├── jsconfig.json
└── .env
```

## 13. Open Item

Confirm the hackathon's final track — KabadMandu is logistics/marketplace with a fintech tail via the ledger, not pure Fintech or Education. If judged under Fintech, open your pitch with the ledger/credit-readiness angle, not the pickup mechanics.
