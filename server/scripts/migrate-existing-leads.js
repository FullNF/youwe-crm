/**
 * One-time migration: assigns a Record ID (and sensible defaults) to leads
 * that already existed in your Google Sheet before this CRM was built.
 *
 * Why this is needed: the CRM uses a `Record ID` column (added at the end
 * of the sheet) as the real primary key for every lead, so that sorting or
 * editing the sheet by hand never silently corrupts data. Rows you entered
 * before the CRM existed don't have a Record ID yet, so the app currently
 * doesn't show them. This script fills that in, once, without touching any
 * of your existing data in the other columns.
 *
 * SAFE BY DEFAULT: running this with no flags only PRINTS what it would do.
 * Nothing is written to your sheet until you re-run it with --apply.
 *
 * Usage (from the server/ folder):
 *   node scripts/migrate-existing-leads.js            # dry run, prints a preview
 *   node scripts/migrate-existing-leads.js --apply     # actually writes the changes
 */

const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../src/services/sheets.service');
const env = require('../src/config/env');
const { LEADS_COLUMNS } = require('../src/constants/sheetSchema');
const { parseFlexibleDate, nowIso } = require('../src/utils/dateUtils');

const APPLY = process.argv.includes('--apply');

async function main() {
  const tab = env.SHEET_TAB_LEADS;
  console.log(`Reading tab "${tab}"...`);

  const allObjects = await sheetsService.getAllObjects(tab, LEADS_COLUMNS);

  const missingRecordId = allObjects.filter((o) => !o.recordId);

  // Safety guard: only treat a row as a real "lead" worth migrating if it has
  // both a name and a contact number. This protects against accidentally
  // turning unrelated stray content elsewhere in the sheet into a fake lead.
  const candidates = missingRecordId.filter((o) => o.customerName && o.contactDetails);
  const skipped = missingRecordId.filter((o) => !(o.customerName && o.contactDetails));

  console.log(`\nFound ${candidates.length} existing lead row(s) to migrate.`);
  if (skipped.length) {
    console.log(
      `Skipping ${skipped.length} row(s) without both a Customer Name and Contact Details ` +
        `(likely not real leads - e.g. stray content elsewhere in the sheet). Row numbers: ` +
        skipped.map((s) => s._sheetRow).join(', ')
    );
  }

  if (!candidates.length) {
    console.log('\nNothing to migrate.');
    return;
  }

  console.log('');
  for (const lead of candidates) {
    const timestamp = nowIso();
    const parsedCreated = parseFlexibleDate(lead.leadCreatedDate);

    const patched = {
      ...lead,
      visitStatus: lead.visitStatus || 'Pending',
      leadStage: lead.leadStage || 'New',
      needLoan: lead.needLoan || 'No',
      priority: lead.priority || 'Warm',
      lastUpdated: lead.lastUpdated || timestamp,
      createdAt: lead.createdAt || (parsedCreated ? parsedCreated.toISOString() : timestamp),
      createdBy: lead.createdBy || 'Migrated (existing sheet data)',
      recordId: uuidv4(),
    };

    console.log(`Row ${lead._sheetRow}: "${patched.customerName}" (${patched.contactDetails}) -> recordId ${patched.recordId}`);

    if (APPLY) {
      await sheetsService.updateRow(tab, LEADS_COLUMNS, lead._sheetRow, patched);
    }
  }

  if (!APPLY) {
    console.log(`\nDry run only - nothing was written. Re-run with --apply to write these ${candidates.length} changes for real:`);
    console.log('  node scripts/migrate-existing-leads.js --apply');
  } else {
    console.log(`\nDone. ${candidates.length} lead(s) migrated and will now show up in the CRM.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
