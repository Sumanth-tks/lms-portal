const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  assignPeerReviewer,
  autoAssignPeerReviewers,
  getMyPeerReviews,
  getReviewsOnMyCode,
  submitPeerReview,
  getPeerReviewStats,
} = require('../controllers/peerCodeReviewController');

router.use(authenticate);

// Admin/Mentor endpoints
router.post('/assign', authorize('ADMIN', 'MENTOR'), assignPeerReviewer);
router.post('/auto-assign', authorize('ADMIN', 'MENTOR'), autoAssignPeerReviewers);
router.get('/stats', authorize('ADMIN', 'MENTOR'), getPeerReviewStats);

// Intern endpoints (also accessible by admin/mentor)
router.get('/my', getMyPeerReviews);
router.get('/on-my-code', getReviewsOnMyCode);
router.put('/:id/submit', submitPeerReview);

module.exports = router;
