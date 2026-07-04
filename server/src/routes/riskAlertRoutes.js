const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getRiskAlerts } = require('../controllers/riskAlertController');

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MENTOR'), getRiskAlerts);

module.exports = router;
