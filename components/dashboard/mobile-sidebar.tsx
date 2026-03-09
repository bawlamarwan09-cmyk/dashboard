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
  Building2,
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Devices", href: "/dashboard/devices", icon: Monitor },
  { name: "My Devices", href: "/dashboard/my-devices", icon: Laptop },
  { name: "Problems", href: "/dashboard/problems", icon: AlertCircle },
  { name: "Interventions", href: "/dashboard/interventions", icon: Wrench },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
]

const adminNavigation = [
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Companies", href: "/dashboard/companies", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-16 flex-row items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Monitor className="h-4 w-4 text-primary-foreground" />
            </div>
            <SheetTitle className="font-semibold">IT Manager</SheetTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>

        <nav className="flex-1 space-y-1 p-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-1">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
