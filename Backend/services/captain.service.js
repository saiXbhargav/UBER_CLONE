const captainmodel = require('../models/captain.model');
const HttpError = require('../utils/httpError');

module.exports.createcaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new HttpError(400, 'All fields are required');
    }
    return captainmodel.create({
        fullname: { firstname, lastname },
        email,
        password,
        vehicle: { color, plate, capacity, vehicleType }
    });
};
