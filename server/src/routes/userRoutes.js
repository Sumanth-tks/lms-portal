const { Router } = require('express');
const { createUser, listUsers, getUser, updateUser, deleteUser, getMentorInterns, setMentorInterns } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createUserSchema), createUser);
router.get('/', authorize('ADMIN', 'MENTOR'), listUsers);
router.get('/:id', authorize('ADMIN', 'MENTOR'), getUser);
router.get('/:id/interns', authorize('ADMIN'), getMentorInterns);
router.put('/:id/interns', authorize('ADMIN'), setMentorInterns);
router.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
