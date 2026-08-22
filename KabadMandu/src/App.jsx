import React from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/hooks/useAuth"
import { ThemeProvider } from "@/lib/ThemeContext"
import { LanguageProvider } from "@/lib/LanguageContext"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import AppRoutes from "@/routes"

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
