const express = require('express');
const ctrl = require('../controllers/users.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/me', ctrl.me);
router.get('/', requireRole('Admin'), ctrl.list);
router.post('/', requireRole('Admin'), ctrl.create);
router.put('/:email', requireRole('Admin'), ctrl.update);
router.delete('/:email', requireRole('Admin'), ctrl.remove);

module.exports = router;
