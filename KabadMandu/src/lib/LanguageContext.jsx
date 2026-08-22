import React, { createContext, useContext, useState, useCallback } from "react"

// Static imports — Vite bundles these at build time, language switch is instant
import enDict from "./i18n/en.json"
import neDict from "./i18n/ne.json"

const DICTS = { en: enDict, ne: neDict }

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
})

const MATERIAL_TRANSLATIONS = {
  "Copy / Notebooks": "कापी / नोटबुक",
  "A4 / White Paper": "A4 / सेतो कागज",
  "Books & Magazines": "किताब र पत्रिकाहरू",
  "Cardboard": "कार्टुन बोर्ड",
  "Carton": "कार्टुन",
  "Confidential Documents": "गोपनीय कागजातहरू",
  "Magazines": "पत्रिकाहरू",
  "Shredded Paper": "टुक्रा पारिएको कागज",
  "Invitation Cards": "निमन्त्रणा कार्डहरू",
  "Egg Crates": "अण्डाको क्रेट",
  "Copper": "तामा",
  "Brass": "पित्तल",
  "Aluminium": "एल्युमिनियम",
  "Steel / Iron": "इस्पात / फलाम",
  "Tin & Cans": "टिन र क्यानहरू",
  "PET Bottles": "PET बोतलहरू",
  "Hard Plastic": "हार्ड प्लास्टिक",
  "Mixed Plastic": "मिश्रित प्लास्टिक",
  "Computer / CPU": "कम्प्युटर / CPU",
  "Laptop": "ल्यापटप",
  "Mobile Phone": "मोबाइल फोन",
  "Television": "टेलिभिजन",
  "Cables & Chargers": "केबल र चार्जरहरू",
  "Printer / Small Electronics": "प्रिन्टर / साना इलेक्ट्रोनिक्स",
  "Glass Bottles / Jars": "काँचको बोतल / जार",
  "Beer Bottle": "बियरको बोतल",
  "Stainless Steel Utensils": "स्टेनलेस स्टील भाँडाहरू",
  "Aluminium Utensils": "एल्युमिनियम भाँडाहरू",
  "Old Clothes / Textile": "पुराना कपडाहरू / कपडा",
  "Mattress": "डस्ना / म्याट्रेस",
  "Wooden Furniture Scrap": "काठको फर्निचर स्क्र्याप",
  "Tyres / Rubber": "टायर / रबर",
  "Car Battery (Lead-Acid)": "कार ब्याट्री (लिड-एसिड)",
  "Inverter Battery": "इन्भर्टर ब्याट्री",
  "Washing Machine": "वाशिङ मेसिन",
  "Refrigerator": "फ्रिज / रेफ्रिजरेटर",
  "Air Conditioner": "एसी / एयर कन्डिसनर",
  "Iron Rod / Rebar Scrap": "फलामे रड / डण्डी स्क्र्याप",
  "Wire Scrap (Copper-coated)": "तामाको लेप भएको तार",
  "Gas Cylinder (Empty)": "ग्यास सिलिन्डर (खाली)"
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("kabadmandu-lang") || "en"
    } catch {
      return "en"
    }
  })

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem("kabadmandu-lang", newLang)
    } catch {}
  }, [])

  const t = useCallback(
    (key, fallback) => {
      const dict = DICTS[language] || {}
      // Support dot-notation keys like "nav.home" → dict.nav.home
      const val = key
        .split(".")
        .reduce((obj, k) => (obj && typeof obj === "object" ? obj[k] : undefined), dict)
      return (typeof val === "string" ? val : undefined) || fallback || key
    },
    [language]
  )

  const t_material = useCallback(
    (name) => {
      if (language === "ne") {
        const cleanName = (name || "")
          .replace(/\s*\(per\s*piece\)/i, "")
          .replace(/\s*\(per\s*kg\)/i, "")
          .trim()
        return MATERIAL_TRANSLATIONS[cleanName] || cleanName
      }
      return name
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, t_material }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
