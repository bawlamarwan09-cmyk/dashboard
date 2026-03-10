import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const chartData = {
    problemsByMonth: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => ({
      month,
      count: backend.db.problems.filter((_problem, problemIndex) => problemIndex % 6 === index).length,
    })),
    devicesByType: ["PC", "Laptop", "Monitor", "Printer", "Phone", "Tablet", "Other"].map((type) => ({
      type,
      count: backend.db.devices.filter((device) => device.type === type).length,
    })),
    interventionsByType: ["internal", "external", "replacement"].map((type) => ({
      type,
      count: backend.db.interventions.filter((intervention) => intervention.type === type).length,
    })),
  }

  return json(chartData)
}
