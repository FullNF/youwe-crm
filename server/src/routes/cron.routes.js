const express = require('express');
const ctrl = require('../controllers/cron.controller');

const router = express.Router();

// Deliberately NOT calling requireAuth - the caller is an external cron
// service, not a logged-in user. Protected by CRON_SECRET instead.
router.get('/check-followups', ctrl.checkFollowups);
router.post('/check-followups', ctrl.checkFollowups);

module.exports = router;
