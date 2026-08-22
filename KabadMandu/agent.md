# AGENT.md — KabadMandu Build Guide

## What this document is

This file is the single source of truth for any AI coding agent (or human) working on KabadMandu. Follow it phase by phase, in order. Each phase builds exactly one page/route, fully working, before moving to the next. Do not skip ahead, do not combine phases, and do not "improve" things outside the current phase's scope without asking first.

---

## 1. Project summary

KabadMandu connects three types of users in Nepal's informal recycling economy:

- **Household** — has scrap/waste to sell, books a pickup
- **Collector (kabadiwala)** — collects scrap, gets paid, and builds a verified income record
- **Admin** — manages rates and scrap types, oversees accounts, handles complaints

**The core value proposition:** every completed pickup is logged as a verified transaction. Over time, this becomes a collector's income history — something they currently cannot prove to any bank or microfinance institution. The app automatically turns this history into a trusted, verifiable income statement the collector can present themselves — no admin approval or loan application inside the app required. The app proves income; the collector takes that proof wherever they need it (a bank, an MFI, anywhere).

Payment for scrap itself is **cash on collection** for this version. No online payment integration is in scope right now.

---

## 2. Tech stack — locked, do not change

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite | Not Next.js. No SSR needed, adds unneeded complexity. |
| UI components | **shadcn/ui — exclusively** | See Rule 1 below. No exceptions. |
| Styling | Tailwind CSS (comes with shadcn) | No separate CSS frameworks, no ad-hoc inline styles beyond Tailwind utility classes. |
| Backend | Supabase (Auth, Postgres DB, Storage, Row Level Security, Edge Functions) | No custom Node/Express server. Supabase is the backend. |
| Payments | None yet | Cash on collection only. Do not build or stub any payment gateway code this version. |
| Hosting | Not decided yet — out of scope until the final phase | |

---

## 3. Non-negotiable rules

These apply in every phase. If a task conflicts with a rule below, stop and ask before proceeding.

1. **No "bukchowdi" (no messy/inconsistent UI).** Every screen uses shadcn components as the building blocks — `Button`, `Card`, `Input`, `Form`, `Table`, `Dialog`, `Badge`, `Select`, `Tabs`, etc. Do not hand-roll a custom component when a shadcn equivalent exists. Do not mix design styles between pages. One visual language, everywhere.
2. **No fake or placeholder functionality presented as real.** If a feature isn't built yet, it should not appear in the UI as if it works. Loading states, empty states, and "coming soon" are fine — a button that looks functional but does nothing is not.
3. **Income statement and trust tier logic must be real, computed logic — never hardcoded.** The trust tier (e.g. Building / Good / Excellent) and the statement's figures must be calculated live from real `ledger_entries` data. No admin approval or manual trigger is involved in generating a statement — it's available to the collector automatically once they have enough real activity.
4. **Don't break what already works.** Before starting a new phase, confirm the previous phase still works end-to-end. If a change in the current phase risks touching a completed phase's code, flag it before making the change.
5. **Ask before big refactors or architecture changes.** Small fixes within a phase are fine to do independently. Renaming core tables, changing the auth flow, or restructuring folders requires a check-in first.
6. **Credentials and keys are provided by the human, never invented.** If a phase needs a Supabase key, project URL, or any other credential, stop and ask for it. Never generate placeholder keys and leave them in code as if real.
7. **One phase, one page, one clear "done" state.** Each phase below builds exactly one route. Do not move to the next phase until that route's Definition of Done is met.
8. **Directory structure is strict — see Section 6.** No stray files, no "temp" or "v2" folders, no code sitting outside its designated place. A messy folder structure is treated the same as messy UI — not acceptable.
9. **Rates and scrap types are data, never code.** Admin must be able to add a new scrap type or change a rate entirely from the admin portal. Never hardcode waste types or prices in component files — they always come from the database.
10. **Admin visibility into personal accounts is restricted by default.** Admin can see that a collector or household account exists and its basic activity status, but NOT a collector's detailed income ledger or a household's personal details, unless actively resolving a complaint tied to that specific account (which does need contact details to act on). Do not build a general "view full profile" admin screen that exposes everything by default.
11. **Use exactly three fixed accounts for all development, testing, and demoing — and never touch the admin one again after Phase 0.** One fixed admin account, one fixed household account, one fixed collector account. When building or testing any feature, log in as one of these three — never spin up extra throwaway accounts (`test1@test.com`, `asdf@asdf.com`, etc.) to check things work. This is a development-hygiene rule, not a product restriction: the public sign-up page still works normally for real users, exactly as built in Phase 3. This rule only stops the agent from cluttering Supabase with junk test accounts during the build.
12. **UI direction depends on whether a design is provided, but the look stays consistent either way.** When a design/reference is sent for a page, follow it precisely. When none is provided, default to the existing minimalist shadcn look already used elsewhere in the app. Never introduce a new visual direction, color scheme, or layout style on your own judgment — consistency across pages matters more than any single page looking "better."
13. **Layout and branding follow the rules in Section 4's Layout & Branding block — see below.** Do not improvise page structure or logo usage outside what's defined there.

---

## 4. Features by page — build reference

Use this section to know exactly what belongs on each route before starting its phase.

### Layout & branding — applies across every page

**Two layout types, never mixed:**
- **Public layout (landing page only):** navbar at top + footer at bottom. Navbar holds the full logo (left) and sign in / sign up buttons (right). Footer holds basic links/info. This is the only place a traditional navbar+footer pair is used.
- **App layout (every logged-in page — household, collector, admin):** a sidebar for navigation, not a navbar. The sidebar holds the role's page links (e.g. collector: Dashboard, Jobs, Ledger, Income Statement, Complaints) and sits fixed on one side for the full session. No footer on these pages.
- Build both as shared layout components (`components/shared/PublicLayout.jsx` and `components/shared/AppLayout.jsx`) that every page imports — never rebuild navigation per page.

**Logo usage — two versions, never substituted for each other:**
- Full illustrated logo (with the "KabadMandu" wordmark) — used only where it has real room to breathe: the public navbar, sign-in/sign-up screens. Never compressed, stretched out of proportion, shrunk small, or placed directly against large heading text — always give it clear space on all sides.
- Cropped icon-only mark (circular badge, no wordmark) — used for the favicon and any small icon spot (browser tab, sidebar collapsed-state mark if you add one). The full logo is illegible at small sizes; this is why the cropped version exists.
- Both are provided as ready-to-use files — place them as-is (`src/assets/logo-full.png`, `public/favicon.ico` + related sizes), don't regenerate or re-crop them.

---

### Public pages (no login required)

**Landing page**
- Clean, simple, single page — what KabadMandu is, who it's for, a short "how it works," and clear buttons to sign in or sign up
- Modern eco-tech aesthetic matching reference design:
  - Floating pill/capsule navbar with full logo, links (`Home`, `About`, `Services`, `Rates`, `Contact`), `Sign in` link and vibrant green `Book a pickup` CTA pill button (links to `/signup`).
  - Hero section introducing KabadMandu's Kathmandu scrap collection and verified income records.
  - "From clutter to cash in four simple steps" section with numbered cards (01: Sort your scrap, 02: Book a free pickup, 03: We weigh it together, 04: Get paid instantly).
  - "What we buy, and what it pays" live rates preview cards (Paper & Cardboard, Metals, Plastic) with link to full rates page.
  - High-impact dark green CTA banner & rich multi-column footer with contact details (WhatsApp, email, Kupondole Patan address), social links, platform and company links.
- No dashboards, no data tables here — this is a first-impression page, keep it visually calm.

**Sign in page**
- Email/phone + password fields, shadcn `Form` + `Input` + `Button`
- Link to sign up page
- Clear error state for wrong credentials

**Sign up page**
- Role selection at signup: household or collector (admin account is never created here)
- Basic profile fields: name, phone, area/location
- Link back to sign in page

**Public rates page**
- Shows current rate per kg for every active scrap type, pulled live from the database
- Search and category filters for scrap types
- No admin controls visible here — this is the read-only public view

**About page (`/about`)**
- Mission, story of empowering Kathmandu's informal recycling workforce, and sustainability impact.

**Services page (`/services`)**
- Breakdown of services: Household scrap pickup, Commercial recycling, Verified income certification for collectors, Digital weighing scale verification.

**Contact page (`/contact`)**
- Contact info, office location (Kupondole, Lalitpur), direct WhatsApp link, and quick inquiry form.

### Household pages (logged in as household)

- **Dashboard** — overview of their own bookings and status at a glance
- **Book pickup** — form to request a pickup: scrap type, estimated quantity, address, preferred time
- **Booking history** — list of all past and current bookings with status
- **Submit a complaint** — simple form to raise an issue, goes to admin

### Collector pages (logged in as collector)

- **Dashboard** — overview: available jobs nearby, active job, quick stats
- **Job list** — list of requested pickups they can accept
- **Accept / complete job** — accept a job, then log actual weight collected on completion, which creates a ledger entry
- **Income ledger** — full history of completed pickups and earnings, with weekly/monthly totals
- **Verified income statement** — the core differentiating feature. Automatically generated (no request, no admin approval needed) once the collector has real, consistent activity. Shows:
  - A trust tier (e.g. Building / Good / Excellent) computed from real consistency and earnings data
  - Total earnings over a period, number of completed pickups, weeks of consistent activity
  - A unique verification code and generation timestamp, so the statement reads as a real, checkable document rather than a live number that could shift
  - A clean, presentable layout — this is the screen a collector could realistically show a loan officer, treat it like a real financial document
- **Submit a complaint** — same as household's complaint form, for collector-side issues

### Admin pages (logged in as admin)

- **Dashboard** — high-level platform stats: total pickups, total kg collected, active collectors, open complaints
- **Manage scrap types & rates** — add a new scrap type, edit its rate, deactivate a type. This is the only place prices and types can change — never in code.
- **Collector accounts overview** — list of collectors with basic status (active, area, account age). Does **not** show income ledger details or full personal info by default (see Rule 10).
- **Household accounts overview** — same restricted-view principle: basic account status only, not personal details.
- **Complaints inbox** — list of complaints submitted by households and collectors, with status (open/resolved) and the ability to mark resolved with a note. This is the one context where the relevant user's contact info is shown, since it's needed to actually resolve the issue.

Admin has no role in generating, approving, or gatekeeping income statements — that feature is entirely self-serve for the collector.

---

## 5. Data model (build in Phase 0)

Core Supabase tables:

- `profiles` — id, role (`household` / `collector` / `admin`), name, phone, area/location, created_at
- `waste_types` — id, name, rate_per_kg, active (boolean), created_by (admin), updated_at — admin adds/edits/deactivates entries here; this is what lets admin "add a type of scrap" and "decide rates" from one place, without touching code
- `pickups` — id, household_id, collector_id (nullable until accepted), waste_type_id, estimated_qty, status (`requested` / `accepted` / `completed` / `cancelled`), scheduled_time, address, created_at
- `ledger_entries` — id, collector_id, pickup_id, waste_type_id, actual_weight_kg, amount_paid, created_at
- `income_statements` — id, collector_id, generated_at, period_start, period_end, total_earnings, total_pickups, weeks_active, avg_weekly_earnings, trust_tier, verification_code (unique) — a stored snapshot generated automatically when a collector views/downloads their statement, so each statement is a fixed, checkable record rather than something that changes if recomputed later. `trust_tier` is computed from both consistency (weeks_active) and `avg_weekly_earnings` together — never from pickup count alone.
- `complaints` — id, submitted_by (profile id), role (`household` / `collector`), subject, description, status (`open` / `resolved`), created_at, resolved_by (admin), resolution_note

Row Level Security (RLS) must be turned on for all tables from Phase 0 onward. In particular:
- Collectors and households only ever see their own rows.
- Admin's default queries for account overviews must deliberately exclude ledger detail and sensitive personal fields — enforce this with specific views/policies, not just "admin sees everything" (see Rule 10).
- Complaint resolution screens use a separate, narrower query that intentionally pulls in the extra contact data needed for that specific task.

---

## 6. Directory structure — strict, do not deviate

The folder structure below is fixed from Phase 0 onward. Every new file has exactly one correct place. If it's unclear where something goes, stop and ask rather than putting it wherever is convenient.

```
kabadmandu/
├── public/                      # static assets only (favicon, static images)
├── src/
│   ├── assets/                  # images, icons used inside components
│   ├── components/
│   │   ├── ui/                  # shadcn components ONLY — generated via shadcn CLI,
│   │   │                        # never hand-edited except through shadcn's own re-add/update
│   │   └── shared/               # reusable, cross-role components — PublicLayout, AppLayout,
│   │                             # ProtectedRoute, EmptyState, LoadingState, StatusBadge, ComplaintForm, etc.
│   ├── features/
│   │   ├── landing/              # public landing page
│   │   ├── auth/                 # sign in, sign up, role selection
│   │   ├── rates/                # public rates page + shared rate-display logic
│   │   ├── household/            # dashboard, booking form, booking history, complaint form
│   │   ├── collector/            # dashboard, job list, accept/complete flow, ledger, income statement
│   │   └── admin/                 # scrap type & rate management, account overviews, complaints
│   ├── lib/
│   │   ├── supabaseClient.js     # single Supabase client instance — imported everywhere, never re-created
│   │   └── utils.js              # small shared helpers (formatting, calculations) — not a dumping ground
│   ├── hooks/                    # shared custom hooks (e.g. useAuth, useUserRole)
│   ├── routes/                   # route definitions and route-level page components
│   ├── App.jsx
│   └── main.jsx
├── .env.local                    # all keys live here — never hardcoded in source files, never committed
├── AGENT.md
├── tailwind.config.js
├── components.json               # shadcn config — do not manually restructure
└── package.json
```

**Rules that apply to this structure:**

- Each folder under `features/` is self-contained — a household component does not reach into the collector folder to reuse something. If two features genuinely need the same piece, it belongs in `components/shared/`, not duplicated or cross-imported.
- Nothing lives loose directly inside `src/` except `App.jsx` and `main.jsx`.
- No `temp/`, `old/`, `test/`, `v2/`, or similarly named folders or files left in the project at any point.
- No commented-out blocks of old code left behind "just in case." Delete it.
- One component, one file, one clear name. No `Component2.jsx` next to an old `Booking.jsx` — rename or replace properly.
- Before ending any phase, do a quick pass: does every file in the diff belong exactly where it is per this structure? If not, fix it before calling the phase done.

---

## 7. Phases — one page per phase

### Phase 0 — Foundations (no visible pages yet)
**Goal:** Project setup, schema, and auth wiring in place before any real page is built.

Tasks:
- Set up Vite + React project structure
- Install and configure Tailwind + shadcn/ui (base theme)
- Set up Supabase project connection (needs: Supabase project URL + anon key from the human)
- Create all tables from Section 5 with RLS policies, including the restricted admin-view policies
- Set up routing skeleton and protected-route logic per role (no page content yet)
- Create the one fixed admin account (needs: admin email/password from the human) — this account and its credentials are not touched again after this phase
- Place the provided logo files: full logo into `src/assets/logo-full.png`, and the favicon files (`favicon.ico`, apple-touch-icon, icon-512) into `public/`. Wire the favicon into `index.html` head tags now, so it's correct from the very first page onward.

**Needed from human:** Supabase project URL, anon key, admin account email/password.

**Definition of done:** Project boots, Supabase connects, tables exist with RLS on, routing skeleton redirects correctly by role, the fixed admin account exists — but no actual page content exists yet.

---

### Phase 1 — Landing page
**Goal:** A clean, working public landing page.

Tasks:
- Build `PublicLayout` (navbar + footer, per the Layout & Branding rules in Section 4) — this layout is reused by sign in and sign up too
- Build the landing page content inside it

**Definition of done:** Landing page is live inside `PublicLayout`, uses only shadcn components, links correctly to sign in and sign up, and has zero dashboard/data content on it. The full logo sits in the navbar with generous surrounding space — never shrunk small or placed directly against a large heading. If a design reference was provided for this page, it's followed; otherwise it defaults to a minimalist shadcn look.

---

### Phase 2 — Sign in page
**Goal:** Working login for existing users.

Built inside the existing `PublicLayout` (navbar + footer) from Phase 1 — do not create a separate layout for this page.

**Definition of done:** Any existing user can log in and lands on the correct role-based dashboard. Wrong credentials show a proper shadcn error state.

---

### Phase 3 — Sign up page
**Goal:** Working signup for new households and collectors.

Also built inside `PublicLayout` — same navbar and footer as landing and sign in.

**Definition of done:** A new user can sign up as household or collector, a `profiles` row is created correctly with the right role, and they land on their new (empty) dashboard.

---

### Phase 4 — Public rates page
**Goal:** Live rates page pulling from the `waste_types` table.

**Definition of done:** The page shows every active scrap type and its current rate, pulled live — not hardcoded — and updates automatically when admin changes a rate later.

---

### Phase 5 — Household pages
**Goal:** Dashboard, booking form, booking history, and complaint form all working for household accounts.

Build `AppLayout` (sidebar navigation, no navbar/footer, per Section 4) here if it doesn't exist yet — collector and admin phases will reuse it.

**Definition of done:** A household can log in, land inside `AppLayout` with a sidebar, book a real pickup, see it appear in their booking history with correct status, and submit a complaint that's saved to the `complaints` table.

---

### Phase 6 — Collector pages
**Goal:** Dashboard, job list, accept/complete flow, and income ledger working for collector accounts. (Verified income statement logic is built in Phase 8, but its page/UI shell can be scaffolded here.)

Uses the existing `AppLayout` sidebar — collector's sidebar links differ from household's, but the layout component itself is shared.

Tasks include the core loop: collector sees requested pickups → accepts → completes with real weight entered → a `ledger_entries` row is created automatically → ledger page reflects it with correct running totals.

**Definition of done:** A collector can complete the full loop above and see an accurate income ledger afterward.

---

### Phase 7 — Admin pages
**Goal:** Every admin function working, with the privacy restrictions from Rule 10 correctly enforced.

Uses the existing `AppLayout` sidebar, with admin's own set of sidebar links.

Tasks:
- Manage scrap types & rates page (add/edit/deactivate)
- Collector accounts overview (restricted view — no ledger/personal detail)
- Household accounts overview (restricted view)
- Complaints inbox (view, resolve, add resolution note — deliberately shows the relevant user's contact info)

**Definition of done:** Admin can manage rates/types live and browse accounts without seeing restricted data. Rate changes made here reflect immediately on the public rates page and anywhere else rates are used.

---

### Phase 8 — Verified income statement & trust tier engine
**Goal:** Build the real logic behind the collector's income statement page — the feature that matters most for the pitch.

Tasks:
- Define the trust tier rule in code using BOTH consistency and earnings — never pickup count alone, since scrap value varies a lot per collection and a count-only rule would misjudge someone with fewer but higher-value pickups. Example starting point: "Building: any activity. Good: active across 3+ distinct weeks in the last 30 days AND average weekly earnings of at least Rs. 3,000. Excellent: active across 6+ distinct weeks AND average weekly earnings of at least Rs. 5,000." Confirm exact thresholds with the human before finalizing — these are a starting point, not final numbers.
- On the collector's income statement page, generate a statement snapshot on demand: computes total earnings, pickup count, and trust tier from real `ledger_entries` data, stores it as a row in `income_statements` with a unique verification code and timestamp
- No admin step anywhere in this flow — fully self-serve for the collector, available automatically once they have real activity

**Definition of done:** A collector with real ledger history can generate a statement showing an accurate trust tier and figures, entirely computed from real data, with a unique verification code — with zero admin involvement anywhere in the process.

---

### Phase 9 — Polish and demo readiness
**Goal:** Nothing breaks on stage.

Tasks:
- Every page has a proper empty state (shadcn-styled) and loading state
- Test the full flow end-to-end as each of the three fixed accounts, back to back
- Responsive check at demo resolution
- Remove any leftover console.logs, debug buttons, or test-only UI
- Confirm the three fixed demo accounts (admin, household, collector) have enough real, believable activity logged through the actual app flows — not injected fake data — so the demo has history to show without live-typing everything on stage

**Definition of done:** You can run the full demo start to finish across all three fixed accounts without touching the database directly or hitting an error state.

---

## 8. What to do if something doesn't fit a phase

If a task comes up that doesn't clearly belong in the current phase, don't quietly slot it in. Say so, and ask whether it should be deferred to a later phase or is actually a Phase 0 gap that was missed. Scope creep mid-phase is exactly what causes broken, rushed builds under hackathon time pressure.
