import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
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
  CheckCircle2,
} from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-24 pb-16 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-16 px-6 sm:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t("landing.badge", "Nepal's Premier Doorstep Scrap Collection & Verified Income Platform")}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.15]">
          {t("landing.heroTitle1", "Turn Your Scrap Into")}{" "}
          <span className="text-emerald-600 dark:text-emerald-400">{t("landing.heroTitleHighlight", "Instant Cash")}</span>{" "}
          {t("landing.heroTitle2", "& Verified Proof")}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          {t("landing.heroDesc", "Book free doorstep pickup in Kathmandu Valley. We weigh your recyclable scrap transparently on digital scales, pay you cash on the spot, and build official income records for collectors.")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-8 h-12 shadow-md shadow-emerald-600/25 text-sm"
          >
            <Link to="/signup">
              {t("landing.ctaBook", "Book a free pickup")}
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
              {t("landing.ctaRates", "View Today's Rates")}
            </Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t("landing.trust1", "100% Calibrated Digital Scales")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t("landing.trust2", "Instant Cash or Digital Transfer")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t("landing.trust3", "Zero Doorstep Hauling Fees")}</span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {t("landing.howItWorks", "HOW IT WORKS")}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            {t("landing.howItWorksTitle", "From clutter to cash in four simple steps")}
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t("landing.howItWorksDesc", "No haggling, no hauling it yourself, no hidden cuts. Just a clean, honest way to recycle and earn.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Package,  num: "01", titleKey: "landing.step1Title", descKey: "landing.step1Desc",
              titleFb: "Sort your scrap", descFb: "Gather your paper, plastic, metal, glass and e-waste. A quick sort at home gets you the best rate." },
            { icon: Calendar, num: "02", titleKey: "landing.step2Title", descKey: "landing.step2Desc",
              titleFb: "Book a free pickup", descFb: "Choose a date and time slot on the app or website — or just call. Doorstep pickup is always free." },
            { icon: Scale,    num: "03", titleKey: "landing.step3Title", descKey: "landing.step3Desc",
              titleFb: "We weigh it together", descFb: "A verified KabadMandu Saathi arrives and weighs everything on a calibrated digital scale in front of you." },
            { icon: Banknote, num: "04", titleKey: "landing.step4Title", descKey: "landing.step4Desc",
              titleFb: "Get paid instantly", descFb: "Cash in hand or a digital transfer via eSewa, Khalti or bank — the moment your scrap is weighed." },
          ].map(({ icon: Icon, num, titleKey, descKey, titleFb, descFb }) => (
            <div key={num} className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-900/60 font-mono">{num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {t(titleKey, titleFb)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(descKey, descFb)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LIVE SCRAP RATES PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {t("landing.liveRates", "LIVE SCRAP RATES")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              {t("landing.liveRatesTitle", "What we buy, and what it pays")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("landing.liveRatesDesc", "Transparent estimates across every category. Final price is set on a digital scale at your door.")}
            </p>
          </div>
          <Link
            to="/rates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors shrink-0"
          >
            <span>{t("landing.viewAllRates", "View all rates")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paper & Cardboard */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Paper &amp; Cardboard</h3>
            </div>
            <div className="space-y-3.5 text-sm">
              {[["Copy / Notebooks","रु. 15/kg"],["A4 / White Paper","रु. 12/kg"],["Books & Magazines","रु. 11/kg"],["Cardboard","रु. 10/kg"]].map(([name, rate]) => (
                <div key={name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{name}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">{rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metals */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Metals</h3>
            </div>
            <div className="space-y-3.5 text-sm">
              {[["Copper","रु. 1300/kg"],["Brass","रु. 1000/kg"],["Aluminium","रु. 200/kg"],["Steel / Iron","रु. 42/kg"]].map(([name, rate]) => (
                <div key={name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{name}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">{rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plastic */}
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-slate-200/80 dark:border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Plastic</h3>
            </div>
            <div className="space-y-3.5 text-sm">
              {[["PET Bottles","रु. 20/kg"],["Hard Plastic","रु. 15/kg"],["Mixed Plastic","रु. 10/kg"],["E-Waste / Electronics","रु. 65/kg"]].map(([name, rate]) => (
                <div key={name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-border/50 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{name}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">{rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="rounded-3xl bg-[#042014] text-white p-10 sm:p-16 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
            {t("landing.ctaTitle", "Ready to turn your scrap into cash?")}
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            {t("landing.ctaDesc", "Book a free doorstep pickup today. Our verified Saathi weighs everything on a digital scale and pays you on the spot.")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Button
              size="lg"
              asChild
              className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold rounded-full px-8 h-12 text-sm shadow-lg shadow-amber-500/20"
            >
              <Link to="/signup">
                {t("landing.ctaBookBtn", "Book a free pickup")}
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full px-7 h-12 text-sm font-semibold border-emerald-700/60 bg-emerald-950/40 text-white hover:bg-emerald-900/60 gap-2"
            >
              <a href="https://wa.me/9779801234567" target="_blank" rel="noreferrer">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                {t("landing.ctaWhatsapp", "WhatsApp us")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
