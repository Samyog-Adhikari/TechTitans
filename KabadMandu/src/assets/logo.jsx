import React from "react"
import logoImg from "@/assets/logo-full.png"

export default function Logo({ className = "", size = "default", showText = false }) {
  const sizeClasses = {
    sm: "h-10 sm:h-12",
    default: "h-14 sm:h-16",
    lg: "h-20 sm:h-24",
  }

  const heightClass = sizeClasses[size] || sizeClasses.default

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoImg}
        alt="KabadMandu"
        className={`${heightClass} w-auto object-contain transition-transform duration-200 hover:scale-105 shrink-0`}
      />
    </div>
  )
}
