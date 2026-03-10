import { NextRequest } from "next/server"
import { backend, json, tokenForUser } from "@/lib/server/backend"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const user = backend.db.users.find((item) => item.email === email && item.password === password)
  if (!user) {
    return json({ message: "Invalid email or password" }, 401)
  }

  return json({ token: tokenForUser(user.id), user: backend.publicUser(user) })
}
