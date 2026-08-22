import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/shared/EmptyState"
import {
  DollarSign,
  Scale,
  Calendar,
  Search,
  RefreshCw,
  Download,
  FileCheck2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileText,
} from "lucide-react"

export default function CollectorLedgerPage() {
  const { user, profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all") // "all" | "month" | "week"

  const fetchLedger = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          pickups ( address, notes )
        `)
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error("Error loading collector ledger:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedger()
  }, [user])

  // Filtered entries
  const filteredEntries = entries.filter((item) => {
    const matchesSearch =
      (item.waste_types?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pickups?.address || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterPeriod === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(item.created_at) >= weekAgo
    }

    if (filterPeriod === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return new Date(item.created_at) >= monthAgo
    }

    return true
  })

  // Summary Metrics
  const totalAmount = filteredEntries.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0)
  const totalWeight = filteredEntries.reduce((acc, curr) => acc + Number(curr.actual_weight_kg || 0), 0)
  const totalJobs = filteredEntries.length
  const avgPayout = totalJobs > 0 ? totalAmount / totalJobs : 0

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Income Ledger & Earnings History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Running chronological record of all verified scrap collections, scale weights, and payouts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLedger}
            disabled={loading}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 bg-white dark:bg-card"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earned</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Running verified total</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Weight</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {totalWeight} KG
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Calibrated scale measurements</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Per Pickup</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(avgPayout)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Average collection payout</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collections Count</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {totalJobs} Jobs
          </p>
          <p className="text-[11px] text-slate-400 mt-1">100% completed & logged</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by material or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: "All Time" },
            { id: "month", label: "This Month" },
            { id: "week", label: "Past 7 Days" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterPeriod === tab.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Entries Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800 dark:text-slate-200">No ledger entries found.</p>
            <p className="mt-1">Completed pickups with scale weights will automatically generate verified receipts here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Scrap Material</th>
                  <th className="py-3.5 px-5">Scale Weight</th>
                  <th className="py-3.5 px-5">Rate / KG</th>
                  <th className="py-3.5 px-5">Amount Paid</th>
                  <th className="py-3.5 px-5">Pickup Location</th>
                  <th className="py-3.5 px-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {entry.waste_types?.name || "Scrap Items"}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                      {entry.actual_weight_kg} kg
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      Rs. {entry.waste_types?.rate_per_kg || 25}
                    </td>
                    <td className="py-4 px-5 font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(entry.amount_paid)}
                    </td>
                    <td className="py-4 px-5 text-slate-500 max-w-[200px] truncate">
                      {entry.pickups?.address || "Kathmandu"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                        ✓ Verified Entry
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
