const rideservice = require('../services/ride.service');
const mapservice = require('../services/maps.service');
const captainmodel = require('../models/captain.model');
const { validationResult } = require('express-validator');
const {sendMessage}=require('../socket');
const rideModel = require('../models/ride.model');
// const Captain = require('./models/captain.model');

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

        
        const pickupCoordinates = await mapservice.getCoordinatesFromName(pickup);
        console.log("📍 Pickup Coordinates:", pickupCoordinates);
        const captaininradius= await mapservice.getcaptainsintheradius(pickupCoordinates[0], pickupCoordinates[1], 5000);
        const captains = await captainmodel.find();
        // console.log("🌍 Searching near:", { lng, ltd, radiusKm: radius });
        // console.log("🧭 All captain locations:");
        captains.forEach(c => console.log(c.location));

        // console.log("👨‍✈️ Captains in radius:", captaininradius);
        ride.otp="";
        const ridewithuser=await rideModel.findOne({ _id: ride._id }).populate('user');
        console.log("🚦 Ride with user details:", ridewithuser);
        captaininradius.map(captain => {
            // console.log("📬 Sending ride request to captain:", captain.socketId);
            // sendMessage(captain.socketId, `New ride request from ${pickup} to ${destination}`);
            sendMessage(captain.socketId, {
                event: 'new-ride',
                data: ridewithuser
            });
        });
        return res.status(201).json(ride);

    } catch (error) {
  console.error("❌ Ride creation failed:", error.message); // log the error reason
  return res.status(500).json({ error: "Failed to create ride", details: error.message });
}

};

module.exports.getFare = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination } = req.query;
    try {
        const fare = await rideservice.getfare(pickup, destination);
        res.json(fare);
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate fare" });
    }
};


module.exports.confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { rideId } = req.body;
    try {
  console.log("🚀 Confirming ride for captain:", req.captain._id, "with ride ID:", rideId);
  
  const ride = await rideservice.confirmRide(rideId, req.captain._id);

  console.log("✅ Ride confirmed:", ride);

  if (!ride) {
    return res.status(404).json({ error: "Ride not found or already confirmed" });
  }

  sendMessage(ride.user?.socketId, {
    event: 'ride-confirmed',
    data: ride
  });

  return res.status(200).json(ride);

    } catch (error) {
    console.error("❌ Error confirming ride:", error.message, error.stack);
    return res.status(500).json({ error: "Ride confirmation failed", details: error.message });
    }

};


module.exports.startRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { rideId, otp } = req.query;
    try {
        const ride = await rideservice.startRide(rideId, otp, req.captain);
        if (!ride) {
            return res.status(404).json({ error: "Ride not found or already started" });
        }
        sendMessage(ride.user?.socketId, {
            event: 'ride-started',
            data: ride
        });
        return res.status(200).json(ride);
    } catch (error) {
        console.error("❌ Error starting ride:", error.message);
        return res.status(500).json({ error: "Failed to start ride", details: error.message });
    }
}


module.exports.endRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { rideId } = req.body;
    try {
        const ride = await rideservice.endRide({ rideId, captain: req.captain });
        if (!ride) {
            return res.status(404).json({ error: "Ride not found or already ended" });
        }
        sendMessage(ride.user?.socketId, {
            event: 'ride-ended',
            data: ride
        });
        return res.status(200).json(ride);
    } catch (error) {
        console.error("❌ Error ending ride:", error.message);
        return res.status(500).json({ error: "Failed to end ride", details: error.message });
    }
};