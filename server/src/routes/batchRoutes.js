const { Router } = require('express');
const { createBatch, listBatches, getBatch, updateBatch } = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBatchSchema, updateBatchSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN'), validate(createBatchSchema), createBatch);
router.get('/', authorize('ADMIN', 'MENTOR'), listBatches);
router.get('/:id', authorize('ADMIN', 'MENTOR'), getBatch);
router.patch('/:id', authorize('ADMIN'), validate(updateBatchSchema), updateBatch);

module.exports = router;
