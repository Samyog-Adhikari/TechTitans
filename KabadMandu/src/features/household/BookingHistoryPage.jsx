import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import {
  Clock,
  MapPin,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react"

export default function BookingHistoryPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || "")

  const fetchHistory = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( name, rate_per_kg ),
          collector:profiles!pickups_collector_id_fkey ( name, phone )
        `)
        .eq("household_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPickups(data || [])
    } catch (err) {
      console.error("Error loading booking history:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  const handleCancel = async (pickupId) => {
    if (!window.confirm("Are you sure you want to cancel this pickup request?")) return
    try {
      const { error } = await supabase
        .from("pickups")
        .update({ status: "cancelled" })
        .eq("id", pickupId)
        .eq("household_id", user.id)

      if (error) throw error
      setPickups((prev) =>
        prev.map((p) => (p.id === pickupId ? { ...p, status: "cancelled" } : p))
      )
    } catch (err) {
      alert("Error cancelling pickup: " + err.message)
    }
  }

  const filteredPickups = pickups.filter((p) => {
    if (filter === "all") return true
    return p.status === filter
  })

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Booking History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your doorstep pickup requests, assigned collectors, and completed receipts
          </p>
        </div>

        <Button
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm gap-2 shrink-0"
        >
          <Link to="/household/book">
            <CalendarPlus className="w-4 h-4" />
            Book New Pickup
          </Link>
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Bookings" },
          { id: "requested", label: "Requested (Open)" },
          { id: "accepted", label: "Accepted (Assigned)" },
          { id: "completed", label: "Completed" },
          { id: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              filter === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchHistory}
          disabled={loading}
          className="rounded-full h-8 px-2.5 text-xs text-slate-500"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredPickups.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={
            filter === "all"
              ? "You have not requested any scrap pickups yet."
              : `No pickups currently in '${filter}' status.`
          }
          actionLabel="Book a Free Pickup"
          onAction={() => window.location.assign("/household/book")}
        />
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((pickup) => (
            <Card
              key={pickup.id}
              className="rounded-2xl border-slate-200/80 dark:border-border p-5 sm:p-6 bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {pickup.waste_types?.name || "Scrap Items"}
                    </h3>
                    <StatusBadge status={pickup.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {pickup.address}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Requested on {formatDate(pickup.created_at)}
                    </span>
                    <span>•</span>
                    <span>Est. {pickup.estimated_qty || "—"} kg</span>
                  </div>

                  {pickup.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 dark:bg-muted/40 p-2.5 rounded-lg">
                      <strong className="text-slate-700 dark:text-slate-300">Note:</strong> {pickup.notes}
                    </p>
                  )}
                </div>

                {/* Right: Assigned Collector & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border">
                  {pickup.status === "accepted" && pickup.collector && (
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                      <p className="font-bold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        Collector Assigned
                      </p>
                      <p className="mt-0.5 text-[11px]">
                        {pickup.collector.name} ({pickup.collector.phone})
                      </p>
                    </div>
                  )}

                  {pickup.status === "completed" && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed & Paid
                      </p>
                      <p className="mt-0.5 text-[11px]">
                        Receipt recorded in verified ledger
                      </p>
                    </div>
                  )}

                  {pickup.status === "requested" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(pickup.id)}
                      className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl h-8"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
