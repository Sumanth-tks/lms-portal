const { error } = require('../utils/apiResponse');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      return error(res, messages.join(', '), 422);
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
