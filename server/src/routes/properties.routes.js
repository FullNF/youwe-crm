const express = require('express');
const ctrl = require('../controllers/properties.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/locations', ctrl.getLocations);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/media', ctrl.addMedia);
router.delete('/:id/media/:mediaId', ctrl.removeMedia);

module.exports = router;
