const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('_id role artistStatus');
        if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
        req.user = { id: user._id.toString(), role: user.role, artistStatus: user.artistStatus };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

function authUser(req, res, next) {
    return authenticate(req, res, next);
}

async function authArtist(req, res, next) {
    return authenticate(req, res, () => {
        if (req.user.role !== 'artist') return res.status(403).json({ message: 'Artist access is required.' });
        if (req.user.artistStatus !== 'approved') return res.status(403).json({ message: 'Your artist request is pending admin approval.' });
        return next();
    });
}

async function authAdmin(req, res, next) {
    return authenticate(req, res, () => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access is required.' });
        return next();
    });
}

module.exports = { authArtist, authUser, authAdmin };
