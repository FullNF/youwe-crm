const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const reportsService = require('../services/reports.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await reportsService.getDashboardSummary();
  return ok(res, summary);
});

const getTrend = asyncHandler(async (req, res) => {
  const granularity = req.query.granularity || 'daily';
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const trend = await reportsService.getTrend({ granularity, days });
  return ok(res, trend);
});

module.exports = { getSummary, getTrend };
