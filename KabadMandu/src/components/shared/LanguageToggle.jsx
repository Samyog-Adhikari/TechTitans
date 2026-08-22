import React from "react"
import { useLanguage } from "@/lib/LanguageContext"
import { Globe } from "lucide-react"

export default function LanguageToggle({ className = "" }) {
  const { language, setLanguage } = useLanguage()

  const toggle = () => {
    setLanguage(language === "en" ? "ne" : "en")
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-muted/40 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted/80 transition-all duration-200 text-xs font-semibold hover:scale-105 active:scale-95 ${className}`}
      title={language === "en" ? "नेपालीमा स्विच गर्नुहोस्" : "Switch to English"}
      aria-label={language === "en" ? "Switch to Nepali" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">
        {language === "en" ? "नेपाली" : "EN"}
      </span>
    </button>
  )
}
