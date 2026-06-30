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
  if (!configured) return { total: 0, sent: 0, failed: 0, configured: false };

  const subs = await subsRepo.getAll();
  if (!subs.length) return { total: 0, sent: 0, failed: 0, configured: true };

  const json = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(pushSubscription, json);
        sent += 1;
      } catch (err) {
        failed += 1;
        // 404/410 = the browser unsubscribed or the subscription expired - clean it up.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await subsRepo.remove(sub.endpoint).catch(() => {});
        } else {
          logger.warn('Push notification failed for one subscriber:', err.message);
        }
      }
    })
  );

  return { total: subs.length, sent, failed, configured: true };
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

/** Builds the message for a deleted lead. The lead is gone, so the link goes to the Leads list. */
function deletedLeadPayload(lead, actorName) {
  return {
    title: 'Lead Deleted',
    body: `${actorName} deleted a lead — ${lead.customerName}`,
    url: '/leads',
  };
}

/**
 * "Mr Haq called Nishat at 6:00 PM but hasn't remarked or updated the stage
 * yet." - fires from the periodic no-followup check, not from any direct
 * user action.
 */
function noFollowupReminderPayload(lead) {
  const time = new Date(lead.lastContactedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const caller = lead.lastContactedBy || 'Someone';
  return {
    title: 'Follow-up Needed',
    body: `${caller} contacted ${lead.customerName} at ${time} but hasn't added a remark or updated the stage yet.`,
    url: `/leads/${lead.recordId}`,
  };
}

module.exports = { notifyAll, newLeadPayload, stageChangePayload, deletedLeadPayload, noFollowupReminderPayload };
