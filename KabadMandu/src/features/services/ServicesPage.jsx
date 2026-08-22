import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Truck, Building2, FileCheck2, Scale, ArrowRight, CheckCircle2 } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: "Household Scrap Collection",
      desc: "Free scheduled doorstep pickup for all household recyclables. Calibrated digital weighing with instant cash payment.",
      points: [
        "Pickups available 7 days a week",
        "Paper, plastics, metals, glass, and electronics",
        "Transparent real-time market pricing per kg",
      ],
    },
    {
      icon: Building2,
      title: "Commercial & Office Clearance",
      desc: "Bulk scrap removal for corporate offices, retail stores, educational institutions, and construction sites.",
      points: [
        "Bulk discount & verified industrial weighing",
        "Official transaction receipts for corporate records",
        "Scheduled monthly or quarterly pickups",
      ],
    },
    {
      icon: FileCheck2,
      title: "Collector Income Certification",
      desc: "Automatic digital income ledger generation transforming daily scrap collection into verified financial statements for banks.",
      points: [
        "Unique QR verification codes",
        "Weekly consistency & earnings scoring (Trust Tiers)",
        "Self-serve PDF generation with zero gatekeeping",
      ],
    },
    {
      icon: Scale,
      title: "Calibrated Digital Weighing",
      desc: "Zero manipulation weighing guarantee. Every Saathi carries certified electronic scales visible to the customer.",
      points: [
        "Clear digital readout on every pickup",
        "Exact weight logged directly into mobile app",
        "Customer confirmation before cash handover",
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-16 py-12 px-6 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          OUR SERVICES
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Complete Recycling Solutions for Kathmandu
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          From doorstep residential pickups to verified financial documentation for informal collectors.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((s, idx) => {
          const Icon = s.icon
          return (
            <Card key={idx} className="rounded-2xl border-slate-200/80 dark:border-border p-8 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {s.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {s.desc}
              </p>
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-border">
                {s.points.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-8 sm:p-10 text-center flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Need a custom commercial pickup or bulk consultation?
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg">
          We handle industrial scrap, IT asset decommissioning, and institutional e-waste across Kathmandu, Lalitpur, and Bhaktapur.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-7 font-semibold">
            <Link to="/contact">Contact Our Team</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-7 font-semibold">
            <Link to="/rates">Check Scrap Rates</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
