const { validationResult } = require('express-validator');

// Validate express-validator results and return 422 on failure
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(422).json({ error: messages[0], details: messages });
  }
  next();
}

// Global error handler — mount last in app.js
function globalErrorHandler(err, req, res, next) {
  console.error('[error]', err.message || err);
  const status = err.status || err.statusCode || 500;
  const message =
    status < 500
      ? err.message
      : 'Something went wrong on our end. Please try again shortly.';
  res.status(status).json({ error: message });
}

module.exports = { validateRequest, globalErrorHandler };
