const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

const messageSchema = new mongoose.Schema({
    from: { type: String, enum: ['user', 'captain'], required: true },
    text: { type: String, required: true, maxlength: 500 },
    at: { type: Date, default: Date.now }
});

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain'
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    pickupCoords: pointSchema,
    destinationCoords: pointSchema,
    vehicleType: {
        type: String,
        enum: ['car', 'auto', 'moto'],
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    surgeMultiplier: {
        type: Number,
        default: 1
    },
    fareBreakdown: {
        base: Number,
        distance: Number,
        time: Number,
        surgeMultiplier: Number,
        surgeAmount: Number,
        total: Number
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'canceled', 'on-going', 'completed'],
        default: 'pending'
    },
    // seconds
    duration: {
        type: Number,
        default: 0
    },
    // meters
    distance: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash'],
        default: 'cash'
    },
    cancelledBy: {
        type: String,
        enum: ['user', 'captain', 'system']
    },
    cancelReason: {
        type: String,
        maxlength: 300
    },
    rating: {
        score: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 }
    },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    // Rider <-> driver chat; excluded from normal queries to keep payloads small.
    messages: {
        type: [messageSchema],
        select: false,
        default: []
    },
    otp: {
        type: String,
        select: false,
        required: true
    },
}, { timestamps: true });

rideSchema.index({ user: 1, status: 1 });
rideSchema.index({ captain: 1, status: 1 });
rideSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ride', rideSchema);
