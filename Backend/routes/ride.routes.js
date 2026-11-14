const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const auth = require('../middlewares/auth.middleware');
const { validate, asyncHandler } = require('../middlewares/validate.middleware');

const VEHICLE_TYPES = ['car', 'auto', 'moto'];
const rideIdBody = body('rideId').isMongoId().withMessage('A valid ride ID is required');

router.get('/get-fare',
    auth.authuser,
    query('pickup').isString().trim().isLength({ min: 3 }).withMessage('Pickup location is required'),
    query('destination').isString().trim().isLength({ min: 3 }).withMessage('Destination location is required'),
    validate,
    asyncHandler(rideController.getFare)
);

router.post('/create',
    auth.authuser,
    body('pickup').isString().trim().isLength({ min: 3 }).withMessage('Pickup location is required'),
    body('destination').isString().trim().isLength({ min: 3 }).withMessage('Destination location is required'),
    body('vehicleType').isIn(VEHICLE_TYPES).withMessage('Vehicle type must be one of car, auto or moto'),
    validate,
    asyncHandler(rideController.createRide)
);

router.post('/confirm',
    auth.authcaptain,
    rideIdBody,
    validate,
    asyncHandler(rideController.confirmRide)
);

router.post('/start',
    auth.authcaptain,
    rideIdBody,
    body('otp').isString().matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
    validate,
    asyncHandler(rideController.startRide)
);

router.post('/end',
    auth.authcaptain,
    rideIdBody,
    validate,
    asyncHandler(rideController.endRide)
);

router.post('/cancel',
    auth.authUserOrCaptain,
    rideIdBody,
    body('reason').optional().isString().trim().isLength({ max: 300 }).withMessage('Reason is too long'),
    validate,
    asyncHandler(rideController.cancelRide)
);

router.post('/rate',
    auth.authuser,
    rideIdBody,
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Comment is too long'),
    validate,
    asyncHandler(rideController.rateRide)
);

router.get('/active',
    auth.authUserOrCaptain,
    asyncHandler(rideController.getActiveRide)
);

router.get('/history',
    auth.authUserOrCaptain,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    validate,
    asyncHandler(rideController.getHistory)
);

const rideIdParam = param('rideId').isMongoId().withMessage('A valid ride ID is required');

router.get('/:rideId/messages',
    auth.authUserOrCaptain,
    rideIdParam,
    validate,
    asyncHandler(rideController.getMessages)
);

router.post('/:rideId/messages',
    auth.authUserOrCaptain,
    rideIdParam,
    body('text').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters'),
    validate,
    asyncHandler(rideController.sendMessage)
);

module.exports = router;
