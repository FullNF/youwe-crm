const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { PROPERTIES_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_PROPERTIES;

async function getAll() {
  const rows = await sheetsService.getAllObjects(TAB, PROPERTIES_COLUMNS);
  return rows.filter((r) => r.id);
}

async function getById(id) {
  const all = await getAll();
  return all.find((p) => p.id === id) || null;
}

async function create(payload, createdByEmail) {
  const obj = {
    id: uuidv4(),
    name: payload.name || '',
    location: payload.location || '',
    propertyType: payload.propertyType || '',
    furnishing: payload.furnishing || '',
    priceRange: payload.priceRange || '',
    description: payload.description || '',
    createdBy: createdByEmail || '',
    createdAt: nowIso(),
  };
  await sheetsService.appendObject(TAB, PROPERTIES_COLUMNS, obj);
  return obj;
}

async function update(id, patch) {
  const rows = await sheetsService.getAllObjects(TAB, PROPERTIES_COLUMNS);
  const existing = rows.find((p) => p.id === id);
  if (!existing) return null;
  const merged = { ...existing, ...patch, id, createdAt: existing.createdAt, createdBy: existing.createdBy };
  await sheetsService.updateRow(TAB, PROPERTIES_COLUMNS, existing._sheetRow, merged);
  return merged;
}

async function remove(id) {
  const rows = await sheetsService.getAllObjects(TAB, PROPERTIES_COLUMNS);
  const existing = rows.find((p) => p.id === id);
  if (!existing) return false;
  await sheetsService.clearRow(TAB, PROPERTIES_COLUMNS, existing._sheetRow);
  return true;
}

/** Simple search/filter for the gallery page - no pagination needed at this scale. */
async function query({ search = '', location = '', propertyType = '' } = {}) {
  let all = await getAll();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    all = all.filter((p) =>
      [p.name, p.location, p.propertyType, p.furnishing, p.priceRange, p.description].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }
  if (location) all = all.filter((p) => p.location.toLowerCase() === location.toLowerCase());
  if (propertyType) all = all.filter((p) => p.propertyType === propertyType);

  all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return all;
}

async function getDistinctLocations() {
  const all = await getAll();
  const locations = new Set(all.map((p) => p.location).filter(Boolean));
  return Array.from(locations).sort();
}

module.exports = { getAll, getById, create, update, remove, query, getDistinctLocations };
