require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing env var: ${name}. The server will start but related features will fail until it is set.`);
  }
  return value;
}

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  GOOGLE_SHEET_ID: required('GOOGLE_SHEET_ID'),
  SHEET_TAB_LEADS: process.env.SHEET_TAB_LEADS || 'Leads',
  SHEET_TAB_TIMELINE: process.env.SHEET_TAB_TIMELINE || 'Timeline',
  SHEET_TAB_NEED_ATTENTION: process.env.SHEET_TAB_NEED_ATTENTION || 'NeedAttention',
  SHEET_TAB_USERS: process.env.SHEET_TAB_USERS || 'Users',
  SHEET_TAB_SETTINGS: process.env.SHEET_TAB_SETTINGS || 'Settings',
  SHEET_TAB_PUSH_SUBSCRIPTIONS: process.env.SHEET_TAB_PUSH_SUBSCRIPTIONS || 'PushSubscriptions',
  SHEET_TAB_PROPERTIES: process.env.SHEET_TAB_PROPERTIES || 'Properties',
  SHEET_TAB_PROPERTY_MEDIA: process.env.SHEET_TAB_PROPERTY_MEDIA || 'PropertyMedia',

  GOOGLE_SERVICE_ACCOUNT_EMAIL: required('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),

  FIREBASE_PROJECT_ID: required('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: required('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),

  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || '',
  SEED_ADMIN_NAME: process.env.SEED_ADMIN_NAME || 'Admin',

  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@youwegroup.com',
};

module.exports = env;
