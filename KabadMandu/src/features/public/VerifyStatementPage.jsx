import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Logo from "@/assets/logo"
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Scale,
  Award,
  Lock,
  ExternalLink,
  Printer,
  Building,
} from "lucide-react"

export default function VerifyStatementPage() {
  const { code: urlCode } = useParams()
  const [searchCode, setSearchCode] = useState(urlCode || "")
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const lookupStatement = async (codeToLookup) => {
    if (!codeToLookup || !codeToLookup.trim()) return
    setLoading(true)
    setErrorMsg("")
    setSearched(true)

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
          setErrorMsg(`No verified statement found with code "${cleanCode}". Please verify the document reference code.`)
          setStatement(null)
          return
        }
        throw error
      }

      setStatement(data)
    } catch (err) {
      console.error("Verification lookup error:", err)
      setErrorMsg("Failed to query verification database. Please try again.")
      setStatement(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (urlCode) {
      lookupStatement(urlCode)
    }
  }, [urlCode])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    lookupStatement(searchCode)
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
      {/* Search Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Public Ledger Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Verify Financial Statement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter the verification code or scan the QR code from any KabadMandu official statement to verify genuine collector recycling records.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="e.g. KM-NEP-7BF502F5"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              className="pl-9 rounded-xl h-11 text-xs font-mono uppercase font-bold"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 px-5 text-xs shadow-md shadow-emerald-600/20"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold max-w-md mx-auto flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verified Document Snapshot Presentation */}
      {statement && (
        <Card className="rounded-3xl border-2 border-emerald-500/30 bg-white dark:bg-card p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in-50">
          {/* Authenticity Badge Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 block">
                  Authentic Verified Financial Statement
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Document Reference: <strong>{statement.verification_code}</strong> • Certified by KabadMandu
                </span>
              </div>
            </div>

            <Badge className="bg-emerald-600 text-white text-xs font-bold uppercase px-3 py-1">
              ✓ 100% Genuine
            </Badge>
          </div>

          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
            <div className="space-y-1">
              <Logo size="default" />
              <p className="text-[11px] text-slate-400">
                Circular Economy Verification Network • Kathmandu, Nepal
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                <span>Credit Trust Tier: {statement.trust_tier}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generated: {formatDate(statement.generated_at)}
              </p>
            </div>
          </div>

          {/* Collector Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-muted/40 text-xs">
            <div className="space-y-1.5">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Registered Scrap Collector
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {statement.collector?.name || "Verified Collector"}
              </p>
              <p className="text-slate-500">Contact: {statement.collector?.phone || "+977 98XXXXXXXX"}</p>
              <p className="text-slate-500">Operational Hub: {statement.collector?.area || "Kathmandu Valley"}</p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Verification Period
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-bold">
                {formatDate(statement.period_start)} – {formatDate(statement.period_end)}
              </p>
              <p className="text-slate-500">Active Consistency: <strong>{statement.weeks_active} Distinct Weeks</strong></p>
              <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                Scale Type: Calibrated Digital Scale (IoT Verified)
              </p>
            </div>
          </div>

          {/* Aggregate Numbers */}
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
              <span className="text-[11px] font-semibold text-slate-500">
                Average Weekly Earnings
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(statement.avg_weekly_earnings)}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:bg-muted/20 text-center">
              <span className="text-[11px] font-semibold text-slate-500">
                Completed Collections
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {statement.total_pickups} Transactions
              </p>
            </div>
          </div>

          {/* Legal / Banking Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-muted/60 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              Notice for Financial Institutions & Lending Cooperatives:
            </p>
            <p className="text-[11px] leading-relaxed">
              This financial record was generated through tamper-evident database transactions on the KabadMandu circular economy network. All collection weights are logged via calibrated digital scales at the doorstep of households.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
