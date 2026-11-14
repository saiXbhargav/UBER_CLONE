const usermodel = require('../models/user.model');
const HttpError = require('../utils/httpError');

module.exports.createuser = async ({ firstname, lastname, email, password }) => {
    if (!firstname || !email || !password) {
        throw new HttpError(400, 'All fields are required');
    }
    return usermodel.create({
        fullname: { firstname, lastname },
        email,
        password
    });
};
