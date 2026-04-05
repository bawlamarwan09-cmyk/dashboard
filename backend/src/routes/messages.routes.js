const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()

// GET /messages/conversations - Get all conversations for current user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const conversations = await prisma.message.groupBy({
      by: ["probleme_id"],
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
    })

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const probleme = await prisma.probleme.findUnique({
          where: { id: conv.probleme_id },
          include: {
            materiel: { select: { id: true, type: true, marque: true, modele: true } },
            declared_by: { select: { id: true, name: true, email: true } },
          },
        })

        const lastMessage = await prisma.message.findFirst({
          where: { probleme_id: conv.probleme_id },
          orderBy: { created_at: "desc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        })

        const unreadCount = 0

        return {
          probleme_id: conv.probleme_id,
          probleme,
          lastMessage,
          unreadCount,
        }
      })
    )

    res.json({ success: true, data: result })
  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /messages/conversations/:problemeId - Get messages for a conversation
router.get("/conversations/:problemeId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const problemeId = parseInt(req.params.problemeId)

    const messages = await prisma.message.findMany({
      where: { probleme_id: problemeId },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: "asc" },
    })


    res.json({ success: true, data: messages })
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /messages - Create a new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { probleme_id, receiver_id, message: messageContent } = req.body
    const sender_id = req.user.id

    if (!probleme_id || !receiver_id || !messageContent) {
      return res.status(400).json({
        success: false,
        message: "probleme_id, receiver_id, and message are required",
      })
    }

    const message = await prisma.message.create({
      data: {
        probleme_id: parseInt(probleme_id),
        sender_id,
        receiver_id: parseInt(receiver_id),
        message: messageContent,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    res.status(201).json({ success: true, data: message })
  } catch (error) {
    console.error("Create message error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})


// GET /messages/unread-count - Get unread message count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const count = await prisma.message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    })

    res.json({ success: true, data: { count } })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router
