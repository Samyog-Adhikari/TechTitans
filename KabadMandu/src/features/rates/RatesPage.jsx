import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/LanguageContext"
import {
  Search,
  Scale,
  Sparkles,
  Calculator,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Wrench,
  Recycle,
  Cpu,
  Wine,
  HelpCircle,
} from "lucide-react"

export default function RatesPage() {
  const { user, role } = useAuth()
  const { t, t_material } = useLanguage()
  const [wasteTypes, setWasteTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Calculator state
  const [calcSelectedId, setCalcSelectedId] = useState("")
  const [calcWeight, setCalcWeight] = useState(10)

  const fetchRates = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("waste_types")
        .select("*")
        .eq("active", true)
        .order("rate_per_kg", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setWasteTypes(data)
        if (!calcSelectedId) {
          setCalcSelectedId(data[0].id)
        }
      } else {
        // Fallback default scrap rates if table is fresh
        const fallback = [
          { id: "1", name: "Copper & Brass", rate_per_kg: 450, unit: "per_kg", category: "Metals" },
          { id: "2", name: "Aluminium & Cans", rate_per_kg: 120, unit: "per_kg", category: "Metals" },
          { id: "3", name: "E-Waste / Electronics", rate_per_kg: 65, unit: "per_kg", category: "E-Waste" },
          { id: "4", name: "Steel & Iron Metal", rate_per_kg: 40, unit: "per_kg", category: "Metals" },
          { id: "5", name: "Plastics (PET Bottles & HDPE)", rate_per_kg: 22, unit: "per_kg", category: "Plastic" },
          { id: "6", name: "Paper & Cardboard", rate_per_kg: 18, unit: "per_kg", category: "Paper & Cardboard" },
          { id: "7", name: "Glass Bottles", rate_per_kg: 8, unit: "per_kg", category: "Glass & Bottles" },
        ]
        setWasteTypes(fallback)
        if (!calcSelectedId) setCalcSelectedId(fallback[0].id)
      }
    } catch (err) {
      console.warn("Using fallback scrap types:", err.message)
      const fallback = [
        { id: "1", name: "Copper & Brass", rate_per_kg: 450, unit: "per_kg", category: "Metals" },
        { id: "2", name: "Aluminium & Cans", rate_per_kg: 120, unit: "per_kg", category: "Metals" },
        { id: "3", name: "E-Waste / Electronics", rate_per_kg: 65, unit: "per_kg", category: "E-Waste" },
        { id: "4", name: "Steel & Iron Metal", rate_per_kg: 40, unit: "per_kg", category: "Metals" },
        { id: "5", name: "Plastics (PET Bottles & HDPE)", rate_per_kg: 22, unit: "per_kg", category: "Plastic" },
        { id: "6", name: "Paper & Cardboard", rate_per_kg: 18, unit: "per_kg", category: "Paper & Cardboard" },
        { id: "7", name: "Glass Bottles", rate_per_kg: 8, unit: "per_kg", category: "Glass & Bottles" },
      ]
      setWasteTypes(fallback)
      if (!calcSelectedId) setCalcSelectedId(fallback[0].id)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const getScrapIcon = (name) => {
    const n = (name || "").toLowerCase()
    if (n.includes("paper") || n.includes("cardboard") || n.includes("book")) return FileText
    if (n.includes("metal") || n.includes("copper") || n.includes("iron") || n.includes("brass") || n.includes("steel") || n.includes("can") || n.includes("aluminium")) return Wrench
    if (n.includes("plastic") || n.includes("bottle") || n.includes("pet")) return Recycle
    if (n.includes("e-waste") || n.includes("electronic") || n.includes("battery")) return Cpu
    if (n.includes("glass")) return Wine
    return Scale
  }

  // Resolve item name
  const getDisplayName = (item) => {
    return t_material ? t_material(item.name) : item.name
  }

  // Resolve item unit
  const getItemUnit = (item) => {
    if (item.unit) return item.unit;
    const n = (item.name || "").toLowerCase();
    if (n.includes("per piece") || n.includes("per_piece")) return "per_piece";
    return "per_kg";
  }

  // Resolve item category
  const getItemCategory = (item) => {
    if (item.category) return item.category;
    const n = (item.name || "").toLowerCase()
    if (n.includes("copper") || n.includes("brass") || n.includes("metal") || n.includes("iron") || n.includes("steel") || n.includes("can") || n.includes("aluminium")) return "Metals"
    if (n.includes("paper") || n.includes("cardboard") || n.includes("book")) return "Paper & Cardboard"
    if (n.includes("plastic") || n.includes("pet")) return "Plastics"
    if (n.includes("e-waste") || n.includes("electronic") || n.includes("battery")) return "E-Waste"
    if (n.includes("glass")) return "Glass & Bottles"
    return "Household Items"
  }

  // Translate category string
  const translateCategory = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("metal")) return t("rates.metals", "Metals")
    if (c.includes("paper") || c.includes("cardboard")) return t("rates.paper", "Paper")
    if (c.includes("plastic")) return t("rates.plastics", "Plastics")
    if (c.includes("e-waste") || c.includes("electronic")) return t("rates.ewaste", "E-Waste")
    if (c.includes("glass") || c.includes("bottle")) return t("rates.glass", "Glass")
    return t("auth.roleHousehold", "Household Items")
  }

  // Filtered waste types
  const filteredTypes = wasteTypes.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedCategory === "all") return matchesSearch
    const cat = getItemCategory(item).toLowerCase()
    return matchesSearch && cat.includes(selectedCategory)
  })

  // Selected item for calculator
  const calcItem = wasteTypes.find((w) => w.id === calcSelectedId) || wasteTypes[0]
  const calcTotal = calcItem ? (calcWeight * Number(calcItem.rate_per_kg || 0)) : 0
  const calcUnit = calcItem ? getItemUnit(calcItem) : "per_kg"

  return (
    <div className="flex flex-col gap-14 py-12 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t("rates.badge", "Live Kathmandu Scrap Market Rates (Updated Daily)")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("rates.title", "Today's Scrap Rates & Price List")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {t("rates.desc", "Guaranteed fair prices per kilogram for all recyclable scrap items in Kathmandu Valley. Doorstep digital scale weighing ensures exact payout.")}
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t("rates.searchPlaceholder", "Search scrap item (e.g. Copper, Iron, Bottle)...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-10 text-xs sm:text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: t("rates.allItems", "All Items") },
            { id: "metal", label: t("rates.metals", "Metals") },
            { id: "paper", label: t("rates.paper", "Paper") },
            { id: "plastic", label: t("rates.plastics", "Plastics") },
            { id: "e-waste", label: t("rates.ewaste", "E-Waste") },
            { id: "glass", label: t("rates.glass", "Glass") },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRates}
            disabled={loading}
            className="rounded-full h-8 px-2.5 text-xs text-slate-500 hover:text-foreground shrink-0"
            title="Refresh Rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Grid + Scrap Value Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Scrap Rates List / Cards (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-card rounded-2xl border border-dashed text-muted-foreground">
              <p className="text-sm font-semibold">{t("rates.noResults", "No scrap types found matching your query.")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}
                className="mt-4 rounded-full text-xs"
              >
                {t("rates.resetFilters", "Reset Filters")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTypes.map((item) => {
                const Icon = getScrapIcon(item.name)
                const category = translateCategory(getItemCategory(item))
                const unit = getItemUnit(item)

                return (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {category}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {getDisplayName(item)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t("rates.doorstepRate", "Doorstep digital scale rate")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                          Rs. {item.rate_per_kg}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          {unit === "per_piece" ? `/${t("nav.home", "piece").replace("Main Menu", "piece")}` : t("rates.perKg", "/ kg")}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCalcSelectedId(item.id)
                          window.scrollTo({ top: 300, behavior: "smooth" })
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg h-8 px-2.5 font-medium"
                      >
                        {t("rates.calculate", "Calculate")}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Instant Scrap Value Calculator & Payout Estimator */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-white to-emerald-500/[0.02] dark:from-card dark:to-emerald-950/10 shadow-lg p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t("rates.calculatorTitle", "Payout Estimator")}</CardTitle>
                <CardDescription className="text-xs">{t("rates.calculatorDesc", "Estimate earnings before booking")}</CardDescription>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Select Scrap Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("rates.selectScrap", "Select Scrap Item")}
                </label>
                <select
                  value={calcSelectedId}
                  onChange={(e) => setCalcSelectedId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  {wasteTypes.map((wt) => {
                    const unit = getItemUnit(wt)
                    const unitLabel = unit === "per_piece" ? "piece" : "kg"
                    return (
                      <option key={wt.id} value={wt.id}>
                        {getDisplayName(wt)} (Rs. {wt.rate_per_kg}/{unitLabel})
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {calcUnit === "per_piece"
                      ? t("household.book.estQuantity", "Estimated Quantity").replace("(KG)", "").trim() + " (in Pieces)"
                      : t("rates.weightLabel", "Estimated Weight (in Kilograms)")}
                  </label>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {calcWeight} {calcUnit === "per_piece" ? "pcs" : "kg"}
                  </span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="10000"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value) || 1))}
                  className="rounded-xl h-10 text-sm font-semibold"
                />
              </div>

              {/* Instant Calculation Result */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 text-center space-y-1 mt-4">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  {t("rates.estimatedPayout", "Estimated Cash Payout")}
                </span>
                <p className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">
                  {formatCurrency(calcTotal)}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  {calcWeight} {calcUnit === "per_piece" ? "pcs" : "kg"} × Rs. {calcItem?.rate_per_kg || 0}/{calcUnit === "per_piece" ? "piece" : "kg"}
                </p>
              </div>

              {/* CTA Book Button */}
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 text-sm shadow-md shadow-emerald-600/20 gap-2 mt-3"
              >
                <Link to={user && role === "household" ? "/household/book" : "/signup"}>
                  {t("rates.bookPickup", "Book Pickup for this Scrap")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Guarantee info */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {t("rates.guaranteeTitle", "Transparent Weighing Guarantee")}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t("rates.guarantee1", "All scales are calibrated digital hanging & platform scales.")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t("rates.guarantee2", "Payment is made immediately on completion of weighing.")}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
