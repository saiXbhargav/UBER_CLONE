const mongoose = require('mongoose');
const usermodel = require('../models/user.model');
const captainmodel = require('../models/captain.model');
const ridemodel = require('../models/ride.model');
const HttpError = require('../utils/httpError');
const { disconnectAccount } = require('../socket');
const locationStore = require('./location.store');

const ACTIVE = ['pending', 'accepted', 'on-going'];
const DAYS = 7;

const pad = n => String(n).padStart(2, '0');
// Server-local calendar date, matching the $dateToString timezone below.
const localDateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function serverTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

function paging({ page = 1, limit = 20 }) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return { page: p, limit: l, skip: (p - 1) * l };
}

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getOverview() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const since = new Date(startOfToday);
    since.setDate(since.getDate() - (DAYS - 1));
    const timezone = serverTimezone();

    const [users, captains, captainsOnline, [rideStats]] = await Promise.all([
        usermodel.countDocuments(),
        captainmodel.countDocuments(),
        captainmodel.countDocuments({ status: 'active', blocked: { $ne: true } }),
        ridemodel.aggregate([
            {
                $facet: {
                    byStatus: [{ $group: { _id: '$status', count: { $sum: 1 }, fares: { $sum: '$fare' } } }],
                    today: [
                        { $match: { createdAt: { $gte: startOfToday } } },
                        {
                            $group: {
                                _id: null,
                                rides: { $sum: 1 },
                                revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fare', 0] } }
                            }
                        }
                    ],
                    days: [
                        { $match: { createdAt: { $gte: since } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone } },
                                rides: { $sum: 1 },
                                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                                revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fare', 0] } }
                            }
                        }
                    ],
                    byVehicle: [
                        {
                            $group: {
                                _id: '$vehicleType',
                                rides: { $sum: 1 },
                                revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fare', 0] } }
                            }
                        },
                        { $sort: { rides: -1 } }
                    ],
                    cancellation: [
                        { $match: { status: 'canceled' } },
                        { $group: { _id: '$cancelledBy', count: { $sum: 1 } } }
                    ],
                    topCaptains: [
                        { $match: { status: 'completed', captain: { $ne: null } } },
                        { $group: { _id: '$captain', trips: { $sum: 1 }, earnings: { $sum: '$fare' } } },
                        { $sort: { earnings: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: captainmodel.collection.name,
                                localField: '_id',
                                foreignField: '_id',
                                as: 'captain'
                            }
                        },
                        { $unwind: '$captain' },
                        {
                            $project: {
                                _id: 1,
                                trips: 1,
                                earnings: 1,
                                fullname: '$captain.fullname',
                                rating: '$captain.rating',
                                vehicle: '$captain.vehicle'
                            }
                        }
                    ]
                }
            }
        ])
    ]);

    const statusMap = Object.fromEntries((rideStats.byStatus || []).map(s => [s._id, s]));
    const countOf = s => statusMap[s]?.count || 0;
    const totalRides = (rideStats.byStatus || []).reduce((sum, s) => sum + s.count, 0);

    const dayMap = Object.fromEntries((rideStats.days || []).map(d => [d._id, d]));
    const last7Days = [];
    for (let i = 0; i < DAYS; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = localDateKey(d);
        const hit = dayMap[key];
        last7Days.push({ date: key, rides: hit?.rides || 0, completed: hit?.completed || 0, revenue: hit?.revenue || 0 });
    }

    const cancelMap = Object.fromEntries((rideStats.cancellation || []).map(c => [c._id, c.count]));
    const today = rideStats.today?.[0] || { rides: 0, revenue: 0 };

    return {
        totals: {
            users,
            captains,
            captainsOnline,
            rides: totalRides,
            completedRides: countOf('completed'),
            canceledRides: countOf('canceled'),
            activeRides: ACTIVE.reduce((sum, s) => sum + countOf(s), 0),
            revenue: statusMap.completed?.fares || 0
        },
        today: { rides: today.rides, revenue: today.revenue },
        last7Days,
        byVehicle: (rideStats.byVehicle || []).map(v => ({ vehicleType: v._id || 'unknown', rides: v.rides, revenue: v.revenue })),
        cancellation: {
            byUser: cancelMap.user || 0,
            byCaptain: cancelMap.captain || 0,
            bySystem: cancelMap.system || 0
        },
        topCaptains: (rideStats.topCaptains || []).map(c => ({
            _id: c._id,
            fullname: c.fullname,
            vehicle: c.vehicle,
            rating: c.rating || { average: 0, count: 0 },
            trips: c.trips,
            earnings: c.earnings
        }))
    };
}

async function listRides({ status, page, limit }) {
    const { page: p, limit: l, skip } = paging({ page, limit });
    const filter = {};
    if (status === 'active') filter.status = { $in: ACTIVE };
    else if (status) filter.status = status;

    const [rides, total] = await Promise.all([
        ridemodel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l)
            .populate('user', 'fullname email')
            .populate('captain', 'fullname vehicle'),
        ridemodel.countDocuments(filter)
    ]);
    return { rides, page: p, total, pages: Math.max(1, Math.ceil(total / l)) };
}

async function listCaptains({ search, page, limit }) {
    const { page: p, limit: l, skip } = paging({ page, limit });
    const filter = {};
    const q = String(search || '').trim();
    if (q) {
        const re = new RegExp(escapeRegex(q), 'i');
        filter.$or = [
            { email: re },
            { 'fullname.firstname': re },
            { 'fullname.lastname': re },
            { 'vehicle.plate': re }
        ];
    }

    const [captains, total] = await Promise.all([
        captainmodel
            .find(filter)
            .select('fullname email vehicle status blocked rating createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        captainmodel.countDocuments(filter)
    ]);

    const ids = captains.map(c => c._id);
    const trips = ids.length
        ? await ridemodel.aggregate([
            { $match: { captain: { $in: ids }, status: 'completed' } },
            { $group: { _id: '$captain', trips: { $sum: 1 }, earnings: { $sum: '$fare' } } }
        ])
        : [];
    const tripMap = Object.fromEntries(trips.map(t => [String(t._id), t]));

    return {
        captains: captains.map(c => ({
            ...c,
            trips: tripMap[String(c._id)]?.trips || 0,
            earnings: tripMap[String(c._id)]?.earnings || 0
        })),
        page: p,
        total,
        pages: Math.max(1, Math.ceil(total / l))
    };
}

async function setCaptainBlocked(id, blocked) {
    if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid captain id');
    const update = blocked ? { blocked: true, status: 'inactive' } : { blocked: false };
    const captain = await captainmodel
        .findByIdAndUpdate(id, update, { new: true })
        .select('fullname email vehicle status blocked rating createdAt');
    if (!captain) throw new HttpError(404, 'Captain not found');
    if (blocked) {
        disconnectAccount('captain', captain._id);
        await locationStore.removeCaptainLocation(captain._id);
    }
    return captain;
}

module.exports = { getOverview, listRides, listCaptains, setCaptainBlocked };
