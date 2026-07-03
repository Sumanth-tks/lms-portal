const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createQuizSchema, updateQuizSchema, addQuestionSchema, submitAttemptSchema } = require('../utils/schemas');
const {
  createQuiz, listQuizzes, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, deleteQuestion, submitAttempt, getAttempts,
} = require('../controllers/quizController');

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createQuizSchema), createQuiz);
router.get('/', authenticate, listQuizzes);
router.get('/:id', authenticate, getQuiz);
router.put('/:id', authorize('ADMIN', 'MENTOR'), validate(updateQuizSchema), updateQuiz);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteQuiz);

router.post('/:quizId/questions', authorize('ADMIN', 'MENTOR'), validate(addQuestionSchema), addQuestion);
router.delete('/:quizId/questions/:questionId', authorize('ADMIN', 'MENTOR'), deleteQuestion);

router.post('/:quizId/submit', authorize('INTERN'), validate(submitAttemptSchema), submitAttempt);
router.get('/:quizId/attempts', authenticate, getAttempts);

module.exports = router;
