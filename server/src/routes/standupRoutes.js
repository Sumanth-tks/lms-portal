const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { submitStandupSchema } = require('../utils/schemas');
const {
  submitStandup,
  getMyStandups,
  getTodayStandups,
  getStandupsByIntern,
  getStandupsByDate,
  getWeekSummary,
} = require('../controllers/standupController');

router.use(authenticate);

router.post('/', authorize('INTERN'), validate(submitStandupSchema), submitStandup);
router.get('/me', authorize('INTERN'), getMyStandups);
router.get('/today', authorize('ADMIN', 'MENTOR'), getTodayStandups);
router.get('/by-date', authorize('ADMIN', 'MENTOR'), getStandupsByDate);
router.get('/week-summary', authorize('ADMIN', 'MENTOR'), getWeekSummary);
router.get('/intern/:internId', authorize('ADMIN', 'MENTOR'), getStandupsByIntern);

module.exports = router;
