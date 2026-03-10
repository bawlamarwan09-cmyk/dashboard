import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error
  return json(backend.db.users.map(backend.publicUser))
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  if (!body.firstName || !body.lastName || !body.email) {
    return json({ message: "Missing required user fields" }, 400)
  }

  const user = {
    id: backend.id("user"),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    role: body.role || "user",
    company: body.company,
    avatar: body.avatar || "",
    createdAt: backend.now(),
    status: body.status || "active",
    password: body.password || "changeme123",
  }

  backend.db.users.push(user)
  return json(backend.publicUser(user), 201)
}
