const { Router } = require('express');
const { createCourse, listCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createCourseSchema), createCourse);
router.get('/', listCourses);
router.get('/:id', getCourse);
router.patch('/:id', authorize('ADMIN', 'MENTOR'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteCourse);

module.exports = router;
