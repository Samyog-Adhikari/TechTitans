import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/shared/EmptyState"
import {
  Truck,
  Search,
  Phone,
  MapPin,
  Scale,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  UserCheck,
} from "lucide-react"

export default function AdminCollectorsPage() {
  const [collectors, setCollectors] = useState([])
  const [ledgerStats, setLedgerStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const loadCollectors = async () => {
    setLoading(true)
    try {
      // 1. Fetch collector profiles
      const { data: profData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "collector")
        .order("created_at", { ascending: false })

      if (pErr) throw pErr

      // 2. Fetch ledger entries to compute per-collector stats
      const { data: lData } = await supabase.from("ledger_entries").select("collector_id, actual_weight_kg, amount_paid")
      const statsMap = {}
      if (lData) {
        lData.forEach((row) => {
          if (!statsMap[row.collector_id]) {
            statsMap[row.collector_id] = { totalWeight: 0, totalAmount: 0, count: 0 }
          }
          statsMap[row.collector_id].totalWeight += Number(row.actual_weight_kg || 0)
          statsMap[row.collector_id].totalAmount += Number(row.amount_paid || 0)
          statsMap[row.collector_id].count += 1
        })
      }

      setLedgerStats(statsMap)
      setCollectors(profData || [])
    } catch (err) {
      console.error("Error loading collectors:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollectors()
  }, [])

  const filtered = collectors.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.area || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Collector Accounts & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of registered scrap collectors, digital scale calibrations, and collection records
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadCollectors}
          disabled={loading}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search collector by name, phone, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-9 text-xs"
          />
        </div>
      </div>

      {/* Collectors Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={Truck} title="No collectors found" description="No collector accounts match your search. Try a different name or area." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="py-3.5 px-5">Collector</th>
                  <th className="py-3.5 px-5">Phone & Contact</th>
                  <th className="py-3.5 px-5">Coverage Hub</th>
                  <th className="py-3.5 px-5">Completed Jobs</th>
                  <th className="py-3.5 px-5">Total Weight (KG)</th>
                  <th className="py-3.5 px-5">Total Paid Out</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {filtered.map((c) => {
                  const stats = ledgerStats[c.id] || { totalWeight: 0, totalAmount: 0, count: 0 }

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Joined {formatDate(c.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-300">
                        {c.phone || "—"}
                      </td>

                      <td className="py-4 px-5 text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{c.area || "Kathmandu"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {stats.count} Jobs
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {stats.totalWeight} kg
                      </td>

                      <td className="py-4 px-5 font-black text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(stats.totalAmount)}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          ✓ Active KYC
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
