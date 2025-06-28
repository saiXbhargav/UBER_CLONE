const ridemodel = require('../models/ride.model');
const mapservice = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendMessage } = require('../socket');

function getOtp(num) {
    if (!num || num <= 0) {
        throw new Error('Number of digits must be greater than 0');
    }

    const otp = Math.floor(Math.random() * Math.pow(10, num)).toString().padStart(num, '0');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    return { otp, hashedOtp };
}





async function getfare(pickup, destination) {
    if(!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }
    const distancetime = await mapservice.getDistanceAndTime(pickup, destination);
    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1
    };

    const distanceInKm = distancetime.distance.value / 1000;
  // time is in seconds, convert to minutes
    const timeInMinutes = distancetime.duration.value / 60;

    const fare = {
        auto: baseFare.auto + (distanceInKm * perKmRate.auto) + (timeInMinutes * perMinuteRate.auto),
        car: baseFare.car + (distanceInKm * perKmRate.car) + (timeInMinutes * perMinuteRate.car),
        moto: baseFare.moto + (distanceInKm * perKmRate.moto) + (timeInMinutes * perMinuteRate.moto)
    };

    for (const vehicleType in fare) {
        fare[vehicleType] = Math.round(fare[vehicleType] ) ;
    }
    // console.log('Fare calculated:', fare);
    return fare;
}
module.exports.getfare = getfare;

module.exports.createRide = async ({
    user,pickup,destination,vehicleType
}) => {
    if(!user || !pickup || !destination || !vehicleType) {
        throw new Error('User, pickup, destination and vehicle type are required');
    }
    const fare = await getfare(pickup, destination);
    const ride=ridemodel.create({
        user,
        pickup,
        destination,
        fare: fare[vehicleType],
        otp: getOtp(6).otp,
    });
    return ride;
}



module.exports.confirmRide = async (rideId, captain) => {
    if(!rideId) {
        throw new Error('Ride ID is required');
    }
    await ridemodel.findOneAndUpdate({
        _id: rideId
    },
    {
        captain: captain._id,
        status: 'accepted'
    });
    const ride = await ridemodel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp'); // Exclude OTP from the response

    if (!ride) {
        throw new Error('Ride not found or already confirmed');
    }
    
    return ride;
};



module.exports.startRide = async (rideId, otp, captain) => {
    if (!rideId || !otp || !captain) {
        throw new Error('Ride ID, OTP, and Captain are required');
    }
    const ride = await ridemodel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp'); // Include OTP in the query
    if (!ride) {
        throw new Error('Ride not found or not assigned to captain');
    }
    // if(ride.status !== 'accepted') {
    //     throw new Error('Ride is not in accepted status');
    // }
    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }
    await ridemodel.findOneAndUpdate(
        { _id: rideId },
        { status: 'on-going' }
    );
    sendMessage(ride.user?.socketId, {
        event: 'ride-started',
        data: ride
    });
    return ride;
};





module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId || !captain) {
        throw new Error('Ride ID and Captain are required');
    }
    const ride = await ridemodel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp'); // Include OTP in the query
    if (!ride) {
        throw new Error('Ride not found or not assigned to captain');
    }
    if (ride.status !== 'on-going') {
        throw new Error('Ride is not in on-going status');
    }
    await ridemodel.findOneAndUpdate(
        { _id: rideId },
        { status: 'completed' }
    );
    return ride;
};
