const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('./users.routes');
const problemesRoutes = require('./problemes.routes');
const interventionsRoutes = require('./interventions.routes');
const historiqueRoutes = require('./historique.routes');
const settingsRoutes = require('./settings.routes');
const authMiddleware = require('../middlewares/auth.middleware');
const materielRoutes = require('./materiel.routes');
const affectationRoutes = require('./affectation.routes');
const messagesRoutes = require('./messages.routes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/problemes', problemesRoutes);
router.use('/interventions', interventionsRoutes);
router.use('/historique', historiqueRoutes);
router.use('/settings', settingsRoutes);
router.use('/materiels', materielRoutes);
router.use('/affectations', affectationRoutes);
router.use('/messages', messagesRoutes);
module.exports = router;