import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const stats = {
    totalDevices: backend.db.devices.length,
    activeProblems: backend.db.problems.filter((problem) => problem.status !== "resolved" && problem.status !== "closed").length,
    pendingInterventions: backend.db.interventions.filter((item) => item.status !== "completed").length,
    resolvedThisMonth: backend.db.problems.filter((item) => item.status === "resolved").length,
    devicesByStatus: ["operational", "in_repair", "decommissioned"].map((status) => ({
      status,
      count: backend.db.devices.filter((device) => device.status === status).length,
    })),
    problemsByPriority: ["low", "medium", "high", "critical"].map((priority) => ({
      priority,
      count: backend.db.problems.filter((problem) => problem.priority === priority).length,
    })),
  }

  return json(stats)
}
