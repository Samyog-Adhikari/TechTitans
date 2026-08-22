import React from "react"
import { Badge } from "@/components/ui/badge"

export default function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase()

  switch (normalized) {
    case "requested":
      return <Badge variant="warning">Requested</Badge>
    case "accepted":
      return <Badge variant="info">Accepted</Badge>
    case "completed":
    case "resolved":
    case "active":
      return <Badge variant="success">Completed</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    case "open":
      return <Badge variant="warning">Open</Badge>
    case "building":
      return <Badge variant="secondary">Building Tier</Badge>
    case "good":
      return <Badge variant="info">Good Tier</Badge>
    case "excellent":
      return <Badge variant="success">Excellent Tier</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
