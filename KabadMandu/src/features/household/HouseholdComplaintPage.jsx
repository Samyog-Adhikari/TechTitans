import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  MessageSquare,
  ShieldAlert,
} from "lucide-react"

export default function HouseholdComplaintPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const loadComplaints = async () => {
    if (!user) return
    setFetchLoading(true)
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      console.error("Error loading complaints:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!subject.trim() || !description.trim()) {
      setError("Please fill out both subject and description.")
      return
    }

    setLoading(true)

    try {
      const { error: insertErr } = await supabase.from("complaints").insert({
        submitted_by: user.id,
        role: "household",
        subject: subject.trim(),
        description: description.trim(),
        status: "open",
      })

      if (insertErr) throw insertErr

      setSuccess(true)
      setSubject("")
      setDescription("")
      await loadComplaints()
    } catch (err) {
      console.error("Error submitting complaint:", err)
      setError(err.message || "Failed to submit issue. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in-50">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Help & Issue Resolution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Have an issue with a pickup, digital scale discrepancy, or collector service? Submit an issue directly to KabadMandu admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Submit Form (3 cols) */}
        <Card className="lg:col-span-3 rounded-2xl border-slate-200/80 dark:border-border shadow-sm bg-white dark:bg-card p-6 sm:p-7">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Raise an Issue to Admin
            </CardTitle>
            <CardDescription className="text-xs">
              Our administration reviews and resolves all complaints within 24 hours.
            </CardDescription>
          </CardHeader>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your issue has been submitted to admin. We will review and contact you shortly.</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Subject
              </Label>
              <Input
                id="subject"
                required
                placeholder="e.g. Collector was delayed / Digital scale issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                className="rounded-xl h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Description
              </Label>
              <textarea
                id="desc"
                rows={4}
                required
                placeholder="Please describe what happened, pickup address, date, or any relevant details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-input bg-transparent p-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 text-xs sm:text-sm px-6 shadow-sm gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Submit Issue
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Complaints History (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Your Submitted Issues
          </h2>

          {fetchLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-muted animate-pulse" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-6 bg-white dark:bg-card rounded-2xl border border-dashed text-center text-xs text-slate-500">
              You haven't submitted any complaints.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <Card
                  key={c.id}
                  className="rounded-2xl border-slate-200/80 dark:border-border p-4 bg-white dark:bg-card shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.subject}
                    </h4>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {c.description}
                  </p>

                  {c.resolution_note && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-300">
                      <strong>Admin Note:</strong> {c.resolution_note}
                    </div>
                  )}

                  <div className="pt-1 text-[10px] text-slate-400">
                    {formatDate(c.created_at)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
