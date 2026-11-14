const Redis = require('ioredis');
const logger = require('./logger');

/**
 * Optional Redis. When REDIS_URL is set the app keeps its real-time state in Redis:
 *   - Socket.IO adapter (several API servers share rooms/events)
 *   - dispatch jobs + offered drivers (survive restarts, shared between servers)
 *   - driver GPS positions in a GEO index (hot path stays out of MongoDB)
 *   - active-ride lookups and the map-provider cache
 * Without REDIS_URL everything falls back to in-process memory (single server).
 */

// Every key this app writes starts with this prefix, so a shared Redis stays tidy.
const PREFIX = process.env.REDIS_PREFIX || 'ride:';

let client = null;
const extraClients = [];

const isRedisEnabled = () => client !== null;
const getRedis = () => client;
const key = (...parts) => PREFIX + parts.join(':');

function baseOptions() {
    return {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableAutoPipelining: true,
        retryStrategy: (times) => Math.min(times * 200, 5000),
    };
}

/** Connect using REDIS_URL. Resolves to false when Redis is not configured. */
async function connectRedis(url = process.env.REDIS_URL) {
    if (!url) return false;
    const redis = new Redis(url, baseOptions());
    redis.on('error', (err) => logger.error({ err: err.message }, 'Redis error'));
    redis.on('reconnecting', () => logger.warn('Redis reconnecting'));
    await redis.connect();
    await redis.ping();
    client = redis;
    logger.info('Redis connected');
    return true;
}

/** Extra connection (pub/sub needs dedicated ones). Closed by disconnectRedis(). */
async function duplicateClient() {
    if (!client) throw new Error('Redis is not connected');
    const dup = client.duplicate();
    dup.on('error', (err) => logger.error({ err: err.message }, 'Redis error (duplicate)'));
    if (dup.status === 'wait') await dup.connect();
    extraClients.push(dup);
    return dup;
}

/** Tests can plug in their own client (e.g. ioredis-mock or a test server). */
function setRedisClient(redis) {
    client = redis;
}

async function disconnectRedis() {
    const all = [...extraClients.splice(0), client].filter(Boolean);
    client = null;
    await Promise.all(all.map((c) => c.quit().catch(() => c.disconnect())));
}

/** For /health: 'disabled' | 'up' | 'down'. */
function redisStatus() {
    if (!client) return 'disabled';
    return client.status === 'ready' ? 'up' : 'down';
}

module.exports = {
    PREFIX,
    key,
    isRedisEnabled,
    getRedis,
    connectRedis,
    duplicateClient,
    setRedisClient,
    disconnectRedis,
    redisStatus,
};
