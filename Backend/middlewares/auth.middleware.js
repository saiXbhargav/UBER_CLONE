const jwt = require('jsonwebtoken');
const usermodel = require('../models/user.model');
const captainmodel = require('../models/captain.model');
const blacklisttokenmodel = require('../models/blacklisttokenmodel');

const SUSPENDED_MESSAGE = 'Your account has been suspended';

function extractToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.slice(7);
    return req.cookies?.token || null;
}

function authError(message, status = 401) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/**
 * Verifies a raw JWT and resolves the account it belongs to.
 * Returns { role, account } or throws an Error with a client-safe message (and `status`).
 * `expectedRole` limits which account type is accepted (undefined = either).
 */
async function resolveToken(token, expectedRole) {
    if (!token) throw authError('Authentication required');

    if (await blacklisttokenmodel.exists({ token })) {
        throw authError('Session has been logged out');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw authError('Invalid or expired token');
    }

    const roles = decoded.role ? [decoded.role] : ['user', 'captain']; // old tokens have no role
    for (const role of roles) {
        if (expectedRole && role !== expectedRole) continue;
        const model = role === 'captain' ? captainmodel : usermodel;
        const account = await model.findById(decoded._id);
        if (account) {
            if (role === 'captain' && account.blocked) throw authError(SUSPENDED_MESSAGE, 403);
            return { role, account };
        }
    }
    throw authError('Account not found');
}

function authenticate(expectedRole) {
    return async (req, res, next) => {
        try {
            const token = extractToken(req);
            const { role, account } = await resolveToken(token, expectedRole);
            req.role = role;
            req.token = token;
            if (role === 'captain') req.captain = account;
            else req.user = account;
            return next();
        } catch (err) {
            return res.status(err.status === 403 ? 403 : 401).json({ message: err.message });
        }
    };
}

// ---------- admin ----------
function adminEmails() {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
}

/** A rider account is an admin when its email is listed in ADMIN_EMAILS. */
function isAdmin(user) {
    if (!user?.email) return false;
    return adminEmails().includes(String(user.email).trim().toLowerCase());
}

/** Use after `authuser`. */
function requireAdmin(req, res, next) {
    if (req.role === 'user' && isAdmin(req.user)) return next();
    return res.status(403).json({ message: 'Admins only' });
}

module.exports = {
    SUSPENDED_MESSAGE,
    extractToken,
    resolveToken,
    isAdmin,
    requireAdmin,
    authuser: authenticate('user'),
    authcaptain: authenticate('captain'),
    authUserOrCaptain: authenticate(),
};
