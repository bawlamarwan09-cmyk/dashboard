import { NextRequest } from "next/server"
import { backend, json, requireAuth } from "@/lib/server/backend"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const { message } = await request.json()

  const problem = backend.db.problems.find((item) => item.id === id)
  if (!problem) return json({ message: "Problem not found" }, 404)
  if (!message) return json({ message: "Message content is required" }, 400)

  const nextMessage = {
    id: backend.id("msg"),
    content: message,
    senderId: auth.user.id,
    senderName: `${auth.user.firstName} ${auth.user.lastName}`,
    senderAvatar: auth.user.avatar,
    createdAt: backend.now(),
    isRead: false,
  }

  if (!problem.messages) problem.messages = []
  problem.messages.push(nextMessage)
  problem.updatedAt = backend.now()

  return json(nextMessage, 201)
}
