const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapcontroller = require('../controllers/maps.controller');
const {query} = require('express-validator'); 
router.get('/get-coordinates',query('address').isString().isLength({min:3}).withMessage('Address is required'),
    authMiddleware.authuser, mapcontroller.getcoordinates);

router.get('/get-distance-time',query('origin').isString().isLength({min:3}).withMessage('Origin is required'),
    query('destination').isString().isLength({min:3}).withMessage('Destination is required'),
    authMiddleware.authuser, mapcontroller.getDistanceAndTime);

router.get('/get-suggestion', query('input').isString().isLength({ min: 3 }).withMessage('Input is required'),
    authMiddleware.authuser, mapcontroller.getSuggestion);

module.exports=router;