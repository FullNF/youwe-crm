const express = require('express');
const ctrl = require('../controllers/reports.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/full', ctrl.getFull);
router.get('/lead-source', ctrl.getLeadSource);
router.get('/lead-stage', ctrl.getLeadStage);
router.get('/agent-performance', ctrl.getAgentPerformance);
router.get('/need-loan', ctrl.getNeedLoan);
router.get('/conversion', ctrl.getConversion);
router.get('/export/excel', ctrl.exportExcel);
router.get('/export/csv', ctrl.exportCsv);
router.get('/export/pdf', ctrl.exportPdf);

module.exports = router;
