const { Router } = require('express');
const { createLesson, getLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createLessonSchema, updateLessonSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createLessonSchema), createLesson);
router.get('/:id', getLesson);
router.patch('/:id', authorize('ADMIN', 'MENTOR'), validate(updateLessonSchema), updateLesson);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteLesson);

module.exports = router;
