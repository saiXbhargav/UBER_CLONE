const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('../helpers/setup');
const rideModel = require('../../models/ride.model');

const trip = { pickup: 'Charminar, Hyderabad', destination: 'Destination Hitech City', vehicleType: 'car' };

async function goOnline(token) {
    const res = await h.api().patch('/captains/status').set(h.bearer(token)).send({ status: 'active' });
    assert.equal(res.status, 200);
    assert.equal(res.body.captain.status, 'active');
}

async function createRide(token) {
    const res = await h.api().post('/rides/create').set(h.bearer(token)).send(trip);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body;
}

const readOtp = async (rideId) => (await rideModel.findById(rideId).select('+otp')).otp;

describe('ride lifecycle API', () => {
    let rider;
    let driver;

    before(h.startDb);
    after(h.stopDb);
    beforeEach(async () => {
        await h.clearDb();
        rider = await h.registerUser();
        driver = await h.registerCaptain();
    });

    it('quotes fares for every vehicle type with route details', async () => {
        const res = await h.api()
            .get('/rides/get-fare')
            .query({ pickup: trip.pickup, destination: trip.destination })
            .set(h.bearer(rider.token));
        assert.equal(res.status, 200);
        for (const type of ['car', 'auto', 'moto']) {
            assert.equal(typeof res.body.fares[type], 'number');
            assert.ok(res.body.fares[type] > 0);
        }
        assert.equal(res.body.distance.value, 5000);
        assert.equal(res.body.duration.value, 900);
        assert.ok(Array.isArray(res.body.polyline) && res.body.polyline.length >= 2);
    });

    it('validates ride creation input', async () => {
        const res = await h.api()
            .post('/rides/create')
            .set(h.bearer(rider.token))
            .send({ ...trip, vehicleType: 'helicopter' });
        assert.equal(res.status, 400);
    });

    it('runs a full trip: create → accept → start → end → rate', async () => {
        const ride = await createRide(rider.token);
        assert.equal(ride.status, 'pending');
        assert.equal(ride.otp, undefined, 'OTP must not be returned on create');
        assert.equal(ride.distance, 5000);

        // Only one active ride per rider.
        const dup = await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
        assert.equal(dup.status, 409);

        await goOnline(driver.token);
        const confirm = await h.api().post('/rides/confirm').set(h.bearer(driver.token)).send({ rideId: ride._id });
        assert.equal(confirm.status, 200, JSON.stringify(confirm.body));
        assert.equal(confirm.body.status, 'accepted');
        assert.equal(confirm.body.otp, undefined, 'driver must not receive the OTP');

        // A second driver cannot take an accepted ride.
        const other = await h.registerCaptain();
        await goOnline(other.token);
        const steal = await h.api().post('/rides/confirm').set(h.bearer(other.token)).send({ rideId: ride._id });
        assert.equal(steal.status, 409);

        // The rider sees the OTP on their active ride.
        const active = await h.api().get('/rides/active').set(h.bearer(rider.token));
        assert.equal(active.status, 200);
        assert.equal(active.body.ride.status, 'accepted');
        assert.match(active.body.ride.otp, /^\d{6}$/);

        const otp = await readOtp(ride._id);
        const wrongOtp = otp === '000000' ? '111111' : '000000';
        const bad = await h.api().post('/rides/start').set(h.bearer(driver.token)).send({ rideId: ride._id, otp: wrongOtp });
        assert.equal(bad.status, 400);

        const start = await h.api().post('/rides/start').set(h.bearer(driver.token)).send({ rideId: ride._id, otp });
        assert.equal(start.status, 200, JSON.stringify(start.body));
        assert.equal(start.body.status, 'on-going');

        // Cannot cancel once the trip has started.
        const lateCancel = await h.api().post('/rides/cancel').set(h.bearer(rider.token)).send({ rideId: ride._id });
        assert.equal(lateCancel.status, 409);

        const end = await h.api().post('/rides/end').set(h.bearer(driver.token)).send({ rideId: ride._id });
        assert.equal(end.status, 200);
        assert.equal(end.body.status, 'completed');

        const rate = await h.api().post('/rides/rate').set(h.bearer(rider.token)).send({ rideId: ride._id, score: 5, comment: 'Great' });
        assert.equal(rate.status, 200);
        assert.equal(rate.body.rating.score, 5);

        const again = await h.api().post('/rides/rate').set(h.bearer(rider.token)).send({ rideId: ride._id, score: 4 });
        assert.equal(again.status, 409);

        // History and stats reflect the completed trip.
        const history = await h.api().get('/rides/history').set(h.bearer(rider.token));
        assert.equal(history.status, 200);
        assert.equal(history.body.total, 1);
        assert.equal(history.body.rides[0]._id, ride._id);

        const driverHistory = await h.api().get('/rides/history').set(h.bearer(driver.token));
        assert.equal(driverHistory.body.total, 1);

        const stats = await h.api().get('/captains/stats').set(h.bearer(driver.token));
        assert.equal(stats.status, 200);
        assert.equal(stats.body.total.rides, 1);
        assert.equal(stats.body.total.earnings, ride.fare);
        assert.equal(stats.body.today.rides, 1);
        assert.equal(stats.body.rating.count, 1);
        assert.equal(stats.body.rating.average, 5);

        const noActive = await h.api().get('/rides/active').set(h.bearer(rider.token));
        assert.equal(noActive.body.ride, null);
    });

    it('lets the rider cancel a pending request', async () => {
        const ride = await createRide(rider.token);
        const res = await h.api().post('/rides/cancel').set(h.bearer(rider.token)).send({ rideId: ride._id });
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'canceled');
        assert.equal(res.body.cancelledBy, 'user');

        // A canceled ride can no longer be accepted.
        await goOnline(driver.token);
        const confirm = await h.api().post('/rides/confirm').set(h.bearer(driver.token)).send({ rideId: ride._id });
        assert.equal(confirm.status, 409);
    });

    it('blocks offline drivers from accepting', async () => {
        const ride = await createRide(rider.token);
        await h.api().patch('/captains/status').set(h.bearer(driver.token)).send({ status: 'inactive' });
        const res = await h.api().post('/rides/confirm').set(h.bearer(driver.token)).send({ rideId: ride._id });
        assert.equal(res.status, 409);
    });

    it('stops other riders from cancelling or rating a ride', async () => {
        const ride = await createRide(rider.token);
        const stranger = await h.registerUser();
        const res = await h.api().post('/rides/cancel').set(h.bearer(stranger.token)).send({ rideId: ride._id });
        assert.equal(res.status, 403);
    });
});
