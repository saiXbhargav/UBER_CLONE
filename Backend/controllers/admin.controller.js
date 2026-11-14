const adminservice = require('../services/admin.service');

module.exports.getOverview = async (req, res) => {
    res.json(await adminservice.getOverview());
};

module.exports.listRides = async (req, res) => {
    const { status, page, limit } = req.query;
    res.json(await adminservice.listRides({ status, page, limit }));
};

module.exports.listCaptains = async (req, res) => {
    const { search, page, limit } = req.query;
    res.json(await adminservice.listCaptains({ search, page, limit }));
};

module.exports.setCaptainBlocked = async (req, res) => {
    const captain = await adminservice.setCaptainBlocked(req.params.id, req.body.blocked);
    res.json({ captain });
};
