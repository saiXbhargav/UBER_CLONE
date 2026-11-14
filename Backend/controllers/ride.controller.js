const rideservice = require('../services/ride.service');

const account = req => (req.role === 'captain' ? req.captain : req.user);

module.exports.getFare = async (req, res) => {
    const { pickup, destination } = req.query;
    const estimate = await rideservice.getFareEstimate(pickup, destination);
    res.json({
        fares: estimate.fares,
        surge: estimate.surge,
        distance: estimate.distance,
        duration: estimate.duration,
        polyline: estimate.polyline
    });
};

module.exports.createRide = async (req, res) => {
    const { pickup, destination, vehicleType } = req.body;
    const ride = await rideservice.createRide({ user: req.user._id, pickup, destination, vehicleType });
    res.status(201).json(ride);
};

module.exports.confirmRide = async (req, res) => {
    const ride = await rideservice.confirmRide(req.body.rideId, req.captain);
    res.json(ride);
};

module.exports.startRide = async (req, res) => {
    const { rideId, otp } = req.body;
    const ride = await rideservice.startRide(rideId, otp, req.captain);
    res.json(ride);
};

module.exports.endRide = async (req, res) => {
    const ride = await rideservice.endRide({ rideId: req.body.rideId, captain: req.captain });
    res.json(ride);
};

module.exports.cancelRide = async (req, res) => {
    const { rideId, reason } = req.body;
    const ride = await rideservice.cancelRide({ rideId, role: req.role, account: account(req), reason });
    res.json(ride);
};

module.exports.rateRide = async (req, res) => {
    const { rideId, score, comment } = req.body;
    const ride = await rideservice.rateRide({ rideId, user: req.user, score: Number(score), comment });
    res.json(ride);
};

module.exports.getActiveRide = async (req, res) => {
    const ride = await rideservice.getActiveRide({ role: req.role, account: account(req) });
    res.json({ ride: ride || null });
};

module.exports.getHistory = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await rideservice.getRideHistory({ role: req.role, account: account(req), page, limit });
    res.json(result);
};

module.exports.getMessages = async (req, res) => {
    const messages = await rideservice.getMessages({ rideId: req.params.rideId, role: req.role, account: account(req) });
    res.json({ messages });
};

module.exports.sendMessage = async (req, res) => {
    const message = await rideservice.sendMessage({
        rideId: req.params.rideId,
        role: req.role,
        account: account(req),
        text: req.body.text,
    });
    res.status(201).json({ message });
};
