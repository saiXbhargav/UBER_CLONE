const usermodel = require('../models/user.model');

module.exports.createuser = async ({
    firstname,
    lastname,
    email,
    password
}) => {
    if(!firstname|| !email || !password) {
        throw new Error('All fields are required');
    }
    const user=await usermodel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password,
        socketId:Math.random().toString(36).substring(2, 15)
    })
    return user;
}