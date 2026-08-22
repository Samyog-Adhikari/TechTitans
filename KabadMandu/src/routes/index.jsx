import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import PublicLayout from "@/components/shared/PublicLayout"
import AppLayout from "@/components/shared/AppLayout"

// Public feature pages
import LandingPage from "@/features/landing/LandingPage"
import AboutPage from "@/features/about/AboutPage"
import ServicesPage from "@/features/services/ServicesPage"
import ContactPage from "@/features/contact/ContactPage"
import RatesPage from "@/features/rates/RatesPage"
import SignInPage from "@/features/auth/SignInPage"
import SignUpPage from "@/features/auth/SignUpPage"
import VerifyStatementPage from "@/features/public/VerifyStatementPage"
import PrivacyPage from "@/features/public/PrivacyPage"
import TermsPage from "@/features/public/TermsPage"
import LicensePage from "@/features/public/LicensePage"

// Household portal pages
import HouseholdDashboard from "@/features/household/HouseholdDashboard"
import BookPickupPage from "@/features/household/BookPickupPage"
import BookingHistoryPage from "@/features/household/BookingHistoryPage"
import HouseholdComplaintPage from "@/features/household/HouseholdComplaintPage"

// Collector portal pages
import CollectorDashboard from "@/features/collector/CollectorDashboard"
import CollectorJobsPage from "@/features/collector/CollectorJobsPage"
import CollectorLedgerPage from "@/features/collector/CollectorLedgerPage"
import IncomeStatementPage from "@/features/collector/IncomeStatementPage"
import CollectorComplaintPage from "@/features/collector/CollectorComplaintPage"

// Admin portal pages
import AdminDashboard from "@/features/admin/AdminDashboard"
import AdminRatesPage from "@/features/admin/AdminRatesPage"
import AdminCollectorsPage from "@/features/admin/AdminCollectorsPage"
import AdminHouseholdsPage from "@/features/admin/AdminHouseholdsPage"
import AdminComplaintsPage from "@/features/admin/AdminComplaintsPage"
import AdminVerifyPage from "@/features/admin/AdminVerifyPage"
import AdminNotificationsPage from "@/features/admin/AdminNotificationsPage"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages wrapped in PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify" element={<VerifyStatementPage />} />
        <Route path="/verify/:code" element={<VerifyStatementPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/license" element={<LicensePage />} />
      </Route>

      {/* Household Portal (AppLayout Sidebar) */}
      <Route
        path="/household"
        element={
          <ProtectedRoute allowedRoles={["household"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HouseholdDashboard />} />
        <Route path="book" element={<BookPickupPage />} />
        <Route path="history" element={<BookingHistoryPage />} />
        <Route path="complaint" element={<HouseholdComplaintPage />} />
        <Route path="rates" element={<RatesPage />} />
      </Route>

      {/* Collector Portal (AppLayout Sidebar) */}
      <Route
        path="/collector"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CollectorDashboard />} />
        <Route path="jobs" element={<CollectorJobsPage />} />
        <Route path="ledger" element={<CollectorLedgerPage />} />
        <Route path="statement" element={<IncomeStatementPage />} />
        <Route path="complaint" element={<CollectorComplaintPage />} />
        <Route path="rates" element={<RatesPage />} />
      </Route>

      {/* Admin Portal (AppLayout Sidebar) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="rates" element={<AdminRatesPage />} />
        <Route path="collectors" element={<AdminCollectorsPage />} />
        <Route path="households" element={<AdminHouseholdsPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="verify" element={<AdminVerifyPage />} />
        <Route path="verify/:code" element={<AdminVerifyPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
