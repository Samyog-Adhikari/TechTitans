import React, { createContext, useContext, useState, useCallback } from "react"

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("kabadmandu-lang") || "en"
    } catch {
      return "en"
    }
  })

  // Lazy-load translation dictionaries
  const [dicts, setDicts] = useState({})

  const loadDict = useCallback(async (lang) => {
    if (dicts[lang]) return dicts[lang]
    try {
      const mod = await import(`./i18n/${lang}.json`)
      const dict = mod.default || mod
      setDicts((prev) => ({ ...prev, [lang]: dict }))
      return dict
    } catch {
      return {}
    }
  }, [dicts])

  // Load current language dict
  React.useEffect(() => {
    loadDict(language)
  }, [language, loadDict])

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem("kabadmandu-lang", newLang)
    } catch {}
  }, [])

  const t = useCallback(
    (key, fallback) => {
      const dict = dicts[language] || {}
      return dict[key] || fallback || key
    },
    [dicts, language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
