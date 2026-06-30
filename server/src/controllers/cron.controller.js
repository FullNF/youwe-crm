const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const env = require('../config/env');
const followupReminderService = require('../services/followupReminder.service');

/**
 * Intended to be called periodically (every 5-10 minutes) by an external
 * scheduler like cron-job.org, since Render's free tier has no built-in
 * cron support. Protected by a shared secret rather than user auth, since
 * the caller isn't a logged-in person.
 */
const checkFollowups = asyncHandler(async (req, res) => {
  const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
  if (!env.CRON_SECRET) {
    return fail(res, 'CRON_SECRET is not configured on the server yet.', 503);
  }
  if (providedSecret !== env.CRON_SECRET) {
    return fail(res, 'Invalid or missing cron secret.', 401);
  }

  const result = await followupReminderService.checkForMissedFollowups();
  return ok(res, result);
});

module.exports = { checkFollowups };
