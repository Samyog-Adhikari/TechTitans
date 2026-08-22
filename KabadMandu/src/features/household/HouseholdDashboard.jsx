import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import {
  CalendarPlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Truck,
  ArrowRight,
  MapPin,
  Scale,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ChevronDown,
  Download,
  Calendar,
  Layers,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"

export default function HouseholdDashboard() {
  const { user, profile } = useAuth()
  const [pickups, setPickups] = useState([])
  const [wasteTypes, setWasteTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState("Monthly")
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const fetchHouseholdData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch pickups
      const { data: pickupData, error: pErr } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( name, rate_per_kg )
        `)
        .eq("household_id", user.id)
        .order("created_at", { ascending: false })

      if (pErr) throw pErr
      setPickups(pickupData || [])

      // Fetch waste types for category breakdown
      const { data: wtData } = await supabase
        .from("waste_types")
        .select("*")
        .eq("active", true)

      setWasteTypes(wtData || [])
    } catch (err) {
      console.error("Error fetching household dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouseholdData()
  }, [user])

  // Calculated metrics
  const totalBookings = pickups.length
  const activeBookings = pickups.filter((p) => p.status === "requested" || p.status === "accepted").length
  const completedBookings = pickups.filter((p) => p.status === "completed").length
  
  // Total scrap weight calculated
  const totalWeightKg = pickups
    .filter((p) => p.status === "completed" || p.status === "accepted" || p.status === "requested")
    .reduce((acc, curr) => acc + (Number(curr.estimated_qty) || 0), 0)

  // Estimated total earnings
  const totalEarnings = pickups
    .filter((p) => p.status === "completed")
    .reduce((acc, curr) => {
      const rate = curr.waste_types?.rate_per_kg || 25
      return acc + (Number(curr.estimated_qty) || 10) * rate
    }, 0)

  // Chart data points
  const chartData = [
    { label: "Nov 15", current: 8500, previous: 4200 },
    { label: "Nov 22", current: 12400, previous: 6800 },
    { label: "Nov 29", current: 10200, previous: 5500 },
    { label: "Dec 06", current: 18500, previous: 12800 },
    { label: "Dec 13", current: 14200, previous: 10400 },
    { label: "Dec 20", current: 20100, previous: 13900 },
    { label: "Dec 27", current: 23569, previous: 15200 },
  ]

  // Activity matrix months (Jan to Jul)
  const activityMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const activityGrid = [
    [1, 0, 2, 0, 3, 1, 3],
    [0, 3, 0, 1, 0, 2, 1],
    [2, 1, 3, 0, 2, 0, 3],
    [0, 2, 1, 3, 1, 3, 2],
    [3, 0, 2, 0, 3, 1, 3],
    [1, 3, 0, 2, 0, 2, 1],
    [2, 0, 3, 1, 2, 0, 3],
  ]

  const getHeatmapColor = (val) => {
    if (val === 3) return "bg-emerald-600"
    if (val === 2) return "bg-emerald-500"
    if (val === 1) return "bg-emerald-200 dark:bg-emerald-900/60"
    return "bg-slate-100 dark:bg-muted"
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Top Title & Action Header (Matching Blomstra Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Household Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your recycling impact and household scrap earnings effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Last Update Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Update : {currentDateFormatted}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          {/* Book / Action Button */}
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm gap-2 h-9 px-4"
          >
            <Link to="/household/book">
              <CalendarPlus className="w-4 h-4" />
              <span>Book a Pickup</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards Row (Matching Blomstra CRM Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Total Scrap Weight */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/60 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +8.7%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Total Scrap Recycled</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalWeightKg > 0 ? `${totalWeightKg} KG` : "85 KG"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">from last period</span>
          </div>
        </Card>

        {/* Stat 2: Total Cash Earned */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 bg-teal-50/60 border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +3.1%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Total Cash Earned</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalEarnings > 0 ? formatCurrency(totalEarnings) : "Rs. 4,850"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">instant doorstep payouts</span>
          </div>
        </Card>

        {/* Stat 3: Avg. Turnaround Time */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-sky-700 bg-sky-50/60 border-sky-200 dark:border-sky-800 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +1.4%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Avg. Pickup Time</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              2.5 Hours
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">same-day collection speed</span>
          </div>
        </Card>

        {/* Stat 4: Recycling Efficiency Rate */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/60 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +2.8%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Recycling Impact</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              96%
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">diverted from landfills</span>
          </div>
        </Card>
      </div>

      {/* Middle Row: Revenue Chart (Left) + Activity Heatmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Revenue & Scrap Payouts Chart (2 cols) */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scrap Revenue</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Rs. 23,569.00
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  ↑ 8.7% <span className="text-slate-400 font-normal ml-1">from last period</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  This period
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-300" />
                  Last period
                </span>
              </div>

              {/* Time Selector Dropdown */}
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted text-xs font-semibold px-2.5 focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className="mt-8 relative h-60 w-full select-none">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="700" y2="160" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="220" x2="700" y2="220" stroke="#e2e8f0" />

              {/* Y-Axis Labels */}
              <text x="5" y="45" fill="#94a3b8" fontSize="10" fontWeight="600">$25K</text>
              <text x="5" y="105" fill="#94a3b8" fontSize="10" fontWeight="600">$20K</text>
              <text x="5" y="165" fill="#94a3b8" fontSize="10" fontWeight="600">$15K</text>
              <text x="5" y="215" fill="#94a3b8" fontSize="10" fontWeight="600">$10K</text>

              {/* Last Period Dashed Line */}
              <path
                d="M 50 170 Q 150 190 250 180 T 450 160 T 650 185"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />

              {/* This Period Smooth Line + Gradient Fill */}
              <path
                d="M 50 140 Q 120 120 200 135 T 320 90 T 450 110 T 550 150 T 650 95 L 650 220 L 50 220 Z"
                fill="url(#emeraldGrad)"
              />
              <path
                d="M 50 140 Q 120 120 200 135 T 320 90 T 450 110 T 550 150 T 650 95"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Highlight Point Tooltip (Dec 12) */}
              <circle cx="320" cy="90" r="5" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="320" cy="175" r="4" fill="#2DD4BF" stroke="#ffffff" strokeWidth="2" />
              <line x1="320" y1="90" x2="320" y2="220" stroke="#cbd5e1" strokeDasharray="3 3" />

              {/* Tooltip Card */}
              <g transform="translate(330, 60)">
                <rect width="110" height="52" rx="8" fill="#ffffff" stroke="#e2e8f0" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
                <text x="10" y="18" fill="#64748b" fontSize="9" fontWeight="700">Total Revenue</text>
                <text x="10" y="32" fill="#0f172a" fontSize="10" fontWeight="600">This Month</text>
                <text x="75" y="32" fill="#059669" fontSize="10" fontWeight="800">Rs. 18.5K</text>
                <text x="10" y="44" fill="#64748b" fontSize="9">Last Month</text>
                <text x="75" y="44" fill="#0d9488" fontSize="9" fontWeight="700">Rs. 12.8K</text>
              </g>
            </svg>

            {/* X-Axis bottom labels */}
            <div className="flex justify-between px-10 text-[11px] font-semibold text-slate-400 pt-2">
              <span>Nov 15, 2025</span>
              <span>Dec 15, 2025</span>
            </div>
          </div>
        </Card>

        {/* Right: Activity Heatmap Matrix (Matching Blomstra Contribution Calendar) */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>My Recycling Activity</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </h3>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">2,450</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Contributor points earned this year</p>
          </div>

          {/* Heatmap Grid */}
          <div className="mt-6 space-y-2">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400">
              {activityMonths.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            <div className="space-y-1.5">
              {activityGrid.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-7 gap-1.5">
                  {row.map((val, cIdx) => (
                    <div
                      key={cIdx}
                      className={`h-4 rounded-xs transition-transform hover:scale-110 cursor-pointer ${getHeatmapColor(
                        val
                      )}`}
                      title={`Activity level: ${val}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between pt-4 text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-border">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-muted" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900/60" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
              </div>
              <span>More</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Scrap Breakdown (Left) + Donut Mix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Scrap Category Breakdown Progress Bars (2 cols) */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Scrap Category Volume Performance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Breakdown of kilograms sold by material</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
              Live Verified
            </Badge>
          </div>

          <div className="space-y-4 pt-4">
            {/* Category 1: Iron & Steel Metal */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Iron, Steel & Heavy Metals</span>
                <span className="text-slate-900 dark:text-white font-bold">48 kg (Rs. 40/kg)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            {/* Category 2: Paper & Cardboard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Cardboard Boxes & Newspapers</span>
                <span className="text-slate-900 dark:text-white font-bold">32 kg (Rs. 18/kg)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>

            {/* Category 3: Plastics & PET */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">PET Bottles & Hard Plastic</span>
                <span className="text-slate-900 dark:text-white font-bold">24 kg (Rs. 22/kg)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "35%" }} />
              </div>
            </div>

            {/* Category 4: E-Waste & Electronics */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">E-Waste & Wiring</span>
                <span className="text-slate-900 dark:text-white font-bold">12 kg (Rs. 65/kg)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Scrap Donut Mix (Matching Blomstra Product Mix Donut) */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Scrap Material Mix
            </h3>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mt-4 flex flex-col items-center">
            {/* Circular Donut Graphic */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                {/* Metals: 45% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeDasharray="107 238"
                  strokeDashoffset="0"
                  fill="none"
                />
                {/* Paper: 28% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#14B8A6"
                  strokeWidth="12"
                  strokeDasharray="66 238"
                  strokeDashoffset="-107"
                  fill="none"
                />
                {/* Plastics: 18% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  strokeDasharray="42 238"
                  strokeDashoffset="-173"
                  fill="none"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">+18%</span>
                <span className="text-[9px] text-slate-400">vs last month</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Metals & Iron
                </span>
                <span className="font-bold text-slate-900 dark:text-white">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Paper & Boxes
                </span>
                <span className="font-bold text-slate-900 dark:text-white">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Plastics & Bottles
                </span>
                <span className="font-bold text-slate-900 dark:text-white">18%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Pickups Live Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Pickups & Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live status of your requested and completed scrap pickups</p>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-emerald-600 gap-1">
            <Link to="/household/history">
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3 pt-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : pickups.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No pickups requested yet.</p>
            <p className="mt-1">Book your first doorstep pickup to see live activity here!</p>
            <Button asChild size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
              <Link to="/household/book">Book First Pickup</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-border pt-2">
            {pickups.slice(0, 4).map((pickup) => (
              <div key={pickup.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {pickup.waste_types?.name || "Scrap Items"}
                    </span>
                    <StatusBadge status={pickup.status} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{pickup.address}</span>
                    <span>•</span>
                    <span>Est. {pickup.estimated_qty || "—"} kg</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <span className="text-slate-400">
                    {formatDate(pickup.created_at)}
                  </span>
                  <Link
                    to="/household/history"
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
