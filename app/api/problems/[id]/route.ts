import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const problem = backend.db.problems.find((item) => item.id === id)
  if (!problem) return json({ message: "Problem not found" }, 404)

  return json(problem)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const problem = backend.db.problems.find((item) => item.id === id)
  if (!problem) return json({ message: "Problem not found" }, 404)

  Object.assign(problem, body, { updatedAt: backend.now() })
  return json(problem)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const index = backend.db.problems.findIndex((item) => item.id === id)
  if (index === -1) return json({ message: "Problem not found" }, 404)

  backend.db.problems.splice(index, 1)
  return json({ success: true })
}
