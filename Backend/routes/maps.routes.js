const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const auth = require('../middlewares/auth.middleware');
const mapcontroller = require('../controllers/maps.controller');
const { validate, asyncHandler } = require('../middlewares/validate.middleware');

router.get('/get-coordinates',
    auth.authUserOrCaptain,
    query('address').isString().trim().isLength({ min: 3 }).withMessage('Address is required'),
    validate,
    asyncHandler(mapcontroller.getcoordinates)
);

router.get('/get-distance-time',
    auth.authUserOrCaptain,
    query('origin').isString().trim().isLength({ min: 3 }).withMessage('Origin is required'),
    query('destination').isString().trim().isLength({ min: 3 }).withMessage('Destination is required'),
    validate,
    asyncHandler(mapcontroller.getDistanceAndTime)
);

router.get('/get-suggestion',
    auth.authUserOrCaptain,
    query('input').isString().trim().isLength({ min: 3 }).withMessage('Input is required'),
    validate,
    asyncHandler(mapcontroller.getSuggestion)
);

router.get('/reverse',
    auth.authUserOrCaptain,
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('A valid latitude is required'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('A valid longitude is required'),
    validate,
    asyncHandler(mapcontroller.reverse)
);

module.exports = router;
