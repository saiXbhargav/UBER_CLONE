const rideservice = require('../services/ride.service');
const { validationResult } = require('express-validator');
module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {  pickup, destination, vehicleType } = req.body;
    // console.log("✅ Request user:", req.user);
    // console.log("📦 Payload:", { pickup, destination, vehicleType });
    // console.log("🚗 Vehicle Type:", vehicleType);
    // console.log("🗺️ Pickup Location:", pickup);
    // console.log("📍 Destination Location:", destination);
    // console.log("👤 User ID:", req.user._id);
    try {
        const ride = await rideservice.createRide({ user:req.user._id, pickup, destination, vehicleType });
        res.status(201).json(ride);
    } catch (error) {
        res.status(500).json({ error: "Failed to create ride" });
    }
};