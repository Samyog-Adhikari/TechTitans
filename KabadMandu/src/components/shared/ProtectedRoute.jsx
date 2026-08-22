import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import LoadingState from "@/components/shared/LoadingState"

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  // Wait until both user and role have finished resolving
  if (loading || (user && !role)) {
    return <LoadingState message="Verifying session and permissions..." />
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />
    if (role === "collector") return <Navigate to="/collector" replace />
    if (role === "household") return <Navigate to="/household" replace />
    return <Navigate to="/signin" replace />
  }

  return children
}
