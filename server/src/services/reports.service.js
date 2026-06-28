const leadsRepo = require('./leads.repository');
const needAttentionEngine = require('./needAttention.engine');
const { parseFlexibleDate, daysBetween } = require('../utils/dateUtils');

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // make Monday day 0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function countBy(items, fn) {
  const map = {};
  items.forEach((item) => {
    const key = fn(item) || 'Unspecified';
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

/** High-level cards + mini previews for the Dashboard page. */
async function getDashboardSummary() {
  const leads = await leadsRepo.getAll();
  const today = new Date();

  const todaysFollowUps = leads.filter((l) => {
    const d = parseFlexibleDate(l.nextFollowUpDate);
    return d && isSameDay(d, today);
  });

  const won = leads.filter((l) => l.leadStage === 'Won');
  const lost = leads.filter((l) => l.leadStage === 'Lost');
  const needLoan = leads.filter((l) => l.needLoan === 'Yes');

  const needAttentionCount = await needAttentionEngine.getCount();

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)
    .map((l) => ({
      recordId: l.recordId,
      customerName: l.customerName,
      contactDetails: l.contactDetails,
      leadStage: l.leadStage,
      priority: l.priority,
      createdAt: l.createdAt,
    }));

  const stageBreakdown = countBy(leads, (l) => l.leadStage);
  const sourceBreakdown = countBy(leads, (l) => l.leadSource);

  return {
    cards: {
      totalLeads: leads.length,
      todaysFollowUps: todaysFollowUps.length,
      needAttention: needAttentionCount,
      won: won.length,
      lost: lost.length,
      needLoan: needLoan.length,
    },
    recentLeads,
    todaysFollowUpPreview: todaysFollowUps.slice(0, 8).map((l) => ({
      recordId: l.recordId,
      customerName: l.customerName,
      contactDetails: l.contactDetails,
      nextFollowUpDate: l.nextFollowUpDate,
      assignedAgent: l.assignedAgent,
    })),
    stageBreakdown,
    sourceBreakdown,
  };
}

/** Daily/weekly/monthly new-lead counts for the trend chart. */
async function getTrend({ granularity = 'daily', days = 30 } = {}) {
  const leads = await leadsRepo.getAll();
  const buckets = new Map();

  leads.forEach((l) => {
    const d = parseFlexibleDate(l.createdAt || l.leadCreatedDate);
    if (!d) return;
    let key;
    if (granularity === 'monthly') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (granularity === 'weekly') {
      key = startOfWeek(d).toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 10);
    }
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  const sorted = Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-days)
    .map(([date, count]) => ({ date, count }));

  return sorted;
}

async function getLeadSourceReport() {
  const leads = await leadsRepo.getAll();
  const bySource = countBy(leads, (l) => l.leadSource);
  return Object.entries(bySource)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

async function getLeadStageReport() {
  const leads = await leadsRepo.getAll();
  const byStage = countBy(leads, (l) => l.leadStage);
  return Object.entries(byStage).map(([stage, count]) => ({ stage, count }));
}

async function getAgentPerformanceReport() {
  const leads = await leadsRepo.getAll();
  const agents = new Map();

  leads.forEach((l) => {
    const agent = l.assignedAgent || l.leadManagedBy || 'Unassigned';
    if (!agents.has(agent)) {
      agents.set(agent, { agent, totalLeads: 0, won: 0, lost: 0, siteVisits: 0, active: 0 });
    }
    const row = agents.get(agent);
    row.totalLeads += 1;
    if (l.leadStage === 'Won') row.won += 1;
    if (l.leadStage === 'Lost') row.lost += 1;
    if (l.visitStatus === 'Done') row.siteVisits += 1;
    if (!['Won', 'Lost'].includes(l.leadStage)) row.active += 1;
  });

  return Array.from(agents.values())
    .map((row) => ({
      ...row,
      conversionRate: row.totalLeads ? Math.round((row.won / row.totalLeads) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.totalLeads - a.totalLeads);
}

async function getNeedLoanReport() {
  const leads = await leadsRepo.getAll();
  const needLoan = leads.filter((l) => l.needLoan === 'Yes');
  return {
    totalNeedingLoan: needLoan.length,
    percentOfTotal: leads.length ? Math.round((needLoan.length / leads.length) * 1000) / 10 : 0,
    byStage: countBy(needLoan, (l) => l.leadStage),
  };
}

async function getConversionReport() {
  const leads = await leadsRepo.getAll();
  const total = leads.length;
  const won = leads.filter((l) => l.leadStage === 'Won').length;
  const lost = leads.filter((l) => l.leadStage === 'Lost').length;
  const active = total - won - lost;
  const siteVisits = leads.filter((l) => l.visitStatus === 'Done').length;

  return {
    total,
    won,
    lost,
    active,
    siteVisits,
    overallConversionRate: total ? Math.round((won / total) * 1000) / 10 : 0,
    visitToWinRate: siteVisits ? Math.round((won / siteVisits) * 1000) / 10 : 0,
  };
}

async function getFullReport({ from, to } = {}) {
  let leads = await leadsRepo.getAll();
  if (from) leads = leads.filter((l) => {
    const d = parseFlexibleDate(l.createdAt || l.leadCreatedDate);
    return d && d >= new Date(from);
  });
  if (to) leads = leads.filter((l) => {
    const d = parseFlexibleDate(l.createdAt || l.leadCreatedDate);
    return d && d <= new Date(to);
  });

  return {
    leadSource: await getLeadSourceReport(),
    leadStage: await getLeadStageReport(),
    agentPerformance: await getAgentPerformanceReport(),
    needLoan: await getNeedLoanReport(),
    conversion: await getConversionReport(),
    filteredLeads: leads,
  };
}

module.exports = {
  getDashboardSummary,
  getTrend,
  getLeadSourceReport,
  getLeadStageReport,
  getAgentPerformanceReport,
  getNeedLoanReport,
  getConversionReport,
  getFullReport,
};
