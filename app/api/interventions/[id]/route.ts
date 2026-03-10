import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const intervention = backend.db.interventions.find((item) => item.id === id)
  if (!intervention) return json({ message: "Intervention not found" }, 404)

  return json(intervention)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const intervention = backend.db.interventions.find((item) => item.id === id)
  if (!intervention) return json({ message: "Intervention not found" }, 404)

  Object.assign(intervention, body)
  return json(intervention)
}
