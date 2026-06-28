const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const leadsRepo = require('../services/leads.repository');
const timelineRepo = require('../services/timeline.repository');

const leadSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  contactDetails: z.string().min(1, 'Contact number is required'),
  buyOrRent: z.string().optional().default(''),
  custType: z.string().optional().default(''),
  leadCreatedDate: z.string().optional().default(''),
  areaNeed: z.string().optional().default(''),
  propertyCondition: z.string().optional().default(''),
  configuration: z.string().optional().default(''),
  bidPricePurchase: z.string().optional().default(''),
  bidPriceRent: z.string().optional().default(''),
  leadManagedBy: z.string().optional().default(''),
  visitedDate: z.string().optional().default(''),
  visitStatus: z.string().optional().default('Pending'),
  leadStage: z.string().optional().default('New'),
  needLoan: z.string().optional().default('No'),
  leadRemark: z.string().optional().default(''),
  nextFollowUpDate: z.string().optional().default(''),
  lastContactDate: z.string().optional().default(''),
  leadSource: z.string().optional().default(''),
  priority: z.string().optional().default('Warm'),
  assignedAgent: z.string().optional().default(''),
});

const patchSchema = leadSchema.partial();

const listQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  buyOrRent: z.string().optional(),
  needLoan: z.string().optional(),
  leadStage: z.string().optional(),
  priority: z.string().optional(),
  visitStatus: z.string().optional(),
  leadSource: z.string().optional(),
  leadManagedBy: z.string().optional(),
  configuration: z.string().optional(),
  propertyCondition: z.string().optional(),
  assignedAgent: z.string().optional(),
  visited: z.enum(['yes', 'no']).optional(),
});

const list = asyncHandler(async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const { search, sortBy, sortDir, page, pageSize, ...filters } = q;
  const result = await leadsRepo.query({
    search,
    sortBy: sortBy || 'lastUpdated',
    sortDir: sortDir || 'desc',
    page: page || 1,
    pageSize: pageSize || 25,
    filters,
  });
  return ok(res, result.items, { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages });
});

const getOne = asyncHandler(async (req, res) => {
  const lead = await leadsRepo.getById(req.params.id);
  if (!lead) return fail(res, 'Lead not found', 404);
  const timeline = await timelineRepo.getForLead(req.params.id);
  return ok(res, { ...lead, timeline });
});

const checkDuplicates = asyncHandler(async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return fail(res, 'phone query param is required', 422);
  const dupes = await leadsRepo.findDuplicatesByPhone(phone, req.query.excludeRecordId);
  return ok(res, dupes);
});

const create = asyncHandler(async (req, res) => {
  const data = leadSchema.parse(req.body);
  const lead = await leadsRepo.create(data, req.user.email);
  await timelineRepo.addEvent(lead.recordId, 'Created', `Lead created by ${req.user.name}`, req.user.email);
  if (data.leadStage && data.leadStage !== 'New') {
    await timelineRepo.addEvent(lead.recordId, data.leadStage, `Stage set to ${data.leadStage}`, req.user.email);
  }
  return created(res, lead);
});

const update = asyncHandler(async (req, res) => {
  const patch = patchSchema.parse(req.body);
  const existing = await leadsRepo.getById(req.params.id);
  if (!existing) return fail(res, 'Lead not found', 404);

  const updated = await leadsRepo.update(req.params.id, patch);

  // Append timeline events for meaningful changes - never overwrite, always append.
  if (patch.leadStage && patch.leadStage !== existing.leadStage) {
    await timelineRepo.addEvent(req.params.id, patch.leadStage, `Stage changed: ${existing.leadStage || '—'} → ${patch.leadStage}`, req.user.email);
  }
  if (patch.leadRemark && patch.leadRemark !== existing.leadRemark) {
    await timelineRepo.addEvent(req.params.id, 'Remark', patch.leadRemark, req.user.email);
  }
  if (patch.visitStatus && patch.visitStatus !== existing.visitStatus) {
    await timelineRepo.addEvent(req.params.id, 'Visit Status', `Visit status changed: ${existing.visitStatus || '—'} → ${patch.visitStatus}`, req.user.email);
  }
  if (Object.keys(patch).length && !patch.leadStage && !patch.leadRemark && !patch.visitStatus) {
    await timelineRepo.addEvent(req.params.id, 'Updated', `Lead details updated by ${req.user.name}`, req.user.email);
  }

  return ok(res, updated);
});

const remove = asyncHandler(async (req, res) => {
  const removed = await leadsRepo.remove(req.params.id);
  if (!removed) return fail(res, 'Lead not found', 404);
  return ok(res, { recordId: req.params.id, deleted: true });
});

const addRemark = asyncHandler(async (req, res) => {
  const note = (req.body && req.body.note) || '';
  if (!note.trim()) return fail(res, 'Remark text is required', 422);
  const existing = await leadsRepo.getById(req.params.id);
  if (!existing) return fail(res, 'Lead not found', 404);

  await leadsRepo.update(req.params.id, { leadRemark: note, lastContactDate: new Date().toISOString() });
  const event = await timelineRepo.addEvent(req.params.id, 'Remark', note, req.user.email);
  return created(res, event);
});

module.exports = { list, getOne, create, update, remove, addRemark, checkDuplicates };
