import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error
  return json(backend.db.devices)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  if (!body.name || !body.type || !body.inventoryNumber || !body.serialNumber) {
    return json({ message: "Missing required device fields" }, 400)
  }

  const assignedUser = body.assignedTo
    ? backend.db.users.find((user) => user.id === body.assignedTo)
    : undefined

  const device = {
    id: backend.id("device"),
    name: body.name,
    type: body.type,
    inventoryNumber: body.inventoryNumber,
    serialNumber: body.serialNumber,
    status: body.status || "operational",
    assignedTo: body.assignedTo,
    assignedToName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : undefined,
    location: body.location,
    purchaseDate: body.purchaseDate,
    warrantyEnd: body.warrantyEnd,
    createdAt: backend.now(),
  }

  backend.db.devices.push(device)
  return json(device, 201)
}
