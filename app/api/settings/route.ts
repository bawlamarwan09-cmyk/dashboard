import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

const defaultSettings = (firstName: string, lastName: string, email: string) => ({
  profile: {
    firstName,
    lastName,
    email,
    phone: "",
    avatar: "",
  },
  notifications: {
    email: true,
    push: false,
    problemUpdates: true,
    interventionUpdates: true,
  },
  appearance: {
    theme: "system" as const,
    language: "en",
  },
})

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  if (!backend.db.settingsByUser[auth.user.id]) {
    backend.db.settingsByUser[auth.user.id] = defaultSettings(
      auth.user.firstName,
      auth.user.lastName,
      auth.user.email
    )
  }

  return json(backend.db.settingsByUser[auth.user.id])
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const body = await request.json()
  const existing = backend.db.settingsByUser[auth.user.id] ||
    defaultSettings(auth.user.firstName, auth.user.lastName, auth.user.email)

  backend.db.settingsByUser[auth.user.id] = {
    profile: { ...existing.profile, ...body.profile },
    notifications: { ...existing.notifications, ...body.notifications },
    appearance: { ...existing.appearance, ...body.appearance },
  }

  return json(backend.db.settingsByUser[auth.user.id])
}
