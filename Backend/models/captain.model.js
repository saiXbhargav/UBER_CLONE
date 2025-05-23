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
        minlength: [5, 'Email must be at least 5 characters long'],
        match: [/^|S+@\S+.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String
    },
    status :{
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    vehicle: {
        color: {
            type: String,
            required: true
            // minlength: [3, 'Color must be at least 3 characters long']
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
            enum: ['car', 'motorcycle', 'auto'],
            default: 'motorcycle'
        }
    },

    location:{
        la:{
            type: Number
            // required: true  
        }
        ,lng:{
            type: Number
            // required: true  
        }
    }

})

captainSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;   
}

captainSchema.methods.comparepassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
}


captainSchema.statics.hashpassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}


const captainmodel = mongoose.model('captain', captainSchema);
module.exports = captainmodel;