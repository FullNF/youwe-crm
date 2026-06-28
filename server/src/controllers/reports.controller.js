const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const reportsService = require('../services/reports.service');
const exportService = require('../services/export.service');
const leadsRepo = require('../services/leads.repository');

const getFull = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const report = await reportsService.getFullReport({ from, to });
  return ok(res, report);
});

const getLeadSource = asyncHandler(async (req, res) => ok(res, await reportsService.getLeadSourceReport()));
const getLeadStage = asyncHandler(async (req, res) => ok(res, await reportsService.getLeadStageReport()));
const getAgentPerformance = asyncHandler(async (req, res) => ok(res, await reportsService.getAgentPerformanceReport()));
const getNeedLoan = asyncHandler(async (req, res) => ok(res, await reportsService.getNeedLoanReport()));
const getConversion = asyncHandler(async (req, res) => ok(res, await reportsService.getConversionReport()));

const exportExcel = asyncHandler(async (req, res) => {
  const leads = await leadsRepo.getAll();
  const buffer = await exportService.leadsToExcel(leads);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-export.xlsx"');
  res.send(buffer);
});

const exportCsv = asyncHandler(async (req, res) => {
  const leads = await leadsRepo.getAll();
  const csv = exportService.leadsToCsv(leads);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
  res.send(csv);
});

const exportPdf = asyncHandler(async (req, res) => {
  const conversion = await reportsService.getConversionReport();
  const leads = await leadsRepo.getAll();
  const summary = [
    { label: 'Total Leads', value: conversion.total },
    { label: 'Won', value: conversion.won },
    { label: 'Lost', value: conversion.lost },
    { label: 'Active', value: conversion.active },
    { label: 'Overall Conversion Rate', value: `${conversion.overallConversionRate}%` },
  ];
  const buffer = await exportService.reportToPdf({ title: 'Lead Report', summary, leads });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-report.pdf"');
  res.send(buffer);
});

module.exports = {
  getFull,
  getLeadSource,
  getLeadStage,
  getAgentPerformance,
  getNeedLoan,
  getConversion,
  exportExcel,
  exportCsv,
  exportPdf,
};
