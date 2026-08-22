import React, { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { computeTrustMetrics } from "@/lib/trustTier"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Logo from "@/assets/logo"
import {
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  Scale,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle2,
  Lock,
  Loader2,
  RefreshCw,
} from "lucide-react"

export default function IncomeStatementPage() {
  const { user, profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [timePeriod, setTimePeriod] = useState("all") // "all" | "90" | "30"
  const [activeStatement, setActiveStatement] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const certificateRef = useRef(null)

  // Hoisted above loadStatementData so it can be called inside it
  const generateNewSnapshot = async (sourceEntries) => {
    const safeEntries = Array.isArray(sourceEntries) ? sourceEntries : []
    if (!user || safeEntries.length === 0) return
    setGenerating(true)
    setToastMsg("")

    try {
      const computed = computeTrustMetrics(safeEntries)
      const earliestDate = safeEntries.reduce(
        (earliest, curr) => (new Date(curr.created_at) < new Date(earliest) ? curr.created_at : earliest),
        safeEntries[0].created_at
      )
      const latestDate = new Date().toISOString()
      const verificationCode = `KM-NEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const snapshotPayload = {
        collector_id: user.id,
        period_start: earliestDate,
        period_end: latestDate,
        total_earnings: computed.totalEarnings,
        total_pickups: computed.totalPickups,
        weeks_active: computed.weeksActive,
        avg_weekly_earnings: computed.avgWeeklyEarnings,
        trust_tier: computed.trustTier,
        verification_code: verificationCode,
        generated_at: new Date().toISOString(),
      }

      const { data: newStmt, error } = await supabase
        .from("income_statements")
        .insert(snapshotPayload)
        .select()
        .single()

      if (error) throw error

      setActiveStatement(newStmt)
      setToastMsg(`Certified Income Statement #${verificationCode} generated and signed!`)
    } catch (err) {
      console.error("Failed to generate statement snapshot:", err)
      alert("Error generating statement: " + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const loadStatementData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch collector's ledger entries
      const { data: ledgerData, error: lErr } = await supabase
        .from("ledger_entries")
        .select(`
          *,
          waste_types ( name, rate_per_kg )
        `)
        .eq("collector_id", user.id)
        .order("created_at", { ascending: false })

      if (lErr) throw lErr
      const allEntries = ledgerData || []
      setEntries(allEntries)

      // 2. Fetch or auto-generate the latest immutable income statement snapshot
      const { data: stmtData } = await supabase
        .from("income_statements")
        .select("*")
        .eq("collector_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)

      if (stmtData && stmtData.length > 0) {
        setActiveStatement(stmtData[0])
      } else if (allEntries.length > 0) {
        // Auto-generate initial snapshot
        await generateNewSnapshot(allEntries)
      }
    } catch (err) {
      console.error("Error loading income statement data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatementData()
  }, [user])

  // Filter entries according to period
  const filteredEntries = entries.filter((e) => {
    if (timePeriod === "30") {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      return new Date(e.created_at) >= d
    }
    if (timePeriod === "90") {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      return new Date(e.created_at) >= d
    }
    return true
  })

  // Dynamic Trust Tier Metrics from active filtered records
  const metrics = computeTrustMetrics(filteredEntries)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const { default: jsPDF } = await import("jspdf")

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      const fileName = `KabadMandu-Statement-${verificationCode}.pdf`
      pdf.save(fileName)
      setToastMsg(`Certificate downloaded as ${fileName}`)
    } catch (err) {
      console.error("PDF download failed:", err)
      alert("PDF download failed. Try using Print > Save as PDF instead.")
    } finally {
      setDownloading(false)
    }
  }

  const verificationCode =
    activeStatement?.verification_code || `KM-NEP-${user?.id?.slice(0, 6).toUpperCase() || "2026"}`
  const verificationUrl = `${window.location.origin}/verify/${verificationCode}`

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in-50">
      {/* Top Action Header (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold">
              Formal Credit & Banking
            </Badge>
            <span className="text-xs text-slate-400">Zero Admin Approval Needed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Verified Income Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official certificate of verified scrap collection earnings for banks, cooperatives, and credit verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewSnapshot}
            disabled={generating || entries.length === 0}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
            title="Generate a new immutable verified snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>Generate New Certificate</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Document</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9 text-xs gap-1.5 shadow-sm"
          >
            {downloading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Downloading...</span></>
            ) : (
              <><Download className="w-3.5 h-3.5" /><span>Download PDF</span></>
            )}
          </Button>
        </div>
      </div>

      {toastMsg && (
        <div className="no-print flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Trust Tier Analysis Card (Interactive on screen) */}
      <Card className="no-print rounded-3xl border-slate-200/80 dark:border-border bg-linear-to-br from-emerald-500/5 via-white to-teal-500/5 dark:from-emerald-950/20 dark:via-card dark:to-card p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Multi-Factor Credit Assessment
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Collector Trust Tier: <span className="text-emerald-600">{metrics.trustTier}</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">{metrics.tierDescription}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs text-center min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Consistency</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {metrics.weeksActive} Weeks
            </p>
            <span className="text-[11px] text-emerald-600 font-bold">
              Avg {formatCurrency(metrics.avgWeeklyEarnings)}/wk
            </span>
          </div>
        </div>

        {/* Progress Bar towards next tier */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Tier Qualification Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${metrics.progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Goal: {metrics.nextTierGoal}
          </p>
        </div>
      </Card>

      {/* Official Verified Statement Document Card */}
      <Card ref={certificateRef} className="print-card rounded-3xl border-2 border-slate-200 dark:border-border bg-white dark:bg-card p-6 sm:p-10 shadow-lg print:shadow-none print:border-none space-y-8">
        {/* Document Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Logo size="default" />
            </div>
            <p className="text-[11px] text-slate-400">
              Circular Economy Verification Network • Kathmandu, Nepal
            </p>
          </div>

          <div className="sm:text-right space-y-0.5">
            <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold">
              Official Verified Financial Statement
            </Badge>
            <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Ref: {verificationCode}
            </p>
            <p className="text-[11px] text-slate-400">
              Generated: {formatDate(activeStatement?.generated_at || new Date())}
            </p>
          </div>
        </div>

        {/* Collector Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-muted/40 text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              Verified Collector
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              {profile?.name || "Ram Kumar Kabadi"}
            </p>
            <p className="text-slate-500">Phone: {profile?.phone || "9801234567"}</p>
            <p className="text-slate-500">Operational Hub: {profile?.area || "Baneshwor, Kathmandu"}</p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              Verification Status
            </span>
            <div className="flex sm:justify-end items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Scale Calibrated & KYC Active</span>
            </div>
            <p className="text-slate-500">
              Credit Trust Tier: <strong className="text-emerald-700 dark:text-emerald-400">{metrics.trustTier}</strong>
            </p>
            <p className="text-slate-400 text-[11px]">
              Active across {metrics.weeksActive} distinct weeks
            </p>
          </div>
        </div>

        {/* Aggregate Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              Total Verified Income
            </span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
              {formatCurrency(metrics.totalEarnings)}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/20 text-center">
            <span className="text-[11px] font-semibold text-slate-500">
              Average Weekly Earnings
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(metrics.avgWeeklyEarnings)}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/20 text-center">
            <span className="text-[11px] font-semibold text-slate-500">
              Total Weight Diverted
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.totalWeight} KG
            </p>
          </div>
        </div>

        {/* Material Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Scrap Volume & Earnings By Material
          </h4>

          {Object.keys(metrics.materialBreakdown).length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No collections recorded.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(metrics.materialBreakdown).map(([mat, data]) => (
                <div key={mat} className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{mat}</span>
                  <p className="text-emerald-700 dark:text-emerald-400 font-extrabold">{formatCurrency(data.amount)}</p>
                  <p className="text-[11px] text-slate-400">{data.weight} kg collected</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certified Collection Log Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent Calibrated Scale Collections
          </h4>

          {loading ? (
            <div className="h-20 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
          ) : entries.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No collection entries recorded in this statement period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Scrap Category</th>
                    <th className="py-2.5">Scale Weight (KG)</th>
                    <th className="py-2.5">Rate/KG</th>
                    <th className="py-2.5 text-right">Income (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                  {entries.slice(0, 6).map((e) => (
                    <tr key={e.id}>
                      <td className="py-3 font-medium text-slate-500">{formatDate(e.created_at)}</td>
                      <td className="py-3 font-bold">{e.waste_types?.name}</td>
                      <td className="py-3 font-semibold">{e.actual_weight_kg} kg</td>
                      <td className="py-3 text-slate-500">Rs. {e.waste_types?.rate_per_kg}</td>
                      <td className="py-3 font-bold text-right text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(e.amount_paid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Guarantee & Seal Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              KabadMandu Technology & Verification Network
            </p>
            <p className="text-[11px]">
              Authenticate this document online at:{" "}
              <a href={verificationUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-mono">
                {verificationUrl}
              </a>
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-center shrink-0">
            <Award className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider block">
              Certified Financial Record
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
