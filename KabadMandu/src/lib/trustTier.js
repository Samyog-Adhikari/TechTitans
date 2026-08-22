/**
 * Trust Tier Engine for KabadMandu
 * Computes consistency, weekly volume, and credit tier based on real ledger transactions
 * Rule: Evaluates BOTH distinct active weeks AND average weekly earnings (never pickup count alone)
 */

export function getISOWeek(dateInput) {
  const date = new Date(dateInput)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`
}

export function computeTrustMetrics(entries = []) {
  if (!entries || entries.length === 0) {
    return {
      totalEarnings: 0,
      totalWeight: 0,
      totalPickups: 0,
      weeksActive: 0,
      avgWeeklyEarnings: 0,
      trustTier: "Building",
      tierColor: "amber",
      tierDescription: "Initial verified collection activity. Keep logging consistent collections to unlock Good Tier.",
      nextTierGoal: "Active across 2+ weeks with Rs. 1,500/week average",
      progressPercent: 25,
      materialBreakdown: {},
    }
  }

  let totalEarnings = 0
  let totalWeight = 0
  const distinctWeeks = new Set()
  const materialMap = {}

  entries.forEach((entry) => {
    const amount = Number(entry.amount_paid || 0)
    const weight = Number(entry.actual_weight_kg || 0)
    const materialName = entry.waste_types?.name || "Scrap Items"

    totalEarnings += amount
    totalWeight += weight

    if (entry.created_at) {
      distinctWeeks.add(getISOWeek(entry.created_at))
    }

    if (!materialMap[materialName]) {
      materialMap[materialName] = { weight: 0, amount: 0, count: 0 }
    }
    materialMap[materialName].weight += weight
    materialMap[materialName].amount += amount
    materialMap[materialName].count += 1
  })

  const totalPickups = entries.length
  const weeksActive = Math.max(distinctWeeks.size, 1)
  const avgWeeklyEarnings = Math.round(totalEarnings / weeksActive)

  let trustTier = "Building"
  let tierColor = "amber"
  let tierDescription = "Verified collection history active. Building multi-week consistency."
  let nextTierGoal = "Active across 2+ distinct weeks with Rs. 1,500/week average."
  let progressPercent = 35

  if (weeksActive >= 4 && avgWeeklyEarnings >= 3500) {
    trustTier = "Excellent"
    tierColor = "emerald"
    tierDescription = "Elite collection consistency. Highest creditworthiness rating for microfinance and formal banking."
    nextTierGoal = "Top Tier Achieved — Maintain active collection status."
    progressPercent = 100
  } else if (weeksActive >= 2 && avgWeeklyEarnings >= 1500) {
    trustTier = "Good"
    tierColor = "teal"
    tierDescription = "Strong weekly volume and consistent recycling records."
    nextTierGoal = "Reach 4+ active weeks with Rs. 3,500/week average for Excellent Tier."
    progressPercent = 70
  } else if (totalEarnings > 0) {
    trustTier = "Building"
    tierColor = "amber"
    tierDescription = "Verified collection history initiated. Scale consistency across multiple weeks."
    nextTierGoal = "Reach 2+ active weeks with Rs. 1,500/week average."
    progressPercent = 40
  }

  return {
    totalEarnings,
    totalWeight,
    totalPickups,
    weeksActive,
    avgWeeklyEarnings,
    trustTier,
    tierColor,
    tierDescription,
    nextTierGoal,
    progressPercent,
    materialBreakdown: materialMap,
    distinctWeeksList: Array.from(distinctWeeks),
  }
}
