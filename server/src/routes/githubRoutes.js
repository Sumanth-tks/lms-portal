const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { linkRepoSchema, addCommitSchema, createReviewSchema, executeCodeSchema } = require('../utils/schemas');
const {
  linkRepo, listLinks, unlinkRepo,
  addCommit, listCommits,
  createReview, listReviews,
  executeCode, getPortfolio,
} = require('../controllers/githubController');

router.use(authenticate);

// GitHub Links
router.post('/links', validate(linkRepoSchema), linkRepo);
router.get('/links', listLinks);
router.delete('/links/:id', unlinkRepo);

// Commits
router.post('/commits', authorize('ADMIN', 'MENTOR'), validate(addCommitSchema), addCommit);
router.get('/commits', listCommits);

// Code Reviews
router.post('/reviews', authorize('ADMIN', 'MENTOR'), validate(createReviewSchema), createReview);
router.get('/reviews', listReviews);

// Code Playground
router.post('/execute', validate(executeCodeSchema), executeCode);

// Portfolio
router.get('/portfolio/:internId?', getPortfolio);

module.exports = router;
