"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"
import type { Role } from "@/lib/api"
import { Header } from "@/components/dashboard/header"

// ── Route permissions ──────────────────────────────────────────────────────
// Only list routes that need RESTRICTED access.
// Any route NOT listed here is accessible to ALL authenticated users.
// COMPANY role has been removed — companies are not user accounts.
const routePermissions: { path: string; roles: Role[] }[] = [
  // Admin only
  { path: "/dashboard/users",         roles: ["ADMIN"] },

  // Admin + Operator (interventions — operators manage them, admins oversee)
  { path: "/dashboard/interventions", roles: ["ADMIN", "OPERATOR"] },

  // Admin + User (own devices)
  { path: "/dashboard/my-devices",    roles: ["ADMIN", "USER" , "OPERATOR"] },

  // Admin + Operator (device management)
  { path: "/dashboard/materiels",     roles: ["ADMIN", "OPERATOR"] },
  { path: "/dashboard/devices",       roles: ["ADMIN", "OPERATOR"] },

  // /dashboard/settings — NOT listed → accessible to everyone
]

function getAllowedRoles(pathname: string): Role[] | null {
  const match = routePermissions.find((r) => pathname.startsWith(r.path))
  return match ? match.roles : null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    const allowedRoles = getAllowedRoles(pathname)
    if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
      router.push("/dashboard")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const allowedRoles = getAllowedRoles(pathname)
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-center space-y-2">
          <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <p className="text-xs text-muted-foreground">
            Required: {allowedRoles.join(" or ")} — Your role: {user.role}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}