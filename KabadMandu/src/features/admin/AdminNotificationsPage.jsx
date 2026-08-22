import React, { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send,
  Bell,
  Users,
  User,
  Home,
  Truck,
  Megaphone,
  Info,
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const TYPES = [
  { value: "info",    label: "Info",    Icon: Info,        color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
  { value: "success", label: "Success", Icon: Check,       color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
  { value: "alert",   label: "Alert",   Icon: AlertCircle, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  { value: "promo",   label: "Promo",   Icon: Megaphone,   color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
]

const AUDIENCE_OPTIONS = [
  { value: "all",       label: "Everyone",        desc: "All users",            Icon: Users },
  { value: "household", label: "Households only", desc: "All household members", Icon: Home },
  { value: "collector", label: "Collectors only", desc: "All collectors",        Icon: Truck },
  { value: "specific",  label: "Specific User",   desc: "Enter email below",     Icon: User },
]

const SQL_MIGRATION = `CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info','success','alert','promo')),
  audience TEXT NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all','household','collector','specific')),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own or global"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);

CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

CREATE POLICY "Users update own"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);

CREATE POLICY "Users delete own"
  ON public.notifications FOR DELETE
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);`

export default function AdminNotificationsPage() {
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [type, setType] = useState("info")
  const [audience, setAudience] = useState("all")
  const [specificEmail, setSpecificEmail] = useState("")

  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState("")
  const [error, setError] = useState("")
  const [tableExists, setTableExists] = useState(true)
  const [showSQL, setShowSQL] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 5000)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.")
      return
    }
    if (audience === "specific" && !specificEmail.trim()) {
      setError("Please enter a user email for specific notifications.")
      return
    }

    setSending(true)
    setError("")

    try {
      let recipientId = null

      if (audience === "specific") {
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, email")
          .limit(50)

        const match = profiles?.find(
          (p) => p.email?.toLowerCase() === specificEmail.trim().toLowerCase()
        )

        if (profileErr || !match) {
          setError(`No user found with email "${specificEmail}".`)
          setSending(false)
          return
        }
        recipientId = match.id
      }

      const payload = {
        title: title.trim(),
        body: body.trim(),
        type,
        audience,
        recipient_id: recipientId,
        created_by: user?.id,
        read: false,
      }

      const { error: insertErr } = await supabase
        .from("notifications")
        .insert(payload)

      if (insertErr) throw insertErr

      const audienceLabel =
        audience === "all" ? "all users" :
        audience === "specific" ? specificEmail :
        `all ${audience}s`

      showToast(`Notification sent to ${audienceLabel}!`)
      setTitle("")
      setBody("")
      setAudience("all")
      setSpecificEmail("")
    } catch (err) {
      if (err.message?.includes("relation") || err.code === "42P01") {
        setTableExists(false)
        setShowSQL(true)
        setError("Notifications table not found. Run the SQL migration shown below.")
      } else {
        setError(err.message || "Failed to send notification.")
      }
    } finally {
      setSending(false)
    }
  }

  const currentTypeMeta = TYPES.find((t) => t.value === type) || TYPES[0]
  const PreviewIcon = currentTypeMeta.Icon

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Bell className="w-7 h-7 text-emerald-600" />
          Send Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compose and broadcast messages to users, roles, or specific accounts.
        </p>
      </div>

      {/* SQL Migration Panel */}
      {showSQL && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-2">
          <p className="font-bold">⚠️ Notifications table not set up yet</p>
          <p>Run the SQL below in your Supabase dashboard → SQL Editor to enable this feature:</p>
          <pre className="mt-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap text-amber-900 dark:text-amber-200 leading-relaxed">
            {SQL_MIGRATION}
          </pre>
          <button
            onClick={() => navigator.clipboard?.writeText(SQL_MIGRATION)}
            className="text-[10px] underline text-amber-700 dark:text-amber-400 hover:opacity-80"
          >
            Copy SQL to clipboard
          </button>
        </div>
      )}

      {/* Feedback */}
      {toast && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}
      {error && !showSQL && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Compose Card */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSend} className="space-y-6">

            {/* Audience Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Send To
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCE_OPTIONS.map((opt) => {
                  const Icon = opt.Icon
                  const selected = audience === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAudience(opt.value)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50"
                          : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-muted/20"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${selected ? "text-emerald-600" : "text-slate-400"}`} />
                      <div>
                        <p className={`text-xs font-bold ${selected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Specific user email */}
            {audience === "specific" && (
              <div className="space-y-1.5">
                <Label htmlFor="specific-email" className="text-xs font-semibold">
                  User Email
                </Label>
                <Input
                  id="specific-email"
                  type="email"
                  placeholder="user@example.com"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                  required
                />
              </div>
            )}

            {/* Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Type
              </Label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const Icon = t.Icon
                  const selected = type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        selected
                          ? `${t.bg} ${t.color} border-current`
                          : "border-slate-200 dark:border-border text-slate-500 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-title" className="text-xs font-semibold">
                Title
              </Label>
              <Input
                id="notif-title"
                required
                placeholder="e.g. New rates effective from Monday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl h-10 text-sm"
                maxLength={120}
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-body" className="text-xs font-semibold">
                Message
              </Label>
              <textarea
                id="notif-body"
                required
                placeholder="Write your notification message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600 resize-none dark:text-white"
              />
              <p className="text-[10px] text-slate-400 text-right">{body.length} / 500</p>
            </div>

            {/* Live Preview */}
            {(title || body) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preview
                </Label>
                <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${currentTypeMeta.bg}`}>
                  <PreviewIcon className={`w-5 h-5 shrink-0 mt-0.5 ${currentTypeMeta.color}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {title || "Notification Title"}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {body || "Your message will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={sending}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm gap-2 shadow-md shadow-emerald-600/20"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
