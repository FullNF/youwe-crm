export const OPTIONS = {
  BUY_OR_RENT: ['Buy', 'Rent'],
  CUST_TYPE: ['Individual', 'Investor', 'Builder', 'NRI', 'Corporate'],
  PROPERTY_CONDITION: ['Fully Furnished', 'Furnished', 'Semi-Furnished', 'Unfurnished', 'Raw'],
  CONFIGURATION: ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office', 'Shop'],
  VISIT_STATUS: ['Pending', 'Scheduled', 'Done', 'Cancelled'],
  LEAD_STAGE: ['New', 'Calling', 'Contacted', 'Follow-up', 'Ready to Visit', 'Visit Done', 'Negotiation', 'Won', 'Lost', 'Hold'],
  NEED_LOAN: ['Yes', 'No'],
  LEAD_SOURCE: ['Facebook', 'Instagram', 'MagicBricks', '99acres', 'Reference', 'Walk-In', 'Website', 'Other'],
  PRIORITY: ['Hot', 'Warm', 'Cold'],
};

export const STAGE_COLORS = {
  New: 'info',
  Contacted: 'info',
  'Follow-up': 'amber',
  'Ready to Visit': 'amber',
  'Visit Done': 'accent',
  Negotiation: 'accent',
  Won: 'success',
  Lost: 'danger',
  Hold: 'neutral',
};

export const PRIORITY_COLORS = {
  Hot: 'danger',
  Warm: 'amber',
  Cold: 'info',
};

export const LEAD_STAGE_PIPELINE = ['New', 'Calling', 'Contacted', 'Follow-up', 'Ready to Visit', 'Visit Done', 'Negotiation', 'Won'];
