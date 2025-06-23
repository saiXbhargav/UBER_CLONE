const mapsService = require('../services/maps.service');
const { validationResult } = require('express-validator');

module.exports.getcoordinates = async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { address } = req.query;
    try {
        const coordinates = await mapsService.getAddressCoordinate(address);
        res.json(coordinates);
    } catch (error) {
        res.status(404).json({ error: "Coordinates not found" });
    }
}

module.exports.getDistanceAndTime = async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { origin, destination } = req.query;
    try {
        const distanceAndTime = await mapsService.getDistanceAndTime(origin, destination);
        res.json(distanceAndTime);
    } catch (error) {
        res.status(404).json({ error: "Distance and time not found" });
    }
}

module.exports.getSuggestion = async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { input } = req.query;
    try {
        const suggestions = await mapsService.getAutoCompleteSuggestions(input);
        res.json(suggestions);
    } catch (error) {
        res.status(404).json({ error: "Suggestions not found" });
    }
}