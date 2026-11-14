const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const cookieparser = require('cookie-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const pinoHttp = require('pino-http');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('./utils/logger');
const { getCorsOrigin } = require('./utils/cors');
const { redisStatus } = require('./utils/redis');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const adminRoutes = require('./routes/admin.routes');

// The DB connection is opened in server.js (tests manage their own connection).
const app = express();

app.set('trust proxy', 1); // correct client IPs behind Render/Railway/Vercel proxies (rate limiting)
app.use(pinoHttp({
    logger,
    genReqId: (req, res) => {
        const incoming = req.headers['x-request-id'];
        const id = typeof incoming === 'string' && incoming.length <= 128 ? incoming : crypto.randomUUID();
        res.setHeader('x-request-id', id);
        return id;
    },
    autoLogging: { ignore: (req) => req.url === '/health' },
    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
}));
app.use(helmet());
app.use(cors({ origin: getCorsOrigin(), credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

const limiterOptions = { standardHeaders: 'draft-7', legacyHeaders: false };
const authLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { message: 'Too many attempts, please try again in a few minutes' }
});
const otpLimiter = rateLimit({
    ...limiterOptions,
    windowMs: 5 * 60 * 1000,
    limit: 10,
    message: { message: 'Too many OTP attempts, please wait a few minutes' }
});

app.use(['/users/login', '/users/register', '/captains/login', '/captains/register'], authLimiter);
app.use('/rides/start', otpLimiter);

app.get('/', (req, res) => res.json({ name: 'ride-app-api', status: 'ok' }));
app.get('/health', (req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    const redis = redisStatus();
    const healthy = dbUp && redis !== 'down';
    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        db: dbUp ? 'up' : 'down',
        redis,
        uptime: Math.round(process.uptime()),
    });
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapRoutes);
app.use('/rides', rideRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler: known errors keep their status; everything else is a generic 500.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Malformed JSON body' });
    }
    if (err.name === 'ValidationError') {
        const first = Object.values(err.errors || {})[0];
        return res.status(400).json({ message: first?.message || 'Invalid data' });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ${err.path}` });
    }
    if (err.code === 11000) {
        return res.status(409).json({ message: 'A record with these details already exists' });
    }
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) (req.log || logger).error({ err }, 'Unhandled error');
    res.status(status).json({ message: status >= 500 ? 'Something went wrong, please try again' : err.message });
});

module.exports = app;
