const express = require('express');
const ctrl = require('../controllers/needAttention.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/count', ctrl.count);
router.post('/resolve', ctrl.resolve);
router.post('/ignore', ctrl.ignore);
router.post('/remind-later', ctrl.remindLater);

module.exports = router;
