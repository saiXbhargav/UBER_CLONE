const locationStore = require('../services/location.store');
const blacklisttokenmodel = require('../models/blacklisttokenmodel');
const captainmodel = require('../models/captain.model');
const captainservice = require('../services/captain.service');
const rideservice = require('../services/ride.service');
const { extractToken, SUSPENDED_MESSAGE } = require('../middlewares/auth.middleware');

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
};

module.exports.registercaptain = async (req, res) => {
    const { fullname, email, password, vehicle } = req.body;

    if (await captainmodel.exists({ email })) {
        return res.status(409).json({ message: 'An account with this email already exists' });
    }
    if (await captainmodel.exists({ 'vehicle.plate': vehicle.plate })) {
        return res.status(409).json({ message: 'This vehicle plate is already registered' });
    }

    const captain = await captainservice.createcaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: await captainmodel.hashpassword(password),
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();
    captain.password = undefined; // never send the hash back
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ token, captain });
};

module.exports.logincaptain = async (req, res) => {
    const { email, password } = req.body;
    const captain = await captainmodel.findOne({ email }).select('+password');
    if (!captain || !(await captain.comparepassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (captain.blocked) {
        return res.status(403).json({ message: SUSPENDED_MESSAGE });
    }

    const token = captain.generateAuthToken();
    captain.password = undefined;
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ token, captain });
};

module.exports.getcaptainprofile = async (req, res) => {
    res.status(200).json({ captain: req.captain });
};

module.exports.getStats = async (req, res) => {
    res.json(await rideservice.getCaptainStats(req.captain));
};

module.exports.updateStatus = async (req, res) => {
    const captain = await captainmodel.findByIdAndUpdate(
        req.captain._id,
        { status: req.body.status },
        { new: true }
    );
    if (captain.status === 'inactive') await locationStore.removeCaptainLocation(captain._id);
    res.json({ captain });
};

module.exports.logoutcaptain = async (req, res) => {
    const token = extractToken(req);
    res.clearCookie('token');
    if (token) await blacklisttokenmodel.updateOne({ token }, { token }, { upsert: true });
    res.status(200).json({ message: 'Logged out successfully' });
};
