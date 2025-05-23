const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




const userSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true,
            minlength:[3,'First name must be at least 3 characters long']
        }
        ,lastname:{
            type:String,
            minlength:[3,'Last name must be at least 3 characters long']
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:[5,'Email must be at least 5 characters long']
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    socketId:{
        type:String
    },
})

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
}

userSchema.statics.hashpassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

const usermodel=mongoose.model('User', userSchema);
module.exports=usermodel;

