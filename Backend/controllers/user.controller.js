const usermodel = require('../models/user.model');
const userservice = require('../services/user.service');
const blacklisttokenmodel = require('../models/blacklisttokenmodel');
const { extractToken, isAdmin } = require('../middlewares/auth.middleware');

// Public user shape: the stored document (never the password hash) plus whether
// this account may open the admin dashboard.
const withRole = user => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...safe } = user.toJSON();
    return { ...safe, isAdmin: isAdmin(user) };
};

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
};

module.exports.registeruser = async (req, res) => {
    const { fullname, email, password } = req.body;

    if (await usermodel.exists({ email })) {
        return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await userservice.createuser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: await usermodel.hashpassword(password)
    });

    const token = user.generateAuthToken();
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ token, user: withRole(user) });
};

module.exports.loginuser = async (req, res) => {
    const { email, password } = req.body;
    const user = await usermodel.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    user.password = undefined;
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ token, user: withRole(user) });
};

module.exports.getuserprofile = async (req, res) => {
    res.status(200).json({ user: withRole(req.user) });
};

module.exports.logoutuser = async (req, res) => {
    const token = extractToken(req);
    res.clearCookie('token');
    if (token) await blacklisttokenmodel.updateOne({ token }, { token }, { upsert: true });
    res.status(200).json({ message: 'Logged out successfully' });
};
