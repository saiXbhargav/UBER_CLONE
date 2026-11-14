const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransition, generateOtp, calculateFare, ACTIVE_STATUSES } = require('../utils/rideRules');
const { formatDuration, formatDistance } = require('../services/maps.service');

test('calculateFare applies base + per-km + per-minute rates', () => {
    // 10 km, 20 minutes
    assert.deepEqual(calculateFare(10000, 1200), {
        auto: 30 + 100 + 40,
        car: 50 + 150 + 60,
        moto: 20 + 80 + 20,
    });
});

test('calculateFare returns base fares for a zero-length trip', () => {
    assert.deepEqual(calculateFare(0, 0), { auto: 30, car: 50, moto: 20 });
});

test('calculateFare rounds to whole rupees and ignores bad input', () => {
    const fare = calculateFare(1234, 95);
    for (const value of Object.values(fare)) assert.ok(Number.isInteger(value));
    assert.deepEqual(calculateFare(-5, NaN), { auto: 30, car: 50, moto: 20 });
});

test('generateOtp returns 6 numeric digits by default', () => {
    for (let i = 0; i < 200; i++) {
        assert.match(generateOtp(), /^\d{6}$/);
    }
});

test('generateOtp respects the digit count and rejects invalid input', () => {
    assert.match(generateOtp(4), /^\d{4}$/);
    assert.throws(() => generateOtp(0));
    assert.throws(() => generateOtp(-1));
});

test('canTransition allows the normal ride lifecycle', () => {
    assert.ok(canTransition('pending', 'accepted'));
    assert.ok(canTransition('accepted', 'on-going'));
    assert.ok(canTransition('on-going', 'completed'));
    assert.ok(canTransition('pending', 'canceled'));
    assert.ok(canTransition('accepted', 'canceled'));
});

test('canTransition blocks skipped steps and terminal states', () => {
    assert.ok(!canTransition('pending', 'on-going'));
    assert.ok(!canTransition('pending', 'completed'));
    assert.ok(!canTransition('accepted', 'completed'));
    assert.ok(!canTransition('on-going', 'canceled'));
    assert.ok(!canTransition('completed', 'pending'));
    assert.ok(!canTransition('canceled', 'accepted'));
    assert.ok(!canTransition('unknown', 'accepted'));
});

test('active statuses are the non-terminal ones', () => {
    assert.deepEqual(ACTIVE_STATUSES, ['pending', 'accepted', 'on-going']);
});

test('formatDuration and formatDistance produce readable text', () => {
    assert.equal(formatDuration(3720).text, '1 hr 2 min');
    assert.equal(formatDuration(20).text, '1 min');
    assert.deepEqual(formatDistance(1500), { text: '1.50 km', value: 1500 });
});

const { surgeMultiplier, fareBreakdown, DISPATCH_WAVES } = require('../utils/rideRules');

test('surgeMultiplier is 1x when supply meets demand', () => {
    assert.equal(surgeMultiplier(1, 1), 1);
    assert.equal(surgeMultiplier(3, 5), 1);
    assert.equal(surgeMultiplier(0, 0), 1);
});

test('surgeMultiplier grows with demand per driver and caps at 2x', () => {
    assert.equal(surgeMultiplier(2, 1), 1.3); // 1.25 rounded
    assert.equal(surgeMultiplier(3, 1), 1.5);
    assert.equal(surgeMultiplier(100, 1), 2);
    assert.equal(surgeMultiplier(4, 0), 1.8); // no drivers counts as one
});

test('fareBreakdown adds up and matches calculateFare', () => {
    const b = fareBreakdown(10000, 1200, 'car');
    assert.deepEqual(b, { base: 50, distance: 150, time: 60, surgeMultiplier: 1, surgeAmount: 0, total: 260 });
    assert.equal(b.total, calculateFare(10000, 1200).car);

    const surged = fareBreakdown(10000, 1200, 'car', 1.5);
    assert.equal(surged.total, 390);
    assert.equal(surged.surgeAmount, 130);
    assert.equal(surged.total, calculateFare(10000, 1200, 1.5).car);
    assert.throws(() => fareBreakdown(1, 1, 'plane'));
});

test('dispatch waves widen over time', () => {
    for (let i = 1; i < DISPATCH_WAVES.length; i++) {
        assert.ok(DISPATCH_WAVES[i].delayMs > DISPATCH_WAVES[i - 1].delayMs);
        assert.ok(DISPATCH_WAVES[i].radiusKm >= DISPATCH_WAVES[i - 1].radiusKm);
    }
});
