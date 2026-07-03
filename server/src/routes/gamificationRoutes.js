const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getBadges,
  awardBadge,
  addXp,
  getXpLogs,
  getLeaderboard,
  getStreaks,
  updateStreak,
} = require('../controllers/gamificationController');
const { awardBadgeSchema, addXpSchema, updateStreakSchema } = require('../utils/schemas');

router.use(authenticate);

router.get('/badges', getBadges);
router.post('/badges/award', authorize('ADMIN', 'MENTOR'), validate(awardBadgeSchema), awardBadge);

router.get('/xp', getXpLogs);
router.post('/xp', authorize('ADMIN', 'MENTOR'), validate(addXpSchema), addXp);

router.get('/leaderboard', getLeaderboard);

router.get('/streaks', getStreaks);
router.post('/streaks', authorize('ADMIN', 'MENTOR'), validate(updateStreakSchema), updateStreak);

module.exports = router;
