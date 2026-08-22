import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/LanguageContext"
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  X,
  Scale,
} from "lucide-react"

export default function AdminRatesPage() {
  const { t } = useLanguage()
  const [wasteTypes, setWasteTypes] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Editing state
  const [editingItem, setEditingItem] = useState(null)
  const [editRate, setEditRate] = useState("")
  const [editUnit, setEditUnit] = useState("per_kg")
  const [editCategory, setEditCategory] = useState("Metals")

  // Add state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newUnit, setNewUnit] = useState("per_kg")
  const [newCategory, setNewCategory] = useState("Paper & Cardboard")

  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const loadRates = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("waste_types")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      setWasteTypes(data || [])
    } catch (err) {
      console.error("Error loading waste types:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRates()
  }, [])

  // Resolve item unit
  const getItemUnit = (item) => {
    if (item.unit) return item.unit;
    const n = (item.name || "").toLowerCase();
    if (n.includes("per piece") || n.includes("per_piece")) return "per_piece";
    return "per_kg";
  }

  // Resolve item category
  const getItemCategory = (item) => {
    if (item.category) return item.category;
    const n = (item.name || "").toLowerCase()
    if (n.includes("copper") || n.includes("brass") || n.includes("metal") || n.includes("iron") || n.includes("steel") || n.includes("can") || n.includes("aluminium")) return "Metals"
    if (n.includes("paper") || n.includes("cardboard") || n.includes("book")) return "Paper & Cardboard"
    if (n.includes("plastic") || n.includes("pet")) return "Plastics"
    if (n.includes("e-waste") || n.includes("electronic") || n.includes("battery")) return "E-Waste"
    if (n.includes("glass")) return "Glass & Bottles"
    return "Household Items"
  }

  // Resolve item display name
  const getDisplayName = (item) => {
    return item.name
      .replace(/\s*\(per\s*piece\)/i, "")
      .replace(/\s*\(per\s*kg\)/i, "");
  }

  const handleStartEdit = (item) => {
    setEditingItem(item)
    setEditRate(String(item.rate_per_kg))
    setEditUnit(getItemUnit(item))
    setEditCategory(getItemCategory(item))
    setErrorMsg("")
  }

  const handleSaveEdit = async () => {
    if (!editRate || Number(editRate) < 0) {
      setErrorMsg("Please enter a valid rate.")
      return
    }

    setSaving(true)
    setErrorMsg("")

    try {
      // First try to update all fields including unit and category
      const { error } = await supabase
        .from("waste_types")
        .update({
          rate_per_kg: Number(editRate),
          unit: editUnit,
          category: editCategory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id)

      if (error) {
        // Columns don't exist yet — fall back to updating rate only
        const isColMissing = error.message?.toLowerCase().includes("column") ||
          error.message?.toLowerCase().includes("schema cache") ||
          error.code === "PGRST204"
        
        if (isColMissing) {
          const { error: fallbackErr } = await supabase
            .from("waste_types")
            .update({
              rate_per_kg: Number(editRate),
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingItem.id)
          
          if (fallbackErr) throw fallbackErr
          // Warn in console but don't block the user
          console.warn("unit/category columns not yet in DB — run the SQL migration to unlock full editing")
        } else {
          throw error
        }
      }

      setToastMsg(`Rate for "${getDisplayName(editingItem)}" updated to Rs. ${editRate} live!`)
      setEditingItem(null)
      await loadRates()
    } catch (err) {
      setErrorMsg(err.message || "Failed to update rate.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from("waste_types")
        .update({
          active: !item.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      if (error) throw error
      setToastMsg(`"${getDisplayName(item)}" is now ${!item.active ? "Active" : "Disabled"}.`)
      await loadRates()
    } catch (err) {
      setErrorMsg("Error updating status: " + err.message)
    }
  }

  const handleDeleteMaterial = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${getDisplayName(item)}"?`)) {
      return
    }

    setErrorMsg("")
    setToastMsg("")

    try {
      const { error } = await supabase
        .from("waste_types")
        .delete()
        .eq("id", item.id)

      if (error) {
        if (error.code === "23503") {
          throw new Error(`Cannot delete "${getDisplayName(item)}" because it is linked to existing pickups. You can click its status badge to Disable it instead.`)
        }
        throw error
      }

      setToastMsg(`Scrap material "${getDisplayName(item)}" removed successfully!`)
      await loadRates()
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete item.")
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newRate || Number(newRate) < 0) {
      setErrorMsg("Please enter a valid material name and rate.")
      return
    }

    setSaving(true)
    setErrorMsg("")

    try {
      // First try inserting all columns
      const { error } = await supabase.from("waste_types").insert({
        name: newName.trim(),
        rate_per_kg: Number(newRate),
        unit: newUnit,
        category: newCategory,
        active: true,
      })

      if (error) {
        // Columns don't exist yet — insert without unit/category
        const isColMissing = error.message?.toLowerCase().includes("column") ||
          error.message?.toLowerCase().includes("schema cache") ||
          error.code === "PGRST204"

        if (isColMissing) {
          const { error: fallbackErr } = await supabase.from("waste_types").insert({
            name: newName.trim(),
            rate_per_kg: Number(newRate),
            active: true,
          })
          if (fallbackErr) throw fallbackErr
          console.warn("unit/category columns not yet in DB — run the SQL migration to unlock full features")
        } else {
          throw error
        }
      }

      setToastMsg(`Added new scrap material "${newName}" at Rs. ${newRate}!`)
      setShowAddModal(false)
      setNewName("")
      setNewRate("")
      await loadRates()
    } catch (err) {
      setErrorMsg(err.message || "Failed to add scrap material.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("admin.rates.title", "Manage Scrap Rates & Waste Types")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update official Kathmandu market scrap rates and collection units.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRates}
            disabled={loading}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("admin.rates.refresh", "Refresh")}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => { setShowAddModal(true); setErrorMsg(""); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9 text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("admin.rates.addNewType", "Add New Scrap Type")}</span>
          </Button>
        </div>
      </div>

      {toastMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-destructive/60 hover:text-destructive">✕</button>
        </div>
      )}

      {/* Rates Table Card */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="py-3.5 px-5">{t("admin.rates.scrapMaterial", "Scrap Material")}</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">{t("admin.rates.currentRate", "Current Rate")}</th>
                  <th className="py-3.5 px-5">{t("admin.rates.status", "Status")}</th>
                  <th className="py-3.5 px-5">{t("admin.rates.lastUpdated", "Last Updated")}</th>
                  <th className="py-3.5 px-5 text-right">{t("admin.rates.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border text-slate-700 dark:text-slate-300">
                {wasteTypes.map((item) => {
                  const isEditing = editingItem?.id === item.id
                  const unit = getItemUnit(item)
                  const category = getItemCategory(item)

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {getDisplayName(item)}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5">
                        {isEditing ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="h-8 rounded-lg border bg-background px-2 text-[11px] font-semibold"
                          >
                            {["Paper & Cardboard", "Metals", "Plastic", "E-Waste", "Glass & Bottles", "Household Metal", "Textile", "Household Items", "Rubber", "Batteries", "Appliances"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {category}
                          </Badge>
                        )}
                      </td>

                      {/* Rate / Unit */}
                      <td className="py-4 px-5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-500">Rs.</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-20 h-8 rounded-lg text-xs font-bold text-emerald-700"
                              autoFocus
                            />
                            <select
                              value={editUnit}
                              onChange={(e) => setEditUnit(e.target.value)}
                              className="h-8 rounded-lg border bg-background px-2 text-[11px] font-semibold"
                            >
                              <option value="per_kg">/ kg</option>
                              <option value="per_piece">/ piece</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                              Rs. {item.rate_per_kg}
                            </span>
                            <span className="text-slate-400 ml-1">
                              {unit === "per_piece" ? "/ piece" : "/ kg"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="cursor-pointer"
                          title="Click to toggle active status"
                        >
                          <Badge
                            className={
                              item.active
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]"
                                : "bg-slate-200 text-slate-600 dark:bg-muted dark:text-slate-400 text-[10px]"
                            }
                          >
                            {item.active ? t("admin.rates.active", "Active") : t("admin.rates.disabled", "Disabled")}
                          </Badge>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-5 text-slate-400 text-[11px]">
                        {formatDate(item.updated_at || item.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 rounded-lg gap-1"
                            >
                              <Check className="w-3 h-3" />
                              {t("admin.rates.save", "Save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                              className="h-8 text-xs px-2.5 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(item)}
                              className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg gap-1 px-2.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              {t("admin.rates.editRate", "Edit")}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMaterial(item)}
                              className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg gap-1 px-2.5"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t("admin.rates.delete", "Delete")}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add New Scrap Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                {t("admin.rates.addTitle", "Add New Scrap Material")}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  {t("admin.rates.materialName", "Scrap Material Name")}
                </Label>
                <Input
                  id="name"
                  required
                  placeholder={t("admin.rates.materialPlaceholder", "e.g. Mixed Hard Plastic")}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                  autoFocus
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category
                </Label>
                <select
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  {["Paper & Cardboard", "Metals", "Plastic", "E-Waste", "Glass & Bottles", "Household Metal", "Textile", "Household Items", "Rubber", "Batteries", "Appliances"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Rate & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rate" className="text-xs font-semibold">
                    Rate (Rs.)
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g. 45"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit" className="text-xs font-semibold">
                    Pricing Unit
                  </Label>
                  <select
                    id="unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                  >
                    <option value="per_kg">Per Kilogram (kg)</option>
                    <option value="per_piece">Per Piece (pcs)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  {t("admin.rates.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 text-xs shadow-md shadow-emerald-600/20 gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.rates.addMaterial", "Add Material")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
