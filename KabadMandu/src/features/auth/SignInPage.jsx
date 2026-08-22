import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle, Loader2, ArrowRight, Shield, Home, Truck } from "lucide-react"

export default function SignInPage() {
  const { signIn, role: currentRole, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && currentRole) {
      if (currentRole === "admin") navigate("/admin", { replace: true })
      else if (currentRole === "collector") navigate("/collector", { replace: true })
      else if (currentRole === "household") navigate("/household", { replace: true })
    }
  }, [user, currentRole, navigate])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await signIn({ email: email.trim(), password })
      const userRole = data.user?.user_metadata?.role || "household"

      // Role-based redirection per AGENT.md Phase 2 definition of done
      if (userRole === "admin") {
        navigate("/admin", { replace: true })
      } else if (userRole === "collector") {
        navigate("/collector", { replace: true })
      } else {
        navigate("/household", { replace: true })
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err.message || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Card className="rounded-2xl border-slate-200/80 dark:border-border shadow-lg bg-white dark:bg-card">
          <CardHeader className="space-y-1.5 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              Sign in to your KabadMandu account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@kabadmandu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                </div>
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
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Accounts Helper per AGENT.md Rule 11 */}
            <div className="pt-4 border-t border-slate-100 dark:border-border/60">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
                Quick Demo Accounts (Rule 11)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo("household@kabadmandu.com", "Household@12345")}
                  className="text-[11px] h-8 rounded-lg px-2 gap-1 border-slate-200 dark:border-slate-800"
                >
                  <Home className="w-3 h-3 text-emerald-600 shrink-0" />
                  Household
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo("collector@kabadmandu.com", "Collector@12345")}
                  className="text-[11px] h-8 rounded-lg px-2 gap-1 border-slate-200 dark:border-slate-800"
                >
                  <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                  Collector
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo("admin@kabadmandu.com", "Admin@12345")}
                  className="text-[11px] h-8 rounded-lg px-2 gap-1 border-slate-200 dark:border-slate-800"
                >
                  <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 text-xs text-slate-500 border-t border-slate-50 dark:border-border/40">
            <p>
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
