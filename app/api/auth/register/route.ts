import { NextRequest } from "next/server"
import { backend, json, tokenForUser } from "@/lib/server/backend"

export async function POST(request: NextRequest) {
  const { firstName, lastName, email, password, company, role } = await request.json()

  if (!firstName || !lastName || !email || !password) {
    return json({ message: "Missing required registration fields" }, 400)
  }

  const alreadyExists = backend.db.users.some((user) => user.email === email)
  if (alreadyExists) {
    return json({ message: "Email is already in use" }, 409)
  }

  const user = {
    id: backend.id("user"),
    firstName,
    lastName,
    email,
    role: role || "user",
    company,
    createdAt: backend.now(),
    status: "active" as const,
    avatar: "",
    password,
  }

  backend.db.users.push(user)

  return json({ token: tokenForUser(user.id), user: backend.publicUser(user) }, 201)
}
