const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { TIMELINE_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_TIMELINE;

/**
 * Append-only event log for a lead. Remarks/status changes are NEVER
 * overwritten here - every call to `addEvent` creates a brand new row,
 * so a lead's full history is always reconstructable.
 */

async function getForLead(leadRecordId) {
  const all = await sheetsService.getAllObjects(TAB, TIMELINE_COLUMNS);
  return all
    .filter((e) => e.leadRecordId === leadRecordId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Reads the entire Timeline sheet ONCE and returns a Map of
 * leadRecordId → the single most-recent timeline event for that lead.
 * Used by the leads list to show "last actor" without N+1 sheet reads.
 */
async function getLastEventPerLead() {
  const all = await sheetsService.getAllObjects(TAB, TIMELINE_COLUMNS);
  const map = new Map();
  for (const event of all) {
    if (!event.leadRecordId || !event.createdAt) continue;
    const existing = map.get(event.leadRecordId);
    if (!existing || new Date(event.createdAt) > new Date(existing.createdAt)) {
      map.set(event.leadRecordId, event);
    }
  }
  return map;
}

async function addEvent(leadRecordId, actionType, note, createdByEmail) {
  const obj = {
    timelineId: uuidv4(),
    leadRecordId,
    actionType,
    note: note || '',
    createdBy: createdByEmail || '',
    createdAt: nowIso(),
  };
  await sheetsService.appendObject(TAB, TIMELINE_COLUMNS, obj);
  return obj;
}

module.exports = { getForLead, getLastEventPerLead, addEvent };
