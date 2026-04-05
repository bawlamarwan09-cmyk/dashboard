const express = require("express")
const prisma = require("../db/prisma")
const authMiddleware = require("../middlewares/auth.middleware")
const { ProblemeStatus } = require("@prisma/client")
const {
  sendStatusNotification,
  sendNewProblemToAdmins,
  sendOperatorAssignment,
} = require("../utils/email")
const { logHistorique } = require("../utils/historique.helper")

const router = express.Router()

// GET /problemes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { role, id: userId } = req.user

    let where = {}

    if (role === "OPERATOR") {
      where = {
        interventions: {
          some: { operator_id: userId },
        },
      }
    } else if (role === "USER") {
      where = { declared_by_user_id: userId }
    }

    const problemes = await prisma.probleme.findMany({
      where,
      include: {
        materiel: { select: { id: true, type: true, marque: true, modele: true, code_onee: true } },
        declaredBy: { select: { id: true, name: true, email: true } },
        interventions: { select: { id: true, resultat: true, date_intervention: true } },
      },
      orderBy: { created_at: "desc" },
    })

    res.json({ success: true, message: "Problemes fetched successfully", data: problemes })
  } catch (error) {
    console.error("Get problemes error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// GET /problemes/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { role, id: userId } = req.user

    const probleme = await prisma.probleme.findUnique({
      where: { id },
      include: {
        materiel: true,
        declaredBy: { select: { id: true, name: true, email: true } },
        interventions: {
          include: {
            operator: { select: { id: true, name: true, email: true } },
            company: { select: { id: true, name: true, email: true } },
            remplacements: true,
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
          orderBy: { created_at: "asc" },
        },
      },
    })

    if (!probleme) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    if (role === "OPERATOR") {
      const isAssigned = probleme.interventions.some((i) => i.operator_id === userId)
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: "Access denied" })
      }
    }

    if (role === "USER" && probleme.declared_by_user_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" })
    }

    res.json({ success: true, message: "Probleme fetched successfully", data: probleme })
  } catch (error) {
    console.error("Get probleme error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// POST /problemes
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { materiel_id, description } = req.body
    const declared_by_user_id = req.user.id

    if (!materiel_id || !description) {
      return res.status(400).json({ success: false, message: "materiel_id and description are required" })
    }

    const materiel = await prisma.materiel.findUnique({ where: { id: parseInt(materiel_id) } })
    if (!materiel) {
      return res.status(404).json({ success: false, message: "Materiel not found" })
    }

    const probleme = await prisma.probleme.create({
      data: {
        materiel_id: parseInt(materiel_id),
        declared_by_user_id,
        description,
        status: ProblemeStatus.DECLARED,
      },
      include: {
        materiel: { select: { id: true, type: true, marque: true, modele: true } },
        declaredBy: { select: { id: true, name: true, email: true } },
      },
    })

    await logHistorique({
      user_id: req.user.id,
      action: "CREATE",
      entity_type: "Probleme",
      entity_id: probleme.id,
      details: `Declared problem for ${materiel.marque} ${materiel.modele}: ${description}`,
    })

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    })

    const adminEmails = admins.map((a) => a.email)

    await sendNewProblemToAdmins({
      adminEmails,
      problemeId: probleme.id,
      materiel: `${materiel.marque} ${materiel.modele}`,
      declaredByName: probleme.declaredBy.name,
      declaredByEmail: probleme.declaredBy.email,
      description,
    })

    res.status(201).json({ success: true, message: "Probleme created successfully", data: probleme })
  } catch (error) {
    console.error("Create probleme error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// PATCH /problemes/:id/status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const { role, id: userId } = req.user
  const { status } = req.body

  if (role === "OPERATOR" && status !== ProblemeStatus.SENT_TO_COMPANY) {
    return res.status(403).json({ success: false, message: "Operators can only send problems to a company." })
  }

  if (role !== "ADMIN" && role !== "OPERATOR") {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  if (role === "OPERATOR") {
    const probleme = await prisma.probleme.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { interventions: { select: { operator_id: true } } },
    })
    const isAssigned = probleme?.interventions.some((i) => i.operator_id === userId)
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: "Access denied: not your problem." })
    }
  }

  try {
    const id = parseInt(req.params.id)
    const { operator_id, company_id, diagnostic } = req.body

    if (!status || !Object.values(ProblemeStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(ProblemeStatus).join(", ")}`,
      })
    }

    const existing = await prisma.probleme.findUnique({
      where: { id },
      include: {
        interventions: { orderBy: { id: "desc" }, take: 1 },
        declaredBy: { select: { id: true, name: true, email: true } },
        materiel: { select: { marque: true, modele: true } },
      },
    })

    if (!existing) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    const latestIntervention = existing.interventions[0] ?? null
    let assignedOperator = null

    await prisma.$transaction(async (tx) => {
      if (existing.status === ProblemeStatus.DECLARED && status === ProblemeStatus.UNDER_VERIFICATION) {
        if (!operator_id) throw new Error("operator_id is required to move to UNDER_VERIFICATION")
        const operator = await tx.user.findUnique({ where: { id: parseInt(operator_id) } })
        if (!operator) throw new Error("Operator not found")

        assignedOperator = operator
        await logHistorique({
          user_id: req.user.id,
          action: "STATUS_CHANGE",
          entity_type: "Probleme",
          entity_id: id,
          details: `Status changed from ${existing.status} to ${status}`,
        })
        await tx.intervention.create({
          data: {
            probleme_id: id,
            operator_id: parseInt(operator_id),
            diagnostic: diagnostic || null,
          },
        })
      }

      else if (existing.status === ProblemeStatus.UNDER_VERIFICATION && status === ProblemeStatus.SENT_TO_COMPANY) {
        if (!company_id) throw new Error("company_id is required to move to SENT_TO_COMPANY")
        if (!latestIntervention) throw new Error("No intervention found. Assign an operator first.")
        const company = await tx.user.findUnique({ where: { id: parseInt(company_id) } })
        if (!company) throw new Error("Company user not found")

        await tx.intervention.update({
          where: { id: latestIntervention.id },
          data: {
            company_id: parseInt(company_id),
            date_envoi_entreprise: new Date(),
            ...(diagnostic && { diagnostic }),
          },
        })
      }

      else if (existing.status === ProblemeStatus.UNDER_VERIFICATION && status === ProblemeStatus.REPAIRED) {
        if (!latestIntervention) throw new Error("No intervention found. Assign an operator first.")
        await tx.intervention.update({
          where: { id: latestIntervention.id },
          data: {
            repare_par_admin: true,
            resultat: "REPAIRED",
            date_intervention: new Date(),
            date_retour_final: new Date(),
            ...(diagnostic && { diagnostic }),
          },
        })
      }

      else if (
        existing.status === ProblemeStatus.SENT_TO_COMPANY &&
        (status === ProblemeStatus.REPAIRED || status === ProblemeStatus.REPLACED)
      ) {
        if (!latestIntervention) throw new Error("No intervention found for this probleme.")
        await tx.intervention.update({
          where: { id: latestIntervention.id },
          data: {
            resultat: status === ProblemeStatus.REPAIRED ? "REPAIRED" : "REPLACED",
            date_retour_drr: new Date(),
            date_retour_final: new Date(),
            ...(diagnostic && { diagnostic }),
          },
        })
      }

      else if (status === ProblemeStatus.CLOSED && latestIntervention && !latestIntervention.date_retour_final) {
        await tx.intervention.update({
          where: { id: latestIntervention.id },
          data: { date_retour_final: new Date() },
        })
      }

      await tx.probleme.update({ where: { id }, data: { status } })
    })

    const updated = await prisma.probleme.findUnique({
      where: { id },
      include: {
        materiel: { select: { id: true, marque: true, modele: true } },
        declaredBy: { select: { id: true, name: true, email: true } },
        interventions: {
          include: {
            operator: { select: { id: true, name: true, email: true } },
            company: { select: { id: true, name: true } },
            remplacements: true,
          },
          orderBy: { id: "desc" },
        },
      },
    })

    const materielLabel = `${existing.materiel?.marque} ${existing.materiel?.modele}`

    await sendStatusNotification({
      userEmail: existing.declaredBy.email,
      userName: existing.declaredBy.name,
      status,
      problemeId: id,
      materiel: materielLabel,
      operatorName: updated.interventions?.[0]?.operator?.name,
      companyName: updated.interventions?.[0]?.company?.name,
    })

    if (assignedOperator && status === ProblemeStatus.UNDER_VERIFICATION) {
      await sendOperatorAssignment({
        operatorEmail: assignedOperator.email,
        operatorName: assignedOperator.name,
        problemeId: id,
        materiel: materielLabel,
        declaredByName: existing.declaredBy.name,
        description: existing.description,
      })
    }

    res.json({ success: true, message: "Probleme status updated successfully", data: updated })
  } catch (error) {
    console.error("Update probleme status error:", error)
    res.status(400).json({ success: false, message: error.message })
  }
})

// PUT /problemes/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { description } = req.body

    const existing = await prisma.probleme.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    const probleme = await prisma.probleme.update({
      where: { id },
      data: { ...(description && { description }) },
      include: {
        materiel: { select: { id: true, marque: true, modele: true } },
        declaredBy: { select: { id: true, name: true } },
      },
    })

    res.json({ success: true, message: "Probleme updated successfully", data: probleme })
  } catch (error) {
    console.error("Update probleme error:", error)
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// DELETE /problemes/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.probleme.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, message: "Probleme not found" })
    }

    await prisma.probleme.delete({ where: { id } })
    res.json({ success: true, message: "Probleme deleted successfully", data: null })
  } catch (error) {
    console.error("Delete probleme error:", error)
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete probleme: it has related interventions or messages",
      })
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

module.exports = router