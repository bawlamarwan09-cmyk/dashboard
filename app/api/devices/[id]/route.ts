import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const device = backend.db.devices.find((item) => item.id === id)
  if (!device) return json({ message: "Device not found" }, 404)

  return json(device)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const device = backend.db.devices.find((item) => item.id === id)
  if (!device) return json({ message: "Device not found" }, 404)

  Object.assign(device, body)
  return json(device)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const index = backend.db.devices.findIndex((item) => item.id === id)
  if (index === -1) return json({ message: "Device not found" }, 404)

  backend.db.devices.splice(index, 1)
  return json({ success: true })
}
