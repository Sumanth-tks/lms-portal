const { Router } = require('express');
const { createModule, listModules, getModule, updateModule, deleteModule } = require('../controllers/moduleController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createModuleSchema, updateModuleSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createModuleSchema), createModule);
router.get('/', listModules);
router.get('/:id', getModule);
router.patch('/:id', authorize('ADMIN', 'MENTOR'), validate(updateModuleSchema), updateModule);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteModule);

module.exports = router;
