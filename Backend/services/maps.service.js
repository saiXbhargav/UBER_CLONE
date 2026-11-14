const axios = require('axios');
const captainmodel = require('../models/captain.model');
const ridemodel = require('../models/ride.model');
const HttpError = require('../utils/httpError');
const { getRedis, isRedisEnabled, key: redisKey } = require('../utils/redis');
const locationStore = require('./location.store');

// All providers used here are free: Photon (geocoding, no key), OSRM public demo (routing, no key),
// and openrouteservice (free key, no card) when ORS_MAPS_API is set.
const http = axios.create({
    timeout: 10000,
    headers: { 'User-Agent': 'ride-app/1.0' }
});

// ---------- TTL cache (Redis when available, shared by all servers; else in-memory) ----------
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map();

async function redisCached(key, producer) {
    const redis = getRedis();
    const cacheKey = redisKey('cache', key);
    try {
        const hit = await redis.get(cacheKey);
        if (hit) return JSON.parse(hit);
    } catch {
        // Redis hiccup: just call the provider
    }
    const value = await producer();
    redis.set(cacheKey, JSON.stringify(value), 'PX', CACHE_TTL_MS).catch(() => {});
    return value;
}

async function cached(key, producer) {
    if (isRedisEnabled()) return redisCached(key, producer);

    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;
    cache.delete(key);

    const value = await producer();
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value); // drop oldest
    cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
    return value;
}

// ---------- helpers ----------
const COORD_RE = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/;

// Accepts "lng,lat" (existing frontend convention) and returns { lat, lng }, or null for a place name.
function parseCoordinateString(str) {
    const m = COORD_RE.exec(String(str));
    if (!m) return null;
    return { lng: Number(m[1]), lat: Number(m[3]) };
}

function photonLabel(props = {}) {
    const parts = [props.name, props.street && props.housenumber ? `${props.street} ${props.housenumber}` : props.street,
        props.city || props.county, props.state, props.country];
    return [...new Set(parts.filter(Boolean))].join(', ');
}

function formatDistance(meters) {
    return { text: `${(meters / 1000).toFixed(2)} km`, value: Math.round(meters) };
}

function formatDuration(seconds) {
    let sec = Math.round(seconds);
    const days = Math.floor(sec / 86400);
    sec %= 86400;
    const hours = Math.floor(sec / 3600);
    sec %= 3600;
    const minutes = Math.floor(sec / 60);

    let text = '';
    if (days > 0) text += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) text += `${hours} hr${hours > 1 ? 's' : ''} `;
    if (minutes > 0 || !text) text += `${Math.max(minutes, 1)} min`;
    return { text: text.trim(), value: Math.round(seconds) };
}

// ---------- geocoding ----------
async function geocode(place) {
    if (!place || !String(place).trim()) throw new HttpError(400, 'Location is required');
    const direct = parseCoordinateString(place);
    if (direct) return direct;

    const key = `geo:${String(place).trim().toLowerCase()}`;
    return cached(key, async () => {
        const res = await http.get('https://photon.komoot.io/api/', { params: { q: place, limit: 1 } });
        const feature = res.data?.features?.[0];
        if (!feature) throw new HttpError(404, `Location not found: ${place}`);
        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng };
    });
}

// Kept for backward compatibility: returns [lng, lat].
async function getCoordinatesFromName(place) {
    const { lat, lng } = await geocode(place);
    return [lng, lat];
}

// Used by GET /maps/get-coordinates. Returns { ltd, lng } as before.
async function getAddressCoordinate(address) {
    const { lat, lng } = await geocode(address);
    return { ltd: lat, lng };
}

// ---------- suggestions ----------
async function orsSuggestions(input) {
    const res = await http.get('https://api.openrouteservice.org/geocode/autocomplete', {
        params: { api_key: process.env.ORS_MAPS_API, text: input }
    });
    return (res.data?.features || []).map(f => ({
        name: f.properties.label,
        coordinates: f.geometry.coordinates
    }));
}

async function photonSuggestions(input) {
    const res = await http.get('https://photon.komoot.io/api/', { params: { q: input, limit: 5 } });
    return (res.data?.features || []).map(f => ({
        name: photonLabel(f.properties),
        coordinates: f.geometry.coordinates
    })).filter(s => s.name);
}

async function getAutoCompleteSuggestions(input) {
    if (!input || input.trim().length < 3) {
        throw new HttpError(400, 'Input must be at least 3 characters long');
    }
    const key = `sug:${input.trim().toLowerCase()}`;
    return cached(key, async () => {
        if (process.env.ORS_MAPS_API) {
            try {
                const results = await orsSuggestions(input);
                if (results.length) return results;
            } catch {
                // fall through to Photon
            }
        }
        return photonSuggestions(input);
    });
}

// ---------- routing ----------
async function orsRoute(from, to) {
    const res = await http.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        { coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
        { headers: { Authorization: process.env.ORS_MAPS_API, 'Content-Type': 'application/json' } }
    );
    const feature = res.data?.features?.[0];
    if (!feature) throw new Error('No route from ORS');
    return {
        distance: feature.properties.summary.distance,
        duration: feature.properties.summary.duration,
        coordinates: feature.geometry.coordinates
    };
}

async function osrmRoute(from, to) {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}`;
    const res = await http.get(url, { params: { overview: 'full', geometries: 'geojson' } });
    const route = res.data?.routes?.[0];
    if (!route) throw new Error('No route from OSRM');
    return {
        distance: route.distance,
        duration: route.duration,
        coordinates: route.geometry.coordinates
    };
}

async function getDistanceAndTime(origin, destination) {
    if (!origin || !destination) throw new HttpError(400, 'Origin and destination are required');

    const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
    const key = `route:${from.lat},${from.lng};${to.lat},${to.lng}`;

    return cached(key, async () => {
        let route = null;
        if (process.env.ORS_MAPS_API) {
            try {
                route = await orsRoute(from, to);
            } catch {
                route = null;
            }
        }
        if (!route) {
            try {
                route = await osrmRoute(from, to);
            } catch {
                throw new HttpError(502, 'Could not find a route between these locations');
            }
        }
        return {
            distance: formatDistance(route.distance),
            duration: formatDuration(route.duration),
            polyline: route.coordinates.map(([lng, lat]) => [lat, lng]), // Leaflet wants [lat, lng]
            origin: from,
            destination: to
        };
    });
}

// ---------- reverse geocoding ----------
async function reverseGeocode(lat, lng) {
    const key = `rev:${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
    return cached(key, async () => {
        const res = await http.get('https://photon.komoot.io/reverse', { params: { lat, lon: lng, limit: 1 } });
        const feature = res.data?.features?.[0];
        if (!feature) throw new HttpError(404, 'No address found for this location');
        return { name: photonLabel(feature.properties), lat, lng };
    });
}

// ---------- captain matching ----------
const EARTH_RADIUS_KM = 6378.1;

function assertCoords(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error('Valid latitude and longitude are required');
    }
}

function busyCaptainIds() {
    return ridemodel.distinct('captain', {
        status: { $in: ['accepted', 'on-going'] },
        captain: { $ne: null }
    });
}

async function availableCaptainFilter(vehicleType, excludeIds = []) {
    const busy = await busyCaptainIds();
    const filter = {
        status: 'active',
        blocked: { $ne: true },
        _id: { $nin: [...busy, ...excludeIds] },
        'location.type': 'Point',
    };
    if (vehicleType) filter['vehicle.vehicleType'] = vehicleType;
    return filter;
}

/**
 * Free, online, unblocked drivers near a point, nearest first.
 * Options: vehicleType, excludeIds (already offered), limit.
 */
async function findNearbyCaptains({ lat, lng }, radiusKm = 5, vehicleType, { excludeIds = [], limit = 50 } = {}) {
    assertCoords(lat, lng);
    const filter = await availableCaptainFilter(vehicleType, excludeIds);

    // Redis mode: the GEO index gives candidates nearest-first; MongoDB checks who is eligible.
    const candidates = await locationStore.nearbyCaptainIds({ lat, lng }, radiusKm);
    if (candidates) {
        if (!candidates.length) return [];
        delete filter['location.type'];
        filter._id.$in = candidates;
        const eligible = new Set((await captainmodel.find(filter).select('_id').lean()).map((c) => String(c._id)));
        return candidates.filter((id) => eligible.has(id)).slice(0, limit).map((id) => ({ _id: id }));
    }

    filter.location = {
        $nearSphere: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radiusKm * 1000
        }
    };
    return captainmodel.find(filter).limit(limit).select('_id');
}

/** Supply side of surge: free online drivers within radius (any vehicle type). */
async function countAvailableCaptains({ lat, lng }, radiusKm = 5) {
    assertCoords(lat, lng);
    const filter = await availableCaptainFilter();

    const candidates = await locationStore.nearbyCaptainIds({ lat, lng }, radiusKm);
    if (candidates) {
        if (!candidates.length) return 0;
        delete filter['location.type'];
        filter._id.$in = candidates;
        return captainmodel.countDocuments(filter);
    }

    filter.location = { $geoWithin: { $centerSphere: [[lng, lat], radiusKm / EARTH_RADIUS_KM] } };
    return captainmodel.countDocuments(filter);
}

/** Demand side of surge: open requests with a pickup within radius in the last 10 minutes. */
async function countPendingRequests({ lat, lng }, radiusKm = 3) {
    assertCoords(lat, lng);
    const dLat = radiusKm / 111;
    const dLng = radiusKm / (111 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
    return ridemodel.countDocuments({
        status: 'pending',
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
        'pickupCoords.lat': { $gte: lat - dLat, $lte: lat + dLat },
        'pickupCoords.lng': { $gte: lng - dLng, $lte: lng + dLng },
    });
}

module.exports = {
    geocode,
    getCoordinatesFromName,
    getAddressCoordinate,
    getAutoCompleteSuggestions,
    getDistanceAndTime,
    findNearbyCaptains,
    countAvailableCaptains,
    countPendingRequests,
    reverseGeocode,
    formatDuration,
    formatDistance,
};
