const express = require('express');
const router = express.Router();
const {body, query} = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create',
    authMiddleware.authuser,
    body('pickup').isString().isLength({min: 3}).withMessage('Pickup location is required'),
    body('destination').isString().isLength({min: 3}).withMessage('destination location is required'),
    body('vehicleType').isString().isIn(['auto', 'car', 'moto']).withMessage('Vehicle type is required and must be one of auto, car, or motorcycle'),
    
    rideController.createRide
)


router.get('/get-fare',
    authMiddleware.authuser,
    query('pickup').isString().isLength({min: 3}).withMessage('Pickup location is required'),
    query('destination').isString().isLength({min: 3}).withMessage('Destination location is required'),
    
    rideController.getFare
);

router.post('/confirm',
    
    authMiddleware.authcaptain,
    body('rideId').isMongoId().withMessage('Ride ID is required'),
    
    rideController.confirmRide
    // console.log(".confirm ride route hit");
);


router.get('/start-ride',
    authMiddleware.authcaptain,
    query('rideId').isMongoId().withMessage('Ride ID is required'),
    query('otp').isString().isLength({min: 6, max: 6}).withMessage('OTP is required and must be 6 characters long'),
    
    rideController.startRide
);


router.post('/end-ride',
    authMiddleware.authcaptain,
    body('rideId').isMongoId().withMessage('Ride ID is required'),
    
    rideController.endRide
);

module.exports=router;