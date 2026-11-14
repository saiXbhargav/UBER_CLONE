const mapsService = require('../services/maps.service');

module.exports.getcoordinates = async (req, res) => {
    res.json(await mapsService.getAddressCoordinate(req.query.address));
};

module.exports.getDistanceAndTime = async (req, res) => {
    const { origin, destination } = req.query;
    res.json(await mapsService.getDistanceAndTime(origin, destination));
};

module.exports.getSuggestion = async (req, res) => {
    res.json(await mapsService.getAutoCompleteSuggestions(req.query.input));
};

module.exports.reverse = async (req, res) => {
    res.json(await mapsService.reverseGeocode(Number(req.query.lat), Number(req.query.lng)));
};
