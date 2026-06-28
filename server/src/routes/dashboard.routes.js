const express = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', ctrl.getSummary);
router.get('/trend', ctrl.getTrend);

module.exports = router;
