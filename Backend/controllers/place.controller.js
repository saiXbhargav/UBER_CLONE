const usermodel = require('../models/user.model');
const ridemodel = require('../models/ride.model');

const RECENT_LIMIT = 5;

/** Saved Home/Work plus the rider's most recent distinct destinations. */
module.exports.getPlaces = async (req, res) => {
    const rides = await ridemodel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30)
        .select('destination pickup')
        .lean();

    const recent = [];
    for (const r of rides) {
        for (const place of [r.destination, r.pickup]) {
            if (place && !recent.includes(place)) recent.push(place);
        }
        if (recent.length >= RECENT_LIMIT) break;
    }

    res.json({
        home: req.user.places?.home || '',
        work: req.user.places?.work || '',
        recent: recent.slice(0, RECENT_LIMIT),
    });
};

/** Body: { home?, work? } — an empty string clears that place. */
module.exports.updatePlaces = async (req, res) => {
    const update = {};
    for (const key of ['home', 'work']) {
        if (typeof req.body[key] === 'string') update[`places.${key}`] = req.body[key].trim();
    }
    const user = await usermodel.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
    res.json({ home: user.places?.home || '', work: user.places?.work || '' });
};
