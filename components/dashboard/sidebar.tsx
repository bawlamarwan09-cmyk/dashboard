"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Monitor,
  Laptop,
  AlertCircle,
  Wrench,
  MessageSquare,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/api"

// ── Nav definitions per role ─────────────────────────────────────────────────

const navByRole: Record<Role, { name: string; href: string; icon: any }[]> = {
  USER: [
    { name: "My Devices",  href: "/dashboard/my-devices", icon: Laptop },
    { name: "Messages",    href: "/dashboard/messages",   icon: MessageSquare },
  ],
  OPERATOR: [
    { name: "Dashboard",      href: "/dashboard",               icon: LayoutDashboard },
    { name: "Problems",       href: "/dashboard/problems",       icon: AlertCircle },
    { name: "Interventions",  href: "/dashboard/interventions",  icon: Wrench },
    { name: "Messages",       href: "/dashboard/messages",       icon: MessageSquare },
    { name: "My Devices",     href: "/dashboard/my-devices",   icon: Laptop },

  ],
  
  ADMIN: [
    { name: "Dashboard",      href: "/dashboard",               icon: LayoutDashboard },
    { name: "Devices",        href: "/dashboard/devices",        icon: Monitor },
    { name: "My Devices",     href: "/dashboard/my-devices",     icon: Laptop },
    { name: "Problems",       href: "/dashboard/problems",       icon: AlertCircle },
    { name: "Interventions",  href: "/dashboard/interventions",  icon: Wrench },
    { name: "Messages",       href: "/dashboard/messages",       icon: MessageSquare },
  ],
}

const adminOnlyNav = [
  { name: "Users",    href: "/dashboard/users",    icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isCollapsed = mounted ? collapsed : false
  const role = (user?.role ?? "USER") as Role
  const mainNav = navByRole[role] ?? navByRole.USER
  const isAdmin = role === "ADMIN"

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className={cn("flex items-center gap-2", isCollapsed && "hidden")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Monitor className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">IT Manager</span>
        </div>
        <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary", !isCollapsed && "hidden")}>
          <Monitor className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">

        {/* Role badge */}
        {!isCollapsed && user && (
          <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2">
            <p className="text-xs font-medium text-primary">{role}</p>
            <p className="truncate text-xs text-muted-foreground">{user.name}</p>
          </div>
        )}

        {/* Main nav */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={cn(isCollapsed && "hidden")}>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div className="my-4 h-px bg-border" />
            <div className="space-y-1">
              <span className={cn("px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", isCollapsed && "hidden")}>
                Admin
              </span>
              {adminOnlyNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={cn(isCollapsed && "hidden")}>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} />
        </Button>
      </div>
    </aside>
  )
}