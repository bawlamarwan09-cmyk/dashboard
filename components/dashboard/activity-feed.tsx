"use client"

import { useMemo } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHistorique } from "@/lib/hooks/use-api"
import type { Historique } from "@/lib/api"

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const ms = date.getTime()
  if (!Number.isFinite(ms)) return iso

  const diffMs = Date.now() - ms
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

function getActivityIcon(entityType?: string, action?: string): {
  icon: LucideIcon
  iconColor: string
} {
  const text = `${entityType ?? ""} ${action ?? ""}`.toUpperCase()

  if (text.includes("MESSAGE")) return { icon: CheckCircle2, iconColor: "text-success bg-success/10" }
  if (text.includes("PROBLEME"))
    return { icon: AlertCircle, iconColor: "text-destructive bg-destructive/10" }
  if (text.includes("INTERVENTION")) return { icon: Wrench, iconColor: "text-warning bg-warning/10" }
  if (text.includes("SENT") || text.includes("SHIP") || text.includes("COMPANY")) {
    return { icon: Truck, iconColor: "text-primary bg-primary/10" }
  }

  return { icon: Clock, iconColor: "text-muted-foreground bg-muted" }
}

export function ActivityFeed() {
  const { data: historique, isLoading, error } = useHistorique()

  const recentActivities = useMemo(() => {
    const items = historique ?? []
    return items
      .slice()
      .sort(
        (a: Historique, b: Historique) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
  }, [historique])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="text-sm text-muted-foreground">Loading recent activity...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="text-sm text-destructive">Failed to load recent activity.</div>
      </div>
    )
  }

  if (recentActivities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="text-sm text-muted-foreground">No recent activity.</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {recentActivities.map((activity) => {
          const { icon: Icon, iconColor } = getActivityIcon(activity.entity_type, activity.action)

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  iconColor
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-card-foreground">
                  {activity.action || "Activity"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.details ?? `${activity.entity_type} #${activity.entity_id}`}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(activity.created_at)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
