const prisma = require("../db/prisma")

/**
 * Log an action to the historique table.
 * Call this after any significant create / update / delete.
 *
 * @example
 * await logHistorique({
 *   user_id: req.user.id,
 *   action: "CREATE",
 *   entity_type: "Probleme",
 *   entity_id: probleme.id,
 *   details: `Declared problem for ${materiel.marque} ${materiel.modele}`,
 * })
 */
const logHistorique = async ({ user_id, action, entity_type, entity_id, details }) => {
  try {
    await prisma.historique.create({
      data: {
        user_id,
        action,
        entity_type,
        entity_id,
        details: details || null,
      },
    })
  } catch (err) {
    // Never crash the main request if logging fails
    console.error("logHistorique failed:", err.message)
  }
}

module.exports = { logHistorique }