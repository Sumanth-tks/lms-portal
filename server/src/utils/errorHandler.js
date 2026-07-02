/**
 * Centralized error handling utility
 * - Logs detailed errors server-side
 * - Returns generic messages to clients
 * - Prevents information leakage
 */

class AppError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function handleError(err, isDevelopment = false) {
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
  };

  // Log full error server-side
  if (err.stack) {
    errorLog.stack = err.stack;
  }
  if (err.details) {
    errorLog.details = err.details;
  }

  console.error('[ERROR]', JSON.stringify(errorLog, null, 2));

  // Return generic message to client
  const response = {
    success: false,
    error: 'Internal server error',
  };

  // Include details only in development
  if (isDevelopment && err.message) {
    response.details = err.message;
  }

  return response;
}

module.exports = { AppError, handleError };
