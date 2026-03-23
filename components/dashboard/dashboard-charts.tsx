"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import type { ChartData, DashboardStats, ProblemeStatus } from "@/lib/api"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

function statusLabel(status: ProblemeStatus): string {
  switch (status) {
    case "DECLARED":
      return "Open"
    case "UNDER_VERIFICATION":
      return "In Verification"
    case "SENT_TO_COMPANY":
      return "Shipped"
    case "REPAIRED":
      return "Repaired"
    case "REPLACED":
      return "Replaced"
    case "CLOSED":
      return "Resolved"
    default:
      return status
  }
}

function colorForIndex(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length] || "hsl(var(--chart-1))"
}

export function ProblemsByStatusChart({ stats }: { stats?: DashboardStats }) {
  const data = (stats?.problemesByStatus ?? []).map((d, i) => ({
    name: statusLabel(d.status),
    value: d.count,
    color: colorForIndex(i),
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Problems by Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ProblemsByDeviceChart({ stats }: { stats?: DashboardStats }) {
  const data = (stats?.materielsByType ?? []).map((d) => ({
    name: d.type,
    count: d.count,
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Materiels by Device Type</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RepairTrendChart({ chartData }: { chartData?: ChartData }) {
  const data = (chartData?.interventionsByResult ?? []).map((d, i) => {
    const label =
      d.result === "REPAIRED" ? "Repairs" : d.result === "REPLACED" ? "Replacements" : d.result
    return {
      name: label,
      value: d.count,
      color: colorForIndex(i),
    }
  })

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Repairs vs Replacements</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
