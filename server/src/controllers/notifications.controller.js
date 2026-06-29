const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const env = require('../config/env');
const subsRepo = require('../services/pushSubscriptions.repository');
const notificationsService = require('../services/notifications.service');

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

/** Manually fires a push notification to every subscribed device - handy for testing. */
const sendTest = asyncHandler(async (req, res) => {
  const { title, body, url, image } = req.body || {};
  const result = await notificationsService.notifyAll({
    title: title || 'Test Notification',
    body: body || `Sent by ${req.user.name} from Settings`,
    url: url || '/',
    image: image || undefined,
  });

  if (!result.configured) {
    return fail(res, 'Push notifications are not configured on the server yet (VAPID keys missing).', 503);
  }
  if (result.total === 0) {
    return fail(res, 'No devices are subscribed to notifications yet. Enable notifications on at least one device first.', 422);
  }
  return ok(res, result);
});

module.exports = { getPublicKey, subscribe, unsubscribe, sendTest };
