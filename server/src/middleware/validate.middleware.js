const { fail } = require('../utils/apiResponse');

/** Generic Zod-schema validator. Usage: router.post('/x', validate(schema), handler) */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return fail(res, 'Validation failed', 422, result.error.flatten());
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
