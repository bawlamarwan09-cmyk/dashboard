import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error
  return json(backend.db.companies)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  if (!body.name || !body.type || !body.email || !body.phone) {
    return json({ message: "Missing required company fields" }, 400)
  }

  const company = {
    id: backend.id("company"),
    name: body.name,
    type: body.type,
    email: body.email,
    phone: body.phone,
    address: body.address,
    contactPerson: body.contactPerson,
    status: body.status || "active",
    createdAt: backend.now(),
  }

  backend.db.companies.push(company)
  return json(company, 201)
}
