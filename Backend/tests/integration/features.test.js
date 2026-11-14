const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('../helpers/setup');
const rideModel = require('../../models/ride.model');
const captainModel = require('../../models/captain.model');
const mapservice = require('../../services/maps.service');

const trip = { pickup: 'Charminar, Hyderabad', destination: 'Destination Hitech City', vehicleType: 'car' };

const goOnline = (token) => h.api().patch('/captains/status').set(h.bearer(token)).send({ status: 'active' });

// Put a driver at an offset (in degrees of latitude) north of the test pickup point.
const placeCaptain = (id, dLat) =>
    captainModel.updateOne(
        { _id: id },
        { location: { type: 'Point', coordinates: [h.ORIGIN.lng, h.ORIGIN.lat + dLat] } }
    );

async function acceptedRide(rider, driver) {
    await goOnline(driver.token);
    const created = await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
    assert.equal(created.status, 201);
    const confirmed = await h.api().post('/rides/confirm').set(h.bearer(driver.token)).send({ rideId: created.body._id });
    assert.equal(confirmed.status, 200);
    return created.body._id;
}

describe('features: chat, saved places, surge, dispatch', () => {
    let rider;
    let driver;

    before(h.startDb);
    after(h.stopDb);
    beforeEach(async () => {
        await h.clearDb();
        rider = await h.registerUser();
        driver = await h.registerCaptain();
    });

    it('lets rider and driver chat during a trip and keeps strangers out', async () => {
        const rideId = await acceptedRide(rider, driver);

        const fromRider = await h.api().post(`/rides/${rideId}/messages`).set(h.bearer(rider.token)).send({ text: '  I am at gate 2  ' });
        assert.equal(fromRider.status, 201);
        assert.equal(fromRider.body.message.from, 'user');
        assert.equal(fromRider.body.message.text, 'I am at gate 2');

        const fromDriver = await h.api().post(`/rides/${rideId}/messages`).set(h.bearer(driver.token)).send({ text: 'Coming' });
        assert.equal(fromDriver.status, 201);
        assert.equal(fromDriver.body.message.from, 'captain');

        const list = await h.api().get(`/rides/${rideId}/messages`).set(h.bearer(driver.token));
        assert.equal(list.status, 200);
        assert.deepEqual(list.body.messages.map((m) => m.text), ['I am at gate 2', 'Coming']);

        // Messages are not leaked into normal ride payloads.
        const active = await h.api().get('/rides/active').set(h.bearer(rider.token));
        assert.equal(active.body.ride.messages, undefined);

        const stranger = await h.registerUser();
        const denied = await h.api().get(`/rides/${rideId}/messages`).set(h.bearer(stranger.token));
        assert.equal(denied.status, 403);

        const empty = await h.api().post(`/rides/${rideId}/messages`).set(h.bearer(rider.token)).send({ text: '   ' });
        assert.equal(empty.status, 400);
    });

    it('closes chat once the ride is no longer active', async () => {
        const rideId = await acceptedRide(rider, driver);
        await h.api().post('/rides/cancel').set(h.bearer(rider.token)).send({ rideId });
        const res = await h.api().post(`/rides/${rideId}/messages`).set(h.bearer(rider.token)).send({ text: 'hello?' });
        assert.equal(res.status, 409);
    });

    it('saves Home/Work and lists recent places', async () => {
        const empty = await h.api().get('/users/places').set(h.bearer(rider.token));
        assert.deepEqual(empty.body, { home: '', work: '', recent: [] });

        const saved = await h.api().put('/users/places').set(h.bearer(rider.token)).send({ home: 'Banjara Hills', work: 'Hitech City' });
        assert.equal(saved.status, 200);
        assert.deepEqual(saved.body, { home: 'Banjara Hills', work: 'Hitech City' });

        await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
        const after = await h.api().get('/users/places').set(h.bearer(rider.token));
        assert.equal(after.body.home, 'Banjara Hills');
        assert.deepEqual(after.body.recent, [trip.destination, trip.pickup]);

        const cleared = await h.api().put('/users/places').set(h.bearer(rider.token)).send({ work: '' });
        assert.equal(cleared.body.work, '');
        assert.equal(cleared.body.home, 'Banjara Hills');
    });

    it('applies surge when requests outnumber free drivers and stores a fare breakdown', async () => {
        const calm = await h.api().get('/rides/get-fare').query(trip).set(h.bearer(rider.token));
        assert.equal(calm.body.surge.multiplier, 1);

        // Three other riders are already waiting near the same pickup, with no drivers around.
        for (let i = 0; i < 3; i++) {
            const other = await h.registerUser();
            await h.api().post('/rides/create').set(h.bearer(other.token)).send(trip);
        }
        const busy = await h.api().get('/rides/get-fare').query(trip).set(h.bearer(rider.token));
        assert.ok(busy.body.surge.multiplier > 1, `expected surge, got ${busy.body.surge.multiplier}`);
        assert.ok(busy.body.fares.car > calm.body.fares.car);

        const created = await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
        const stored = await rideModel.findById(created.body._id).lean();
        assert.equal(stored.fare, stored.fareBreakdown.total);
        assert.ok(stored.surgeMultiplier > 1);
        assert.equal(
            stored.fareBreakdown.base + stored.fareBreakdown.distance + stored.fareBreakdown.time + stored.fareBreakdown.surgeAmount,
            stored.fare
        );
    });

    it('finds the nearest free drivers first and skips blocked, offline or busy ones', async () => {
        const near = driver;
        const mid = await h.registerCaptain();
        const far = await h.registerCaptain();
        const blocked = await h.registerCaptain();
        const offline = await h.registerCaptain();
        for (const c of [near, mid, far, blocked]) await goOnline(c.token);

        await placeCaptain(near.captain._id, 0.005); // ~0.5 km
        await placeCaptain(mid.captain._id, 0.015); // ~1.7 km
        await placeCaptain(far.captain._id, 0.04); // ~4.4 km
        await placeCaptain(blocked.captain._id, 0.001);
        await placeCaptain(offline.captain._id, 0.001);
        await captainModel.updateOne({ _id: blocked.captain._id }, { blocked: true });

        const ids = (list) => list.map((c) => String(c._id));
        const nearest = await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'car');
        assert.deepEqual(ids(nearest), [near, mid, far].map((c) => String(c.captain._id)));

        const firstWave = await mapservice.findNearbyCaptains(h.ORIGIN, 3, 'car', { limit: 1 });
        assert.deepEqual(ids(firstWave), [String(near.captain._id)]);

        const nextWave = await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'car', { excludeIds: ids(firstWave) });
        assert.deepEqual(ids(nextWave), [mid, far].map((c) => String(c.captain._id)));

        assert.equal(await mapservice.countAvailableCaptains(h.ORIGIN, 5), 3);
        assert.equal((await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'auto')).length, 0);
    });
});
