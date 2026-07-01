const { v4: uuidv4 } = require('uuid');
const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { LEADS_COLUMNS } = require('../constants/sheetSchema');
const { nowIso } = require('../utils/dateUtils');

const TAB = env.SHEET_TAB_LEADS;

/**
 * Repository pattern: this is the ONLY module the rest of the app uses to
 * read/write leads. If you swap Google Sheets for Postgres/Supabase later,
 * re-implement these exact method signatures against the new database and
 * nothing in the controllers/services above this file needs to change.
 */

async function getAll() {
  const rows = await sheetsService.getAllObjects(TAB, LEADS_COLUMNS);
  return rows.filter((r) => r.recordId); // ignore stray/blank rows
}

async function getById(recordId) {
  const all = await getAll();
  return all.find((l) => l.recordId === recordId) || null;
}

async function getNextSerialNo() {
  const all = await getAll();
  const max = all.reduce((m, l) => Math.max(m, parseInt(l.serialNo, 10) || 0), 0);
  return max + 1;
}

async function create(payload, createdByEmail) {
  const recordId = uuidv4();
  const serialNo = await getNextSerialNo();
  const timestamp = nowIso();

  const obj = {
    serialNo,
    customerName: payload.customerName || '',
    contactDetails: payload.contactDetails || '',
    buyOrRent: payload.buyOrRent || '',
    custType: payload.custType || '',
    leadCreatedDate: payload.leadCreatedDate || timestamp,
    areaNeed: payload.areaNeed || '',
    propertyCondition: payload.propertyCondition || '',
    configuration: payload.configuration || '',
    bidPricePurchase: payload.bidPricePurchase || '',
    bidPriceRent: payload.bidPriceRent || '',
    leadManagedBy: payload.leadManagedBy || '',
    visitedDate: payload.visitedDate || '',
    visitStatus: payload.visitStatus || 'Pending',
    leadStage: payload.leadStage || 'New',
    needLoan: payload.needLoan || 'No',
    leadRemark: payload.leadRemark || '',
    nextFollowUpDate: payload.nextFollowUpDate || '',
    lastContactDate: payload.lastContactDate || '',
    leadSource: payload.leadSource || '',
    priority: payload.priority || 'Warm',
    assignedAgent: payload.assignedAgent || '',
    lastUpdated: timestamp,
    createdAt: timestamp,
    createdBy: createdByEmail || '',
    recordId,
  };

  await sheetsService.appendObject(TAB, LEADS_COLUMNS, obj);
  return obj;
}

async function update(recordId, patch) {
  const all = await sheetsService.getAllObjects(TAB, LEADS_COLUMNS);
  const existing = all.find((l) => l.recordId === recordId);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...patch,
    recordId, // never allow overwrite of the primary key
    serialNo: existing.serialNo, // serial number is immutable once assigned
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    lastUpdated: nowIso(),
  };

  await sheetsService.updateRow(TAB, LEADS_COLUMNS, existing._sheetRow, merged);
  return merged;
}

async function remove(recordId) {
  const all = await sheetsService.getAllObjects(TAB, LEADS_COLUMNS);
  const existing = all.find((l) => l.recordId === recordId);
  if (!existing) return false;
  await sheetsService.clearRow(TAB, LEADS_COLUMNS, existing._sheetRow);
  return true;
}

/** Normalizes a phone number for duplicate comparison (strips spaces, +91, dashes). */
function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
}

async function findDuplicatesByPhone(phone, excludeRecordId = null) {
  const all = await getAll();
  const target = normalizePhone(phone);
  if (!target) return [];
  return all.filter((l) => l.recordId !== excludeRecordId && normalizePhone(l.contactDetails) === target);
}

/**
 * Search across (almost) every field, filter by exact-match fields, sort, and paginate.
 * Designed to back the Leads list page's smart search + filter bar in one call.
 */
async function query({
  search = '',
  filters = {},
  sortBy = 'lastUpdated',
  sortDir = 'desc',
  page = 1,
  pageSize = 25,
} = {}) {
  let all = await getAll();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    all = all.filter((lead) =>
      [
        lead.customerName,
        lead.contactDetails,
        lead.areaNeed,
        lead.leadManagedBy,
        lead.leadSource,
        lead.leadStage,
        lead.needLoan,
        lead.propertyCondition,
        lead.configuration,
        lead.priority,
        lead.assignedAgent,
        lead.custType,
        lead.buyOrRent,
        lead.leadRemark,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }

  const filterMap = {
    buyOrRent: 'buyOrRent',
    needLoan: 'needLoan',
    leadStage: 'leadStage',
    priority: 'priority',
    visitStatus: 'visitStatus',
    leadSource: 'leadSource',
    leadManagedBy: 'leadManagedBy',
    configuration: 'configuration',
    propertyCondition: 'propertyCondition',
    assignedAgent: 'assignedAgent',
  };

  Object.entries(filters).forEach(([filterKey, filterValue]) => {
    if (filterValue === undefined || filterValue === null || filterValue === '') return;
    const field = filterMap[filterKey];
    if (!field) return;
    const values = Array.isArray(filterValue) ? filterValue : [filterValue];
    all = all.filter((lead) => values.map(String).map((v) => v.toLowerCase()).includes(String(lead[field] || '').toLowerCase()));
  });

  // Special composite filters
  if (filters.visited === 'yes') all = all.filter((l) => l.visitStatus === 'Done');
  if (filters.visited === 'no') all = all.filter((l) => l.visitStatus !== 'Done');

  const DATE_FIELDS = new Set(['lastUpdated', 'createdAt', 'leadCreatedDate', 'nextFollowUpDate', 'visitedDate', 'lastContactDate', 'lastContactedAt']);

  all.sort((a, b) => {
    const av = a[sortBy] || '';
    const bv = b[sortBy] || '';

    if (DATE_FIELDS.has(sortBy)) {
      // Empty dates always go to the bottom regardless of sort direction
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      const diff = new Date(av).getTime() - new Date(bv).getTime();
      return sortDir === 'asc' ? diff : -diff;
    }

    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = all.length;
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  query,
  findDuplicatesByPhone,
  normalizePhone,
};
