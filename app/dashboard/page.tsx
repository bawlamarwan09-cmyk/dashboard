"use client"

import { Monitor, AlertCircle, Wrench, Truck, CheckCircle2, Loader2 } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import {
  ProblemsByStatusChart,
  ProblemsByDeviceChart,
  RepairTrendChart,
} from "@/components/dashboard/dashboard-charts"
import { useDashboardStats } from "@/lib/hooks/use-api"

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats()

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
        Failed to load dashboard data. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your IT equipment and problem management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Devices"
          value={stats?.totalDevices ?? 0}
          change="+12 this month"
          changeType="positive"
          icon={Monitor}
          iconColor="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Active Problems"
          value={stats?.activeProblems ?? 0}
          change="+3 today"
          changeType="negative"
          icon={AlertCircle}
          iconColor="bg-destructive/10 text-destructive"
        />
        <StatsCard
          title="Under Repair"
          value={stats?.pendingInterventions ?? 0}
          change="5 internal, 13 external"
          changeType="neutral"
          icon={Wrench}
          iconColor="bg-warning/10 text-warning"
        />
        <StatsCard
          title="Sent to Companies"
          value={8}
          change="2 returning soon"
          changeType="neutral"
          icon={Truck}
          iconColor="bg-chart-5/10 text-chart-5"
        />
        <StatsCard
          title="Resolved"
          value={stats?.resolvedThisMonth ?? 0}
          change="+45 this month"
          changeType="positive"
          icon={CheckCircle2}
          iconColor="bg-success/10 text-success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProblemsByStatusChart />
        <ProblemsByDeviceChart />
        <RepairTrendChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-card-foreground">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="/dashboard/problems/new"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Report Problem</p>
                <p className="text-sm text-muted-foreground">Submit a new issue</p>
              </div>
            </a>
            <a
              href="/dashboard/devices/new"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Add Device</p>
                <p className="text-sm text-muted-foreground">Register new equipment</p>
              </div>
            </a>
            <a
              href="/dashboard/interventions"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">View Repairs</p>
                <p className="text-sm text-muted-foreground">Track interventions</p>
              </div>
            </a>
            <a
              href="/dashboard/messages"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Messages</p>
                <p className="text-sm text-muted-foreground">View communications</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
