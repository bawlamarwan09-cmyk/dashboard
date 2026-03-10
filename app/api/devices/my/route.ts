import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const devices = backend.db.devices.filter((device) => device.assignedTo === auth.user.id)
  return json(devices)
}
