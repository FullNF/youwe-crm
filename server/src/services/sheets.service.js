const { google } = require('googleapis');
const env = require('../config/env');

/**
 * Generic Google Sheets data-access layer.
 *
 * This is the ONLY file in the entire backend that imports `googleapis`.
 * Every other module (repositories, controllers, services) talks to
 * `SheetsService`, never to the Sheets API directly.
 *
 * To migrate to Postgres/Supabase later: write a new repository that
 * implements the same method signatures as the ones in
 * `leads.repository.js` / `timeline.repository.js` / etc., and swap the
 * `require(...)` in the controllers. Nothing above the repository layer
 * needs to change.
 */
class SheetsService {
  constructor() {
    this._sheetsApi = null;
    this._tabCache = new Set(); // tabs we've already verified/created this process
  }

  _getAuth() {
    return new google.auth.JWT(
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
  }

  _getApi() {
    if (this._sheetsApi) return this._sheetsApi;
    const auth = this._getAuth();
    this._sheetsApi = google.sheets({ version: 'v4', auth });
    return this._sheetsApi;
  }

  /**
   * Ensure a tab exists with the given header row. If the tab doesn't
   * exist, it is created. If the header row is empty, it is written.
   * Existing data/headers are never overwritten.
   */
  async ensureTab(tabName, columns) {
    if (this._tabCache.has(tabName)) return;
    const api = this._getApi();

    const meta = await api.spreadsheets.get({ spreadsheetId: env.GOOGLE_SHEET_ID });
    const exists = meta.data.sheets.some((s) => s.properties.title === tabName);

    if (!exists) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: tabName } } }],
        },
      });
    }

    const headerRange = `${tabName}!A1:${this._colLetter(columns.length)}1`;
    const headerRes = await api.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: headerRange,
    });

    const currentHeader = headerRes.data.values && headerRes.data.values[0];
    if (!currentHeader || currentHeader.length === 0) {
      await api.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: { values: [columns.map((c) => c.label)] },
      });
    }

    this._tabCache.add(tabName);
  }

  _colLetter(n) {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  /** Read all data rows (excluding header) for a tab as raw 2D array, plus the row number each maps to. */
  async getAllRows(tabName, columns) {
    await this.ensureTab(tabName, columns);
    const api = this._getApi();
    const lastCol = this._colLetter(columns.length);
    const res = await api.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${tabName}!A2:${lastCol}100000`,
    });
    const rows = res.data.values || [];
    return rows.map((row, idx) => ({
      sheetRow: idx + 2, // actual 1-indexed row number in the sheet
      values: row,
    }));
  }

  /** Read all rows mapped to objects using the columns schema (key -> value). */
  async getAllObjects(tabName, columns) {
    const rows = await this.getAllRows(tabName, columns);
    return rows
      .filter((r) => r.values.some((v) => v !== undefined && v !== ''))
      .map((r) => this._rowToObject(r, columns));
  }

  _rowToObject(row, columns) {
    const obj = { _sheetRow: row.sheetRow };
    columns.forEach((col, i) => {
      obj[col.key] = row.values[i] !== undefined ? row.values[i] : '';
    });
    return obj;
  }

  _objectToRow(obj, columns) {
    return columns.map((col) => (obj[col.key] !== undefined && obj[col.key] !== null ? String(obj[col.key]) : ''));
  }

  /**
   * Finds the first fully-blank row right after the header/contiguous data
   * block. We deliberately do NOT use the Sheets API's own "append" (which
   * scans the entire tab and writes after the last non-empty cell anywhere
   * below) - if a sheet has any unrelated content far down (an old note, a
   * chart, leftover formatting), that heuristic jumps new rows down there.
   * Scanning forward from row 2 and stopping at the first blank row is
   * deterministic and immune to whatever exists further down the sheet.
   */
  async _getNextEmptyRow(tabName, columns) {
    const api = this._getApi();
    const lastCol = this._colLetter(columns.length);
    const res = await api.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${tabName}!A2:${lastCol}20000`,
    });
    const rows = res.data.values || [];
    let row = 2;
    for (const r of rows) {
      const hasData = r.some((v) => v !== undefined && v !== '');
      if (!hasData) break;
      row++;
    }
    return row;
  }

  /** Write a new object into the first blank row after the existing data block. */
  async appendObject(tabName, columns, obj) {
    await this.ensureTab(tabName, columns);
    const nextRow = await this._getNextEmptyRow(tabName, columns);
    await this.updateRow(tabName, columns, nextRow, obj);
  }

  /** Overwrite a specific sheet row (1-indexed, as stored in `_sheetRow`) with new object values. */
  async updateRow(tabName, columns, sheetRow, obj) {
    await this.ensureTab(tabName, columns);
    const api = this._getApi();
    const lastCol = this._colLetter(columns.length);
    await api.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${tabName}!A${sheetRow}:${lastCol}${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [this._objectToRow(obj, columns)] },
    });
  }

  /** Clear a specific sheet row's contents (soft pattern used for delete -> blank row, never reused). */
  async clearRow(tabName, columns, sheetRow) {
    const api = this._getApi();
    const lastCol = this._colLetter(columns.length);
    await api.spreadsheets.values.clear({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${tabName}!A${sheetRow}:${lastCol}${sheetRow}`,
    });
  }
}

module.exports = new SheetsService();
