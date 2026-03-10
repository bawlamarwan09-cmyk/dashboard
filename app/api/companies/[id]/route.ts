import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const company = backend.db.companies.find((item) => item.id === id)
  if (!company) return json({ message: "Company not found" }, 404)

  return json(company)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const body = await request.json()
  const company = backend.db.companies.find((item) => item.id === id)
  if (!company) return json({ message: "Company not found" }, 404)

  Object.assign(company, body)
  return json(company)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const index = backend.db.companies.findIndex((item) => item.id === id)
  if (index === -1) return json({ message: "Company not found" }, 404)

  backend.db.companies.splice(index, 1)
  return json({ success: true })
}
