import React, { useState, useEffect, useRef, useCallback } from "react"
import { Bell, BellRing, Check, CheckCheck, Info, Megaphone, AlertCircle, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"

// Notification type → icon + colour mapping
const TYPE_META = {
  info:    { Icon: Info,      color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/50" },
  alert:   { Icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/50" },
  success: { Icon: Check,     color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  promo:   { Icon: Megaphone, color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/50" },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return "just now"
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const fetchNotifications = useCallback(async () => {
    if (!user || !tableExists) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        // If table doesn't exist yet, silently hide feature
        if (error.message?.includes("relation") || error.code === "42P01") {
          setTableExists(false)
        }
        setNotifications([])
      } else {
        setNotifications(data || [])
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [user, tableExists])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!user || !tableExists) return
    const channel = supabase
      .channel("notifications-bell")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, tableExists])

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    await supabase.from("notifications").update({ read: true }).eq("id", id)
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const ids = notifications.filter((n) => !n.read).map((n) => n.id)
    if (ids.length) {
      await supabase.from("notifications").update({ read: true }).in("id", ids)
    }
  }

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await supabase.from("notifications").delete().eq("id", id)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // If table doesn't exist yet, show a simple placeholder bell
  if (!tableExists) {
    return (
      <button
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
        title="Notifications (not yet enabled)"
        onClick={() => {}}
      >
        <Bell className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-emerald-600 animate-[wiggle_0.5s_ease-in-out]" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-card text-[9px] font-bold text-white flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-border">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-border/50">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">You're all caught up!</p>
                <p className="text-[10px]">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.info
                const Icon = meta.Icon
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors cursor-pointer group ${!n.read ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""}`}
                    onClick={() => !n.read && markRead(n.id)}
                  >
                    <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold text-slate-900 dark:text-white truncate ${!n.read ? "font-bold" : ""}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
