const blacklisttokenmodel = require('../models/blacklisttokenmodel');
const captainmodel = require('../models/captain.model');
const captainservice = require('../services/captain.service');
const { validationResult } = require('express-validator');


module.exports.registercaptain = async (req, res, next) => {
    const errors = validationResult(req);
    console.log("Request body:", req.body);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;
    const iscaptainalreadyexists = await captainmodel.findOne({ email });
    if (iscaptainalreadyexists) {
        return res.status(400).json({ message: 'Captain already exists' });
    }

    const hashedpassword = await captainmodel.hashpassword(password);

    const captain = await captainservice.createcaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedpassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicletype: vehicle.vehicleType
    });

    const token = await captain.generateAuthToken();
    res.status(201).json({
        token, captain
    });
}

module.exports.logincaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const captain = await captainmodel.findOne({email}).select('+password');
    if (!captain) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const ispasswordcorrect = await captain.comparepassword(password);
    if (!ispasswordcorrect) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = await captain.generateAuthToken();
    res.cookie('token',token);
    res.status(200).json({
        token, captain
    });

}

module.exports.getcaptainprofile = async (req, res, next) => {
    res.status(200).json({
        captain:req.captain
    });
}

module.exports.logoutcaptain = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Split "Bearer <token
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized1: No token provided' });
    }
    await blacklisttokenmodel.create({ token });
    res.status(200).json({ message: 'Logged out successfully' });   
}