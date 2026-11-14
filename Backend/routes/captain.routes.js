const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captaincontroller = require('../controllers/captain.controller');
const auth = require('../middlewares/auth.middleware');
const { validate, asyncHandler } = require('../middlewares/validate.middleware');

router.post('/register',
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('fullname.firstname').isString().trim().isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').optional({ values: 'falsy' }).isString().trim().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').isString().trim().notEmpty().withMessage('Vehicle color is required'),
    body('vehicle.plate').isString().trim().isLength({ min: 5 }).withMessage('Plate number must be at least 5 characters long'),
    body('vehicle.capacity').isInt({ min: 1, max: 10 }).withMessage('Capacity must be a number between 1 and 10'),
    body('vehicle.vehicleType').isIn(['car', 'auto', 'moto']).withMessage('Vehicle type must be car, auto or moto'),
    validate,
    asyncHandler(captaincontroller.registercaptain)
);

router.post('/login',
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate,
    asyncHandler(captaincontroller.logincaptain)
);

router.get('/profile', auth.authcaptain, asyncHandler(captaincontroller.getcaptainprofile));

router.get('/stats', auth.authcaptain, asyncHandler(captaincontroller.getStats));

router.patch('/status',
    auth.authcaptain,
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate,
    asyncHandler(captaincontroller.updateStatus)
);

router.get('/logout', auth.authcaptain, asyncHandler(captaincontroller.logoutcaptain));

module.exports = router;
