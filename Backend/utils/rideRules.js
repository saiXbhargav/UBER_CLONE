const crypto = require('crypto');

// Ride state machine: which status may follow which.
const TRANSITIONS = {
    pending: ['accepted', 'canceled'],
    accepted: ['on-going', 'canceled'],
    'on-going': ['completed'],
    completed: [],
    canceled: [],
};

const ACTIVE_STATUSES = ['pending', 'accepted', 'on-going'];

function canTransition(from, to) {
    return Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));
}

function generateOtp(digits = 6) {
    if (!Number.isInteger(digits) || digits <= 0) {
        throw new Error('Number of digits must be a positive integer');
    }
    return crypto.randomInt(0, 10 ** digits).toString().padStart(digits, '0');
}

const BASE_FARE = { auto: 30, car: 50, moto: 20 };
const PER_KM = { auto: 10, car: 15, moto: 8 };
const PER_MINUTE = { auto: 2, car: 3, moto: 1 };

// ---------- surge pricing ----------
// Demand = open requests near the pickup (including this one), supply = free online drivers nearby.
// Price rises 25% for every extra request per driver, rounded to 0.1, capped at 2x.
const SURGE_STEP = 0.25;
const SURGE_CAP = 2;

function surgeMultiplier(demand, supply) {
    const d = Math.max(0, Number(demand) || 0);
    const s = Math.max(1, Number(supply) || 0);
    const ratio = d / s;
    if (ratio <= 1) return 1;
    const raw = 1 + (ratio - 1) * SURGE_STEP;
    return Math.min(SURGE_CAP, Math.round(raw * 10) / 10);
}

/** Itemised fare for one vehicle type; total is what the rider pays. */
function fareBreakdown(distanceMeters, durationSeconds, vehicleType, surge = 1) {
    if (!BASE_FARE[vehicleType]) throw new Error(`Unknown vehicle type: ${vehicleType}`);
    const km = Math.max(0, Number(distanceMeters) || 0) / 1000;
    const minutes = Math.max(0, Number(durationSeconds) || 0) / 60;
    const base = BASE_FARE[vehicleType];
    const distance = Math.round(km * PER_KM[vehicleType]);
    const time = Math.round(minutes * PER_MINUTE[vehicleType]);
    const subtotal = base + distance + time;
    const multiplier = Math.max(1, Number(surge) || 1);
    const total = Math.round(subtotal * multiplier);
    return { base, distance, time, surgeMultiplier: multiplier, surgeAmount: total - subtotal, total };
}

function calculateFare(distanceMeters, durationSeconds, surge = 1) {
    const km = Math.max(0, Number(distanceMeters) || 0) / 1000;
    const minutes = Math.max(0, Number(durationSeconds) || 0) / 60;
    const multiplier = Math.max(1, Number(surge) || 1);
    const fare = {};
    for (const type of Object.keys(BASE_FARE)) {
        fare[type] = Math.round((BASE_FARE[type] + km * PER_KM[type] + minutes * PER_MINUTE[type]) * multiplier);
    }
    return fare;
}

// ---------- dispatch waves ----------
// Offer a request to the nearest few drivers first, then widen the circle.
const DISPATCH_WAVES = [
    { delayMs: 0, radiusKm: 3, maxCaptains: 3 },
    { delayMs: 20 * 1000, radiusKm: 5, maxCaptains: 5 },
    { delayMs: 40 * 1000, radiusKm: 8, maxCaptains: 20 },
];

module.exports = {
    TRANSITIONS,
    ACTIVE_STATUSES,
    DISPATCH_WAVES,
    canTransition,
    generateOtp,
    calculateFare,
    fareBreakdown,
    surgeMultiplier,
};
