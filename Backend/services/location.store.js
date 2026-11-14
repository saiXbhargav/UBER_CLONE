const captainmodel = require('../models/captain.model');
const ridemodel = require('../models/ride.model');
const { getRedis, isRedisEnabled, key } = require('../utils/redis');

/**
 * Driver positions and "which ride is this driver on" lookups — the hottest path in the app
 * (every online driver reports GPS every few seconds).
 *
 * Memory mode: positions are written straight to MongoDB (2dsphere index) and active rides are
 * looked up in MongoDB each time.
 * Redis mode:  positions go into a Redis GEO set; MongoDB is updated at most once a minute per
 * driver (so a restart without Redis still has a recent position). Active rides are cached.
 */

const GEO = () => key('captains', 'geo');
const SEEN = () => key('captains', 'seen');
const PERSIST_LOCK = (id) => key('captains', id, 'persisted');
const ACTIVE_RIDE = (id) => key('captains', id, 'active-ride');

const PERSIST_EVERY_SECONDS = 60;
const STALE_AFTER_MS = 5 * 60 * 1000; // a driver silent for 5 min is not offered rides
const ACTIVE_RIDE_TTL_SECONDS = 6 * 60 * 60;
const NO_RIDE_TTL_SECONDS = 30;
const NO_RIDE = '-';

const toGeoJSON = (lat, lng) => ({ type: 'Point', coordinates: [lng, lat] });

async function saveCaptainLocation(captainId, lat, lng) {
    const id = String(captainId);
    if (!isRedisEnabled()) {
        await captainmodel.updateOne({ _id: id }, { location: toGeoJSON(lat, lng) });
        return;
    }
    const redis = getRedis();
    await redis.multi().geoadd(GEO(), lng, lat, id).zadd(SEEN(), Date.now(), id).exec();
    // Throttled durable copy: only the first update in each 60 s window reaches MongoDB.
    const first = await redis.set(PERSIST_LOCK(id), '1', 'EX', PERSIST_EVERY_SECONDS, 'NX');
    if (first === 'OK') await captainmodel.updateOne({ _id: id }, { location: toGeoJSON(lat, lng) });
}

/** Drop a driver from the live index (went offline or was suspended). */
async function removeCaptainLocation(captainId) {
    if (!isRedisEnabled()) return;
    const id = String(captainId);
    await getRedis().multi().zrem(GEO(), id).zrem(SEEN(), id).exec();
}

/**
 * Redis mode only: ids of drivers within radiusKm, nearest first, ignoring stale positions.
 * Returns null in memory mode so callers fall back to the MongoDB geo query.
 */
async function nearbyCaptainIds({ lat, lng }, radiusKm, count) {
    if (!isRedisEnabled()) return null;
    const redis = getRedis();
    const args = [GEO(), 'FROMLONLAT', lng, lat, 'BYRADIUS', radiusKm, 'km', 'ASC'];
    if (count) args.push('COUNT', count);
    const ids = await redis.call('GEOSEARCH', ...args);
    if (!ids.length) return [];

    const seen = await redis.call('ZMSCORE', SEEN(), ...ids);
    const cutoff = Date.now() - STALE_AFTER_MS;
    return ids.filter((_, i) => seen[i] !== null && Number(seen[i]) >= cutoff);
}

// ---------------------------------------------------------------- active ride cache
async function setActiveRide(captainId, rideId, userId) {
    if (!isRedisEnabled()) return;
    await getRedis().set(ACTIVE_RIDE(captainId), `${rideId}|${userId}`, 'EX', ACTIVE_RIDE_TTL_SECONDS);
}

async function clearActiveRide(captainId) {
    if (!isRedisEnabled() || !captainId) return;
    await getRedis().del(ACTIVE_RIDE(String(captainId)));
}

/** { rideId, userId } of the driver's accepted/on-going ride, or null. */
async function getActiveRide(captainId) {
    const id = String(captainId);
    if (isRedisEnabled()) {
        const cached = await getRedis().get(ACTIVE_RIDE(id));
        if (cached === NO_RIDE) return null;
        if (cached) {
            const [rideId, userId] = cached.split('|');
            return { rideId, userId };
        }
    }

    const ride = await ridemodel
        .findOne({ captain: id, status: { $in: ['accepted', 'on-going'] } })
        .select('_id user')
        .lean();
    const result = ride ? { rideId: String(ride._id), userId: String(ride.user) } : null;

    if (isRedisEnabled()) {
        if (result) await setActiveRide(id, result.rideId, result.userId);
        else await getRedis().set(ACTIVE_RIDE(id), NO_RIDE, 'EX', NO_RIDE_TTL_SECONDS);
    }
    return result;
}

module.exports = {
    saveCaptainLocation,
    removeCaptainLocation,
    nearbyCaptainIds,
    setActiveRide,
    clearActiveRide,
    getActiveRide,
};
