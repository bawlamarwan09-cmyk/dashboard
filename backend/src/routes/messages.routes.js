const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()

// GET /messages/inbox — messages received by current user
router.get("/inbox", authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { receiver_id: req.user.id },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
        probleme: {
          select: {
            id: true,
            description: true,
            status: true,
            materiel: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Inbox fetched successfully", data: messages })
  } catch (error) {
    console.error("Get inbox error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /messages/sent — messages sent by current user
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { sender_id: req.user.id },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
        probleme: {
          select: {
            id: true,
            description: true,
            status: true,
            materiel: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Sent messages fetched successfully", data: messages })
  } catch (error) {
    console.error("Get sent error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /messages/probleme/:id — all messages for a specific problem
router.get("/probleme/:id", authMiddleware, async (req, res) => {
  try {
    const probleme_id = parseInt(req.params.id)

    const probleme = await prisma.probleme.findUnique({ where: { id: probleme_id } })
    if (!probleme) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    const messages = await prisma.message.findMany({
      where: { probleme_id },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { created_at: "asc" },
    })

    res.json({ success: true, message: "Thread fetched successfully", data: messages })
  } catch (error) {
    console.error("Get thread error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /messages/probleme/:id/contact
// Returns the best contact for a USER to message about a problem:
// priority: assigned operator > admin
router.get("/probleme/:id/contact", authMiddleware, async (req, res) => {
  try {
    const probleme_id = parseInt(req.params.id)

    const probleme = await prisma.probleme.findUnique({
      where: { id: probleme_id },
      include: {
        interventions: {
          orderBy: { id: "desc" },
          take: 1,
          include: {
            operator: { select: { id: true, name: true, role: true } },
          },
        },
      },
    })

    if (!probleme) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    // Try assigned operator first
    const operator = probleme.interventions?.[0]?.operator
    if (operator) {
      return res.json({ success: true, data: { contact: operator } })
    }

    // Fall back to any admin
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true, role: true },
    })

    if (admin) {
      return res.json({ success: true, data: { contact: admin } })
    }

    res.status(404).json({ success: false, message: "No contact found for this problem" })
  } catch (error) {
    console.error("Get contact error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /messages — send a message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { probleme_id, receiver_id, message } = req.body

    if (!probleme_id || !receiver_id || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "probleme_id, receiver_id, and message are required",
      })
    }

    const probleme = await prisma.probleme.findUnique({ where: { id: parseInt(probleme_id) } })
    if (!probleme) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiver_id) } })
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" })
    }

    const newMessage = await prisma.message.create({
      data: {
        probleme_id: parseInt(probleme_id),
        sender_id: req.user.id,
        receiver_id: parseInt(receiver_id),
        message: message.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    })

    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage })
  } catch (error) {
    console.error("Send message error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router