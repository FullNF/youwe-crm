const logger = require('../utils/logger');
const { fail } = require('../utils/apiResponse');

// 404 handler - placed after all routes
function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// Centralized error handler - placed last in the middleware chain
function errorHandler(err, req, res, _next) {
  logger.error(err.stack || err.message || err);
  const status = err.status || 500;
  return fail(res, err.message || 'Internal server error', status, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

module.exports = { notFound, errorHandler };
