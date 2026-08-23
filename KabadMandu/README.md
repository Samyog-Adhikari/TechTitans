# ♻️ KabadMandu

> **Nepal's Digital Scrap Economy Platform** — Connecting households, collectors, and administrators in a verified, bilingual circular economy network.

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Styled with Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## 📌 What is KabadMandu?

KabadMandu is a full-stack web platform built for Nepal's informal scrap recycling sector. It digitizes the entire scrap collection workflow — from household pickup requests to collector income verification — making it transparent, accountable, and microfinance-ready.

### The Problem
- Scrap collectors in Nepal have **no formal income proof**, blocking access to banking and credit.
- Households have **no reliable way** to schedule eco-friendly scrap pickups.
- Rates are **inconsistent and opaque** across the market.

### The Solution
KabadMandu creates a **verified digital trail** for every scrap transaction, generating tamper-proof income certificates backed by actual collection data.

---

## ✨ Features

### 🏠 Household Portal
- Book pickup requests with item type, estimated quantity, address, and preferred **date + time slot**
- Track booking history and live pickup status
- Submit complaints and feedback
- View current scrap rates in real time

### 🧑‍🔧 Collector Portal
- View and accept open pickup jobs in your area
- Log completed collections with actual weights (via calibrated scale)
- Real-time **Ledger** of all income and transactions
- Generate **Verified Income Statements** (PDF certificates) with:
  - Multi-factor Trust Tier assessment (Building / Good / Excellent)
  - Weekly consistency analysis
  - QR-verifiable reference codes
  - **One-click PDF download** to device

### 🛠️ Admin Portal
- Full control over all collector and household profiles
- Dynamic scrap rate management (add / update / deactivate)
- Complaints resolution dashboard
- **Push notifications** to all users (system-wide broadcasts)
- Verify income statement authenticity by reference code

---

## 🌐 Bilingual Support (English / Nepali)

The entire app supports **English** and **Nepali (नेपाली)** with a live language toggle. All UI labels, navigation, legal pages, and form fields switch instantly without page reload.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS + Radix UI |
| Auth & Database | Supabase (PostgreSQL + GoTrue Auth) |
| PDF Generation | jsPDF + html2canvas |
| Routing | React Router v6 |
| State Management | React Context (Auth, Theme, Language) |
| Icons | Lucide React |
| Deployment | Vercel (recommended) |

---

## 🗂️ Project Structure

```
KabadMandu/
├── src/
│   ├── App.jsx                     # Root app with all providers
│   ├── routes/index.jsx            # All route definitions
│   ├── features/
│   │   ├── landing/                # Public landing page
│   │   ├── auth/                   # Sign In / Sign Up pages
│   │   ├── household/              # Household portal pages
│   │   ├── collector/              # Collector portal pages
│   │   ├── admin/                  # Admin portal pages
│   │   ├── rates/                  # Scrap rates public page
│   │   └── public/                 # Privacy, Terms, License, Verify
│   ├── components/
│   │   ├── shared/                 # AppLayout, Navbar, NotificationBell, etc.
│   │   └── ui/                     # Radix-based UI primitives
│   ├── hooks/
│   │   └── useAuth.jsx             # Auth context and session management
│   └── lib/
│       ├── supabaseClient.js       # Supabase client initialization
│       ├── trustTier.js            # Trust tier calculation engine
│       ├── LanguageContext.jsx     # EN/NE i18n provider
│       ├── ThemeContext.jsx        # Dark/Light theme provider
│       ├── i18n/
│       │   ├── en.json             # English translations
│       │   └── ne.json             # Nepali translations
│       └── void.js                 # Empty stub for optional jsPDF deps
├── supabase/
│   └── schema.sql                  # Full database schema + RLS + seed data
├── .env.example                    # Environment variable template
└── vite.config.js                  # Vite + alias configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the Repository

```bash
git clone https://github.com/Samyog-Adhikari/TechTitans.git
cd TechTitans/KabadMandu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database

Open your **Supabase SQL Editor** and run the entire contents of:

```
supabase/schema.sql
```

This will create all tables, RLS policies, triggers, helper functions, and seed 40 Nepal scrap rates automatically.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@kabadmandu.com` | `Admin@12345` |
| Collector | `collector@kabadmandu.com` | `Collector@12345` |
| Household | `household@kabadmandu.com` | `Household@12345` |

> **Note:** These accounts are pre-seeded in the Supabase project. For a fresh database, register new users via the `/signup` page.

---

## 🗄️ Database Schema

The schema (`supabase/schema.sql`) includes:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (role, name, phone, area) |
| `waste_types` | Scrap material types and rates per kg/piece |
| `pickups` | Pickup requests from households |
| `ledger_entries` | Verified collection records with weights & payments |
| `income_statements` | Immutable, verifiable collector income snapshots |
| `complaints` | Support complaints from households and collectors |
| `notifications` | System-wide broadcasts from admin |

### Key Security Features
- **Row Level Security (RLS)** on every table
- `is_admin()` helper function for admin-scoped policies
- Auto-profile creation trigger on user signup (`handle_new_user`)
- Public income statement verification by reference code (no auth required)

---

## 📄 Income Certificate & PDF Download

The Income Statement page generates a **verifiable, printable certificate** for collectors:

1. Computes Trust Tier (`Building` / `Good` / `Excellent`) based on:
   - Number of distinct active weeks
   - Average weekly earnings
2. Generates a unique reference code (`KM-NEP-XXXXXX`)
3. Saves an immutable snapshot to `income_statements` table
4. Allows **PDF download directly to device** via `jsPDF + html2canvas`
5. Verification URL updates automatically to match the deployed domain

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel Dashboard](https://vercel.com/new)
3. Set the **Root Directory** to `KabadMandu`
4. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
5. Deploy ✅

The verification URL on certificates will **automatically** use your Vercel domain (e.g., `https://kabadmandu.vercel.app/verify/KM-NEP-...`).

---

## 🛣️ Routes

| Path | Description | Auth |
|------|-------------|------|
| `/` | Landing page | Public |
| `/about` | About KabadMandu | Public |
| `/services` | Services overview | Public |
| `/rates` | Live scrap rates | Public |
| `/signin` | Sign in | Public |
| `/signup` | Register (household / collector) | Public |
| `/verify/:code` | Verify income statement | Public |
| `/privacy` | Privacy Policy | Public |
| `/terms` | Terms of Service | Public |
| `/license` | License information | Public |
| `/household` | Household dashboard | Household |
| `/household/book` | Book a pickup | Household |
| `/household/history` | Pickup history | Household |
| `/collector` | Collector dashboard | Collector |
| `/collector/ledger` | Earnings ledger | Collector |
| `/collector/statement` | Income certificate | Collector |
| `/collector/jobs` | Available jobs | Collector |
| `/admin` | Admin dashboard | Admin |
| `/admin/rates` | Manage scrap rates | Admin |
| `/admin/collectors` | Manage collectors | Admin |
| `/admin/households` | Manage households | Admin |
| `/admin/complaints` | Resolve complaints | Admin |
| `/admin/notifications` | Push notifications | Admin |
| `/admin/verify/:code` | Verify certificates | Admin |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the terms described in the [License](/license) page of the application.

---

## 👥 Team

**Tech Titans** — Built for Nepal's circular economy.

> *KabadMandu: Turning waste into verified wealth.*
