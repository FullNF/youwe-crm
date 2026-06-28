# Architecture Notes

## Why the backend is structured this way

```
Controllers  ->  Repositories / Services  ->  sheets.service.js  ->  Google Sheets API
```

`server/src/services/sheets.service.js` is the **only** file that imports
`googleapis`. Everything above it — `leads.repository.js`,
`timeline.repository.js`, `users.repository.js`, `settings.repository.js`,
`needAttention.engine.js`, `reports.service.js` — talks in plain JavaScript
objects, never in Sheets API calls.

### Migrating off Google Sheets later

When you outgrow Sheets (rate limits, concurrent-write conflicts, or just
wanting real SQL), you write **one new file per repository** —
e.g. `leads.repository.postgres.js` — implementing the exact same exported
function signatures (`getAll`, `getById`, `create`, `update`, `remove`,
`query`, `findDuplicatesByPhone`). Then in each controller you change one
`require(...)` line. Nothing in `controllers/`, `routes/`, the rule engine, or
any frontend code needs to change, because they only ever call repository
methods, never Sheets-specific code.

### Why `Record ID`, not row number or `S. NO.`

Google Sheets doesn't have a real primary key. Using a row's position (or
your `S. NO.` column) as an identifier breaks the moment a human:
- sorts the sheet,
- deletes a row,
- or filters/reorders it manually.

So every lead gets a UUID (`recordId`) at creation time, stored in the last
column. The backend always looks up rows by `recordId`, never by position.
This is the one column you should never manually edit in the sheet.

### Why remarks/timeline are append-only

`leadRemark` on the lead row always shows the *latest* remark (for fast
scanning in the table view), but every remark, stage change, and visit-status
change is also written as a brand new row in the `Timeline` tab via
`timeline.repository.js`. Nothing is ever overwritten there — that's what
powers the full history view on the Lead Details page, and it's also why two
people editing the same lead at slightly different times can't silently erase
each other's notes the way they could with a single overwritten cell.

## The Need Attention rule engine

`server/src/services/needAttention.engine.js` is intentionally simple and
fully deterministic — no AI/ML, just readable `if` statements over each
lead's fields (see `detectIssues()`). The thresholds (how many days before a
lead counts as "old", "not updated", etc.) are three numbers at the top of
that file (`THRESHOLDS`) — change them there and the whole app picks it up.

Because Sheets has no concept of "I already saw this and dealt with it," the
engine re-detects issues fresh on every request, then cross-references a
separate `NeedAttention` tab that stores **Resolve / Ignore / Remind-later**
decisions per `(leadRecordId, issueType)` pair. That's why ignoring a
"Missing Follow-up" issue on a lead doesn't make it disappear forever — it
reappears if something about the lead changes and the same condition becomes
true again later (e.g. you fill it in, then clear it again).

## Reports vs. Dashboard

`reports.service.js` is the single source of truth for every number shown
anywhere in the app — the Dashboard cards/charts and the Reports page both
call the same functions (`getDashboardSummary`, `getLeadSourceReport`, etc.).
There's no duplicated counting logic to drift out of sync.
