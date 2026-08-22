import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import {
  ShieldAlert,
  TrendingUp,
  Truck,
  Home,
  Inbox,
  Scale,
  DollarSign,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Users,
} from "lucide-react"
import EmptyState from "@/components/shared/EmptyState"

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [pickups, setPickups] = useState([])
  const [collectors, setCollectors] = useState([])
  const [households, setHouseholds] = useState([])
  const [wasteTypes, setWasteTypes] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // 1. Fetch all pickups
      const { data: pData } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          household:profiles!pickups_household_id_fkey ( name, phone, area ),
          collector:profiles!pickups_collector_id_fkey ( name, phone )
        `)
        .order("created_at", { ascending: false })
      setPickups(pData || [])

      // 2. Fetch profiles
      const { data: profData } = await supabase.from("profiles").select("*")
      if (profData) {
        setCollectors(profData.filter((p) => p.role === "collector"))
        setHouseholds(profData.filter((p) => p.role === "household"))
      }

      // 3. Fetch waste types
      const { data: wtData } = await supabase.from("waste_types").select("*")
      setWasteTypes(wtData || [])

      // 4. Fetch complaints
      const { data: compData } = await supabase.from("complaints").select("*").order("created_at", { ascending: false })
      setComplaints(compData || [])
    } catch (err) {
      console.error("Error fetching admin dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // Platform Aggregates
  const totalPickups = pickups.length
  const completedPickups = pickups.filter((p) => p.status === "completed").length
  const openRequests = pickups.filter((p) => p.status === "requested").length
  const openComplaints = complaints.filter((c) => c.status === "open").length

  const totalDivertedKg = pickups
    .filter((p) => p.status === "completed")
    .reduce((acc, curr) => acc + (Number(curr.estimated_qty) || 0), 0)

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px] uppercase font-bold">
              System Administration
            </Badge>
            <span className="text-xs text-slate-400 font-medium">
              Central Command • Kathmandu Valley
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Platform Governance & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time monitoring of scrap pickups, collectors, market rates, and customer dispute resolution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            disabled={loading}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4 Key Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Platform Pickups */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px]">
              {completedPickups} Completed
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Total Pickups Booked</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalPickups} Requests
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">{openRequests} open / pending</span>
          </div>
        </Card>

        {/* Metric 2: Registered Collectors */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
              Active Network
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Registered Collectors</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {collectors.length} Collectors
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">calibrated digital scales</span>
          </div>
        </Card>

        {/* Metric 3: Total Households */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 bg-teal-50 border-teal-200">
              Kathmandu
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Registered Households</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {households.length} Users
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">doorstep sellers</span>
          </div>
        </Card>

        {/* Metric 4: Open Complaints */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-border p-5 bg-white dark:bg-card shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <Badge variant={openComplaints > 0 ? "destructive" : "secondary"} className="text-[10px]">
              {openComplaints} Open
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-400">Complaints & Disputes</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {complaints.length} Total
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">admin resolution inbox</span>
          </div>
        </Card>
      </div>

      {/* Quick Governance Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/rates"
          className="p-5 rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs hover:border-emerald-500 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Manage Scrap Rates
            </span>
            <p className="text-xs text-slate-400">Edit per-kg rates & add materials</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/collectors"
          className="p-5 rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs hover:border-amber-500 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              Collector Directory
            </span>
            <p className="text-xs text-slate-400">View performance & active status</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/complaints"
          className="p-5 rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs hover:border-destructive hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-destructive" />
              Complaints Inbox
            </span>
            <p className="text-xs text-slate-400">{openComplaints} unresolved tickets</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-destructive group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Platform Pickups Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Platform Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live overview of requested, accepted, and completed pickups across Kathmandu</p>
          </div>

          <Badge variant="outline" className="text-xs text-slate-500">
            {pickups.length} Records
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : pickups.length === 0 ? (
          <div className="p-6"><EmptyState icon={Calendar} title="No platform pickups yet" description="Pickup requests will appear here once households start booking collections." /></div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Scrap Material</th>
                  <th className="py-3 px-3">Household</th>
                  <th className="py-3 px-3">Address</th>
                  <th className="py-3 px-3">Est. Weight</th>
                  <th className="py-3 px-3">Assigned Collector</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {pickups.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {p.waste_types?.name || "Scrap Items"}
                    </td>
                    <td className="py-3 px-3">
                      {p.household?.name || "Household"}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[180px] truncate">
                      {p.address}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {p.estimated_qty} kg
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {p.collector?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={p.status} />
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
