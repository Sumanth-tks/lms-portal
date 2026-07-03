const { Router } = require('express');
const { toggleAccess, bulkToggleAccess, getInternAccess } = require('../controllers/accessController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { toggleAccessSchema, bulkToggleAccessSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/toggle', authorize('ADMIN', 'MENTOR'), validate(toggleAccessSchema), toggleAccess);
router.post('/bulk-toggle', authorize('ADMIN', 'MENTOR'), validate(bulkToggleAccessSchema), bulkToggleAccess);
router.get('/intern/:internId', getInternAccess);

module.exports = router;
