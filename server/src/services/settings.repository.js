const sheetsService = require('./sheets.service');
const env = require('../config/env');
const { SETTINGS_COLUMNS, ENUMS } = require('../constants/sheetSchema');

const TAB = env.SHEET_TAB_SETTINGS;

const DEFAULTS = {
  dropdown_custType: ENUMS.CUST_TYPE,
  dropdown_propertyCondition: ENUMS.PROPERTY_CONDITION,
  dropdown_configuration: ENUMS.CONFIGURATION,
  dropdown_visitStatus: ENUMS.VISIT_STATUS,
  dropdown_leadStage: ENUMS.LEAD_STAGE,
  dropdown_leadSource: ENUMS.LEAD_SOURCE,
  dropdown_priority: ENUMS.PRIORITY,
  company_logo_url: '',
  theme: 'dark',
};

async function getAllRaw() {
  return sheetsService.getAllObjects(TAB, SETTINGS_COLUMNS);
}

async function getAll() {
  const rows = await getAllRaw();
  const map = { ...DEFAULTS };
  rows.forEach((r) => {
    if (!r.settingKey) return;
    try {
      map[r.settingKey] = JSON.parse(r.settingValue);
    } catch {
      map[r.settingKey] = r.settingValue;
    }
  });
  return map;
}

async function get(key) {
  const all = await getAll();
  return all[key];
}

async function set(key, value) {
  const rows = await getAllRaw();
  const existing = rows.find((r) => r.settingKey === key);
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (existing) {
    await sheetsService.updateRow(TAB, SETTINGS_COLUMNS, existing._sheetRow, {
      settingKey: key,
      settingValue: serialized,
    });
  } else {
    await sheetsService.appendObject(TAB, SETTINGS_COLUMNS, { settingKey: key, settingValue: serialized });
  }
  return get(key);
}

module.exports = { getAll, get, set, DEFAULTS };
