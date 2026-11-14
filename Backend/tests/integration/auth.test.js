const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('../helpers/setup');

describe('auth API', () => {
    before(h.startDb);
    after(h.stopDb);
    beforeEach(h.clearDb);

    it('health reports the database as up', async () => {
        const res = await h.api().get('/health');
        assert.equal(res.status, 200);
        assert.equal(res.body.db, 'up');
    });

    it('echoes a request id header', async () => {
        const res = await h.api().get('/health').set('x-request-id', 'test-req-1');
        assert.equal(res.headers['x-request-id'], 'test-req-1');
    });

    it('registers, logs in and reads the rider profile', async () => {
        const { token, user, credentials } = await h.registerUser();
        assert.ok(token);
        assert.equal(user.password, undefined, 'password hash must not be returned');

        const login = await h.api().post('/users/login').send(credentials);
        assert.equal(login.status, 200);
        assert.ok(login.body.token);

        const profile = await h.api().get('/users/profile').set(h.bearer(login.body.token));
        assert.equal(profile.status, 200);
        assert.equal(profile.body.user.email, credentials.email);
    });

    it('rejects a duplicate email', async () => {
        const { credentials } = await h.registerUser();
        const res = await h.api().post('/users/register').send({
            ...credentials,
            fullname: { firstname: 'Other' },
        });
        assert.ok([400, 409].includes(res.status), `expected 400/409, got ${res.status}`);
    });

    it('rejects bad credentials with 401', async () => {
        const { credentials } = await h.registerUser();
        const res = await h.api().post('/users/login').send({ ...credentials, password: 'wrong-password' });
        assert.equal(res.status, 401);
    });

    it('validates signup input with 400 and a message', async () => {
        const res = await h.api().post('/users/register').send({
            email: 'not-an-email',
            password: '123',
            fullname: { firstname: 'Al' },
        });
        assert.equal(res.status, 400);
        assert.equal(typeof res.body.message, 'string');
    });

    it('blacklists the token on logout', async () => {
        const { token } = await h.registerUser();
        const out = await h.api().get('/users/logout').set(h.bearer(token));
        assert.equal(out.status, 200);

        const profile = await h.api().get('/users/profile').set(h.bearer(token));
        assert.equal(profile.status, 401);
    });

    it('requires a token for protected routes', async () => {
        const res = await h.api().get('/users/profile');
        assert.equal(res.status, 401);
    });

    it('registers and logs in a captain with a vehicle', async () => {
        const { token, captain, credentials } = await h.registerCaptain();
        assert.ok(token);
        assert.equal(captain.vehicle.vehicleType, 'car');

        const login = await h.api().post('/captains/login').send(credentials);
        assert.equal(login.status, 200);

        const profile = await h.api().get('/captains/profile').set(h.bearer(login.body.token));
        assert.equal(profile.status, 200);
        assert.equal(profile.body.captain.email, credentials.email);
    });

    it('rejects an invalid captain vehicle type', async () => {
        const res = await h.api().post('/captains/register').send({
            email: 'bad-vehicle@example.com',
            password: 'secret123',
            fullname: { firstname: 'Arjun' },
            vehicle: { color: 'Red', plate: 'AB12345', capacity: 4, vehicleType: 'truck' },
        });
        assert.equal(res.status, 400);
    });

    it('does not let a rider token act as a captain', async () => {
        const { token } = await h.registerUser();
        const res = await h.api().get('/captains/profile').set(h.bearer(token));
        assert.equal(res.status, 401);
    });

    it('returns JSON 404 for unknown routes', async () => {
        const res = await h.api().get('/nope');
        assert.equal(res.status, 404);
        assert.equal(typeof res.body.message, 'string');
    });
});
