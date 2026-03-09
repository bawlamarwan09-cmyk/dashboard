import { AlertCircle, CheckCircle2, Clock, Truck, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "problem",
    title: "New problem reported",
    description: "PC-001 - Display flickering issue",
    time: "2 minutes ago",
    icon: AlertCircle,
    iconColor: "text-destructive bg-destructive/10",
  },
  {
    id: 2,
    type: "repair",
    title: "Repair started",
    description: "Laptop-015 - Battery replacement",
    time: "15 minutes ago",
    icon: Wrench,
    iconColor: "text-warning bg-warning/10",
  },
  {
    id: 3,
    type: "shipped",
    title: "Device shipped to company",
    description: "Printer-005 - Sent to HP Service Center",
    time: "1 hour ago",
    icon: Truck,
    iconColor: "text-primary bg-primary/10",
  },
  {
    id: 4,
    type: "resolved",
    title: "Problem resolved",
    description: "Monitor-008 - Replaced with new unit",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconColor: "text-success bg-success/10",
  },
  {
    id: 5,
    type: "pending",
    title: "Awaiting parts",
    description: "PC-022 - Waiting for SSD delivery",
    time: "3 hours ago",
    icon: Clock,
    iconColor: "text-muted-foreground bg-muted",
  },
]

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                activity.iconColor
              )}
            >
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium text-card-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
