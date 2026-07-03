const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCalendarEventSchema } = require('../utils/schemas');
const {
  getCalendarEvents,
  createCalendarEvent,
} = require('../controllers/calendarEventController');

router.use(authenticate);

router.get('/', getCalendarEvents);
router.post('/', authorize('ADMIN', 'MENTOR'), validate(createCalendarEventSchema), createCalendarEvent);

module.exports = router;
