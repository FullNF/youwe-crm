/**
 * Single source of truth for the "Leads" Google Sheet tab layout.
 *
 * The column order below intentionally matches your existing sheet
 * (S.No. ... Last Updated) and only APPENDS new columns at the end
 * (Created At, Created By, Record ID) so nothing in your current
 * sheet has to move.
 *
 * `key`   -> the field name used everywhere in the API/JSON/UI
 * `label` -> the exact header text written in row 1 of the sheet
 *
 * IMPORTANT: Record ID (last column) is the real primary key used by
 * the backend for update/delete, NOT the row's position and NOT S.No.
 * Sheet rows can be sorted/filtered by humans in Google Sheets itself;
 * relying on row index as an ID would silently corrupt data the moment
 * someone reorders rows. Record ID never changes once a lead is created.
 */

const LEADS_COLUMNS = [
  { key: 'serialNo', label: 'S. NO.' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'contactDetails', label: 'Contact Details' },
  { key: 'buyOrRent', label: 'Buy or Rent' },
  { key: 'custType', label: 'Cust. Type' },
  { key: 'leadCreatedDate', label: 'Date (Lead Coming)' },
  { key: 'areaNeed', label: 'Area Need' },
  { key: 'propertyCondition', label: 'Property Type' }, // furnishing condition
  { key: 'configuration', label: 'Property Area Type' }, // 1BHK/2BHK/etc.
  { key: 'bidPricePurchase', label: 'Bid Price (For Purchase)' },
  { key: 'bidPriceRent', label: 'Bid Price (For Rent)' },
  { key: 'leadManagedBy', label: 'Lead Manage By' },
  { key: 'visitedDate', label: 'Visited Date' },
  { key: 'visitStatus', label: 'Visit Status' },
  { key: 'leadStage', label: 'Lead Stage' },
  { key: 'needLoan', label: 'Need Loan' },
  { key: 'leadRemark', label: 'Lead Remark' }, // latest remark snapshot (full history lives in Timeline tab)
  { key: 'nextFollowUpDate', label: 'Next Follow-up Date' },
  { key: 'lastContactDate', label: 'Last Contact Date' },
  { key: 'leadSource', label: 'Lead Source' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignedAgent', label: 'Assigned Agent' },
  { key: 'lastUpdated', label: 'Last Updated' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'recordId', label: 'Record ID' },
];

const TIMELINE_COLUMNS = [
  { key: 'timelineId', label: 'Timeline ID' },
  { key: 'leadRecordId', label: 'Lead Record ID' },
  { key: 'actionType', label: 'Action Type' },
  { key: 'note', label: 'Note' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created At' },
];

const NEED_ATTENTION_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'leadRecordId', label: 'Lead Record ID' },
  { key: 'issueType', label: 'Issue Type' },
  { key: 'status', label: 'Status' }, // open | ignored | resolved | snoozed
  { key: 'snoozedUntil', label: 'Snoozed Until' },
  { key: 'ignoredReason', label: 'Ignored Reason' },
  { key: 'ignoredBy', label: 'Ignored By' },
  { key: 'ignoredDate', label: 'Ignored Date' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
];

const USERS_COLUMNS = [
  { key: 'email', label: 'Email' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' }, // Admin | Employee
  { key: 'active', label: 'Active' }, // Yes | No
  { key: 'createdAt', label: 'Created At' },
];

const SETTINGS_COLUMNS = [
  { key: 'settingKey', label: 'Key' },
  { key: 'settingValue', label: 'Value' },
];

const ENUMS = {
  BUY_OR_RENT: ['Buy', 'Rent'],
  CUST_TYPE: ['Individual', 'Investor', 'Builder', 'NRI', 'Corporate'],
  PROPERTY_CONDITION: ['Fully Furnished', 'Furnished', 'Semi-Furnished', 'Unfurnished', 'Raw'],
  CONFIGURATION: ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office', 'Shop'],
  VISIT_STATUS: ['Pending', 'Scheduled', 'Done', 'Cancelled'],
  LEAD_STAGE: ['New', 'Contacted', 'Follow-up', 'Site Visit', 'Negotiation', 'Won', 'Lost'],
  NEED_LOAN: ['Yes', 'No'],
  LEAD_SOURCE: ['Facebook', 'Instagram', 'MagicBricks', '99acres', 'Reference', 'Walk-In', 'Website', 'Other'],
  PRIORITY: ['Hot', 'Warm', 'Cold'],
  ROLE: ['Admin', 'Employee'],
};

const NEED_ATTENTION_ISSUE_TYPES = {
  MISSING_CONTACT: 'Missing Contact',
  MISSING_AREA: 'Missing Area',
  MISSING_CONFIGURATION: 'Missing Configuration',
  MISSING_PROPERTY_CONDITION: 'Missing Property Condition',
  MISSING_FOLLOWUP: 'Missing Follow-up',
  DUPLICATE_PHONE: 'Duplicate Phone Number',
  OLD_LEAD: 'Old Lead',
  NOT_UPDATED: 'Lead Not Updated',
  NO_REMARKS: 'No Remarks',
  VISIT_PENDING: 'Visit Pending',
  STAGE_PENDING: 'Stage Pending',
  MISSING_LEAD_MANAGER: 'Missing Lead Manager',
};

module.exports = {
  LEADS_COLUMNS,
  TIMELINE_COLUMNS,
  NEED_ATTENTION_COLUMNS,
  USERS_COLUMNS,
  SETTINGS_COLUMNS,
  ENUMS,
  NEED_ATTENTION_ISSUE_TYPES,
};
