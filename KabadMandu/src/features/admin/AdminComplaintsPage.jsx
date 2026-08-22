import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import {
  Inbox,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  ShieldCheck,
  User,
  Clock,
  MessageSquare,
} from "lucide-react"

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // "all" | "open" | "resolved"
  const [searchQuery, setSearchQuery] = useState("")

  // Resolve Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [resolutionNote, setResolutionNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          profile:profiles!complaints_submitted_by_fkey ( name, phone, area )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      console.error("Error loading complaints:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const handleOpenResolve = (comp) => {
    setSelectedComplaint(comp)
    setResolutionNote(comp.resolution_note || "")
    setErrorMsg("")
  }

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolutionNote.trim()) {
      setErrorMsg("Please provide an admin resolution note.")
      return
    }

    setSaving(true)
    setErrorMsg("")

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: "resolved",
          resolution_note: resolutionNote.trim(),
          resolved_at: new Date().toISOString(),
        })
        .eq("id", selectedComplaint.id)

      if (error) throw error

      setToastMsg(`Ticket #${selectedComplaint.id.slice(0, 8)} marked as Resolved!`)
      setSelectedComplaint(null)
      await loadComplaints()
    } catch (err) {
      setErrorMsg(err.message || "Failed to resolve complaint.")
    } finally {
      setSaving(false)
    }
  }

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.profile?.name || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (filter === "all") return true
    return c.status === filter
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Complaints Inbox & Dispute Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and resolve complaints submitted by households and collectors
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadComplaints}
          disabled={loading}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {toastMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search complaints by subject, user, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: `All (${complaints.length})` },
            { id: "open", label: `Open (${complaints.filter((c) => c.status === "open").length})` },
            { id: "resolved", label: `Resolved (${complaints.filter((c) => c.status === "resolved").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List / Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={Inbox} title="No complaints found" description="No complaints match your current filter. The platform is complaint-free!" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Submitted By</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {c.profile?.name || "User"}
                    </td>

                    <td className="py-4 px-5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize font-semibold ${
                          c.role === "collector" ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {c.role}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white max-w-[160px] truncate">
                      {c.subject}
                    </td>

                    <td className="py-4 px-5 text-slate-500 max-w-[240px] truncate">
                      {c.description}
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={c.status === "open" ? "default" : "outline"}
                        onClick={() => handleOpenResolve(c)}
                        className={`h-8 text-xs font-semibold rounded-lg px-3 ${
                          c.status === "open"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "text-slate-600"
                        }`}
                      >
                        {c.status === "open" ? "Resolve Ticket" : "View Note"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Ticket Resolution #{selectedComplaint.id.slice(0, 8)}
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted by:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedComplaint.profile?.name} ({selectedComplaint.role})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedComplaint.subject}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-slate-600 dark:text-slate-300">
                <strong>Description:</strong> {selectedComplaint.description}
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-semibold">
                  Admin Resolution Note
                </Label>
                <textarea
                  id="note"
                  rows={4}
                  required
                  placeholder="Describe resolution taken, customer follow-up, or dispute action..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-input bg-transparent p-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComplaint(null)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 text-xs shadow-md shadow-emerald-600/20 gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Resolved"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
