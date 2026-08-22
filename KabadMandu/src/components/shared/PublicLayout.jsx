import React from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Logo from "@/assets/logo"
import { useAuth } from "@/hooks/useAuth"
import ThemeToggle from "@/components/shared/ThemeToggle"
import LanguageToggle from "@/components/shared/LanguageToggle"
import { useLanguage } from "@/lib/LanguageContext"
import {
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react"

export default function PublicLayout({ children }) {
  const { user, role, signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const getDashboardRoute = () => {
    if (role === "admin") return "/admin"
    if (role === "collector") return "/collector"
    if (role === "household") return "/household"
    return "/"
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
      isActive ? "text-emerald-700 font-semibold" : "text-slate-700 dark:text-slate-300"
    }`

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Floating / Sticky Capsule Navbar */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-slate-200/80 dark:border-border/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 py-1">
            <Logo size="default" />
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" className={navLinkClass}>
              {t("nav.home", "Home")}
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              {t("nav.about", "About")}
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              {t("nav.services", "Services")}
            </NavLink>
            <NavLink to="/rates" className={navLinkClass}>
              {t("nav.rates", "Rates")}
            </NavLink>
            <NavLink to="/verify" className={navLinkClass}>
              {t("nav.verify", "Verify Statement")}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t("nav.contact", "Contact")}
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme & Language Toggles */}
            <LanguageToggle />
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5">
                <Button
                  onClick={() => navigate(getDashboardRoute())}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 text-xs font-semibold shadow-sm"
                >
                  {t("nav.goToPortal", "Go to Portal")}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="rounded-full text-xs text-muted-foreground"
                >
                  {t("nav.signOut", "Sign Out")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs sm:text-sm font-medium rounded-full px-3 text-slate-700 dark:text-slate-300"
                >
                  <Link to="/signin">{t("nav.signIn", "Sign in")}</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-5 text-xs sm:text-sm shadow-sm shadow-emerald-600/20"
                >
                  <Link to="/signup">{t("nav.signUp", "Book a pickup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* High-Impact Dark Green Footer */}
      <footer className="bg-[#042014] text-slate-200 pt-16 pb-12 px-6 sm:px-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/50">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <Logo isDark={true} size="default" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                KabadMandu is Nepal's doorstep scrap-collection service. We turn the things you no longer need into cash for you — and a cleaner Kathmandu for everyone.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp: +977 9801234567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>hello@kabadmandu.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kupondole, Lalitpur, Nepal</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-3">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Platform links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Book a pickup</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/rates" className="hover:text-white transition-colors">Live Rates</Link></li>
                <li><Link to="/verify" className="hover:text-white transition-colors">Verify Statement</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Collector Portal</Link></li>
              </ul>
            </div>

            {/* Company links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Our mission</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Legal links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: KabadMandu protects all user and transaction data.") }} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Transparent pricing and cash on collection.") }} className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#license" onClick={(e) => { e.preventDefault(); alert("KabadMandu Circular Economy Initiative Nepal") }} className="hover:text-white transition-colors">Software License</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} KabadMandu Pvt. Ltd. All rights reserved.</p>
            <p className="font-medium text-slate-300">
              Made By <span className="text-emerald-400 font-bold tracking-wide">TechTitans</span>
            </p>
            
            {/* Styled buttons for Sign in and Register in footer */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="h-7 text-xs px-3 rounded-full border-emerald-800/80 bg-emerald-950/60 text-slate-300 hover:text-white hover:bg-emerald-900/60"
              >
                <Link to="/signin" className="flex items-center gap-1">
                  <LogIn className="w-3 h-3 text-emerald-400" />
                  Sign In
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="h-7 text-xs px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <Link to="/signup" className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Register
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
