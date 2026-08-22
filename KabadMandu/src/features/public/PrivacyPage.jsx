import React from "react"
import { Shield, Eye, Lock, FileText, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/LanguageContext"

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-8 animate-in fade-in-50">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("common.back", "Back to Home")}</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600 shrink-0" />
          {t("legal.privacyTitle", "Privacy Policy")}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-2">
          {t("legal.lastUpdated", "Last Updated: August 2026")}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
        <p>
          {t("legal.privacyIntro", "At KabadMandu, your privacy is our priority. This policy outlines how we collect, store, protect, and use your data when you use our doorstep scrap collection platform.")}
        </p>

        {/* Section 1 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            1. {t("legal.privacyS1Title", "Information We Collect")}
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>{t("legal.privacyS1Item1Title", "Personal Information:")}</strong> {t("legal.privacyS1Item1Desc", "Name, contact phone number, email address, and location details for pickup scheduling.")}</li>
            <li><strong>{t("legal.privacyS1Item2Title", "Transaction Details:")}</strong> {t("legal.privacyS1Item2Desc", "Logs of scrap items weighed, category parameters, and actual payouts transferred.")}</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            2. {t("legal.privacyS2Title", "How We Protect Your Data")}
          </h3>
          <p>
            {t("legal.privacyS2Desc", "We secure your transaction logs inside encrypted cloud database hubs (Supabase) under strict Row Level Security (RLS) policies. Only authenticated administrators and you can access your personal profiles and transaction history.")}
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            3. {t("legal.privacyS3Title", "Data Retention & Sharing")}
          </h3>
          <p>
            {t("legal.privacyS3Desc", "Your collection ledgers are retained to compile verified income statements. We do not sell your personal data to third parties. Sharing only occurs with local KabadMandu Saathi partners to successfully perform doorstep pickup routing.")}
          </p>
        </div>
      </div>
    </div>
  )
}
