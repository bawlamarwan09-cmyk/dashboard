const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")
const bcrypt = require("bcrypt")

const router = express.Router()

// GET /settings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, preferences: true },
    })

    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const preferences = user.preferences || {
      notifications: {
        email: true,
        problemUpdates: true,
        interventionUpdates: true,
        deviceAssignments: true,
        newMessages: true,
        systemAnnouncements: false,
      },
      appearance: { theme: "system" },
    }

    res.json({
      success: true,
      data: {
        profile: { name: user.name, email: user.email, role: user.role },
        preferences,
      },
    })
  } catch (error) {
    console.error("Get settings error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// PUT /settings/profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body

    if (!name && !email) {
      return res.status(400).json({ success: false, message: "Nothing to update" })
    }

    if (email) {
      const taken = await prisma.user.findFirst({
        where: { email, NOT: { id: req.user.id } },
      })
      if (taken) {
        return res.status(409).json({ success: false, message: "Email already in use" })
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: { id: true, name: true, email: true, role: true },
    })

    res.json({ success: true, message: "Profile updated successfully", data: user })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// PUT /settings/password
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(currentPassword, user.password)

    if (!valid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })

    res.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// PUT /settings/preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { notifications, appearance } = req.body

    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { preferences: true },
    })

    const merged = {
      ...(current.preferences || {}),
      ...(notifications && { notifications }),
      ...(appearance && { appearance }),
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences: merged },
    })

    res.json({ success: true, message: "Preferences saved", data: merged })
  } catch (error) {
    console.error("Update preferences error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router