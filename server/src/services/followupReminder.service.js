const leadsRepo = require('./leads.repository');
const notificationsService = require('./notifications.service');
const logger = require('../utils/logger');

const REMINDER_DELAY_MINUTES = 15;

/**
 * Finds leads where Call/WhatsApp was tapped (lastContactedAt set) at least
 * REMINDER_DELAY_MINUTES ago, but nothing has happened since (lastUpdated
 * is still the same moment as lastContactedAt - i.e. no remark, no stage
 * change), and no reminder has already gone out for this specific contact
 * attempt (contactReminderSentAt empty). Sends one nudge per attempt, then
 * marks it sent so it doesn't repeat on every cron run.
 *
 * This is intentionally simple and stateless across runs - it just re-scans
 * every lead each time it's called. At realistic team sizes (hundreds of
 * leads, not tens of thousands) this comfortably fits in one Sheets read.
 */
async function checkForMissedFollowups() {
  const leads = await leadsRepo.getAll();
  const now = Date.now();
  let sent = 0;

  for (const lead of leads) {
    if (!lead.lastContactedAt) continue;
    if (lead.contactReminderSentAt) continue; // already nudged for this attempt

    const contactedAt = new Date(lead.lastContactedAt).getTime();
    if (Number.isNaN(contactedAt)) continue;

    const minutesSinceContact = (now - contactedAt) / 60000;
    if (minutesSinceContact < REMINDER_DELAY_MINUTES) continue;

    const updatedAt = new Date(lead.lastUpdated || 0).getTime();
    if (updatedAt > contactedAt + 5000) continue;

    try {
      await notificationsService.notifyAll(notificationsService.noFollowupReminderPayload(lead));
      await leadsRepo.update(lead.recordId, { contactReminderSentAt: new Date().toISOString() });
      sent += 1;
    } catch (err) {
      logger.warn(`Could not send follow-up reminder for lead ${lead.recordId}:`, err.message);
    }
  }

  return { checked: leads.length, remindersSent: sent };
}

module.exports = { checkForMissedFollowups, REMINDER_DELAY_MINUTES };
