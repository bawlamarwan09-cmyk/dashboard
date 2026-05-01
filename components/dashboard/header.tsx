"use client"

import { Bell, Search, Moon, Sun, Menu, LogOut, X, Monitor, AlertCircle, Wrench, CheckCircle2, Clock, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useHistorique, useProblemes, useMateriels } from "@/lib/hooks/use-api"
import { useRouter } from "next/navigation"
import type { Probleme, Materiel } from "@/lib/api"

interface HeaderProps {
  onMenuClick?: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  if (days < 7)     return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short" })
}

function getNotifIcon(action: string, entityType: string) {
  const a = action.toLowerCase()
  const e = entityType.toLowerCase()
  if (a.includes("closed") || a.includes("resolved") || a.includes("repaired"))
    return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
  if (a.includes("intervention") || e === "intervention")
    return <Wrench className="h-3.5 w-3.5 text-warning" />
  if (a.includes("problem") || e === "probleme")
    return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
  if (a.includes("materiel") || e === "materiel")
    return <Monitor className="h-3.5 w-3.5 text-primary" />
  return <User className="h-3.5 w-3.5 text-muted-foreground" />
}

function getNotifColor(action: string) {
  const a = action.toLowerCase()
  if (a.includes("closed") || a.includes("resolved") || a.includes("repaired")) return "bg-success/10"
  if (a.includes("intervention")) return "bg-warning/10"
  if (a.includes("problem"))      return "bg-destructive/10"
  return "bg-primary/10"
}

type SearchResult =
  | { kind: "probleme"; item: Probleme }
  | { kind: "materiel"; item: Materiel }

// ── Main component ────────────────────────────────────────────────────────────

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout }    = useAuth()
  const router              = useRouter()
  const [mounted, setMounted] = useState(false)

  // Only ADMIN and OPERATOR see notifications
  // USER role excluded — they don't need system-wide activity feed
  // COMPANY role removed entirely from the system
  const canSeeNotifications = user?.role === "ADMIN"

  const [notifOpen, setNotifOpen]   = useState(false)
  const [readIds, setReadIds]       = useState<Set<number>>(new Set())
  const [query, setQuery]           = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const { data: historique } = useHistorique()
  const { data: problemes }  = useProblemes()
  const { data: materiels }  = useMateriels()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Notifications ─────────────────────────────────────────────────────────

  const recent = canSeeNotifications && historique
    ? [...historique]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15)
    : []

  const unreadCount = recent.filter((h) => !readIds.has(h.id)).length
  const markAllRead = () => setReadIds(new Set(recent.map((h) => h.id)))
  const markRead    = (id: number) => setReadIds((prev) => new Set([...prev, id]))

  // ── Search ────────────────────────────────────────────────────────────────

  const results: SearchResult[] = (() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const matched: SearchResult[] = []
    if (problemes) {
      problemes
        .filter((p) =>
          p.description.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          p.materiel?.marque?.toLowerCase().includes(q) ||
          p.materiel?.modele?.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((p) => matched.push({ kind: "probleme", item: p }))
    }
    if (materiels) {
      materiels
        .filter((m) =>
          m.type.toLowerCase().includes(q) ||
          m.marque.toLowerCase().includes(q) ||
          m.modele.toLowerCase().includes(q) ||
          m.numero_inventaire.toLowerCase().includes(q) ||
          m.numero_serie.toLowerCase().includes(q) ||
          m.code_onee.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((m) => matched.push({ kind: "materiel", item: m }))
    }
    return matched.slice(0, 6)
  })()

  const handleSearchSelect = (result: SearchResult) => {
    if (result.kind === "probleme") router.push(`/dashboard/problemes/${result.item.id}`)
    else router.push(`/dashboard/materiels/${result.item.id}`)
    setQuery("")
    setSearchOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery(""); setSearchOpen(false); inputRef.current?.blur()
    }
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-muted lg:hidden" />
          <div className="hidden h-9 w-80 rounded-md bg-muted md:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-muted" />
          <div className="h-9 w-9 rounded-md bg-muted" />
          <div className="h-9 w-9 rounded-full bg-muted" />
        </div>
      </header>
    )
  }

  const fullName     = user?.name || "User"
  const userInitials = fullName.split(" ").filter(Boolean).map((p) => p.charAt(0)).join("").slice(0, 2).toUpperCase()
  const userEmail    = user?.email || ""

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">

      {/* Left — menu + search */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search devices, problems..."
            className="w-80 pl-9 pr-8"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => { setQuery(""); inputRef.current?.focus() }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {searchOpen && query.length >= 2 && (
            <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-96 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for "<span className="font-medium text-foreground">{query}</span>"
                </div>
              ) : (
                <div>
                  {["probleme", "materiel"].map((kind) => {
                    const group = results.filter((r) => r.kind === kind)
                    if (group.length === 0) return null
                    return (
                      <div key={kind}>
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
                          {kind === "probleme" ? "Problems" : "Materiels"}
                        </div>
                        {group.map((result) => (
                          <button
                            key={result.kind === "probleme" ? `p-${result.item.id}` : `m-${result.item.id}`}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                            onClick={() => handleSearchSelect(result)}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              result.kind === "probleme" ? "bg-destructive/10" : "bg-primary/10"
                            }`}>
                              {result.kind === "probleme"
                                ? <AlertCircle className="h-4 w-4 text-destructive" />
                                : <Monitor className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              {result.kind === "probleme" ? (
                                <>
                                  <p className="text-sm font-medium text-foreground truncate">Problem #{result.item.id}</p>
                                  <p className="text-xs text-muted-foreground truncate">{result.item.description}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-foreground truncate">{result.item.marque} {result.item.modele}</p>
                                  <p className="text-xs text-muted-foreground truncate">{result.item.type} · #{result.item.numero_inventaire}</p>
                                </>
                              )}
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )
                  })}
                  <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground bg-muted/20">
                    {results.length} result{results.length !== 1 ? "s" : ""} — press{" "}
                    <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to close
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right — theme + notifications (ADMIN & OPERATOR only) + user */}
      <div className="flex items-center gap-1">

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications — ADMIN and OPERATOR only */}
        {canSeeNotifications && (
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  recent.map((h) => {
                    const isUnread = !readIds.has(h.id)
                    return (
                      <button
                        key={h.id}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 ${
                          isUnread ? "bg-primary/[0.03]" : ""
                        }`}
                        onClick={() => markRead(h.id)}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 ${getNotifColor(h.action)}`}>
                          {getNotifIcon(h.action, h.entity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug truncate ${isUnread ? "font-medium text-foreground" : "text-foreground/80"}`}>
                            {h.action}
                          </p>
                          {h.details && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{h.details}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {timeAgo(h.created_at)}
                            <span className="mx-1 opacity-40">·</span>
                            <span className="uppercase tracking-wide">{h.entity_type}</span>
                          </p>
                        </div>
                        {isUnread && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {recent.length > 0 && (
                <div className="border-t border-border p-2">
                  <button
                    className="w-full rounded-lg px-3 py-2 text-xs text-center text-primary hover:bg-muted/50 transition-colors"
                    onClick={() => { router.push("/dashboard/historique"); setNotifOpen(false) }}
                  >
                    View all activity →
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
                {user?.role && (
                  <Badge variant="outline" className="w-fit text-[10px] mt-1">
                    {user.role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}