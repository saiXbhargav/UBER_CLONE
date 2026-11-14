const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long']
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long']
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [5, 'Email must be at least 5 characters long'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        // Drivers start offline and must go online from the app to receive requests.
        default: 'inactive'
    },
    // Suspended by an admin: cannot log in, connect or receive rides.
    blocked: {
        type: Boolean,
        default: false
    },
    vehicle: {
        color: {
            type: String,
            required: true
        },
        plate: {
            type: String,
            required: true,
            unique: true,
            minlength: [5, 'Plate number must be at least 5 characters long']
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'Capacity must be at least 1']
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'auto', 'moto']
        }
    },
    // GeoJSON point: coordinates are [lng, lat]
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            default: undefined
        }
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

captainSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, role: 'captain' }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

captainSchema.methods.comparepassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

captainSchema.statics.hashpassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// 2dsphere indexes skip documents without a location, so captains who never shared one are simply not matched.
captainSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Captain', captainSchema);
