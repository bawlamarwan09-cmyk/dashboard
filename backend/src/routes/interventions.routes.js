const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")
const { InterventionResult } = require("@prisma/client")
const { logHistorique } = require("../utils/historique.helper")

const router = express.Router()

// GET /interventions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const interventions = await prisma.intervention.findMany({
      include: {
        probleme: {
          include: {
            materiel: {
              select: { id: true, type: true, marque: true, modele: true, code_onee: true },
            },
          },
        },
        operator: { select: { id: true, name: true, email: true, role: true } },
        company: { select: { id: true, name: true, email: true, role: true } },
        remplacements: true,
      },
      orderBy: { id: "desc" },
    })

    res.json({ success: true, message: "Interventions fetched successfully", data: interventions })
  } catch (error) {
    console.error("Get interventions error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /interventions/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const intervention = await prisma.intervention.findUnique({
      where: { id },
      include: {
        probleme: {
          include: {
            materiel: true,
            declaredBy: { select: { id: true, name: true, email: true } },
          },
        },
        operator: { select: { id: true, name: true, email: true, role: true } },
        company: { select: { id: true, name: true, email: true, role: true } },
        remplacements: {
          include: {
            ancienMateriel: {
              select: { id: true, marque: true, modele: true, code_onee: true, numero_serie: true },
            },
          },
        },
      },
    })

    if (!intervention) {
      return res.status(404).json({ success: false, message: "Intervention not found" })
    }

    res.json({ success: true, message: "Intervention fetched successfully", data: intervention })
  } catch (error) {
    console.error("Get intervention error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /interventions
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { probleme_id, operator_id, company_id, diagnostic, repare_par_admin } = req.body

    if (!probleme_id || !operator_id) {
      return res.status(400).json({
        success: false,
        message: "probleme_id and operator_id are required",
      })
    }

    const probleme = await prisma.probleme.findUnique({ where: { id: parseInt(probleme_id) } })
    if (!probleme) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    const operator = await prisma.user.findUnique({ where: { id: parseInt(operator_id) } })
    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" })
    }

    if (company_id) {
      const company = await prisma.user.findUnique({ where: { id: parseInt(company_id) } })
      if (!company) {
        return res.status(404).json({ success: false, message: "Company user not found" })
      }
    }

    const intervention = await prisma.intervention.create({
      data: {
        probleme_id: parseInt(probleme_id),
        operator_id: parseInt(operator_id),
        company_id: company_id ? parseInt(company_id) : null,
        diagnostic: diagnostic || null,
        repare_par_admin: repare_par_admin ?? false,
      },
      include: {
        probleme: {
          include: {
            materiel: { select: { id: true, marque: true, modele: true } },
          },
        },
        operator: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, email: true } },
        remplacements: true,
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "CREATE",
      entity_type: "Intervention",
      entity_id: intervention.id,
      details: `Intervention created for problem #${probleme_id}`,
    })

    res.status(201).json({ success: true, message: "Intervention created successfully", data: intervention })
  } catch (error) {
    console.error("Create intervention error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// PUT /interventions/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const {
      company_id,
      repare_par_admin,
      diagnostic,
      date_envoi_entreprise,
      reference_envoi,
      date_retour_drr,
      reference_retour,
      resultat,
      date_intervention,
      date_retour_final,
    } = req.body

    const existing = await prisma.intervention.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "Intervention not found" })
    }

    if (resultat && !Object.values(InterventionResult).includes(resultat)) {
      return res.status(400).json({
        success: false,
        message: `Invalid resultat. Must be one of: ${Object.values(InterventionResult).join(", ")}`,
      })
    }

    const intervention = await prisma.intervention.update({
      where: { id },
      data: {
        ...(company_id !== undefined && { company_id: company_id ? parseInt(company_id) : null }),
        ...(repare_par_admin !== undefined && { repare_par_admin }),
        ...(diagnostic !== undefined && { diagnostic }),
        ...(date_envoi_entreprise !== undefined && {
          date_envoi_entreprise: date_envoi_entreprise ? new Date(date_envoi_entreprise) : null,
        }),
        ...(reference_envoi !== undefined && { reference_envoi }),
        ...(date_retour_drr !== undefined && {
          date_retour_drr: date_retour_drr ? new Date(date_retour_drr) : null,
        }),
        ...(reference_retour !== undefined && { reference_retour }),
        ...(resultat !== undefined && { resultat }),
        ...(date_intervention !== undefined && {
          date_intervention: date_intervention ? new Date(date_intervention) : null,
        }),
        ...(date_retour_final !== undefined && {
          date_retour_final: date_retour_final ? new Date(date_retour_final) : null,
        }),
      },
      include: {
        probleme: {
          include: {
            materiel: { select: { id: true, marque: true, modele: true } },
          },
        },
        operator: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, email: true } },
        remplacements: true,
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "UPDATE",
      entity_type: "Intervention",
      entity_id: id,
      details: `Intervention #${id} updated`,
    })

    res.json({ success: true, message: "Intervention updated successfully", data: intervention })
  } catch (error) {
    console.error("Update intervention error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /interventions/:id/remplacements
router.post("/:id/remplacements", authMiddleware, async (req, res) => {
  try {
    const intervention_id = parseInt(req.params.id)
    const {
      ancien_materiel_id,
      nouveau_marque,
      nouveau_modele,
      nouveau_code_onee,
      nouveau_numero_serie,
    } = req.body

    if (!ancien_materiel_id || !nouveau_marque || !nouveau_modele || !nouveau_code_onee || !nouveau_numero_serie) {
      return res.status(400).json({
        success: false,
        message: "ancien_materiel_id, nouveau_marque, nouveau_modele, nouveau_code_onee, and nouveau_numero_serie are required",
      })
    }

    const intervention = await prisma.intervention.findUnique({ where: { id: intervention_id } })
    if (!intervention) {
      return res.status(404).json({ success: false, message: "Intervention not found" })
    }

    const ancienMateriel = await prisma.materiel.findUnique({ where: { id: parseInt(ancien_materiel_id) } })
    if (!ancienMateriel) {
      return res.status(404).json({ success: false, message: "Ancien materiel not found" })
    }

    const remplacement = await prisma.remplacement.create({
      data: {
        intervention_id,
        ancien_materiel_id: parseInt(ancien_materiel_id),
        nouveau_marque,
        nouveau_modele,
        nouveau_code_onee,
        nouveau_numero_serie,
      },
      include: {
        ancienMateriel: { select: { id: true, marque: true, modele: true, code_onee: true } },
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "CREATE",
      entity_type: "Remplacement",
      entity_id: remplacement.id,
      details: `Device replaced in intervention #${intervention_id}`,
    })

    res.status(201).json({ success: true, message: "Remplacement added successfully", data: remplacement })
  } catch (error) {
    console.error("Add remplacement error:", error)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `A remplacement with this ${error.meta?.target?.join(", ")} already exists`,
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router