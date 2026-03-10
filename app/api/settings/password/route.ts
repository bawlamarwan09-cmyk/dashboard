import { NextRequest } from "next/server"
import { json, requireAuth } from "@/lib/server/backend"

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { currentPassword, newPassword } = await request.json()
  if (auth.user.password !== currentPassword) {
    return json({ message: "Current password is incorrect" }, 400)
  }

  auth.user.password = newPassword
  return json({ success: true })
}
