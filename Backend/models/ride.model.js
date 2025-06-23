const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user:{
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
    fare:{
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'canceled','on-going', 'completed'],
        default: 'pending'
    },
    duration:{
        type: Number,
        default: 0  
    },
    distance: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: String,
        default: ''
    },
    orderId:{
        type: String,
        default: ''
    },
    signature: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        select: false, // Do not include OTP in queries by default,
        required: true
    },
});

module.exports = mongoose.model('ride', rideSchema);