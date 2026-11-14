const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { initializeSocket, getIO } = require('./socket');
const { connectRedis, disconnectRedis } = require('./utils/redis');
const dispatchStore = require('./services/dispatch.store');
const { connect } = require('./db/db');
const logger = require('./utils/logger');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function start() {
    // Redis is optional; if REDIS_URL is set it must be reachable (fail fast instead of silently
    // running several servers with private in-memory state).
    try {
        const usingRedis = await connectRedis();
        if (!usingRedis) logger.info('REDIS_URL not set: using in-memory real-time state (single server)');
    } catch (err) {
        logger.fatal({ err: err.message }, 'Could not connect to Redis (REDIS_URL is set)');
        process.exit(1);
    }

    await initializeSocket(server);
    dispatchStore.startDispatcher();

    connect().catch((err) => {
        logger.fatal({ err }, 'Could not connect to MongoDB');
        process.exit(1);
    });

    server.listen(port, () => {
        logger.info({ port: Number(port) }, 'Server listening');
    });
}

start();

let shuttingDown = false;

function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down gracefully');

    const forceExit = setTimeout(() => {
        logger.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, 10000);
    forceExit.unref();

    dispatchStore.stopDispatcher();
    getIO()?.close();

    server.close(async () => {
        try {
            await mongoose.connection.close();
            await disconnectRedis();
            logger.info('Shutdown complete');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during shutdown');
            process.exit(1);
        }
    });
    // Open sockets (Socket.IO / keep-alive) would otherwise keep server.close() waiting.
    server.closeAllConnections?.();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    shutdown('uncaughtException');
});
