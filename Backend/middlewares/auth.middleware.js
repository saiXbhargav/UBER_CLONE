const usermodel=require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklisttokenmodel = require('../models/blacklisttokenmodel');
const captainmodel = require('../models/captain.model');
module.exports.authuser = async (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Split "Bearer <token>" if present

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized1: No token provided' });
    }
    const isblacklisted = await blacklisttokenmodel.findOne({ token });
    if (isblacklisted) {
        return res.status(401).json({ message: 'Unauthorized2: Token is blacklisted' });
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized2: User not found' });
        }
        
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized3: Invalid token', error: err.message });
    }
};

module.exports.authcaptain = async (req, res, next) => {
    //  console.log(".confirm ride route hit");
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Split "Bearer <token>" if present

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized1: No token provided' });
    }
    const isblacklisted = await blacklisttokenmodel.findOne({ token });
    if (isblacklisted) {
        return res.status(401).json({ message: 'Unauthorized2: Token is blacklisted' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainmodel.findById(decoded._id);

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized2: Captain not found' });
        }
        
        req.captain = captain;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized3: Invalid token', error: err.message });
    }
}
