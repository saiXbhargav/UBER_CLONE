const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usercontroller = require('../controllers/user.controller');
const placecontroller = require('../controllers/place.controller');
const auth = require('../middlewares/auth.middleware');
const { validate, asyncHandler } = require('../middlewares/validate.middleware');

router.post('/register',
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('fullname.firstname').isString().trim().isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').optional({ values: 'falsy' }).isString().trim().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate,
    asyncHandler(usercontroller.registeruser)
);

router.post('/login',
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate,
    asyncHandler(usercontroller.loginuser)
);

router.get('/profile', auth.authuser, asyncHandler(usercontroller.getuserprofile));

router.get('/logout', auth.authuser, asyncHandler(usercontroller.logoutuser));

router.get('/places', auth.authuser, asyncHandler(placecontroller.getPlaces));

router.put('/places',
    auth.authuser,
    body('home').optional().isString().trim().isLength({ max: 200 }).withMessage('Home address is too long'),
    body('work').optional().isString().trim().isLength({ max: 200 }).withMessage('Work address is too long'),
    validate,
    asyncHandler(placecontroller.updatePlaces)
);

module.exports = router;
