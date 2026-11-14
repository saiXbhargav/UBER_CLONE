// Allowed origins come from CLIENT_URL (comma-separated). When unset, every origin is allowed.
function getCorsOrigin() {
    const raw = process.env.CLIENT_URL;
    if (!raw || !raw.trim()) return true;
    return raw.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
}

module.exports = { getCorsOrigin };
