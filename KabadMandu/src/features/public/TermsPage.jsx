import React from "react"
import { Scale, ShieldAlert, Award, FileText, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "@/lib/LanguageContext"

export default function TermsPage() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-8 animate-in fade-in-50">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("common.back", "Back to Home")}</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-emerald-600 shrink-0" />
          {t("legal.termsTitle", "Terms of Service")}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-2">
          {t("legal.lastUpdated", "Last Updated: August 2026")}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
        <p>
          {t("legal.termsIntro", "Welcome to KabadMandu. By accessing our platform or requesting our doorstep scrap collection services, you agree to comply with the following Terms of Service.")}
        </p>

        {/* Section 1 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            1. {t("legal.termsS1Title", "Service Request Requirements")}
          </h3>
          <p>
            {t("legal.termsS1Desc", "Households must provide accurate location and contact data. Scrap must be sorted and free from hazardous materials, liquid wastes, or illegal items. KabadMandu reserves the right to reject any collection request at doorstep.")}
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            2. {t("legal.termsS2Title", "Weighing and Fair Payouts")}
          </h3>
          <p>
            {t("legal.termsS2Desc", "All transactions are weighed using calibrated digital scales in front of you. Payout rates correspond to the live Kathmandu market values shown on our app at the time of pickup. Once cash/digital transfer is confirmed, ownership of scrap transfers to KabadMandu.")}
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            3. {t("legal.termsS3Title", "Verified Ledger Entries")}
          </h3>
          <p>
            {t("legal.termsS3Desc", "Our collectors record all transaction values in a shared ledger. These entries are used to produce certified income statements. Tampering, fraud, or misrepresentation will result in immediate ban and cancellation of statements.")}
          </p>
        </div>
      </div>
    </div>
  )
}
