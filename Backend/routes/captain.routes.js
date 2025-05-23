const express = require('express');
const router = express.Router();
const captaincontroller = require('../controllers/captain.controller');
const { body } = require('express-validator');
const authmiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').notEmpty().withMessage('Color is required'),
    body('vehicle.plate').isLength({ min: 5 }).withMessage('Plate number must be at least 5 characters long'),
    body('vehicle.capacity').isNumeric().withMessage('Capacity must be a number'),
    body('vehicle.vehicleType').notEmpty().withMessage('Vehicle type is required'),
], captaincontroller.registercaptain);


router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], captaincontroller.logincaptain);

router.get('/profile', authmiddleware.authcaptain, captaincontroller.getcaptainprofile);

router.get('/logout', authmiddleware.authcaptain, captaincontroller.logoutcaptain);


module.exports=router;