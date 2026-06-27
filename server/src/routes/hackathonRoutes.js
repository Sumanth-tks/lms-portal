const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createHackathonSchema, updateHackathonSchema, submitHackathonSchema, judgeHackathonSchema } = require('../utils/schemas');
const {
  createHackathon, listHackathons, getHackathon, updateHackathon, deleteHackathon,
  submitHackathon, judgeSubmission, getLeaderboard,
} = require('../controllers/hackathonController');

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createHackathonSchema), createHackathon);
router.get('/', listHackathons);
router.get('/:id', getHackathon);
router.put('/:id', authorize('ADMIN', 'MENTOR'), validate(updateHackathonSchema), updateHackathon);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteHackathon);

router.post('/:id/submit', authorize('INTERN'), validate(submitHackathonSchema), submitHackathon);
router.put('/submissions/:submissionId/judge', authorize('ADMIN', 'MENTOR'), validate(judgeHackathonSchema), judgeSubmission);
router.get('/:id/leaderboard', getLeaderboard);

module.exports = router;
