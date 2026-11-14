// Redis-mode behaviour of the dispatch store and map cache, using ioredis-mock (no server needed).
// Two mock clients share one dataset, which lets us simulate two API servers.
process.env.NODE_ENV = 'test';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const RedisMock = require('ioredis-mock');
const redisUtil = require('../utils/redis');
const dispatchStore = require('../services/dispatch.store');

let serverA;
let serverB;
let ran;

function useServer(client) {
    redisUtil.setRedisClient(client);
}

describe('dispatch store (Redis mode)', () => {
    beforeEach(async () => {
        serverA = new RedisMock();
        serverB = new RedisMock();
        await serverA.flushall();
        useServer(serverA);
        ran = [];
        dispatchStore.setJobHandler(async (job) => {
            ran.push(job);
        });
    });

    afterEach(() => {
        redisUtil.setRedisClient(null);
    });

    it('runs only jobs that are due, in order of due time', async () => {
        const now = Date.now();
        await dispatchStore.schedule({ rideId: 'r1', type: 'wave', wave: 2 }, now + 2000);
        await dispatchStore.schedule({ rideId: 'r1', type: 'wave', wave: 1 }, now + 1000);
        await dispatchStore.schedule({ rideId: 'r1', type: 'expire' }, now + 90000);

        assert.equal(await dispatchStore.pollDueJobs(now), 0);
        assert.equal(await dispatchStore.pollDueJobs(now + 2500), 2);
        assert.deepEqual(ran, [
            { rideId: 'r1', type: 'wave', wave: 1 },
            { rideId: 'r1', type: 'wave', wave: 2 },
        ]);
        assert.equal(await dispatchStore.pollDueJobs(now + 100000), 1);
        assert.deepEqual(ran[2], { rideId: 'r1', type: 'expire', wave: undefined });
    });

    it('lets exactly one server claim each job', async () => {
        const now = Date.now();
        for (let i = 0; i < 10; i++) {
            await dispatchStore.schedule({ rideId: `ride${i}`, type: 'expire' }, now);
        }
        // Both servers poll the same due jobs "at the same time".
        useServer(serverA);
        const pollA = dispatchStore.pollDueJobs(now + 1);
        useServer(serverB);
        const pollB = dispatchStore.pollDueJobs(now + 1);
        const [a, b] = await Promise.all([pollA, pollB]);

        assert.equal(a + b, 10);
        assert.equal(new Set(ran.map((j) => j.rideId)).size, 10, 'no job ran twice');
    });

    it('keeps jobs across a restart (state lives in Redis, not the process)', async () => {
        const now = Date.now();
        await dispatchStore.schedule({ rideId: 'r9', type: 'expire' }, now + 1000);
        // "Restart": a brand-new client/process picks the job up later.
        useServer(new RedisMock());
        assert.equal(await dispatchStore.pollDueJobs(now + 1500), 1);
        assert.equal(ran[0].rideId, 'r9');
    });

    it('cancels every job and the offered list when a ride is cleared', async () => {
        const now = Date.now();
        await dispatchStore.schedule({ rideId: 'r2', type: 'wave', wave: 1 }, now);
        await dispatchStore.schedule({ rideId: 'r2', type: 'expire' }, now);
        await dispatchStore.schedule({ rideId: 'r3', type: 'expire' }, now);
        await dispatchStore.addOffered('r2', ['c1', 'c2']);
        await dispatchStore.addOffered('r2', ['c2', 'c3']);
        assert.deepEqual((await dispatchStore.getOffered('r2')).sort(), ['c1', 'c2', 'c3']);

        await dispatchStore.clear('r2');
        assert.deepEqual(await dispatchStore.getOffered('r2'), []);
        assert.equal(await dispatchStore.pollDueJobs(now + 1), 1);
        assert.equal(ran[0].rideId, 'r3');
    });
});

describe('dispatch store (memory mode)', () => {
    it('fires scheduled jobs with timers and clears them', async () => {
        redisUtil.setRedisClient(null);
        const fired = [];
        dispatchStore.setJobHandler(async (job) => fired.push(job.rideId));

        await dispatchStore.schedule({ rideId: 'm1', type: 'expire' }, Date.now() + 20);
        await dispatchStore.schedule({ rideId: 'm2', type: 'expire' }, Date.now() + 20);
        await dispatchStore.addOffered('m1', ['c1']);
        assert.deepEqual(await dispatchStore.getOffered('m1'), ['c1']);
        await dispatchStore.clear('m2');

        await new Promise((r) => setTimeout(r, 60));
        assert.deepEqual(fired, ['m1']);
    });
});

describe('map cache (Redis mode)', () => {
    afterEach(() => redisUtil.setRedisClient(null));

    it('serves repeated lookups from Redis, shared between servers', async () => {
        const a = new RedisMock();
        await a.flushall();
        redisUtil.setRedisClient(a);
        const mapservice = require('../services/maps.service');

        // Server A cached a reverse-geocode result earlier.
        const key = `${redisUtil.PREFIX}cache:rev:17.3850,78.4867`;
        await a.set(key, JSON.stringify({ name: 'Charminar, Hyderabad', lat: 17.385, lng: 78.4867 }));

        // A second "server" reads the same cached value without calling Photon.
        redisUtil.setRedisClient(new RedisMock());
        const hit = await mapservice.reverseGeocode(17.385, 78.4867);
        assert.equal(hit.name, 'Charminar, Hyderabad');
    });
});
