"use client"

import Link from "next/link"
import { Monitor, Laptop, Printer, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAffectationsByUser } from "@/lib/hooks/use-api"
import { useAuth } from "@/lib/auth-context"
import type { ProblemeStatus } from "@/lib/api"

const getDeviceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "laptop": return Laptop
    case "printer": return Printer
    default: return Monitor
  }
}

const getActiveProblemeStatus = (statuses: ProblemeStatus[]) => {
  const active = statuses.find((s) =>
    ["DECLARED", "UNDER_VERIFICATION", "SENT_TO_COMPANY"].includes(s)
  )
  if (!active) return null
  switch (active) {
    case "DECLARED": return "Declared"
    case "UNDER_VERIFICATION": return "Under Verification"
    case "SENT_TO_COMPANY": return "Sent to Company"
    default: return active
  }
}

export default function MyDevicesPage() {
  const { user } = useAuth()
  const { data: affectations, isLoading, error } = useAffectationsByUser(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Failed to load your devices. Please try again.
      </div>
    )
  }

  // Only current affectations (date_fin is null)
  const currentAffectations = (affectations || []).filter((a) => !a.date_fin)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Devices</h1>
        <p className="text-muted-foreground">View and manage your assigned IT equipment</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentAffectations.map((affectation) => {
          const m = affectation.materiel
          if (!m) return null

          const DeviceIcon = getDeviceIcon(m.type)

          // Derive status from active problemes on this materiel
          const activeStatuses = (m as any).problemes
            ?.map((p: any) => p.status as ProblemeStatus)
            .filter((s: ProblemeStatus) =>
              ["DECLARED", "UNDER_VERIFICATION", "SENT_TO_COMPANY"].includes(s)
            ) ?? []

          const hasActiveProbleme = activeStatuses.length > 0
          const activeStatusLabel = getActiveProblemeStatus(activeStatuses)

          const statusInfo = hasActiveProbleme
            ? { icon: Clock, color: "text-warning", bgColor: "bg-warning/10", label: activeStatusLabel ?? "In Repair" }
            : { icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10", label: "Active" }

          const StatusIcon = statusInfo.icon

          return (
            <div
              key={affectation.id}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DeviceIcon className="h-6 w-6 text-primary" />
                </div>
                <Badge className={cn("flex items-center gap-1", statusInfo.bgColor, statusInfo.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="mt-4 space-y-1">
                <p className="font-semibold text-card-foreground">{m.marque} {m.modele}</p>
                <p className="text-sm text-muted-foreground">{m.type}</p>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">N° Inventaire</span>
                  <span className="font-mono text-foreground">{m.numero_inventaire}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Code ONEE</span>
                  <span className="font-mono text-foreground">{m.code_onee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agence</span>
                  <span className="text-foreground">{affectation.agence}</span>
                </div>
                {hasActiveProbleme && (
                  <div className="flex items-start gap-2 rounded-lg bg-warning/5 border border-warning/20 p-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span className="text-muted-foreground">Active issue: {activeStatusLabel}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Link href={`/dashboard/problems/new?materiel=${m.id}`}>
                  <Button
                    variant={hasActiveProbleme ? "secondary" : "default"}
                    className="w-full"
                    disabled={hasActiveProbleme}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {hasActiveProbleme ? "Issue In Progress" : "Report Problem"}
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {currentAffectations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Monitor className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No devices assigned</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don&apos;t have any devices assigned to you yet. Contact your IT administrator.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-card-foreground">Need Help?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          If you&apos;re experiencing issues with any of your devices, click the &quot;Report Problem&quot; button
          on the device card. Our IT team will be notified and will assist you as soon as possible.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard/problems">
            <Button variant="outline">View My Problèmes</Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline">Contact IT Support</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}