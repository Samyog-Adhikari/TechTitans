import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("kabadmandu-theme") || "system"
    } catch {
      return "system"
    }
  })

  const [resolvedTheme, setResolvedTheme] = useState("light")

  // Resolve system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const resolve = () => {
      const resolved = theme === "system"
        ? (mediaQuery.matches ? "dark" : "light")
        : theme
      setResolvedTheme(resolved)

      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(resolved)
    }

    resolve()
    mediaQuery.addEventListener("change", resolve)
    return () => mediaQuery.removeEventListener("change", resolve)
  }, [theme])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem("kabadmandu-theme", newTheme)
    } catch {}
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
