const mongoose = require('mongoose');
const ridemodel = require('../models/ride.model');
const captainmodel = require('../models/captain.model');
const mapservice = require('./maps.service');
const HttpError = require('../utils/httpError');
const {
    ACTIVE_STATUSES, DISPATCH_WAVES, canTransition, generateOtp, calculateFare, fareBreakdown, surgeMultiplier
} = require('../utils/rideRules');
const { emitToUser, emitToCaptain } = require('../socket');
const dispatchStore = require('./dispatch.store');
const locationStore = require('./location.store');
const logger = require('../utils/logger');

const RIDE_REQUEST_TIMEOUT_MS = 90 * 1000;
const SUPPLY_RADIUS_KM = 5;
const DEMAND_RADIUS_KM = 3;
const MAX_MESSAGES = 200;

const CAPTAIN_PUBLIC_FIELDS = 'fullname vehicle rating';
const USER_PUBLIC_FIELDS = 'fullname';

function populateRide(query) {
    return query
        .populate('user', USER_PUBLIC_FIELDS)
        .populate('captain', CAPTAIN_PUBLIC_FIELDS);
}

function findRide(id, { withOtp = false } = {}) {
    const q = populateRide(ridemodel.findById(id));
    return withOtp ? q.select('+otp') : q;
}

function assertTransition(ride, to) {
    if (!canTransition(ride.status, to)) {
        throw new HttpError(409, `Ride is ${ride.status} and cannot become ${to}`);
    }
}

async function forgetPendingRequest(rideId, { notifyCaptains = false, exceptCaptainId } = {}) {
    const key = String(rideId);
    const offered = notifyCaptains ? await dispatchStore.getOffered(key) : [];
    await dispatchStore.clear(key);
    for (const captainId of offered) {
        if (captainId !== String(exceptCaptainId)) {
            emitToCaptain(captainId, 'ride-unavailable', { rideId: key });
        }
    }
}

async function expireRide(rideId) {
    const ride = await ridemodel.findOneAndUpdate(
        { _id: rideId, status: 'pending' },
        { status: 'canceled', cancelledBy: 'system', cancelReason: 'No captain accepted in time' },
        { new: true }
    );
    await forgetPendingRequest(rideId, { notifyCaptains: true });
    if (ride) emitToUser(ride.user, 'ride-timeout', { rideId: String(rideId) });
}

// ---------- fares ----------
// Surge is advisory: if the lookup fails we simply charge the normal fare.
async function getSurge(origin) {
    try {
        const [pending, supply] = await Promise.all([
            mapservice.countPendingRequests(origin, DEMAND_RADIUS_KM),
            mapservice.countAvailableCaptains(origin, SUPPLY_RADIUS_KM),
        ]);
        const demand = pending + 1; // include the rider asking right now
        return { multiplier: surgeMultiplier(demand, supply), demand, supply };
    } catch {
        return { multiplier: 1, demand: 0, supply: 0 };
    }
}

async function getFareEstimate(pickup, destination) {
    if (!pickup || !destination) throw new HttpError(400, 'Pickup and destination are required');
    const route = await mapservice.getDistanceAndTime(pickup, destination);
    const surge = await getSurge(route.origin);
    return {
        fares: calculateFare(route.distance.value, route.duration.value, surge.multiplier),
        surge,
        distance: route.distance,
        duration: route.duration,
        polyline: route.polyline,
        origin: route.origin,
        destination: route.destination
    };
}

// ---------- dispatch ----------
// Wave 0 goes to the nearest few drivers right away; later waves widen the radius and
// include drivers who came online since. Unanswered requests expire after the timeout.
// Jobs and offered drivers live in dispatch.store (memory, or Redis when REDIS_URL is set).
async function runDispatchWave(rideId, waveIndex) {
    const ride = await findRide(rideId);
    if (!ride || ride.status !== 'pending') {
        await forgetPendingRequest(rideId);
        return;
    }

    const wave = DISPATCH_WAVES[waveIndex];
    if (!wave) return;
    const alreadyOffered = await dispatchStore.getOffered(rideId);
    const captains = await mapservice.findNearbyCaptains(ride.pickupCoords, wave.radiusKm, ride.vehicleType, {
        excludeIds: alreadyOffered,
        limit: wave.maxCaptains,
    });
    const ids = captains.map((c) => String(c._id));
    await dispatchStore.addOffered(rideId, ids);
    for (const captainId of ids) emitToCaptain(captainId, 'new-ride', ride);
}

async function handleDispatchJob(job) {
    if (job.type === 'wave') return runDispatchWave(job.rideId, job.wave);
    if (job.type === 'expire') return expireRide(job.rideId);
    return undefined;
}
dispatchStore.setJobHandler(handleDispatchJob);

async function startDispatch(ride) {
    const rideId = String(ride._id);
    const now = Date.now();
    for (let i = 1; i < DISPATCH_WAVES.length; i++) {
        await dispatchStore.schedule({ rideId, type: 'wave', wave: i }, now + DISPATCH_WAVES[i].delayMs);
    }
    await dispatchStore.schedule({ rideId, type: 'expire' }, now + RIDE_REQUEST_TIMEOUT_MS);
    // The first wave runs right away on this server.
    await runDispatchWave(rideId, 0);
}

// ---------- lifecycle ----------
async function createRide({ user, pickup, destination, vehicleType }) {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new HttpError(400, 'User, pickup, destination and vehicle type are required');
    }

    const existing = await ridemodel.exists({ user, status: { $in: ACTIVE_STATUSES } });
    if (existing) throw new HttpError(409, 'You already have an active ride');

    const estimate = await getFareEstimate(pickup, destination);

    const breakdown = fareBreakdown(
        estimate.distance.value, estimate.duration.value, vehicleType, estimate.surge.multiplier
    );

    const created = await ridemodel.create({
        user,
        pickup,
        destination,
        vehicleType,
        pickupCoords: estimate.origin,
        destinationCoords: estimate.destination,
        distance: estimate.distance.value,
        duration: estimate.duration.value,
        fare: breakdown.total,
        surgeMultiplier: breakdown.surgeMultiplier,
        fareBreakdown: breakdown,
        otp: generateOtp(6),
    });

    const ride = await findRide(created._id);
    // A dispatch hiccup must not fail the booking: later waves and the timeout still run.
    await startDispatch(ride).catch((err) => logger.error({ err: err.message, rideId: String(ride._id) }, 'Dispatch failed'));
    return ride;
}

async function confirmRide(rideId, captain) {
    if (!rideId || !captain) throw new HttpError(400, 'Ride ID and captain are required');

    const busy = await ridemodel.exists({ captain: captain._id, status: { $in: ['accepted', 'on-going'] } });
    if (busy) throw new HttpError(409, 'Finish your current ride before accepting another');

    if (captain.status !== 'active') throw new HttpError(409, 'Go online to accept rides');

    // Atomic: only one captain can move a ride out of "pending".
    const updated = await ridemodel.findOneAndUpdate(
        { _id: rideId, status: 'pending' },
        { status: 'accepted', captain: captain._id, acceptedAt: new Date() },
        { new: true }
    );
    if (!updated) throw new HttpError(409, 'This ride is no longer available');

    await forgetPendingRequest(rideId, { notifyCaptains: true, exceptCaptainId: captain._id });
    await locationStore.setActiveRide(captain._id, rideId, updated.user);

    const rideForUser = await findRide(rideId, { withOtp: true });
    emitToUser(rideForUser.user._id, 'ride-confirmed', rideForUser);

    return findRide(rideId);
}

async function startRide(rideId, otp, captain) {
    if (!rideId || !otp || !captain) throw new HttpError(400, 'Ride ID, OTP and captain are required');

    const ride = await ridemodel.findById(rideId).select('+otp');
    if (!ride) throw new HttpError(404, 'Ride not found');
    if (String(ride.captain) !== String(captain._id)) throw new HttpError(403, 'This ride is not assigned to you');
    assertTransition(ride, 'on-going');
    if (ride.otp !== String(otp)) throw new HttpError(400, 'Invalid OTP');

    const updated = await ridemodel.findOneAndUpdate(
        { _id: rideId, status: 'accepted', captain: captain._id },
        { status: 'on-going', startedAt: new Date() },
        { new: true }
    );
    if (!updated) throw new HttpError(409, 'Ride could not be started');

    const populated = await findRide(rideId);
    emitToUser(populated.user._id, 'ride-started', populated);
    return populated;
}

async function endRide({ rideId, captain }) {
    if (!rideId || !captain) throw new HttpError(400, 'Ride ID and captain are required');

    const ride = await ridemodel.findById(rideId);
    if (!ride) throw new HttpError(404, 'Ride not found');
    if (String(ride.captain) !== String(captain._id)) throw new HttpError(403, 'This ride is not assigned to you');
    assertTransition(ride, 'completed');

    const updated = await ridemodel.findOneAndUpdate(
        { _id: rideId, status: 'on-going', captain: captain._id },
        { status: 'completed', completedAt: new Date() },
        { new: true }
    );
    if (!updated) throw new HttpError(409, 'Ride could not be completed');
    await locationStore.clearActiveRide(captain._id);

    const populated = await findRide(rideId);
    emitToUser(populated.user._id, 'ride-ended', populated);
    return populated;
}

async function cancelRide({ rideId, role, account, reason }) {
    const ride = await ridemodel.findById(rideId);
    if (!ride) throw new HttpError(404, 'Ride not found');

    if (role === 'user') {
        if (String(ride.user) !== String(account._id)) throw new HttpError(403, 'This is not your ride');
        if (!['pending', 'accepted'].includes(ride.status)) {
            throw new HttpError(409, `A ${ride.status} ride cannot be canceled`);
        }
    } else {
        if (String(ride.captain) !== String(account._id)) throw new HttpError(403, 'This ride is not assigned to you');
        if (ride.status !== 'accepted') throw new HttpError(409, `A ${ride.status} ride cannot be canceled`);
    }

    const previousStatus = ride.status;
    const updated = await ridemodel.findOneAndUpdate(
        { _id: rideId, status: previousStatus },
        { status: 'canceled', cancelledBy: role, cancelReason: reason || undefined },
        { new: true }
    );
    if (!updated) throw new HttpError(409, 'Ride status changed, please refresh');

    const payload = { rideId: String(rideId), by: role };
    if (role === 'user') {
        if (updated.captain) emitToCaptain(updated.captain, 'ride-canceled', payload);
    } else {
        emitToUser(updated.user, 'ride-canceled', payload);
    }
    await forgetPendingRequest(rideId, { notifyCaptains: previousStatus === 'pending' });
    await locationStore.clearActiveRide(updated.captain);

    return findRide(rideId);
}

async function rateRide({ rideId, user, score, comment }) {
    const ride = await ridemodel.findById(rideId);
    if (!ride) throw new HttpError(404, 'Ride not found');
    if (String(ride.user) !== String(user._id)) throw new HttpError(403, 'This is not your ride');
    if (ride.status !== 'completed') throw new HttpError(409, 'Only completed rides can be rated');

    const updated = await ridemodel.findOneAndUpdate(
        { _id: rideId, 'rating.score': { $exists: false } },
        { rating: { score, comment: comment || undefined } },
        { new: true }
    );
    if (!updated) throw new HttpError(409, 'You already rated this ride');

    if (ride.captain) {
        // Incremental average in a single atomic pipeline update.
        await captainmodel.updateOne({ _id: ride.captain }, [{
            $set: {
                'rating.average': {
                    $divide: [
                        { $add: [{ $multiply: [{ $ifNull: ['$rating.average', 0] }, { $ifNull: ['$rating.count', 0] }] }, score] },
                        { $add: [{ $ifNull: ['$rating.count', 0] }, 1] }
                    ]
                },
                'rating.count': { $add: [{ $ifNull: ['$rating.count', 0] }, 1] }
            }
        }]);
    }

    return findRide(rideId);
}

// ---------- chat ----------
async function loadRideForChat(rideId, role, account) {
    const ride = await ridemodel.findById(rideId).select('+messages user captain status');
    if (!ride) throw new HttpError(404, 'Ride not found');
    const owner = role === 'captain' ? ride.captain : ride.user;
    if (!owner || String(owner) !== String(account._id)) throw new HttpError(403, 'You are not part of this ride');
    return ride;
}

async function getMessages({ rideId, role, account }) {
    const ride = await loadRideForChat(rideId, role, account);
    return ride.messages;
}

async function sendMessage({ rideId, role, account, text }) {
    const ride = await loadRideForChat(rideId, role, account);
    if (!['accepted', 'on-going'].includes(ride.status)) {
        throw new HttpError(409, 'Chat is only available during an active trip');
    }
    const message = { _id: new mongoose.Types.ObjectId(), from: role, text: String(text).trim(), at: new Date() };
    await ridemodel.updateOne(
        { _id: rideId },
        { $push: { messages: { $each: [message], $slice: -MAX_MESSAGES } } }
    );
    const payload = { rideId: String(rideId), message };
    emitToUser(ride.user, 'chat-message', payload);
    emitToCaptain(ride.captain, 'chat-message', payload);
    return message;
}

// ---------- queries ----------
async function getActiveRide({ role, account }) {
    const field = role === 'captain' ? 'captain' : 'user';
    const statuses = role === 'captain' ? ['accepted', 'on-going'] : ACTIVE_STATUSES;
    let query = populateRide(
        ridemodel.findOne({ [field]: account._id, status: { $in: statuses } }).sort({ createdAt: -1 })
    );
    if (role === 'user') query = query.select('+otp');
    return query;
}

async function getRideHistory({ role, account, page = 1, limit = 10 }) {
    const field = role === 'captain' ? 'captain' : 'user';
    const filter = { [field]: account._id };
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
        populateRide(ridemodel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        ridemodel.countDocuments(filter)
    ]);
    return { rides, page, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

async function getCaptainStats(captain) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const captainId = new mongoose.Types.ObjectId(String(captain._id));

    const [result] = await ridemodel.aggregate([
        { $match: { captain: captainId, status: 'completed' } },
        {
            $facet: {
                total: [{ $group: { _id: null, earnings: { $sum: '$fare' }, rides: { $sum: 1 }, distance: { $sum: '$distance' } } }],
                today: [
                    { $match: { completedAt: { $gte: startOfDay } } },
                    { $group: { _id: null, earnings: { $sum: '$fare' }, rides: { $sum: 1 } } }
                ]
            }
        }
    ]);

    const total = result?.total?.[0] || { earnings: 0, rides: 0, distance: 0 };
    const today = result?.today?.[0] || { earnings: 0, rides: 0 };

    return {
        today: { earnings: today.earnings, rides: today.rides },
        total: {
            earnings: total.earnings,
            rides: total.rides,
            distanceKm: Math.round((total.distance / 1000) * 10) / 10
        },
        rating: {
            average: Math.round((captain.rating?.average || 0) * 10) / 10,
            count: captain.rating?.count || 0
        },
        status: captain.status
    };
}

module.exports = {
    getFareEstimate,
    createRide,
    confirmRide,
    startRide,
    endRide,
    cancelRide,
    rateRide,
    getActiveRide,
    getRideHistory,
    getCaptainStats,
    getMessages,
    sendMessage,
};
