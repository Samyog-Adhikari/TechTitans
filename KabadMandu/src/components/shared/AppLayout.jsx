import React, { useState } from "react"
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Logo from "@/assets/logo"
import {
  LayoutDashboard,
  CalendarPlus,
  Clock,
  AlertTriangle,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  MessageSquare,
  History,
  User,
  Briefcase,
  FileCheck2,
  DollarSign,
  Settings,
  Shield,
  Home,
  Truck,
  Inbox,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react"

export default function AppLayout({ children }) {
  const { user, profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSignOut = async () => {
    await signOut()
    navigate("/", { replace: true })
  }

  // Get grouped sidebar navigation
  const getNavSections = () => {
    if (role === "admin") {
      return [
        {
          title: "Main Menu",
          links: [
            { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
            { label: "Manage Rates & Types", to: "/admin/rates", icon: TrendingUp },
            { label: "Collector Accounts", to: "/admin/collectors", icon: Truck },
            { label: "Household Accounts", to: "/admin/households", icon: Home },
          ],
        },
        {
          title: "Inbox & Support",
          links: [
            { label: "Complaints Inbox", to: "/admin/complaints", icon: Inbox },
            { label: "Verify Statement", to: "/admin/verify", icon: ShieldCheck },
          ],
        },
      ]
    }
    if (role === "collector") {
      return [
        {
          title: "Main Menu",
          links: [
            { label: "Dashboard", to: "/collector", icon: LayoutDashboard, end: true },
            { label: "Available Jobs", to: "/collector/jobs", icon: Briefcase },
            { label: "Income Ledger", to: "/collector/ledger", icon: DollarSign },
            { label: "Verified Statement", to: "/collector/statement", icon: FileCheck2 },
          ],
        },
        {
          title: "Market & Help",
          links: [
            { label: "Live Scrap Rates", to: "/collector/rates", icon: TrendingUp },
            { label: "Submit Issue", to: "/collector/complaint", icon: AlertTriangle },
          ],
        },
      ]
    }
    // Default: Household
    return [
      {
        title: "Main Menu",
        links: [
          { label: "Dashboard", to: "/household", icon: LayoutDashboard, end: true },
          { label: "Book a Pickup", to: "/household/book", icon: CalendarPlus },
          { label: "Booking History", to: "/household/history", icon: Clock },
        ],
      },
      {
        title: "Market & Support",
        links: [
          { label: "Today's Scrap Rates", to: "/household/rates", icon: TrendingUp },
          { label: "Submit Complaint", to: "/household/complaint", icon: AlertTriangle },
        ],
      },
    ]
  }

  const navSections = getNavSections()

  const getRoleBadge = () => {
    if (role === "admin") return <Badge variant="destructive" className="text-[10px] uppercase font-bold">Admin Portal</Badge>
    if (role === "collector") return <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[10px] uppercase font-bold">Collector Portal</Badge>
    return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] uppercase font-bold">Household Portal</Badge>
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes("/book")) return "Book a Scrap Pickup"
    if (path.includes("/history")) return "Booking History"
    if (path.includes("/complaint")) return "Submit a Complaint"
    if (path.includes("/rates")) return "Today's Scrap Rates & Calculator"
    if (path.includes("/jobs")) return "Available Jobs"
    if (path.includes("/ledger")) return "Income Ledger"
    if (path.includes("/statement")) return "Income Statement"
    if (path.includes("/collectors")) return "Collector Accounts"
    if (path.includes("/households")) return "Household Accounts"
    if (path.includes("/complaints")) return "Complaints Inbox"
    return "Dashboard & Analytics"
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Modern Fixed Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-card border-r border-slate-200/80 dark:border-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Brand Header */}
          <div className="p-5 border-b border-slate-100 dark:border-border/60">
            <div className="flex items-center justify-between">
              <Link to={role === "collector" ? "/collector" : role === "admin" ? "/admin" : "/household"} className="flex items-center gap-2">
                <Logo size="default" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean Role & Area Display */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <div>{getRoleBadge()}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{profile?.area || "Kathmandu Valley"}</span>
              </div>
            </div>
          </div>

          {/* Search Box in Sidebar */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search portal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-muted/40 border-slate-200/80 dark:border-border rounded-lg"
              />
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <div className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </span>
                <div className="space-y-0.5 pt-1">
                  {section.links.map((link) => {
                    const Icon = link.icon
                    const isActive = link.end
                      ? location.pathname === link.to
                      : location.pathname.startsWith(link.to)

                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs border border-emerald-200/60 dark:border-emerald-800"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted/60 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                        <span>{link.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Pill Card */}
        <div className="p-3 border-t border-slate-100 dark:border-border/60 bg-slate-50/60 dark:bg-card">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-muted/40 border border-slate-200/70 dark:border-border shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-emerald-500/20">
                {(profile?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.name || "KabadMandu User"}
                </span>
                <span className="text-[10px] text-slate-400 truncate capitalize">
                  {role || "Household"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="w-7 h-7 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Layout Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right: Quick actions, notifications, user */}
          <div className="flex items-center gap-3">
            {role === "household" && (
              <Button
                size="sm"
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 text-xs font-bold shadow-xs h-8 gap-1"
              >
                <Link to="/household/book">
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Book a Pickup</span>
                </Link>
              </Button>
            )}

            {role === "collector" && (
              <Button
                size="sm"
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 text-xs font-bold shadow-xs h-8 gap-1"
              >
                <Link to="/collector/jobs">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Find Jobs</span>
                </Link>
              </Button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => alert("No new notifications at this time.")}
              className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-muted"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {/* Small Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-muted border border-slate-200 dark:border-border flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
              {(profile?.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
