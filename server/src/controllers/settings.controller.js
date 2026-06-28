const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const settingsRepo = require('../services/settings.repository');

const getAll = asyncHandler(async (req, res) => ok(res, await settingsRepo.getAll()));

const setOne = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key) return fail(res, 'key is required', 422);
  const updated = await settingsRepo.set(key, value);
  return ok(res, { key, value: updated });
});

module.exports = { getAll, setOne };
