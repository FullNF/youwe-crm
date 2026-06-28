const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { LEADS_COLUMNS } = require('../constants/sheetSchema');

/** Builds an .xlsx buffer from an array of lead objects. */
async function leadsToExcel(leads) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Leads');

  const exportColumns = LEADS_COLUMNS.filter((c) => c.key !== 'recordId');
  sheet.columns = exportColumns.map((c) => ({ header: c.label, key: c.key, width: 20 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2128' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  leads.forEach((lead) => {
    const row = {};
    exportColumns.forEach((c) => { row[c.key] = lead[c.key] || ''; });
    sheet.addRow(row);
  });

  return workbook.xlsx.writeBuffer();
}

/** Builds a CSV string from an array of lead objects. */
function leadsToCsv(leads) {
  const exportColumns = LEADS_COLUMNS.filter((c) => c.key !== 'recordId');
  const escape = (val) => {
    const s = val === undefined || val === null ? '' : String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = exportColumns.map((c) => escape(c.label)).join(',');
  const rows = leads.map((lead) => exportColumns.map((c) => escape(lead[c.key])).join(','));
  return [header, ...rows].join('\n');
}

/** Builds a simple, readable PDF report buffer (summary + lead table). */
function reportToPdf({ title, summary = [], leads = [] }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(title || 'CRM Report', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toLocaleString('en-IN')}`);
    doc.moveDown();

    if (summary.length) {
      doc.fontSize(13).fillColor('#000').text('Summary');
      doc.moveDown(0.3);
      summary.forEach((item) => {
        doc.fontSize(10).fillColor('#222').text(`${item.label}: ${item.value}`);
      });
      doc.moveDown();
    }

    if (leads.length) {
      doc.fontSize(13).fillColor('#000').text('Leads');
      doc.moveDown(0.3);
      const cols = ['customerName', 'contactDetails', 'leadStage', 'priority', 'assignedAgent'];
      const headers = ['Name', 'Contact', 'Stage', 'Priority', 'Agent'];
      doc.fontSize(9).fillColor('#000');
      doc.text(headers.join('   |   '));
      doc.moveDown(0.2);
      leads.slice(0, 500).forEach((lead) => {
        const line = cols.map((c) => lead[c] || '-').join('   |   ');
        doc.fontSize(8).fillColor('#333').text(line);
      });
    }

    doc.end();
  });
}

module.exports = { leadsToExcel, leadsToCsv, reportToPdf };
