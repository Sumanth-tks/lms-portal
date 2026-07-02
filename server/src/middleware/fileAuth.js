const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');

/**
 * Middleware to authenticate and authorize file access
 * - Requires valid JWT token (Bearer scheme)
 * - INTERN users: Can only access their own files
 * - MENTOR/ADMIN: Can access any file
 */
async function authorizeFileAccess(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check for authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required to access files', 401);
    }

    // Verify JWT token
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (err) {
      return error(res, 'Invalid or expired token', 401);
    }

    // Enforce file ownership for INTERN users
    if (req.user.role === 'INTERN') {
      const filename = req.params[0]; // Path after /uploads/
      const isOwnFile = filename && filename.includes(req.user.id);

      if (!isOwnFile) {
        return error(res, 'You can only access your own files', 403);
      }
    }

    // MENTOR and ADMIN have unrestricted access
    next();
  } catch (err) {
    console.error('[File Auth Error]', err.message);
    return error(res, 'Access denied', 403);
  }
}

module.exports = { authorizeFileAccess };
