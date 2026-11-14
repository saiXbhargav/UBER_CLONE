const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

function prettyTransport() {
    if (isProduction || isTest) return undefined;
    try {
        require.resolve('pino-pretty'); // devDependency: absent in production images
        return { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } };
    } catch {
        return undefined;
    }
}

const logger = pino({
    level: process.env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
    redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    transport: prettyTransport(),
});

module.exports = logger;
