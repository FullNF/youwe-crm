const admin = require('firebase-admin');
const env = require('./env');

let app;

function getFirebaseAdmin() {
  if (app) return app;

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
  });

  return app;
}

module.exports = { getFirebaseAdmin, admin };
