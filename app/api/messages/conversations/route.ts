import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const conversations = backend.db.conversations.filter((conversation) =>
    conversation.participants.some((participant) => participant.id === auth.user.id)
  )

  return json(conversations)
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { recipientId } = await request.json()
  const recipient = backend.db.users.find((item) => item.id === recipientId)
  if (!recipient) return json({ message: "Recipient not found" }, 404)

  const existing = backend.db.conversations.find((conversation) => {
    const ids = conversation.participants.map((participant) => participant.id)
    return ids.includes(auth.user.id) && ids.includes(recipientId) && ids.length === 2
  })

  if (existing) return json(existing)

  const conversation = {
    id: backend.id("conv"),
    participants: [backend.publicUser(auth.user), backend.publicUser(recipient)],
    unreadCount: 0,
    updatedAt: backend.now(),
  }

  backend.db.conversations.push(conversation)
  backend.db.messagesByConversation[conversation.id] = []

  return json(conversation, 201)
}
