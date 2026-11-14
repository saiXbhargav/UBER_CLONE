// Redis mode against a REAL Redis server (GEO commands, pub/sub). Skipped unless TEST_REDIS_URL is set:
//   TEST_REDIS_URL=redis://localhost:6379 npm run test:integration
// CI runs it with a Redis service container.
const REDIS_URL = process.env.TEST_REDIS_URL;
process.env.REDIS_PREFIX = `test${Date.now().toString(36)}:`; // isolate keys from anything else in that Redis

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const h = require('../helpers/setup');
const redisUtil = require('../../utils/redis');
const dispatchStore = require('../../services/dispatch.store');
const locationStore = require('../../services/location.store');
const mapservice = require('../../services/maps.service');
const rideModel = require('../../models/ride.model');
const captainModel = require('../../models/captain.model');

const trip = { pickup: 'Charminar, Hyderabad', destination: 'Destination Hitech City', vehicleType: 'car' };
const goOnline = (token) => h.api().patch('/captains/status').set(h.bearer(token)).send({ status: 'active' });
const redis = () => redisUtil.getRedis();
const k = (...parts) => redisUtil.key(...parts);

async function deleteTestKeys() {
    let cursor = '0';
    do {
        const [next, keys] = await redis().scan(cursor, 'MATCH', `${redisUtil.PREFIX}*`, 'COUNT', 500);
        if (keys.length) await redis().del(...keys);
        cursor = next;
    } while (cursor !== '0');
}

const withTimeout = (promise, ms, what) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out: ${what}`)), ms))]);

describe('Redis mode (real Redis)', { skip: !REDIS_URL && 'set TEST_REDIS_URL to run' }, () => {
    before(async () => {
        await h.startDb();
        await redisUtil.connectRedis(REDIS_URL);
    });

    after(async () => {
        await deleteTestKeys();
        await redisUtil.disconnectRedis();
        await h.stopDb();
    });

    beforeEach(async () => {
        await h.clearDb();
        await deleteTestKeys();
    });

    it('matches drivers from the Redis GEO index, nearest first, skipping ineligible and stale ones', async () => {
        const [near, mid, far, blocked, offline, stale] = await Promise.all(
            Array.from({ length: 6 }, () => h.registerCaptain())
        );
        for (const c of [near, mid, far, blocked, stale]) await goOnline(c.token);
        await captainModel.updateOne({ _id: blocked.captain._id }, { blocked: true });

        const at = (c, dLat) => locationStore.saveCaptainLocation(c.captain._id, h.ORIGIN.lat + dLat, h.ORIGIN.lng);
        await at(near, 0.005);
        await at(mid, 0.015);
        await at(far, 0.04);
        await at(blocked, 0.001);
        await at(offline, 0.001);
        await at(stale, 0.002);
        // Pretend the "stale" driver last reported 10 minutes ago.
        await redis().zadd(k('captains', 'seen'), Date.now() - 10 * 60 * 1000, String(stale.captain._id));

        const ids = (list) => list.map((c) => String(c._id));
        const expected = [near, mid, far].map((c) => String(c.captain._id));
        assert.deepEqual(ids(await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'car')), expected);
        assert.deepEqual(ids(await mapservice.findNearbyCaptains(h.ORIGIN, 3, 'car', { limit: 1 })), expected.slice(0, 1));
        assert.deepEqual(
            ids(await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'car', { excludeIds: expected.slice(0, 1) })),
            expected.slice(1)
        );
        assert.equal(await mapservice.countAvailableCaptains(h.ORIGIN, 5), 3);

        // Going offline removes the driver from the live index.
        await h.api().patch('/captains/status').set(h.bearer(near.token)).send({ status: 'inactive' });
        assert.equal(await redis().zscore(k('captains', 'seen'), String(near.captain._id)), null);
        assert.deepEqual(ids(await mapservice.findNearbyCaptains(h.ORIGIN, 5, 'car')), expected.slice(1));
    });

    it('writes GPS to MongoDB at most once a minute per driver', async () => {
        const driver = await h.registerCaptain();
        const id = driver.captain._id;
        await locationStore.saveCaptainLocation(id, 17.1, 78.1);
        await locationStore.saveCaptainLocation(id, 17.2, 78.2);
        const doc = await captainModel.findById(id).lean();
        assert.deepEqual(doc.location.coordinates, [78.1, 17.1], 'second update stays in Redis only');
        const [[lng, lat]] = await redis().geopos(k('captains', 'geo'), String(id));
        assert.ok(Math.abs(Number(lat) - 17.2) < 1e-4 && Math.abs(Number(lng) - 78.2) < 1e-4);
    });

    it('runs a full trip with dispatch state and the active-ride cache in Redis', async () => {
        const rider = await h.registerUser();
        const driver = await h.registerCaptain();
        const driverId = String(driver.captain._id);
        await goOnline(driver.token);
        await locationStore.saveCaptainLocation(driverId, h.ORIGIN.lat + 0.002, h.ORIGIN.lng);

        const created = await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
        assert.equal(created.status, 201);
        const rideId = created.body._id;

        // Wave 0 offered the nearby driver; later waves + expiry are queued in Redis.
        assert.deepEqual(await dispatchStore.getOffered(rideId), [driverId]);
        const queued = (await redis().zrange(k('dispatch', 'jobs'), 0, -1)).filter((m) => m.startsWith(rideId));
        assert.equal(queued.length, 3);

        const confirmed = await h.api().post('/rides/confirm').set(h.bearer(driver.token)).send({ rideId });
        assert.equal(confirmed.status, 200);
        const left = (await redis().zrange(k('dispatch', 'jobs'), 0, -1)).filter((m) => m.startsWith(rideId));
        assert.equal(left.length, 0, 'accepting a ride cancels its pending jobs');
        assert.equal(await redis().get(k('captains', driverId, 'active-ride')), `${rideId}|${rider.user._id}`);
        assert.deepEqual(await locationStore.getActiveRide(driverId), { rideId, userId: String(rider.user._id) });

        const { otp } = await rideModel.findById(rideId).select('+otp').lean();
        assert.equal((await h.api().post('/rides/start').set(h.bearer(driver.token)).send({ rideId, otp })).status, 200);
        assert.equal((await h.api().post('/rides/end').set(h.bearer(driver.token)).send({ rideId })).status, 200);
        assert.equal(await redis().get(k('captains', driverId, 'active-ride')), null);
    });

    it('expires unanswered requests through the Redis job poller', async () => {
        const rider = await h.registerUser();
        const created = await h.api().post('/rides/create').set(h.bearer(rider.token)).send(trip);
        const rideId = created.body._id;

        assert.equal(await dispatchStore.pollDueJobs(Date.now()), 0, 'nothing is due yet');
        // Jump past the 90 s timeout: waves 1-2 and the expiry all run (on whichever server polls).
        assert.equal(await dispatchStore.pollDueJobs(Date.now() + 91 * 1000), 3);
        const ride = await rideModel.findById(rideId).lean();
        assert.equal(ride.status, 'canceled');
        assert.equal(ride.cancelledBy, 'system');
    });

    // Keep last: it closes the shared Socket.IO server.
    it('delivers socket events across API servers through the Redis adapter', async () => {
        const { Server } = require('socket.io');
        const { createAdapter } = require('@socket.io/redis-adapter');
        const { io: connect } = require('socket.io-client');
        const { initializeSocket, getIO } = require('../../socket');

        // Server A: the real app socket server. Server B: another instance on the same Redis.
        const serverA = http.createServer();
        await initializeSocket(serverA);
        await new Promise((resolve) => serverA.listen(0, resolve));
        const [pub, sub] = await Promise.all([redisUtil.duplicateClient(), redisUtil.duplicateClient()]);
        const ioB = new Server();
        ioB.adapter(createAdapter(pub, sub, { key: `${redisUtil.PREFIX}socket.io` }));

        const rider = await h.registerUser();
        const client = connect(`http://localhost:${serverA.address().port}`, {
            auth: { token: rider.token },
            transports: ['websocket'],
            reconnection: false,
        });
        try {
            await withTimeout(new Promise((resolve, reject) => {
                client.once('connect', resolve);
                client.once('connect_error', reject);
            }), 5000, 'socket connect');

            const received = new Promise((resolve) => client.once('hello-from-b', resolve));
            // Give the adapter's subscription a moment, then emit from the OTHER server.
            await new Promise((r) => setTimeout(r, 300));
            ioB.to(`user:${rider.user._id}`).emit('hello-from-b', { ok: true });
            assert.deepEqual(await withTimeout(received, 5000, 'cross-server event'), { ok: true });
        } finally {
            client.close();
            ioB.close();
            getIO().close();
            serverA.close();
        }
    });
});
