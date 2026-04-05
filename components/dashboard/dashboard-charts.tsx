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

// ─── Blue & Indigo palette ────────────────────────────────────────────────────

const BLUE = {
  50:  "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
}

const INDIGO = {
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
}

const STATUS_COLORS: Record<ProblemeStatus, string> = {
  DECLARED:           BLUE[400],
  UNDER_VERIFICATION: BLUE[500],
  SENT_TO_COMPANY:    INDIGO[400],
  REPAIRED:           BLUE[700],
  REPLACED:           INDIGO[600],
  CLOSED:             BLUE[900],
}

const RESULT_COLORS = [BLUE[500], INDIGO[500]]

function statusLabel(status: ProblemeStatus): string {
  switch (status) {
    case "DECLARED":           return "Declared"
    case "UNDER_VERIFICATION": return "In Verification"
    case "SENT_TO_COMPANY":    return "Sent to Company"
    case "REPAIRED":           return "Repaired"
    case "REPLACED":           return "Replaced"
    case "CLOSED":             return "Closed"
    default:                   return status
  }
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  },
}

export function getSentToCompaniesCount(stats?: DashboardStats): number {
  return (
    stats?.problemesByStatus?.find((item) => item.status === "SENT_TO_COMPANY")?.count ?? 0
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
      <div className="text-3xl opacity-20">—</div>
      <p className="text-sm">{label}</p>
    </div>
  )
}

// ─── Problems by Status (Donut) ───────────────────────────────────────────────

export function ProblemsByStatusChart({ stats }: { stats?: DashboardStats }) {
  const raw = stats?.problemesByStatus ?? []
  const data = raw.map((d) => ({
    name: statusLabel(d.status),
    value: d.count,
    color: STATUS_COLORS[d.status] ?? BLUE[500],
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 font-semibold text-card-foreground">Problems by Status</h3>
      <p className="mb-4 text-xs text-muted-foreground">All time breakdown</p>
      {data.length === 0 ? (
        <EmptyChart label="No problems recorded yet" />
      ) : (
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
              <Tooltip {...tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Materiels by Device Type (Horizontal Bar) ────────────────────────────────

export function ProblemsByDeviceChart({ stats }: { stats?: DashboardStats }) {
  const data = (stats?.materielsByType ?? []).map((d) => ({
    name: d.type,
    count: d.count,
  }))

  const barHeight = Math.max(64, data.length * 44)

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 font-semibold text-card-foreground">Materiels by Type</h3>
      <p className="mb-4 text-xs text-muted-foreground">Total registered equipment</p>
      {data.length === 0 ? (
        <EmptyChart label="No materiels registered yet" />
      ) : (
        <div style={{ height: Math.max(barHeight, 256) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="count"
                name="Devices"
                fill={BLUE[500]}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Problems per Month (Bar) ─────────────────────────────────────────────────

export function RepairTrendChart({ chartData }: { chartData?: ChartData }) {
  const monthly = chartData?.problemesByMonth ?? []
  const results = chartData?.interventionsByResult ?? []

  const hasMonthly = monthly.length > 0 && monthly.some((m) => m.count > 0)
  const hasResults = results.length > 0

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 font-semibold text-card-foreground">Problems — Last 6 Months</h3>
      <p className="mb-4 text-xs text-muted-foreground">New problems reported per month</p>

      {!hasMonthly ? (
        <EmptyChart label="No problem history yet" />
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="count"
                name="Problems"
                fill={INDIGO[500]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasResults && (
        <>
          <div className="my-4 border-t border-border" />
          <p className="mb-3 text-xs font-medium text-muted-foreground">Repairs vs Replacements</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={results.map((d, i) => ({
                    name: d.result === "REPAIRED" ? "Repaired" : "Replaced",
                    value: d.count,
                    color: RESULT_COLORS[i] ?? BLUE[500],
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={52}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {results.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RESULT_COLORS[index] ?? BLUE[500]}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}