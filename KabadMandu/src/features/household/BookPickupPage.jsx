import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarPlus,
  Scale,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react"

export default function BookPickupPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [wasteTypes, setWasteTypes] = useState([])
  const [wasteTypeId, setWasteTypeId] = useState("")
  const [estimatedQty, setEstimatedQty] = useState("10")
  const [address, setAddress] = useState(profile?.area || "Kathmandu")
  const [scheduledTime, setScheduledTime] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (profile?.area) {
      setAddress(profile.area)
    }
  }, [profile])

  useEffect(() => {
    const loadWasteTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("waste_types")
          .select("*")
          .eq("active", true)
          .order("rate_per_kg", { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setWasteTypes(data)
          setWasteTypeId(data[0].id)
        }
      } catch (err) {
        console.error("Error loading waste types:", err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadWasteTypes()
  }, [])

  const selectedWasteType = wasteTypes.find((w) => w.id === wasteTypeId) || wasteTypes[0]
  const estimatedTotal = selectedWasteType
    ? Number(estimatedQty || 0) * Number(selectedWasteType.rate_per_kg || 0)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("Please sign in to request a pickup.")
      return
    }
    if (!wasteTypeId && wasteTypes.length > 0) {
      setWasteTypeId(wasteTypes[0].id)
    }
    const finalWasteTypeId = wasteTypeId || (wasteTypes.length > 0 ? wasteTypes[0].id : null)

    if (!finalWasteTypeId) {
      setError("Please select a scrap type.")
      return
    }
    if (!address.trim()) {
      setError("Please provide your pickup address.")
      return
    }
    if (Number(estimatedQty) <= 0) {
      setError("Please enter a valid estimated quantity greater than 0 kg.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        household_id: user.id,
        waste_type_id: finalWasteTypeId,
        estimated_qty: Number(estimatedQty),
        status: "requested",
        scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : null,
        address: address.trim(),
        notes: notes.trim() || null,
      }

      const { data, error: insertErr } = await supabase.from("pickups").insert(payload).select()

      if (insertErr) throw insertErr

      navigate("/household/history", {
        state: { successMessage: "Your scrap pickup has been requested successfully! A local collector will be notified." },
      })
    } catch (err) {
      console.error("Error booking pickup:", err)
      setError(err.message || "Failed to book pickup. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Book a Free Scrap Pickup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select scrap items, approximate weight, and your address. A verified collector will visit with digital scales.
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild className="text-xs text-slate-500 gap-1">
          <Link to="/household">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-slate-200/80 dark:border-border shadow-sm bg-white dark:bg-card">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Waste Type & Estimated Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="wasteType" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Scrap Type
                </Label>
                <select
                  id="wasteType"
                  value={wasteTypeId}
                  onChange={(e) => setWasteTypeId(e.target.value)}
                  disabled={loading || initialLoading}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  {wasteTypes.map((wt) => (
                    <option key={wt.id} value={wt.id}>
                      {wt.name} — Rs. {wt.rate_per_kg}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="qty" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Quantity (KG)
                  </Label>
                  <span className="text-xs font-semibold text-emerald-600">
                    Rs. {selectedWasteType?.rate_per_kg || 0}/kg
                  </span>
                </div>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  max="5000"
                  step="0.5"
                  required
                  placeholder="e.g. 15"
                  value={estimatedQty}
                  onChange={(e) => setEstimatedQty(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-10 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Live Price Calculation Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  Estimated Cash on Collection:
                </span>
                <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                  {formatCurrency(estimatedTotal)}
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">
                Digital Scale Verified
              </Badge>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Doorstep Pickup Address & Landmark
              </Label>
              <Input
                id="address"
                required
                placeholder="e.g. House #14, Jhamsikhel, Lalitpur (near Big Mart)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                className="rounded-xl h-10 text-sm"
              />
            </div>

            {/* Scheduled Date & Time */}
            <div className="space-y-1.5">
              <Label htmlFor="scheduledTime" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Preferred Date & Time (Optional)
              </Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={loading}
                className="rounded-xl h-10 text-sm"
              />
              <p className="text-[11px] text-slate-400">
                Leave blank for immediate same-day pickup.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Additional Instructions / Notes (Optional)
              </Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="e.g. Scrap is in the garage; please ring bell 2."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-input bg-transparent p-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
              />
            </div>
          </CardContent>

          <CardFooter className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-border/60">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doorstep pickup is always 100% free</span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 h-11 text-sm shadow-md shadow-emerald-600/20 gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Confirm Pickup Request
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
