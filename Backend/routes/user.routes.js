const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const usercontroller=require('../controllers/user.controller');
const authmiddleware=require('../middlewares/auth.middleware');

router.post('/register',[
    
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('fullname.firstname').isLength({min:3}).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
    // body('socketId').notEmpty().withMessage('Socket ID is required')
],usercontroller.registeruser);

router.post('/login',[
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')
],usercontroller.loginuser);

router.get('/profile',authmiddleware.authuser,usercontroller.getuserprofile);


router.get('/logout',authmiddleware.authuser,usercontroller.logoutuser);

module.exports=router;