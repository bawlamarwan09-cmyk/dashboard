import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error
  return json(backend.db.interventions)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  if (!body.problemId || !body.deviceId || !body.description) {
    return json({ message: "Missing required intervention fields" }, 400)
  }

  const device = backend.db.devices.find((item) => item.id === body.deviceId)
  const tech = body.technician
    ? backend.db.users.find((item) => item.id === body.technician)
    : undefined

  const intervention = {
    id: backend.id("int"),
    type: body.type || "internal",
    problemId: body.problemId,
    deviceId: body.deviceId,
    deviceName: device?.name,
    description: body.description,
    status: body.status || "pending",
    technician: body.technician,
    technicianName: tech ? `${tech.firstName} ${tech.lastName}` : undefined,
    company: body.company,
    startDate: body.startDate || backend.now(),
    endDate: body.endDate,
    cost: body.cost,
    notes: body.notes,
  }

  backend.db.interventions.push(intervention)
  return json(intervention, 201)
}
