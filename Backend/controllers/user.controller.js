// const app = require('../app');
const usermodel = require('../models/user.model');
const userservice = require('../services/user.service');
const { validationResult } = require('express-validator');
// const { body } = require('express-validator');
const blacklisttokenmodel = require('../models/blacklisttokenmodel');
module.exports.registeruser = async (req, res,next) => {
    const errors= validationResult(req);
    console.log("Request body:", req.body); 
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    
    const { fullname, email, password} = req.body;
    const isuseralreadyexists = await usermodel.findOne({ email });
    if (isuseralreadyexists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedpassword = await usermodel.hashpassword(password);

    const user=await userservice.createuser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password:hashedpassword
    });

    const token=await user.generateAuthToken();
    res.status(201).json({
        token,user
    });
}


module.exports.loginuser=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {email,password}=req.body;
    const user=await usermodel.findOne({email}).select('+password');
    if(!user){
        return res.status(401).json({message:'Invalid email or password'});
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({message:'Invalid email or password'});
    }
    const token=await user.generateAuthToken();
    res.cookie('token',token);
    res.status(200).json({
        token,user
    });
}

module.exports.getuserprofile=async(req,res,next)=>{
    res.status(200).json({
        user:req.user
    });
}


module.exports.logoutuser=async(req,res,next)=>{
    res.clearCookie('token');
    const token=req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    await blacklisttokenmodel.create({ token });
    res.status(200).json({
        message:'Logout successful'
    });
}