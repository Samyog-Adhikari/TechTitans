import React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2">
            An unexpected error occurred while rendering this page:
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-muted text-xs font-mono text-slate-700 dark:text-slate-300 max-w-lg overflow-x-auto text-left">
            {this.state.error?.message || "Unknown error"}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={this.handleReload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 px-5 gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </Button>
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="rounded-xl text-xs h-10 px-5 gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
