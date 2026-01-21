const express = require('express');
const { InfoController } = require('../../controllers');
const authRoutes = require('./auth-routes');

const router = express.Router();

router.get('/info', InfoController.info);
router.use('/auth', authRoutes);

module.exports = router;
