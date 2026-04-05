"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"
import type { Role } from "@/lib/api"
import { Header } from "@/components/dashboard/header"

const routePermissions: { path: string; roles: Role[] }[] = [
  { path: "/dashboard/devices",       roles: ["ADMIN"] },
  { path: "/dashboard/users",         roles: ["ADMIN"] },
  { path: "/dashboard/settings",      roles: ["ADMIN"] },
  { path: "/dashboard/interventions", roles: ["ADMIN", "OPERATOR", "COMPANY"] },
  { path: "/dashboard/my-devices",    roles: ["ADMIN", "USER"] },
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
        <div className="rounded-lg bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
