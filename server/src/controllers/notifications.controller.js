const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const env = require('../config/env');
const subsRepo = require('../services/pushSubscriptions.repository');

const getPublicKey = asyncHandler(async (req, res) => {
  if (!env.VAPID_PUBLIC_KEY) return fail(res, 'Push notifications are not configured on the server yet.', 503);
  return ok(res, { publicKey: env.VAPID_PUBLIC_KEY });
});

const subscribe = asyncHandler(async (req, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint) return fail(res, 'A valid push subscription is required', 422);
  const saved = await subsRepo.save(req.user.email, subscription);
  return ok(res, saved);
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return fail(res, 'endpoint is required', 422);
  await subsRepo.remove(endpoint);
  return ok(res, { unsubscribed: true });
});

module.exports = { getPublicKey, subscribe, unsubscribe };
