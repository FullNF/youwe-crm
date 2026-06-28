const express = require('express');
const ctrl = require('../controllers/notifications.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/vapid-public-key', ctrl.getPublicKey);
router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);

module.exports = router;
