import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import {
  Briefcase,
  Scale,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  ArrowRight,
  RefreshCw,
  Loader2,
  DollarSign,
  ShieldCheck,
} from "lucide-react"

export default function CollectorJobsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("available") // "available" | "my_jobs"
  const [availableJobs, setAvailableJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Complete Job Dialog State
  const [selectedJob, setSelectedJob] = useState(null)
  const [actualWeight, setActualWeight] = useState("")
  const [completing, setCompleting] = useState(false)
  const [dialogError, setDialogError] = useState("")
  const [successToast, setSuccessToast] = useState("")

  const loadJobs = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch available open requests
      const { data: availData, error: aErr } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( id, name, rate_per_kg ),
          household:profiles!pickups_household_id_fkey ( name, phone, area )
        `)
        .eq("status", "requested")
        .order("created_at", { ascending: false })

      if (aErr) throw aErr
      setAvailableJobs(availData || [])

      // 2. Fetch my active accepted jobs
      const { data: myData, error: mErr } = await supabase
        .from("pickups")
        .select(`
          *,
          waste_types ( id, name, rate_per_kg ),
          household:profiles!pickups_household_id_fkey ( name, phone, area )
        `)
        .eq("collector_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })

      if (mErr) throw mErr
      setMyJobs(myData || [])
    } catch (err) {
      console.error("Error loading collector jobs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
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
      setSuccessToast("Job accepted successfully! Moved to 'My Active Jobs'.")
      setActiveTab("my_jobs")
      await loadJobs()
    } catch (err) {
      alert("Error accepting job: " + err.message)
    }
  }

  const handleOpenCompleteDialog = (job) => {
    setSelectedJob(job)
    setActualWeight(job.estimated_qty || "10")
    setDialogError("")
  }

  const handleCompletePickup = async (e) => {
    e.preventDefault()
    setDialogError("")

    if (!actualWeight || Number(actualWeight) <= 0) {
      setDialogError("Please enter a valid actual scale weight greater than 0 kg.")
      return
    }

    setCompleting(true)

    try {
      const weightNum = Number(actualWeight)
      const rate = Number(selectedJob.waste_types?.rate_per_kg || 25)
      const totalPayout = weightNum * rate

      // 1. Update pickup status to completed
      const { error: updateErr } = await supabase
        .from("pickups")
        .update({
          status: "completed",
        })
        .eq("id", selectedJob.id)

      if (updateErr) throw updateErr

      // 2. Automatically insert verified row in ledger_entries
      const { error: ledgerErr } = await supabase
        .from("ledger_entries")
        .insert({
          collector_id: user.id,
          pickup_id: selectedJob.id,
          waste_type_id: selectedJob.waste_types.id,
          actual_weight_kg: weightNum,
          amount_paid: totalPayout,
        })

      if (ledgerErr) throw ledgerErr

      setSelectedJob(null)
      setSuccessToast(`Pickup completed successfully! Recorded Rs. ${totalPayout} to your Income Ledger.`)
      await loadJobs()
    } catch (err) {
      console.error("Error completing pickup:", err)
      setDialogError(err.message || "Failed to complete pickup. Please try again.")
    } finally {
      setCompleting(false)
    }
  }

  const calculatedPayout = selectedJob
    ? Number(actualWeight || 0) * Number(selectedJob.waste_types?.rate_per_kg || 0)
    : 0

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Job Market & Pickup Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Claim open household requests and complete collections with digital scale entries
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadJobs}
          disabled={loading}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Jobs</span>
        </Button>
      </div>

      {successToast && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast("")} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-border pb-3">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "available"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Available Requests ({availableJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("my_jobs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "my_jobs"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>My Active Jobs ({myJobs.length})</span>
        </button>
      </div>

      {/* Tab 1: Available Requests */}
      {activeTab === "available" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
              ))}
            </div>
          ) : availableJobs.length === 0 ? (
            <EmptyState
              title="No open pickup requests right now"
              description="All household requests in your area have been claimed. Check back shortly for new bookings."
              actionLabel="Check My Active Jobs"
              onAction={() => setActiveTab("my_jobs")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableJobs.map((job) => (
                <Card
                  key={job.id}
                  className="rounded-2xl border-slate-200/80 dark:border-border p-5 sm:p-6 bg-white dark:bg-card shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {job.waste_types?.name || "Scrap Items"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.address}</span>
                        </p>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-[10px] shrink-0 font-bold">
                        Rs. {job.waste_types?.rate_per_kg}/kg
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Estimated Quantity:</span>
                        <span className="font-bold text-slate-900 dark:text-white">~ {job.estimated_qty} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Est. Payout to Customer:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency((job.estimated_qty || 10) * (job.waste_types?.rate_per_kg || 25))}
                        </span>
                      </div>
                      {job.scheduled_time && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-border">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Preferred Time:
                          </span>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(job.scheduled_time)}
                          </span>
                        </div>
                      )}
                    </div>

                    {job.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/40">
                        "{job.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Requested {formatDate(job.created_at)}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleAcceptJob(job.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-5 shadow-sm"
                    >
                      Accept Pickup
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Active Jobs */}
      {activeTab === "my_jobs" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
              ))}
            </div>
          ) : myJobs.length === 0 ? (
            <EmptyState
              title="No active jobs in progress"
              description="You have no pickups currently assigned. Browse the available requests tab to claim doorstep jobs."
              actionLabel="Find Open Requests"
              onAction={() => setActiveTab("available")}
            />
          ) : (
            <div className="space-y-4">
              {myJobs.map((job) => (
                <Card
                  key={job.id}
                  className="rounded-2xl border-2 border-amber-500/30 p-5 sm:p-6 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {job.waste_types?.name || "Scrap Items"}
                        </h3>
                        <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                          Assigned to You
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white">{job.address}</span>
                        </div>
                        {job.household && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Customer: <strong>{job.household.name}</strong> ({job.household.phone})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Est. Quantity: {job.estimated_qty} kg (Rate: Rs. {job.waste_types?.rate_per_kg}/kg)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Booked on {formatDate(job.created_at)}</span>
                        </div>
                      </div>

                      {job.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 dark:bg-muted/40 p-2.5 rounded-xl">
                          <strong className="text-slate-800 dark:text-slate-200">Customer Note:</strong> {job.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border">
                      <Button
                        size="sm"
                        onClick={() => handleOpenCompleteDialog(job)}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm h-10 px-6 shadow-md shadow-amber-600/20 gap-2"
                      >
                        <Scale className="w-4 h-4" />
                        <span>Weigh & Complete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calibrated Digital Scale Weighing Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Digital Scale Weighing
                  </h3>
                  <p className="text-xs text-slate-400">Record calibrated weight & pay customer</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {dialogError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dialogError}</span>
              </div>
            )}

            <form onSubmit={handleCompletePickup} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Material Type:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJob.waste_types?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Rate:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    Rs. {selectedJob.waste_types?.rate_per_kg} / kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {selectedJob.address}
                  </span>
                </div>
              </div>

              {/* Actual Calibrated Weight Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weight" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Calibrated Scale Weight (in Kilograms)
                  </Label>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
                    Digital Scale Verified
                  </Badge>
                </div>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10000"
                  required
                  autoFocus
                  placeholder="e.g. 14.5"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  disabled={completing}
                  className="rounded-xl h-11 text-base font-bold text-emerald-700 dark:text-emerald-300"
                />
              </div>

              {/* Total Payout Calculation Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Cash Amount to Pay Customer
                </span>
                <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(calculatedPayout)}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  {actualWeight || 0} kg × Rs. {selectedJob.waste_types?.rate_per_kg || 0}/kg
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  disabled={completing}
                  className="rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={completing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 text-xs sm:text-sm shadow-md shadow-emerald-600/20 gap-2"
                >
                  {completing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging Verified Receipt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Pay Cash
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
