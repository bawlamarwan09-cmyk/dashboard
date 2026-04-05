const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")
const bcrypt = require("bcrypt")
const { requireRole } = require("../middlewares/role.middleware")
const { logHistorique } = require("../utils/historique.helper")

const router = express.Router()

// GET /users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, created_at: true },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Users fetched successfully", data: users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /users/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        affectations: {
          include: {
            materiel: { select: { id: true, type: true, marque: true, modele: true } },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ success: true, message: "User fetched successfully", data: user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /users
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "USER" },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "CREATE",
      entity_type: "User",
      entity_id: user.id,
      details: `Created user ${user.name} with role ${user.role}`,
    })

    res.status(201).json({ success: true, message: "User created successfully", data: user })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// PUT /users/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { name, email, role, password } = req.body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return res.status(409).json({ success: false, message: "Email already in use" })
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(password && { password: await bcrypt.hash(password, 10) }),
      },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    })

    res.json({ success: true, message: "User updated successfully", data: user })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// DELETE /users/:id
router.delete("/:id", authMiddleware,  async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    await prisma.user.delete({ where: { id } })

    await logHistorique({
      user_id: req.user.id,
      action: "DELETE",
      entity_type: "User",
      entity_id: id,
      details: `Deleted user ${existing.name}`,
    })

    res.json({ success: true, message: "User deleted successfully", data: null })
  } catch (error) {
    console.error("Delete user error:", error)
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete user: they have related records",
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router