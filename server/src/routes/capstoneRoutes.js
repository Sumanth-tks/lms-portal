const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCapstoneSchema, updateCapstoneSchema, evaluateCapstoneSchema } = require('../utils/schemas');
const { createCapstone, listCapstones, getCapstone, updateCapstone, evaluateCapstone } = require('../controllers/capstoneController');

router.use(authenticate);

router.post('/', validate(createCapstoneSchema), createCapstone);
router.get('/', listCapstones);
router.get('/:id', getCapstone);
router.put('/:id', validate(updateCapstoneSchema), updateCapstone);
router.put('/:id/evaluate', authorize('ADMIN', 'MENTOR'), validate(evaluateCapstoneSchema), evaluateCapstone);

module.exports = router;
