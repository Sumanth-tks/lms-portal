const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createThreadSchema, createReplySchema } = require('../utils/schemas');
const {
  listThreads, getThread, createThread, deleteThread,
  togglePin, toggleResolve,
  toggleThreadUpvote, toggleReplyUpvote,
  createReply, deleteReply,
} = require('../controllers/discussionController');

router.use(authenticate);

// Threads
router.get('/', listThreads);
router.get('/:id', getThread);
router.post('/', validate(createThreadSchema), createThread);
router.delete('/:id', deleteThread);

// Moderation (mentors & admins)
router.patch('/:id/pin', authorize('ADMIN', 'MENTOR'), togglePin);
router.patch('/:id/resolve', authorize('ADMIN', 'MENTOR'), toggleResolve);

// Upvotes
router.post('/:id/upvote', toggleThreadUpvote);
router.post('/:id/replies/:replyId/upvote', toggleReplyUpvote);

// Replies
router.post('/:id/replies', validate(createReplySchema), createReply);
router.delete('/:id/replies/:replyId', deleteReply);

module.exports = router;
