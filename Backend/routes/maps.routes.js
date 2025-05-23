const express = require('express');
const router = express.Router();
const authmiddleware = require('../middlewares/auth.middleware');
const {getCoordinate} = require('../controllers/maps.controller');
const {query}=require('express-validator');
router.get('/get-coordinates',query('address').isString().isLength({min:1}).withMessage('Address is required'),authmiddleware,getCoordinate);


module.exports=router;