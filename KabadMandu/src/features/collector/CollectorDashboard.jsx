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
  Briefcase,
  DollarSign,
  Scale,
  Truck,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Loader2,
} from "lucide-react"

export default function CollectorDashboard() {
  const { user, profile } = useAuth()
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [activeJobs, setActiveJobs] = useState([])
  const [availableRequests, setAvailableRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCollectorData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch collector's completed ledger entries
      const { data: ledgerData, error: lErr } = await supabase
        .from("ledger_entries")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          pickups ( address )
        `)
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })

      if (lErr) throw lErr
      setLedgerEntries(ledgerData || [])

      // 2. Fetch collector's active (accepted) jobs
      const { data: activeData, error: aErr } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          household:profiles!pickups_household_id_fkey ( name, phone )
        `)
        .eq("collector_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })

      if (aErr) throw aErr
      setActiveJobs(activeData || [])

      // 3. Fetch open requested pickups nearby
      const { data: availData, error: vErr } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          household:profiles!pickups_household_id_fkey ( name, phone )
        `)
        .eq("status", "requested")
        .order("created_at", { ascending: false })
        .limit(5)

      if (vErr) throw vErr
      setAvailableRequests(availData || [])
    } catch (err) {
      console.error("Error fetching collector dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollectorData()
  }, [user])

  const handleAcceptJob = async (pickupId) => {
    try {
      const { error } = await supabase
        .from("pickups")
        .update({
          collector_id: user.id,
          status: "accepted",
        })
        .eq("id", pickupId)
        .eq("status", "requested")

      if (error) throw error
      await fetchCollectorData()
    } catch (err) {
      alert("Error accepting job: " + err.message)
    }
  }

  // Aggregate Metrics
  const totalEarnings = ledgerEntries.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0)
  const totalWeightKg = ledgerEntries.reduce((acc, curr) => acc + Number(curr.actual_weight_kg || 0), 0)
  const totalCompletedCount = ledgerEntries.length

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 text-white text-[10px] uppercase font-bold">
              Verified Collector
            </Badge>
            <span className="text-xs text-slate-400 font-medium">
              {profile?.area || "Kathmandu Valley Coverage"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Namaste, {profile?.name || "Collector"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View available scrap jobs, complete doorstep pickups with digital scales, and track your verified income.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm gap-2 h-9 px-4"
          >
            <Link to="/collector/jobs">
              <Briefcase className="w-4 h-4" />
              <span>Available Jobs ({availableRequests.length})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Active In-Progress Job Alert Banner */}
      {activeJobs.length > 0 && (
        <Card className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-amber-950/40 dark:to-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Active Pickup In Progress ({activeJobs.length} Job{activeJobs.length > 1 ? "s" : ""})
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeJobs[0].waste_types?.name} — Est. {activeJobs[0].estimated_qty} kg
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{activeJobs[0].address}</span>
                {activeJobs[0].household && (
                  <>
                    <span>•</span>
                    <span>Customer: {activeJobs[0].household.name} ({activeJobs[0].household.phone})</span>
                  </>
                )}
              </p>
            </div>

            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 gap-2 shrink-0 h-10 px-6"
            >
              <Link to="/collector/jobs">
                <Scale className="w-4 h-4" />
                Weigh & Complete Pickup
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* 4 Stat Metric Cards (Blomstra Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Total Earnings */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/60 border-emerald-200 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Verified
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Total Income Earned</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalEarnings)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">recorded in verified ledger</span>
          </div>
        </Card>

        {/* Stat 2: Total Weight Collected */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 bg-teal-50/60 border-teal-200 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Scale Calibrated
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Total Scrap Collected</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalWeightKg} KG
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">diverted to recycling hub</span>
          </div>
        </Card>

        {/* Stat 3: Completed Jobs Count */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-sky-700 bg-sky-50/60 border-sky-200 flex items-center gap-1">
              100% Success
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Completed Pickups</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalCompletedCount} Pickups
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">doorstep collections</span>
          </div>
        </Card>

        {/* Stat 4: Available Market Requests */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <Badge className="bg-amber-600 text-white text-[10px] font-semibold">
              Open Now
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Available Nearby Requests</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {availableRequests.length}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">ready for claim</span>
          </div>
        </Card>
      </div>

      {/* Available Jobs Market Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Available Household Requests
            </h2>
            <p className="text-xs text-slate-500">Pickups requested by households in your operational area</p>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-emerald-600 gap-1">
            <Link to="/collector/jobs">
              <span>View all available jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : availableRequests.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center bg-white dark:bg-card text-xs text-slate-500">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No new pickup requests right now.</p>
            <p className="mt-1">Check back in a few minutes or review your ledger history.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRequests.map((req) => (
              <Card
                key={req.id}
                className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {req.waste_types?.name || "Scrap Items"}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      Rs. {req.waste_types?.rate_per_kg}/kg
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.address}</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Est. <strong>{req.estimated_qty || "—"} kg</strong></span>
                    <span>•</span>
                    <span className="text-slate-400">{formatDate(req.created_at)}</span>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-muted/40 p-2 rounded-lg">
                      Note: {req.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Est. Value ~ {formatCurrency((req.estimated_qty || 10) * (req.waste_types?.rate_per_kg || 25))}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => handleAcceptJob(req.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-8 px-4 shadow-2xs"
                  >
                    Accept Job
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed Collections Feed */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Verified Collections
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Entries recorded automatically to your income ledger</p>
          </div>

          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-emerald-600 gap-1">
            <Link to="/collector/ledger">
              <span>View Full Ledger</span>
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
        ) : ledgerEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No completed pickups recorded yet.</p>
            <p className="mt-1">Accept open jobs above and weigh them to log your first verified earnings!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-border pt-2">
            {ledgerEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {entry.waste_types?.name || "Scrap Items"}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{entry.pickups?.address || "Kathmandu"}</span>
                    <span>•</span>
                    <span>Scale Weight: <strong className="text-slate-700 dark:text-slate-300">{entry.actual_weight_kg} kg</strong></span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(entry.amount_paid)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
