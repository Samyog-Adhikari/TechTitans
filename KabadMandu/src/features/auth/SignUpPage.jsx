import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  Home,
  Truck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react"

export default function SignUpPage() {
  const { signUp, role: currentRole, user } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState("household") // "household" | "collector"
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [area, setArea] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && currentRole) {
      if (currentRole === "admin") navigate("/admin", { replace: true })
      else if (currentRole === "collector") navigate("/collector", { replace: true })
      else if (currentRole === "household") navigate("/household", { replace: true })
    }
  }, [user, currentRole, navigate])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }
    if (!phone.trim()) {
      setError("Please enter your contact phone number.")
      return
    }
    if (!area.trim()) {
      setError("Please enter your location/area in Kathmandu Valley.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)

    try {
      await signUp({
        email: email.trim(),
        password,
        role,
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
      })

      // Role-based redirection upon successful signup
      if (role === "collector") {
        navigate("/collector", { replace: true })
      } else {
        navigate("/household", { replace: true })
      }
    } catch (err) {
      console.error("Sign up error:", err)
      setError(err.message || "Failed to create account. Please check your details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Card className="rounded-2xl border-slate-200/80 dark:border-border shadow-lg bg-white dark:bg-card">
          <CardHeader className="space-y-1.5 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              Join KabadMandu to book scrap pickups or start earning as a verified collector
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Role Selection (Household vs Collector) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                I am signing up as:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Household option */}
                <button
                  type="button"
                  onClick={() => setRole("household")}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all relative ${
                    role === "household"
                      ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-600"
                      : "border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-card/80 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`p-2 rounded-lg ${role === "household" ? "bg-emerald-600 text-white" : "bg-muted text-slate-600"}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    {role === "household" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Household</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Sell scrap from home/office</span>
                </button>

                {/* Collector option */}
                <button
                  type="button"
                  onClick={() => setRole("collector")}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all relative ${
                    role === "collector"
                      ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-600"
                      : "border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-card/80 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`p-2 rounded-lg ${role === "collector" ? "bg-emerald-600 text-white" : "bg-muted text-slate-600"}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    {role === "collector" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Collector</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Collect scrap & verify income</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Ramesh Shrestha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    required
                    placeholder="e.g. 9841234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="area" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Area / Location in Kathmandu Valley
                </Label>
                <Input
                  id="area"
                  required
                  placeholder="e.g. Patan, Lalitpur (or Baneshwor, Thamel, etc.)"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password (min. 6 characters)
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-10 text-sm shadow-md shadow-emerald-600/20 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign Up as {role === "household" ? "Household" : "Collector"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 text-xs text-slate-500 border-t border-slate-50 dark:border-border/40">
            <p>
              Already have an account?{" "}
              <Link to="/signin" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
