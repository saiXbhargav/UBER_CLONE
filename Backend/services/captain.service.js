const captainmodel= require('../models/captain.model');

module.exports.createcaptain = async  ({firstname, lastname, email, password, 
    color,plate,capacity,vehicletype}) => {
    if(!firstname|| !email || !password || !color || !plate || 
        !capacity || !vehicletype) {
        throw new Error('All fields are required');
    }
    const captain=await captainmodel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password,
        vehicle:{
            color,
            plate,
            capacity,
            vehicletype
        },
        socketId:Math.random().toString(36).substring(2, 15)
    })
    return captain;
}

