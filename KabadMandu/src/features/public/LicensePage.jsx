import React from "react"
import { FileText, Heart, Shield, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "@/lib/LanguageContext"

export default function LicensePage() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-8 animate-in fade-in-50">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("common.back", "Back to Home")}</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
          {t("legal.licenseTitle", "Software License")}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-2">
          {t("legal.lastUpdated", "Last Updated: August 2026")}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
        <p>
          {t("legal.licenseIntro", "KabadMandu software is proprietary. Below is the end-user software license agreement under which this platform is distributed.")}
        </p>

        {/* MIT style clean text */}
        <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] sm:text-xs leading-relaxed space-y-4 shadow-inner border border-slate-800">
          <p className="font-bold border-b border-slate-800 pb-2 text-emerald-400">
            PROPRIETARY SOFTWARE LICENSE AGREEMENT
          </p>
          <p>
            Copyright (c) 2026 Tech Titans Team. All rights reserved.
          </p>
          <p>
            Permission is hereby granted, free of charge, to any registered user of KabadMandu to run and access the application interface for personal scrap management.
          </p>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-muted/30 border border-slate-200/80 dark:border-border rounded-2xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            {t("legal.licenseS1Title", "Restrictions")}
          </h3>
          <p>
            {t("legal.licenseS1Desc", "You may not reverse-engineer, decompile, copy, modify, distribute, or create derivative works based on KabadMandu core source files, database schemas, or branding components without explicit written authorization from the copyright holders.")}
          </p>
        </div>
      </div>
    </div>
  )
}
