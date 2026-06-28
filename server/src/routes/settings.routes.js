const express = require('express');
const ctrl = require('../controllers/settings.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.getAll);
router.put('/', requireRole('Admin'), ctrl.setOne);

module.exports = router;
