const mongoose = require('mongoose');
const logger = require('../utils/logger');

let listenersAttached = false;

function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
    mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
}

async function connect(uri = process.env.DB_CONNECT) {
    if (!uri) throw new Error('DB_CONNECT is not set');
    attachListeners();
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20,
    });
    return mongoose.connection;
}

async function disconnect() {
    await mongoose.connection.close();
}

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = connect;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.isConnected = isConnected;
