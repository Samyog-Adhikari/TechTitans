import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, HeartHandshake, Award, Recycle, CheckCircle2, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 py-12 px-6 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          ABOUT KABADMANDU
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Formalizing Nepal's Informal Recycling Economy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          We are on a mission to connect households with local scrap collectors through transparency, fair calibrated pricing, and verifiable income records.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-8 bg-white dark:bg-card shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-6">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Dignity & Financial Inclusion for Collectors
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            In Nepal, thousands of informal waste collectors earn honest daily incomes but cannot qualify for bank loans, microfinance, or credit because their work is unrecorded. KabadMandu logs every single transaction into a certified digital ledger, creating bank-ready income proof.
          </p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-8 bg-white dark:bg-card shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-6">
            <Recycle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Zero Hassle Doorstep Recycling for Kathmandu
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Instead of dumping plastics, metals, paper, and e-waste into municipality landfills, households can book doorstep collection with a few taps. Calibrated digital scales guarantee you get the exact fair market value for every kilogram.
          </p>
        </Card>
      </div>

      {/* Values Grid */}
      <div className="bg-slate-50 dark:bg-card/50 rounded-3xl p-8 sm:p-12 border border-slate-200/70 dark:border-border space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
          Our Core Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto sm:mx-0" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">100% Rate Transparency</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rates are updated dynamically based on real Nepal recycling market values. No middleman cuts.
            </p>
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto sm:mx-0" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Verified Saathis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every collector on our platform is identity-verified and trained in polite doorstep service and digital scale handling.
            </p>
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <Award className="w-6 h-6 text-emerald-600 mx-auto sm:mx-0" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Automated Trust Tiers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Collectors unlock certified Building, Good, and Excellent trust tiers based on verified consistency and volume.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 font-semibold">
          <Link to="/signup">
            Join KabadMandu Today
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
