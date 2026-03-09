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
  LineChart,
  Line,
} from "recharts"

const problemsByStatus = [
  { name: "Open", value: 24, color: "hsl(var(--chart-4))" },
  { name: "In Progress", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Shipped", value: 8, color: "hsl(var(--chart-1))" },
  { name: "Resolved", value: 45, color: "hsl(var(--chart-2))" },
]

const problemsByDeviceType = [
  { name: "PCs", problems: 35 },
  { name: "Laptops", problems: 28 },
  { name: "Printers", problems: 15 },
  { name: "Monitors", problems: 12 },
  { name: "Others", problems: 5 },
]

const repairTrend = [
  { month: "Jan", repaired: 12, replaced: 3 },
  { month: "Feb", repaired: 18, replaced: 5 },
  { month: "Mar", repaired: 15, replaced: 2 },
  { month: "Apr", repaired: 22, replaced: 4 },
  { month: "May", repaired: 28, replaced: 6 },
  { month: "Jun", repaired: 25, replaced: 3 },
]

export function ProblemsByStatusChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Problems by Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={problemsByStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {problemsByStatus.map((entry, index) => (
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

export function ProblemsByDeviceChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Problems by Device Type</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={problemsByDeviceType} layout="vertical">
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
            <Bar dataKey="problems" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RepairTrendChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">Repair vs Replacement Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={repairTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="repaired"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
            <Line
              type="monotone"
              dataKey="replaced"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-4))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
