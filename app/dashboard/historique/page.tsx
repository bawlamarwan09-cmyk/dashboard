"use client"

import { useState, useMemo } from "react"
import {
  History, Search, Filter, User, Monitor, Wrench,
  AlertCircle, Loader2, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useHistorique } from "@/lib/hooks/use-api"
import { mutate } from "swr"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  CREATE:        "bg-success/10 text-success",
  UPDATE:        "bg-primary/10 text-primary",
  DELETE:        "bg-destructive/10 text-destructive",
  STATUS_CHANGE: "bg-warning/10 text-warning",
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  Probleme:     AlertCircle,
  Intervention: Wrench,
  User:         User,
  Materiel:     Monitor,
}

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? "bg-muted text-muted-foreground"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {action.replace("_", " ")}
    </span>
  )
}

function EntityIcon({ type }: { type: string }) {
  const Icon = ENTITY_ICONS[type] ?? History
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  }
}

const PAGE_SIZE = 20

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoriquePage() {
  const { data: historique, isLoading, error } = useHistorique()

  const [search, setSearch] = useState("")
  const [filterAction, setFilterAction] = useState("ALL")
  const [filterEntity, setFilterEntity] = useState("ALL")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!historique) return []
    return [...historique]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .filter((item) => {
        const matchAction = filterAction === "ALL" || item.action === filterAction
        const matchEntity = filterEntity === "ALL" || item.entity_type === filterEntity
        const matchSearch =
          !search ||
          item.action.toLowerCase().includes(search.toLowerCase()) ||
          item.entity_type.toLowerCase().includes(search.toLowerCase()) ||
          item.details?.toLowerCase().includes(search.toLowerCase()) ||
          item.user?.name?.toLowerCase().includes(search.toLowerCase())
        return matchAction && matchEntity && matchSearch
      })
  }, [historique, search, filterAction, filterEntity])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch("")
    setFilterAction("ALL")
    setFilterEntity("ALL")
    setPage(1)
  }

  const hasFilters = search || filterAction !== "ALL" || filterEntity !== "ALL"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity History</h1>
          <p className="text-muted-foreground">Complete log of all actions across the system</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate(["historique"])}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by user, entity, or details..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>

          <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="STATUS_CHANGE">Status Change</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEntity} onValueChange={(v) => { setFilterEntity(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entities</SelectItem>
              <SelectItem value="Probleme">Probleme</SelectItem>
              <SelectItem value="Intervention">Intervention</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Materiel">Materiel</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-semibold text-card-foreground">All Activity</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${filtered.length} entries${hasFilters ? " (filtered)" : ""}`}
            </p>
          </div>
          {historique && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {historique.length} total
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-6 py-8 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load activity history.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <History className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "No entries match your filters." : "No activity recorded yet."}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Rows */}
        {!isLoading && !error && paginated.length > 0 && (
          <div className="divide-y divide-border">
            {paginated.map((item) => {
              const { date, time } = formatDate(item.created_at)
              return (
                <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <EntityIcon type={item.entity_type} />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ActionBadge action={item.action} />
                      <span className="text-sm font-medium text-foreground">
                        {item.entity_type} #{item.entity_id}
                      </span>
                    </div>
                    {item.details && (
                      <p className="text-sm text-muted-foreground truncate">{item.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      by <span className="font-medium text-foreground">{item.user?.name ?? `User #${item.user_id}`}</span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-foreground">{date}</p>
                    <p className="text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {filtered.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}