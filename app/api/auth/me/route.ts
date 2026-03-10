import { NextRequest } from "next/server"
import { backend, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) {
    return auth.error
  }

  return Response.json(backend.publicUser(auth.user))
}
