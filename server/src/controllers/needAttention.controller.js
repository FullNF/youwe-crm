const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const engine = require('../services/needAttention.engine');

const list = asyncHandler(async (req, res) => {
  const items = await engine.getOpenList();
  return ok(res, items, { total: items.length });
});

const count = asyncHandler(async (req, res) => {
  const total = await engine.getCount();
  return ok(res, { count: total });
});

const resolve = asyncHandler(async (req, res) => {
  const { leadRecordId, issueType } = req.body;
  if (!leadRecordId || !issueType) return fail(res, 'leadRecordId and issueType are required', 422);
  const result = await engine.resolve(leadRecordId, issueType);
  return ok(res, result);
});

const ignore = asyncHandler(async (req, res) => {
  const { leadRecordId, issueType, reason } = req.body;
  if (!leadRecordId || !issueType) return fail(res, 'leadRecordId and issueType are required', 422);
  const result = await engine.ignore(leadRecordId, issueType, reason, req.user.email);
  return ok(res, result);
});

const remindLater = asyncHandler(async (req, res) => {
  const { leadRecordId, issueType, days } = req.body;
  if (!leadRecordId || !issueType) return fail(res, 'leadRecordId and issueType are required', 422);
  const result = await engine.remindLater(leadRecordId, issueType, Number(days) || 1, req.user.email);
  return ok(res, result);
});

module.exports = { list, count, resolve, ignore, remindLater };
