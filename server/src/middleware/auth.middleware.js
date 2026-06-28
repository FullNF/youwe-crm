const { getFirebaseAdmin, admin } = require('../config/firebaseAdmin');
const usersRepo = require('../services/users.repository');
const { fail } = require('../utils/apiResponse');

/**
 * Expects: Authorization: Bearer <Firebase ID token>
 * On success, attaches req.user = { uid, email, name, role }
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Missing Authorization Bearer token', 401);

    getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    const userRecord = await usersRepo.getByEmail(decoded.email);
    if (!userRecord || userRecord.active === 'No') {
      return fail(res, 'Your account is not authorized to access this CRM. Ask an Admin to add you in Settings > Manage Users.', 403);
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: userRecord.name || decoded.name || decoded.email,
      role: userRecord.role || 'Employee',
    };
    next();
  } catch (err) {
    return fail(res, 'Invalid or expired session. Please sign in again.', 401, err.message);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Not authenticated', 401);
    if (!roles.includes(req.user.role)) {
      return fail(res, `This action requires one of these roles: ${roles.join(', ')}`, 403);
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
