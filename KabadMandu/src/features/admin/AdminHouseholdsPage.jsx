import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/shared/EmptyState"
import {
  Home,
  Search,
  Phone,
  MapPin,
  RefreshCw,
  Truck,
  Calendar,
} from "lucide-react"

export default function AdminHouseholdsPage() {
  const [households, setHouseholds] = useState([])
  const [pickupStats, setPickupStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const loadHouseholds = async () => {
    setLoading(true)
    try {
      // 1. Fetch household profiles
      const { data: profData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "household")
        .order("created_at", { ascending: false })

      if (pErr) throw pErr

      // 2. Fetch pickups to count pickups per household
      const { data: pData } = await supabase.from("pickups").select("household_id, status")
      const statsMap = {}
      if (pData) {
        pData.forEach((p) => {
          if (!statsMap[p.household_id]) {
            statsMap[p.household_id] = { total: 0, completed: 0 }
          }
          statsMap[p.household_id].total += 1
          if (p.status === "completed") {
            statsMap[p.household_id].completed += 1
          }
        })
      }

      setPickupStats(statsMap)
      setHouseholds(profData || [])
    } catch (err) {
      console.error("Error loading households:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHouseholds()
  }, [])

  const filtered = households.filter(
    (h) =>
      (h.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.area || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Household Accounts Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered doorstep household users, neighborhood coverage, and pickup booking history
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadHouseholds}
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
            placeholder="Search household by name, phone, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-9 text-xs"
          />
        </div>
      </div>

      {/* Households Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={Home} title="No households found" description="No household accounts match your search. Try a different name or area." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="py-3.5 px-5">Household Name</th>
                  <th className="py-3.5 px-5">Phone & Contact</th>
                  <th className="py-3.5 px-5">Area / Neighborhood</th>
                  <th className="py-3.5 px-5">Total Pickups</th>
                  <th className="py-3.5 px-5">Completed</th>
                  <th className="py-3.5 px-5 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {filtered.map((h) => {
                  const stats = pickupStats[h.id] || { total: 0, completed: 0 }

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {h.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {h.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-300">
                        {h.phone || "—"}
                      </td>

                      <td className="py-4 px-5 text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{h.area || "Kathmandu"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {stats.total} Bookings
                      </td>

                      <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400">
                        {stats.completed} Completed
                      </td>

                      <td className="py-4 px-5 text-right text-slate-400 text-[11px]">
                        {formatDate(h.created_at)}
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
