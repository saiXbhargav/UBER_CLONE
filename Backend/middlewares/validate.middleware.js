const { validationResult } = require('express-validator');

// Runs after express-validator chains; responds 400 with the first message plus the full list.
function validate(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    // Never echo submitted values back (they may contain passwords).
    const list = errors.array().map(({ msg, path, location }) => ({ msg, path, location }));
    return res.status(400).json({ message: list[0].msg, errors: list });
}

// Forwards rejected promises from async handlers to the central error handler.
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { validate, asyncHandler };
