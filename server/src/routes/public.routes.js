const express = require('express');
const ctrl = require('../controllers/public.controller');

const router = express.Router();

// Deliberately NOT calling requireAuth here - these endpoints power links
// shared with customers who don't have (and shouldn't need) a CRM login.
router.get('/media/:mediaId', ctrl.getPublicMedia);

module.exports = router;
