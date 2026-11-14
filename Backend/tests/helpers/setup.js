// Shared harness for integration tests: in-memory MongoDB + stubbed map providers.
// Require this BEFORE anything that loads ../../app.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret';
delete process.env.ORS_MAPS_API;

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

// ---- deterministic, offline map provider ----
const ORIGIN = { lat: 17.385, lng: 78.4867 };
const DESTINATION = { lat: 17.44, lng: 78.35 };

const mapservice = require('../../services/maps.service');

mapservice.geocode = async (place) => {
    if (!place || !String(place).trim()) throw Object.assign(new Error('Location is required'), { status: 400 });
    return String(place).toLowerCase().includes('dest') ? { ...DESTINATION } : { ...ORIGIN };
};
mapservice.getDistanceAndTime = async () => ({
    distance: { text: '5.00 km', value: 5000 },
    duration: { text: '15 min', value: 900 },
    polyline: [
        [ORIGIN.lat, ORIGIN.lng],
        [DESTINATION.lat, DESTINATION.lng],
    ],
    origin: { ...ORIGIN },
    destination: { ...DESTINATION },
});
mapservice.getAutoCompleteSuggestions = async (input) => [
    { name: `${input} Road, Hyderabad`, coordinates: [ORIGIN.lng, ORIGIN.lat] },
];

const app = require('../../app');

let mongod;

async function startDb() {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    // Build indexes up front (unique email, 2dsphere for captain matching).
    await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));
}

async function clearDb() {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
}

async function stopDb() {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
}

// ---- small API helpers ----
const api = () => request(app);
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

let seq = 0;
const unique = (prefix) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

async function registerUser(overrides = {}) {
    const body = {
        email: `${unique('rider')}@example.com`,
        password: 'secret123',
        fullname: { firstname: 'Riya', lastname: 'Sharma' },
        ...overrides,
    };
    const res = await api().post('/users/register').send(body);
    if (res.status !== 201) throw new Error(`user register failed: ${res.status} ${JSON.stringify(res.body)}`);
    return { ...res.body, credentials: { email: body.email, password: body.password } };
}

async function registerCaptain(overrides = {}) {
    const body = {
        email: `${unique('driver')}@example.com`,
        password: 'secret123',
        fullname: { firstname: 'Arjun', lastname: 'Kumar' },
        vehicle: { color: 'White', plate: unique('TS09').toUpperCase().slice(0, 12), capacity: 4, vehicleType: 'car' },
        ...overrides,
    };
    const res = await api().post('/captains/register').send(body);
    if (res.status !== 201) throw new Error(`captain register failed: ${res.status} ${JSON.stringify(res.body)}`);
    return { ...res.body, credentials: { email: body.email, password: body.password } };
}

module.exports = {
    app,
    api,
    bearer,
    startDb,
    clearDb,
    stopDb,
    registerUser,
    registerCaptain,
    ORIGIN,
    DESTINATION,
};
