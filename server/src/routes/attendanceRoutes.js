const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { overrideAttendanceSchema } = require('../utils/schemas');
const {
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  overrideAttendance,
} = require('../controllers/attendanceController');

router.use(authenticate);

router.get('/me', authorize('INTERN'), getMyAttendance);
router.get('/today', authorize('ADMIN', 'MENTOR'), getTodayAttendance);
router.get('/', authorize('ADMIN', 'MENTOR'), getAllAttendance);
router.post('/override', authorize('ADMIN', 'MENTOR'), validate(overrideAttendanceSchema), overrideAttendance);

module.exports = router;
