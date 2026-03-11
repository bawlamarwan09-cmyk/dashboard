const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

router.use('/auth', authRoutes);

module.exports = router;
