import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error
  return json(backend.db.problems)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  if (!body.title || !body.description || !body.deviceId) {
    return json({ message: "Missing required problem fields" }, 400)
  }

  const device = backend.db.devices.find((item) => item.id === body.deviceId)
  const assigned = body.assignedTo
    ? backend.db.users.find((user) => user.id === body.assignedTo)
    : undefined

  const problem = {
    id: backend.id("problem"),
    title: body.title,
    description: body.description,
    deviceId: body.deviceId,
    deviceName: device?.name,
    status: body.status || "open",
    priority: body.priority || "medium",
    reportedBy: auth.user.id,
    reportedByName: `${auth.user.firstName} ${auth.user.lastName}`,
    assignedTo: body.assignedTo,
    assignedToName: assigned ? `${assigned.firstName} ${assigned.lastName}` : undefined,
    createdAt: backend.now(),
    updatedAt: backend.now(),
    messages: [],
  }

  backend.db.problems.push(problem)
  return json(problem, 201)
}
