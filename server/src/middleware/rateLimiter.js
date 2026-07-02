const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per minute per IP/user
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true, // Return rate limit info in headers
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in tests
});

/**
 * Login rate limiter
 * 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, error: 'Too many login attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: false, // Count successful attempts too
  standardHeaders: true,
});

/**
 * Strict rate limiter for sensitive operations
 * 5 requests per hour per user
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Too many sensitive requests. Try again later.' },
  standardHeaders: true,
  skip: (req) => !req.user || process.env.NODE_ENV === 'test',
});

/**
 * Per-user rate limiter (after authentication)
 * 100 requests per minute per authenticated user
 */
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Rate limit exceeded' },
  standardHeaders: true,
  skip: (req) => !req.user, // Only apply to authenticated users
});

module.exports = {
  apiLimiter,
  loginLimiter,
  strictLimiter,
  userLimiter,
};
