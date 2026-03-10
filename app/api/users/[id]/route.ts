import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const user = backend.db.users.find((item) => item.id === id)
  if (!user) return json({ message: "User not found" }, 404)

  return json(backend.publicUser(user))
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const user = backend.db.users.find((item) => item.id === id)
  if (!user) return json({ message: "User not found" }, 404)

  Object.assign(user, body)
  return json(backend.publicUser(user))
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const index = backend.db.users.findIndex((item) => item.id === id)
  if (index === -1) return json({ message: "User not found" }, 404)

  backend.db.users.splice(index, 1)
  return json({ success: true })
}
