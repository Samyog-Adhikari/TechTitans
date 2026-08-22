import React from "react"
import { Loader2 } from "lucide-react"

export default function LoadingState({ message = "Loading KabadMandu..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in-50 duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <Loader2 className="w-6 h-6 text-emerald-600 animate-pulse absolute" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground tracking-wide">
        {message}
      </p>
    </div>
  )
}
