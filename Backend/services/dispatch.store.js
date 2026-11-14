const { getRedis, isRedisEnabled, key } = require('../utils/redis');
const logger = require('../utils/logger');

/**
 * Dispatch state for pending ride requests:
 *   - which drivers have already been offered a ride
 *   - scheduled jobs: { rideId, type: 'wave' | 'expire', wave? } that fire at a given time
 *
 * Memory mode: a Map + setTimeout (one server; state is lost on restart).
 * Redis mode:  jobs live in a sorted set scored by due time. Every server polls it and claims a
 *              due job with ZREM — only the server whose ZREM succeeds runs it, so each job runs
 *              exactly once across the cluster and pending rides survive a restart.
 */

const OFFERED_TTL_SECONDS = 15 * 60;
const POLL_INTERVAL_MS = 1000;
const POLL_BATCH = 50;

let handler = async () => {};

/** ride.service registers the function that executes a due job. */
function setJobHandler(fn) {
    handler = fn;
}

const encodeJob = (job) => `${job.rideId}|${job.type}|${job.wave ?? ''}`;
function decodeJob(member) {
    const [rideId, type, wave] = member.split('|');
    return { rideId, type, wave: wave === '' ? undefined : Number(wave) };
}

async function runJob(job) {
    try {
        await handler(job);
    } catch (err) {
        logger.error({ err: err.message, job }, 'Dispatch job failed');
    }
}

// ---------------------------------------------------------------- memory implementation
const memory = new Map(); // rideId -> { offered: Set<string>, timers: Timeout[] }

function memoryEntry(rideId) {
    const id = String(rideId);
    if (!memory.has(id)) memory.set(id, { offered: new Set(), timers: [] });
    return memory.get(id);
}

const memoryStore = {
    async schedule(job, dueAt) {
        const timer = setTimeout(() => runJob(job), Math.max(0, dueAt - Date.now()));
        timer.unref?.();
        memoryEntry(job.rideId).timers.push(timer);
    },
    async addOffered(rideId, captainIds) {
        captainIds.forEach((c) => memoryEntry(rideId).offered.add(String(c)));
    },
    async getOffered(rideId) {
        return [...(memory.get(String(rideId))?.offered || [])];
    },
    async clear(rideId) {
        const entry = memory.get(String(rideId));
        if (!entry) return;
        entry.timers.forEach(clearTimeout);
        memory.delete(String(rideId));
    },
};

// ---------------------------------------------------------------- redis implementation
const JOBS = () => key('dispatch', 'jobs');
const RIDE_JOBS = (rideId) => key('dispatch', 'ride', rideId, 'jobs');
const OFFERED = (rideId) => key('dispatch', 'ride', rideId, 'offered');

const redisStore = {
    async schedule(job, dueAt) {
        const member = encodeJob(job);
        await getRedis()
            .multi()
            .zadd(JOBS(), dueAt, member)
            .sadd(RIDE_JOBS(job.rideId), member)
            .expire(RIDE_JOBS(job.rideId), OFFERED_TTL_SECONDS)
            .exec();
    },
    async addOffered(rideId, captainIds) {
        if (!captainIds.length) return;
        await getRedis()
            .multi()
            .sadd(OFFERED(rideId), ...captainIds.map(String))
            .expire(OFFERED(rideId), OFFERED_TTL_SECONDS)
            .exec();
    },
    async getOffered(rideId) {
        return getRedis().smembers(OFFERED(rideId));
    },
    async clear(rideId) {
        const redis = getRedis();
        const members = await redis.smembers(RIDE_JOBS(rideId));
        const tx = redis.multi();
        if (members.length) tx.zrem(JOBS(), ...members);
        await tx.del(RIDE_JOBS(rideId), OFFERED(rideId)).exec();
    },
};

/** Claim and run every due job once. Exported so tests can drive the poller deterministically. */
async function pollDueJobs(now = Date.now()) {
    const redis = getRedis();
    const due = await redis.zrangebyscore(JOBS(), '-inf', now, 'LIMIT', 0, POLL_BATCH);
    let ran = 0;
    for (const member of due) {
        // Atomic claim: if another server removed it first, ZREM returns 0 and we skip it.
        if ((await redis.zrem(JOBS(), member)) !== 1) continue;
        const job = decodeJob(member);
        await redis.srem(RIDE_JOBS(job.rideId), member);
        await runJob(job);
        ran += 1;
    }
    return ran;
}

let pollTimer = null;
let polling = false;

/** Start the Redis job poller (no-op in memory mode, where setTimeout does the work). */
function startDispatcher() {
    if (!isRedisEnabled() || pollTimer) return;
    pollTimer = setInterval(async () => {
        if (polling) return; // never overlap polls on one server
        polling = true;
        try {
            await pollDueJobs();
        } catch (err) {
            logger.error({ err: err.message }, 'Dispatch poll failed');
        } finally {
            polling = false;
        }
    }, POLL_INTERVAL_MS);
    pollTimer.unref?.();
    logger.info('Dispatch poller started (Redis)');
}

function stopDispatcher() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
}

const store = () => (isRedisEnabled() ? redisStore : memoryStore);

module.exports = {
    setJobHandler,
    schedule: (job, dueAt) => store().schedule(job, dueAt),
    addOffered: (rideId, ids) => store().addOffered(rideId, ids),
    getOffered: (rideId) => store().getOffered(rideId),
    clear: (rideId) => store().clear(rideId),
    pollDueJobs,
    startDispatcher,
    stopDispatcher,
};
