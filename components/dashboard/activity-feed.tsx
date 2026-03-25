"use client"

import { useHistorique } from "@/lib/hooks/use-api"
import { Loader2, AlertCircle, Wrench, CheckCircle2, Truck, Clock, User } from "lucide-react"
import type { Historique } from "@/lib/api"

function getActivityIcon(action: string, entityType: string) {
  const a = action.toLowerCase()
  const e = entityType.toLowerCase()

  if (a.includes("closed") || a.includes("resolved") || a.includes("repaired"))
    return <CheckCircle2 className="h-4 w-4 text-success" />
  if (a.includes("sent") || a.includes("company"))
    return <Truck className="h-4 w-4 text-chart-5" />
  if (a.includes("intervention") || e === "intervention" || a.includes("repair"))
    return <Wrench className="h-4 w-4 text-warning" />
  if (a.includes("problem") || e === "probleme" || a.includes("declared"))
    return <AlertCircle className="h-4 w-4 text-destructive" />
  return <User className="h-4 w-4 text-muted-foreground" />
}

function getActivityColor(action: string) {
  const a = action.toLowerCase()
  if (a.includes("closed") || a.includes("resolved") || a.includes("repaired"))
    return "bg-success/10"
  if (a.includes("sent") || a.includes("company"))
    return "bg-chart-5/10"
  if (a.includes("intervention") || a.includes("repair"))
    return "bg-warning/10"
  if (a.includes("problem") || a.includes("declared"))
    return "bg-destructive/10"
  return "bg-muted"
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  })
}

function ActivityItem({ item }: { item: Historique }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getActivityColor(item.action)}`}
      >
        {getActivityIcon(item.action, item.entity_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">
          {item.action}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {item.user && (
            <span className="text-xs text-muted-foreground truncate">
              by {item.user.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(item.created_at)}
          </span>
        </div>
        {item.details && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.details}</p>
        )}
      </div>
      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {item.entity_type}
      </span>
    </div>
  )
}

export function ActivityFeed() {
  const { data: historique, isLoading, error } = useHistorique()

  // Most recent 10 entries
  const recent = historique
    ? [...historique]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    : []

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Latest actions across the system</p>
        </div>
        {historique && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {historique.length} total
          </span>
        )}
      </div>

      <div className="px-6">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load activity
          </div>
        )}

        {!isLoading && !error && recent.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity recorded yet
          </p>
        )}

        {recent.length > 0 && (
          <div className="divide-y divide-border">
            {recent.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="border-t border-border px-6 py-3">
          <a
            href="/dashboard/historique"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  )
}