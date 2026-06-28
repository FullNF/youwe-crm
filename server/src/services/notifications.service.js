const webpush = require('web-push');
const env = require('../config/env');
const logger = require('../utils/logger');
const subsRepo = require('./pushSubscriptions.repository');

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    logger.warn('VAPID keys not set - push notifications are disabled until VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY are configured.');
    return;
  }
  webpush.setVapidDetails(env.VAPID_SUBJECT || 'mailto:admin@youwegroup.com', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
}

/**
 * Sends a push notification to every subscribed team member.
 * payload: { title, body, url }
 */
async function notifyAll(payload) {
  ensureConfigured();
  if (!configured) return;

  const subs = await subsRepo.getAll();
  if (!subs.length) return;

  const json = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(pushSubscription, json);
      } catch (err) {
        // 404/410 = the browser unsubscribed or the subscription expired - clean it up.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await subsRepo.remove(sub.endpoint).catch(() => {});
        } else {
          logger.warn('Push notification failed for one subscriber:', err.message);
        }
      }
    })
  );
}

/** Builds the message for a brand-new lead. */
function newLeadPayload(lead, actorName) {
  const priority = lead.priority || 'Warm';
  return {
    title: 'New Lead Added',
    body: `${actorName} added a new ${priority} lead — ${lead.customerName}`,
    url: `/leads/${lead.recordId}`,
  };
}

/** Builds the message for a stage change, formatted as "Old > New (Actor)". */
function stageChangePayload(lead, fromStage, toStage, actorName) {
  return {
    title: lead.customerName || 'Lead updated',
    body: `${fromStage || '—'} > ${toStage} (${actorName})`,
    url: `/leads/${lead.recordId}`,
  };
}

module.exports = { notifyAll, newLeadPayload, stageChangePayload };
