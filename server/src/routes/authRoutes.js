const { Router } = require('express');
const { login, refreshAccessToken, changePassword, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../utils/schemas');
const { loginLimiter, strictLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/change-password', authenticate, strictLimiter, validate(changePasswordSchema), changePassword);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
