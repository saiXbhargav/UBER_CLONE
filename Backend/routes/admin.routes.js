const express = require('express');
const { body, param, query } = require('express-validator');
const admincontroller = require('../controllers/admin.controller');
const { authuser, requireAdmin } = require('../middlewares/auth.middleware');
const { validate, asyncHandler } = require('../middlewares/validate.middleware');

const router = express.Router();

// Every admin route: signed-in rider account whose email is listed in ADMIN_EMAILS.
router.use(authuser, requireAdmin);

const pagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
];

router.get('/overview', asyncHandler(admincontroller.getOverview));

router.get('/rides',
    query('status').optional({ values: 'falsy' })
        .isIn(['pending', 'accepted', 'on-going', 'completed', 'canceled', 'active'])
        .withMessage('Unknown ride status'),
    ...pagination,
    validate,
    asyncHandler(admincontroller.listRides)
);

router.get('/captains',
    query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Search is too long'),
    ...pagination,
    validate,
    asyncHandler(admincontroller.listCaptains)
);

router.patch('/captains/:id/block',
    param('id').isMongoId().withMessage('Invalid captain id'),
    body('blocked').isBoolean({ strict: true }).withMessage('blocked must be true or false').toBoolean(true),
    validate,
    asyncHandler(admincontroller.setCaptainBlocked)
);

module.exports = router;
