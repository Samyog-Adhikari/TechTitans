import React from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/hooks/useAuth"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import AppRoutes from "@/routes"

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
