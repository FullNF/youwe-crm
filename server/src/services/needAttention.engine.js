const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const leadsRepo = require('./leads.repository');
const env = require('../config/env');
const { NEED_ATTENTION_COLUMNS, NEED_ATTENTION_ISSUE_TYPES: ISSUE } = require('../constants/sheetSchema');
const { daysBetween, nowIso, parseFlexibleDate } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_NEED_ATTENTION;

// Thresholds - tweak here, nowhere else.
const THRESHOLDS = {
  OLD_LEAD_DAYS: 10, // created this many days ago with no real progress
  NOT_UPDATED_DAYS: 5, // not touched (lastUpdated) in this many days
  STAGE_PENDING_DAYS: 7, // stuck on New/Contacted this long
};

const CLOSED_STAGES = ['Won', 'Lost'];

/**
 * Pure rule-based detection. Given one lead object, returns the list of
 * issue type strings that currently apply. No ML/AI involved - every rule
 * here is an explicit, readable condition.
 */
function detectIssues(lead) {
  const issues = [];

  if (CLOSED_STAGES.includes(lead.leadStage)) {
    // A closed lead (Won/Lost) doesn't need follow-up/visit/stage nagging,
    // but data-quality issues still matter for reporting integrity.
    if (!lead.contactDetails) issues.push(ISSUE.MISSING_CONTACT);
    return issues;
  }

  if (!lead.contactDetails) issues.push(ISSUE.MISSING_CONTACT);
  if (!lead.areaNeed) issues.push(ISSUE.MISSING_AREA);
  if (!lead.configuration) issues.push(ISSUE.MISSING_CONFIGURATION);
  if (!lead.propertyCondition) issues.push(ISSUE.MISSING_PROPERTY_CONDITION);
  if (!lead.leadManagedBy) issues.push(ISSUE.MISSING_LEAD_MANAGER);
  if (!lead.leadRemark) issues.push(ISSUE.NO_REMARKS);

  if (!lead.nextFollowUpDate) {
    issues.push(ISSUE.MISSING_FOLLOWUP);
  }

  const createdDaysAgo = daysBetween(lead.createdAt || lead.leadCreatedDate);
  if (createdDaysAgo !== null && createdDaysAgo >= THRESHOLDS.OLD_LEAD_DAYS && lead.leadStage === 'New') {
    issues.push(ISSUE.OLD_LEAD);
  }

  const updatedDaysAgo = daysBetween(lead.lastUpdated || lead.createdAt);
  if (updatedDaysAgo !== null && updatedDaysAgo >= THRESHOLDS.NOT_UPDATED_DAYS) {
    issues.push(ISSUE.NOT_UPDATED);
  }

  if (['New', 'Contacted'].includes(lead.leadStage)) {
    const stageDaysAgo = daysBetween(lead.lastUpdated || lead.createdAt);
    if (stageDaysAgo !== null && stageDaysAgo >= THRESHOLDS.STAGE_PENDING_DAYS) {
      issues.push(ISSUE.STAGE_PENDING);
    }
  }

  if (lead.leadStage === 'Site Visit' && lead.visitStatus !== 'Done') {
    issues.push(ISSUE.VISIT_PENDING);
  }
  // Visit date has passed but never marked Done
  const visitDate = parseFlexibleDate(lead.visitedDate);
  if (visitDate && visitDate.getTime() < Date.now() && lead.visitStatus !== 'Done') {
    if (!issues.includes(ISSUE.VISIT_PENDING)) issues.push(ISSUE.VISIT_PENDING);
  }

  return issues;
}

async function getPersistedStates() {
  return sheetsService.getAllObjects(TAB, NEED_ATTENTION_COLUMNS);
}

function isSuppressed(stateRow) {
  if (!stateRow) return false;
  if (stateRow.status === 'resolved') return true;
  if (stateRow.status === 'ignored') return true;
  if (stateRow.status === 'snoozed') {
    const until = parseFlexibleDate(stateRow.snoozedUntil);
    if (until && until.getTime() > Date.now()) return true;
  }
  return false;
}

async function findDuplicatePhoneIssues(allLeads) {
  const byPhone = new Map();
  allLeads.forEach((lead) => {
    const norm = leadsRepo.normalizePhone(lead.contactDetails);
    if (!norm) return;
    if (!byPhone.has(norm)) byPhone.set(norm, []);
    byPhone.get(norm).push(lead);
  });
  const dupes = new Map(); // recordId -> true
  byPhone.forEach((group) => {
    if (group.length > 1) group.forEach((l) => dupes.set(l.recordId, group));
  });
  return dupes;
}

/**
 * Returns the full, currently-open Need Attention list, joined with the
 * lead it belongs to, with persisted ignore/snooze/resolve states applied.
 */
async function getOpenList() {
  const allLeads = await leadsRepo.getAll();
  const states = await getPersistedStates();
  const stateKey = (leadRecordId, issueType) => `${leadRecordId}::${issueType}`;
  const stateMap = new Map(states.map((s) => [stateKey(s.leadRecordId, s.issueType), s]));

  const dupeMap = await findDuplicatePhoneIssues(allLeads);

  const open = [];
  for (const lead of allLeads) {
    const issues = detectIssues(lead);
    if (dupeMap.has(lead.recordId)) issues.push(ISSUE.DUPLICATE_PHONE);

    for (const issueType of issues) {
      const state = stateMap.get(stateKey(lead.recordId, issueType));
      if (isSuppressed(state)) continue;
      open.push({
        lead: {
          recordId: lead.recordId,
          customerName: lead.customerName,
          contactDetails: lead.contactDetails,
          leadStage: lead.leadStage,
          priority: lead.priority,
          assignedAgent: lead.assignedAgent,
          leadManagedBy: lead.leadManagedBy,
        },
        issueType,
        state: state ? { status: state.status, snoozedUntil: state.snoozedUntil } : { status: 'open' },
      });
    }
  }

  return open;
}

async function getCount() {
  const list = await getOpenList();
  return list.length;
}

async function _upsertState(leadRecordId, issueType, patch) {
  const all = await sheetsService.getAllObjects(TAB, NEED_ATTENTION_COLUMNS);
  const existing = all.find((s) => s.leadRecordId === leadRecordId && s.issueType === issueType);
  const timestamp = nowIso();

  if (existing) {
    const merged = { ...existing, ...patch, updatedAt: timestamp };
    await sheetsService.updateRow(TAB, NEED_ATTENTION_COLUMNS, existing._sheetRow, merged);
    return merged;
  }

  const obj = {
    id: uuidv4(),
    leadRecordId,
    issueType,
    status: 'open',
    snoozedUntil: '',
    ignoredReason: '',
    ignoredBy: '',
    ignoredDate: '',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch,
  };
  await sheetsService.appendObject(TAB, NEED_ATTENTION_COLUMNS, obj);
  return obj;
}

async function resolve(leadRecordId, issueType) {
  return _upsertState(leadRecordId, issueType, { status: 'resolved' });
}

async function ignore(leadRecordId, issueType, reason, userEmail) {
  return _upsertState(leadRecordId, issueType, {
    status: 'ignored',
    ignoredReason: reason || '',
    ignoredBy: userEmail || '',
    ignoredDate: nowIso(),
  });
}

async function remindLater(leadRecordId, issueType, days, userEmail) {
  const until = new Date();
  until.setDate(until.getDate() + days);
  return _upsertState(leadRecordId, issueType, {
    status: 'snoozed',
    snoozedUntil: until.toISOString(),
    ignoredBy: userEmail || '',
  });
}

module.exports = {
  detectIssues,
  getOpenList,
  getCount,
  resolve,
  ignore,
  remindLater,
  THRESHOLDS,
};
