const express = require('express');
const ctrl = require('../controllers/leads.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/check-duplicate', ctrl.checkDuplicates);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/remarks', ctrl.addRemark);
router.post('/:id/log-contact', ctrl.logContact);

module.exports = router;
