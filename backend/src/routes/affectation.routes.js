const express = require("express");
const prisma = require("../db/prisma");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /affectation - Get all affectations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const affectations = await prisma.affectation.findMany({
      include: {
        materiel: {
          include: {
            problemes: { select: { id: true, status: true } },
          },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date_debut: "desc" },
    });

    res.json({ success: true, message: "Affectations fetched successfully", data: affectations });
  } catch (error) {
    console.error("Get affectations error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /affectation/:id - Get single affectation
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const affectation = await prisma.affectation.findUnique({
      where: { id },
      include: {
        materiel: {
          include: {
            problemes: {
              include: {
                interventions: { select: { id: true, resultat: true, date_intervention: true } },
              },
              orderBy: { created_at: "desc" },
            },
          },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!affectation) {
      return res.status(404).json({ success: false, message: "Affectation not found" });
    }

    res.json({ success: true, message: "Affectation fetched successfully", data: affectation });
  } catch (error) {
    console.error("Get affectation error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /affectation/materiel/:materielId - Get affectations by materiel
router.get("/materiel/:materielId", authMiddleware, async (req, res) => {
  try {
    const materiel_id = parseInt(req.params.materielId);

    const affectations = await prisma.affectation.findMany({
      where: { materiel_id },
      include: {
        materiel: {
          include: {
            problemes: { select: { id: true, status: true } },
          },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date_debut: "desc" },
    });

    res.json({ success: true, message: "Affectations fetched successfully", data: affectations });
  } catch (error) {
    console.error("Get affectations by materiel error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET /affectation/user/:userId - Get affectations by user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const user_id = parseInt(req.params.userId);

    const affectations = await prisma.affectation.findMany({
      where: { user_id },
      include: {
        materiel: {
          include: {
            problemes: { select: { id: true, status: true } },
          },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date_debut: "desc" },
    });

    res.json({ success: true, message: "Affectations fetched successfully", data: affectations });
  } catch (error) {
    console.error("Get affectations by user error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /affectation - Create affectation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      materiel_id,
      user_id,
      entite,
      agence,
      secteur,
      centre,
      date_debut,
    } = req.body;

    if (!materiel_id || !user_id || !entite || !agence || !secteur || !centre || !date_debut) {
      return res.status(400).json({
        success: false,
        message: "materiel_id, user_id, entite, agence, secteur, centre, and date_debut are required",
      });
    }

    const materiel = await prisma.materiel.findUnique({ where: { id: parseInt(materiel_id) } });
    if (!materiel) {
      return res.status(404).json({ success: false, message: "Materiel not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(user_id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const affectation = await prisma.affectation.create({
      data: {
        materiel_id: parseInt(materiel_id),
        user_id: parseInt(user_id),
        entite,
        agence,
        secteur,
        centre,
        date_debut: new Date(date_debut),
      },
      include: {
        materiel: { select: { id: true, type: true, marque: true, modele: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, message: "Affectation created successfully", data: affectation });
  } catch (error) {
    console.error("Create affectation error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// PUT /affectation/:id - Update affectation
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { entite, agence, secteur, centre, date_debut } = req.body;

    const existing = await prisma.affectation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Affectation not found" });
    }

    const affectation = await prisma.affectation.update({
      where: { id },
      data: {
        ...(entite && { entite }),
        ...(agence && { agence }),
        ...(secteur && { secteur }),
        ...(centre && { centre }),
        ...(date_debut && { date_debut: new Date(date_debut) }),
      },
      include: {
        materiel: { select: { id: true, type: true, marque: true, modele: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, message: "Affectation updated successfully", data: affectation });
  } catch (error) {
    console.error("Update affectation error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// DELETE /affectation/:id - Delete affectation
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.affectation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Affectation not found" });
    }

    await prisma.affectation.delete({ where: { id } });

    res.json({ success: true, message: "Affectation deleted successfully", data: null });
  } catch (error) {
    console.error("Delete affectation error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;