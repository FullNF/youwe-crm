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

module.exports = { getForLead, addEvent };
