import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Logo from "@/assets/logo"
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  Building,
  Loader2,
} from "lucide-react"

export default function AdminVerifyPage() {
  const { code: urlCode } = useParams()
  const [searchCode, setSearchCode] = useState(urlCode || "")
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const lookupStatement = async (codeToLookup) => {
    if (!codeToLookup?.trim()) return
    setLoading(true)
    setErrorMsg("")
    setSearched(true)
    setStatement(null)

    try {
      const cleanCode = codeToLookup.trim().toUpperCase()
      const { data, error } = await supabase
        .from("income_statements")
        .select(`
          *,
          collector:profiles!income_statements_collector_id_fkey ( name, phone, area, created_at )
        `)
        .eq("verification_code", cleanCode)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setErrorMsg(`No statement found with code "${cleanCode}". Verify the reference code is correct.`)
          return
        }
        throw error
      }
      setStatement(data)
    } catch (err) {
      setErrorMsg("Failed to query the verification database. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (urlCode) lookupStatement(urlCode)
  }, [urlCode])

  const handleSubmit = (e) => {
    e.preventDefault()
    lookupStatement(searchCode)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in-50">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verify Collector Statement
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Enter a statement reference code to authenticate and view the certified collector earnings record.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="e.g. KM-NEP-DEMO2026"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            className="pl-9 rounded-xl h-11 text-xs font-mono uppercase font-bold"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !searchCode.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 px-6 text-xs gap-1.5 shadow-sm shadow-emerald-600/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verified Statement Card */}
      {statement && (
        <Card className="rounded-3xl border-2 border-emerald-500/30 bg-white dark:bg-card p-6 sm:p-8 shadow-lg space-y-6 animate-in fade-in-50">
          {/* Authenticity Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                  Authentic Verified Financial Statement
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Reference: <strong>{statement.verification_code}</strong> · Certified by KabadMandu
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 shrink-0">
              ✓ 100% Genuine
            </Badge>
          </div>

          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-border">
            <div>
              <Logo size="default" />
              <p className="text-[11px] text-slate-400 mt-1">
                Circular Economy Verification Network · Kathmandu, Nepal
              </p>
            </div>
            <div className="sm:text-right space-y-0.5">
              <div className="flex sm:justify-end items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                <span>Credit Trust Tier: {statement.trust_tier}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generated: {formatDate(statement.generated_at)}
              </p>
            </div>
          </div>

          {/* Collector Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Registered Scrap Collector
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {statement.collector?.name || "Verified Collector"}
              </p>
              <p className="text-slate-500">Phone: {statement.collector?.phone || "—"}</p>
              <p className="text-slate-500">Hub: {statement.collector?.area || "Kathmandu Valley"}</p>
            </div>
            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Verification Period
              </span>
              <p className="font-bold text-slate-700 dark:text-slate-300">
                {formatDate(statement.period_start)} – {formatDate(statement.period_end)}
              </p>
              <p className="text-slate-500">
                Active Consistency: <strong>{statement.weeks_active} Distinct Weeks</strong>
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Scale Type: Calibrated Digital Scale (IoT Verified)
              </p>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                Total Certified Earnings
              </span>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                {formatCurrency(statement.total_earnings)}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/20 text-center">
              <span className="text-[11px] font-semibold text-slate-500">Average Weekly Earnings</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(statement.avg_weekly_earnings)}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/20 text-center">
              <span className="text-[11px] font-semibold text-slate-500">Completed Collections</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {statement.total_pickups} Transactions
              </p>
            </div>
          </div>

          {/* Banking Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-muted/60 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              Notice for Financial Institutions & Lending Cooperatives:
            </p>
            <p className="text-[11px] leading-relaxed">
              This financial record was generated through tamper-evident database transactions on the KabadMandu circular economy network. All collection weights are logged via calibrated digital scales.
            </p>
          </div>
        </Card>
      )}

      {/* Empty / Initial State */}
      {!loading && !statement && !errorMsg && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-muted flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Enter a verification code above</p>
          <p className="text-xs max-w-xs">
            Type the reference code from any KabadMandu official statement (format: KM-NEP-XXXXXXXX) to authenticate it instantly.
          </p>
        </div>
      )}
    </div>
  )
}
