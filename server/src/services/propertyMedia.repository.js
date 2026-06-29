const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { PROPERTY_MEDIA_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');
const { buildDriveUrls } = require('../utils/driveLink');

const TAB = env.SHEET_TAB_PROPERTY_MEDIA;

async function getAll() {
  const rows = await sheetsService.getAllObjects(TAB, PROPERTY_MEDIA_COLUMNS);
  return rows.filter((r) => r.id);
}

async function getById(id) {
  const all = await getAll();
  const item = all.find((m) => m.id === id);
  return item ? { ...item, ...buildDriveUrls(item.driveLink) } : null;
}

async function getForProperty(propertyId) {
  const all = await getAll();
  return all
    .filter((m) => m.propertyId === propertyId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((m) => ({ ...m, ...buildDriveUrls(m.driveLink) }));
}

/** One thumbnail per property, for the gallery card - cheap, no need to fetch every media row's full list. */
async function getFirstThumbnailsByProperty() {
  const all = await getAll();
  const map = new Map();
  all
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((m) => {
      if (!map.has(m.propertyId)) {
        map.set(m.propertyId, buildDriveUrls(m.driveLink).thumbnailUrl);
      }
    });
  return map;
}

async function getCountsByProperty() {
  const all = await getAll();
  const counts = new Map();
  all.forEach((m) => {
    const c = counts.get(m.propertyId) || { photos: 0, videos: 0 };
    if (m.mediaType === 'Video') c.videos += 1;
    else c.photos += 1;
    counts.set(m.propertyId, c);
  });
  return counts;
}

async function add(propertyId, { mediaType, driveLink, caption }, addedByEmail) {
  const { fileId } = buildDriveUrls(driveLink);
  const obj = {
    id: uuidv4(),
    propertyId,
    mediaType: mediaType === 'Video' ? 'Video' : 'Photo',
    driveLink,
    fileId: fileId || '',
    caption: caption || '',
    addedBy: addedByEmail || '',
    createdAt: nowIso(),
  };
  await sheetsService.appendObject(TAB, PROPERTY_MEDIA_COLUMNS, obj);
  return { ...obj, ...buildDriveUrls(driveLink) };
}

async function remove(id) {
  const rows = await sheetsService.getAllObjects(TAB, PROPERTY_MEDIA_COLUMNS);
  const existing = rows.find((m) => m.id === id);
  if (!existing) return false;
  await sheetsService.clearRow(TAB, PROPERTY_MEDIA_COLUMNS, existing._sheetRow);
  return true;
}

async function removeAllForProperty(propertyId) {
  const all = await getAll();
  const toRemove = all.filter((m) => m.propertyId === propertyId);
  for (const m of toRemove) {
    await sheetsService.clearRow(TAB, PROPERTY_MEDIA_COLUMNS, m._sheetRow);
  }
}

module.exports = { getById, getForProperty, getFirstThumbnailsByProperty, getCountsByProperty, add, remove, removeAllForProperty };
