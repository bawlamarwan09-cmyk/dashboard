import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const conversation = backend.db.conversations.find((item) => item.id === id)
  if (!conversation) return json({ message: "Conversation not found" }, 404)

  const member = conversation.participants.some((participant) => participant.id === auth.user.id)
  if (!member) return json({ message: "Forbidden" }, 403)

  return json(backend.db.messagesByConversation[id] || [])
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const { content } = await request.json()
  const conversation = backend.db.conversations.find((item) => item.id === id)
  if (!conversation) return json({ message: "Conversation not found" }, 404)
  if (!content) return json({ message: "Message content is required" }, 400)

  const message = {
    id: backend.id("msg"),
    content,
    senderId: auth.user.id,
    senderName: `${auth.user.firstName} ${auth.user.lastName}`,
    senderAvatar: auth.user.avatar,
    createdAt: backend.now(),
    isRead: false,
  }

  if (!backend.db.messagesByConversation[id]) backend.db.messagesByConversation[id] = []
  backend.db.messagesByConversation[id].push(message)
  conversation.lastMessage = message
  conversation.updatedAt = backend.now()

  return json(message, 201)
}
