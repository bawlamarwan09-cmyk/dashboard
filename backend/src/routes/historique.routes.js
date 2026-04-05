const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()

// GET /historique - Get all historique entries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const historique = await prisma.historique.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Historique fetched successfully", data: historique })
  } catch (error) {
    console.error("Get historique error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /historique/:entity_type/:entity_id - Get historique for a specific entity
router.get("/:entity_type/:entity_id", authMiddleware, async (req, res) => {
  try {
    const { entity_type } = req.params
    const entity_id = parseInt(req.params.entity_id)

    if (isNaN(entity_id)) {
      return res.status(400).json({ success: false, message: "Invalid entity_id" })
    }

    const historique = await prisma.historique.findMany({
      where: { entity_type, entity_id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Historique fetched successfully", data: historique })
  } catch (error) {
    console.error("Get historique by entity error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router