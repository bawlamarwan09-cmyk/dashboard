import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const activity = [
    ...backend.db.problems.map((problem) => ({
      id: `act_${problem.id}`,
      type: "problem_created" as const,
      description: `Problem opened: ${problem.title}`,
      user: problem.reportedByName || "Unknown",
      createdAt: problem.createdAt,
    })),
    ...backend.db.devices.map((device) => ({
      id: `act_${device.id}`,
      type: "device_added" as const,
      description: `Device added: ${device.name}`,
      user: device.assignedToName || "System",
      createdAt: device.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return json(activity.slice(0, 20))
}
