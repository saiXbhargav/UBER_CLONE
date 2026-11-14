const { Server } = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const { resolveToken } = require('./middlewares/auth.middleware');
const { getCorsOrigin } = require('./utils/cors');
const { isRedisEnabled, duplicateClient } = require('./utils/redis');
const locationStore = require('./services/location.store');
const logger = require('./utils/logger');

let io;

const roomFor = (role, id) => `${role}:${id}`;

async function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: getCorsOrigin(),
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // With Redis, every API server joins one Socket.IO cluster: an event emitted to a room on
    // server A reaches sockets connected to server B.
    if (isRedisEnabled()) {
        const { createAdapter } = require('@socket.io/redis-adapter');
        const [pub, sub] = await Promise.all([duplicateClient(), duplicateClient()]);
        io.adapter(createAdapter(pub, sub, { key: `${require('./utils/redis').PREFIX}socket.io` }));
        logger.info('Socket.IO using the Redis adapter');
    }

    // Every socket must present a valid JWT: socket.handshake.auth.token
    io.use(async (socket, next) => {
        try {
            const { role, account } = await resolveToken(socket.handshake.auth?.token);
            socket.data = { id: String(account._id), role };
            return next();
        } catch (err) {
            return next(new Error(err.message || 'Unauthorized'));
        }
    });

    io.on('connection', async socket => {
        const { id, role } = socket.data;
        socket.join(roomFor(role, id));

        // Kept for compatibility with code that still reads socketId.
        const model = role === 'captain' ? captainModel : userModel;
        model.findByIdAndUpdate(id, { socketId: socket.id }).catch(() => {});

        // Older clients emit 'join'; identity already comes from the token, so the payload is ignored.
        socket.on('join', () => {});

        socket.on('update-location-captain', async (data = {}) => {
            if (role !== 'captain') return;
            const lat = Number(data.location?.ltd ?? data.location?.lat);
            const lng = Number(data.location?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
                Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                socket.emit('error', 'Invalid location data');
                return;
            }
            try {
                await locationStore.saveCaptainLocation(id, lat, lng);
                const activeRide = await locationStore.getActiveRide(id);
                if (activeRide) {
                    emitToUser(activeRide.userId, 'captain-location', { rideId: activeRide.rideId, lat, lng });
                }
            } catch (error) {
                logger.error({ err: error.message, captainId: id }, 'Failed to update captain location');
            }
        });
    });
}

function emitTo(role, id, event, data) {
    if (!io || !id) return;
    io.to(roomFor(role, String(id))).emit(event, data);
}

const emitToUser = (id, event, data) => emitTo('user', id, event, data);
const emitToCaptain = (id, event, data) => emitTo('captain', id, event, data);

// Force-close every socket of an account (e.g. a driver suspended by an admin).
function disconnectAccount(role, id) {
    if (!io || !id) return;
    io.to(roomFor(role, String(id))).emit('account-suspended');
    io.in(roomFor(role, String(id))).disconnectSockets(true);
}

const getIO = () => io;

module.exports = { initializeSocket, emitToUser, emitToCaptain, disconnectAccount, getIO };
