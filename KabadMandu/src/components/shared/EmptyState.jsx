import React from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No items found",
  description = "There are no records to display at this moment.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-card/50">
      <div className="p-3 rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/80" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
