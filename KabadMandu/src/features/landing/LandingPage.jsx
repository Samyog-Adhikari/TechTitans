import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  Calendar,
  Scale,
  Banknote,
  FileText,
  Wrench,
  Recycle,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-16 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-16 px-6 sm:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nepal's Premier Doorstep Scrap Collection & Verified Income Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.15]">
          Turn Your Scrap Into{" "}
          <span className="text-emerald-600 dark:text-emerald-400">Instant Cash</span> & Verified Proof
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Book free doorstep pickup in Kathmandu Valley. We weigh your recyclable scrap transparently on digital scales, pay you cash on the spot, and build official income records for collectors.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-8 h-12 shadow-md shadow-emerald-600/25 text-sm"
          >
            <Link to="/signup">
              Book a free pickup
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-full px-7 h-12 text-sm font-semibold border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-card"
          >
            <Link to="/rates">
              View Today's Rates
            </Link>
          </Button>
        </div>

        {/* Quick stats / trust */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Calibrated Digital Scales</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Instant Cash or Digital Transfer</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Doorstep Hauling Fees</span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION (Matching Image 3) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            From clutter to cash in four simple steps
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            No haggling, no hauling it yourself, no hidden cuts. Just a clean, honest way to recycle and earn.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 01 */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-900/60 font-mono">
                  01
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Sort your scrap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gather your paper, plastic, metal, glass and e-waste. A quick sort at home gets you the best rate.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-900/60 font-mono">
                  02
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Book a free pickup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose a date and time slot on the app or website — or just call. Doorstep pickup is always free.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-900/60 font-mono">
                  03
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                We weigh it together
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A verified KabadMandu Saathi arrives and weighs everything on a calibrated digital scale in front of you.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Banknote className="w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-900/60 font-mono">
                  04
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Get paid instantly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cash in hand or a digital transfer via eSewa, Khalti or bank — the moment your scrap is weighed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE SCRAP RATES PREVIEW (Matching Image 4) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              LIVE SCRAP RATES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              What we buy, and what it pays
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Transparent estimates across every category. Final price is set on a digital scale at your door.
            </p>
          </div>

          <Link
            to="/rates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors shrink-0"
          >
            <span>View all rates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Rates Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Paper & Cardboard */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Paper & Cardboard
              </h3>
            </div>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Copy / Notebooks</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 15/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">A4 / White Paper</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 12/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Books & Magazines</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 11/kg</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Cardboard</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 10/kg</span>
              </div>
            </div>
          </div>

          {/* Card 2: Metals */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Metals
              </h3>
            </div>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Copper</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 1300/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Brass</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 1000/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Aluminium</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 200/kg</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Steel / Iron</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 42/kg</span>
              </div>
            </div>
          </div>

          {/* Card 3: Plastic */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Plastic
              </h3>
            </div>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">PET Bottles</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 20/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Hard Plastic</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 15/kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50">
                <span className="text-slate-600 dark:text-slate-400 text-xs">Mixed Plastic</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 10/kg</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400 text-xs">E-Waste / Electronics</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">रु. 65/kg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HIGH-IMPACT DARK LUXURY GREEN CTA (Matching Image 5) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="rounded-3xl bg-[#042014] text-white p-10 sm:p-16 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
          {/* Subtle radial emerald background bloom */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Ready to turn your scrap into cash?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Book a free doorstep pickup today. Our verified Saathi weighs everything on a digital scale and pays you on the spot.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
            {/* Golden/Amber Pill Button */}
            <Button
              size="lg"
              asChild
              className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold rounded-full px-8 h-12 text-sm shadow-lg shadow-amber-500/20"
            >
              <Link to="/signup">
                Book a free pickup
              </Link>
            </Button>

            {/* WhatsApp Link Button */}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full px-7 h-12 text-sm font-semibold border-emerald-700/60 bg-emerald-950/40 text-white hover:bg-emerald-900/60 gap-2"
            >
              <a href="https://wa.me/9779801234567" target="_blank" rel="noreferrer">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
