const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { USERS_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_USERS;

async function getAll() {
  return sheetsService.getAllObjects(TAB, USERS_COLUMNS);
}

async function getByEmail(email) {
  if (!email) return null;
  const all = await getAll();
  return all.find((u) => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function create({ email, name, role }) {
  const obj = { email, name: name || email, role: role || 'Employee', active: 'Yes', createdAt: nowIso() };
  await sheetsService.appendObject(TAB, USERS_COLUMNS, obj);
  return obj;
}

async function update(email, patch) {
  const all = await sheetsService.getAllObjects(TAB, USERS_COLUMNS);
  const existing = all.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!existing) return null;
  const merged = { ...existing, ...patch, email: existing.email };
  await sheetsService.updateRow(TAB, USERS_COLUMNS, existing._sheetRow, merged);
  return merged;
}

async function remove(email) {
  const all = await sheetsService.getAllObjects(TAB, USERS_COLUMNS);
  const existing = all.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!existing) return false;
  await sheetsService.clearRow(TAB, USERS_COLUMNS, existing._sheetRow);
  return true;
}

/** Ensures at least one Admin exists, seeded from SEED_ADMIN_EMAIL on first boot. */
async function ensureSeedAdmin() {
  if (!env.SEED_ADMIN_EMAIL) return;
  const all = await getAll();
  if (all.length > 0) return;
  await create({ email: env.SEED_ADMIN_EMAIL, name: env.SEED_ADMIN_NAME, role: 'Admin' });
}

module.exports = { getAll, getByEmail, create, update, remove, ensureSeedAdmin };
