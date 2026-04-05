const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")
const { logHistorique } = require("../utils/historique.helper")

const router = express.Router()

// GET /materiels
router.get("/", authMiddleware, async (req, res) => {
  try {
    const materiels = await prisma.materiel.findMany({
      include: {
        affectations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          take: 1,
        },
        problemes: {
          where: {
            status: { notIn: ["CLOSED", "REPAIRED", "REPLACED"] },
          },
          select: { id: true, status: true },
        },
      },
      orderBy: { id: "desc" },
    })

    res.json({ success: true, message: "Materiels fetched successfully", data: materiels })
  } catch (error) {
    console.error("Get materiels error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /materiels/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const materiel = await prisma.materiel.findUnique({
      where: { id },
      include: {
        affectations: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { date_debut: "desc" },
        },
        problemes: {
          include: {
            declaredBy: { select: { id: true, name: true, email: true } },
            interventions: {
              select: { id: true, resultat: true, date_intervention: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    })

    if (!materiel) {
      return res.status(404).json({ success: false, message: "Materiel not found" })
    }

    res.json({ success: true, message: "Materiel fetched successfully", data: materiel })
  } catch (error) {
    console.error("Get materiel error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /materiels
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      marque,
      modele,
      code_onee,
      numero_serie,
      numero_inventaire,
      date_arrive_drr,
    } = req.body

    if (!type || !marque || !modele || !code_onee || !numero_serie || !numero_inventaire || !date_arrive_drr) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: type, marque, modele, code_onee, numero_serie, numero_inventaire, date_arrive_drr",
      })
    }

    const materiel = await prisma.materiel.create({
      data: {
        type,
        marque,
        modele,
        code_onee,
        numero_serie,
        numero_inventaire,
        date_arrive_drr: new Date(date_arrive_drr),
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "CREATE",
      entity_type: "Materiel",
      entity_id: materiel.id,
      details: `Added ${materiel.marque} ${materiel.modele} (${materiel.type})`,
    })

    res.status(201).json({ success: true, message: "Materiel created successfully", data: materiel })
  } catch (error) {
    console.error("Create materiel error:", error)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `A materiel with this ${error.meta?.target?.join(", ")} already exists`,
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// PUT /materiels/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const {
      type,
      marque,
      modele,
      code_onee,
      numero_serie,
      numero_inventaire,
      date_arrive_drr,
    } = req.body

    const existing = await prisma.materiel.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "Materiel not found" })
    }

    const materiel = await prisma.materiel.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(marque && { marque }),
        ...(modele && { modele }),
        ...(code_onee && { code_onee }),
        ...(numero_serie && { numero_serie }),
        ...(numero_inventaire && { numero_inventaire }),
        ...(date_arrive_drr && { date_arrive_drr: new Date(date_arrive_drr) }),
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "UPDATE",
      entity_type: "Materiel",
      entity_id: id,
      details: `Updated ${materiel.marque} ${materiel.modele}`,
    })

    res.json({ success: true, message: "Materiel updated successfully", data: materiel })
  } catch (error) {
    console.error("Update materiel error:", error)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `A materiel with this ${error.meta?.target?.join(", ")} already exists`,
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// DELETE /materiels/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.materiel.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "Materiel not found" })
    }

    // Block delete if materiel has active problems or affectations
    const [activeProblemes, activeAffectations] = await Promise.all([
      prisma.probleme.count({
        where: { materiel_id: id, status: { notIn: ["CLOSED", "REPAIRED", "REPLACED"] } },
      }),
      prisma.affectation.count({ where: { materiel_id: id } }),
    ])

    if (activeProblemes > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete materiel: it has active problems. Close them first.",
      })
    }

    if (activeAffectations > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete materiel: it is currently assigned to a user. Unassign it first.",
      })
    }

    await prisma.materiel.delete({ where: { id } })

    await logHistorique({
      user_id: req.user.id,
      action: "DELETE",
      entity_type: "Materiel",
      entity_id: id,
      details: `Deleted ${existing.marque} ${existing.modele} (${existing.type})`,
    })

    res.json({ success: true, message: "Materiel deleted successfully", data: null })
  } catch (error) {
    console.error("Delete materiel error:", error)
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete materiel: it has related records",
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router