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


module.exports=router;