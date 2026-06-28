const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { PUSH_SUBSCRIPTIONS_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_PUSH_SUBSCRIPTIONS;

async function getAll() {
  return sheetsService.getAllObjects(TAB, PUSH_SUBSCRIPTIONS_COLUMNS);
}

async function save(userEmail, subscription) {
  const all = await getAll();
  const existing = all.find((s) => s.endpoint === subscription.endpoint);
  if (existing) return existing; // already saved (e.g. browser re-subscribed with same endpoint)

  const obj = {
    id: uuidv4(),
    userEmail,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys?.p256dh || '',
    auth: subscription.keys?.auth || '',
    createdAt: nowIso(),
  };
  await sheetsService.appendObject(TAB, PUSH_SUBSCRIPTIONS_COLUMNS, obj);
  return obj;
}

async function remove(endpoint) {
  const all = await getAll();
  const existing = all.find((s) => s.endpoint === endpoint);
  if (!existing) return false;
  await sheetsService.clearRow(TAB, PUSH_SUBSCRIPTIONS_COLUMNS, existing._sheetRow);
  return true;
}

module.exports = { getAll, save, remove };
