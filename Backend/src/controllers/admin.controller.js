const userModel = require('../models/user.model');

async function listArtistRequests(req, res) {
    const artists = await userModel
        .find({ role: 'artist', artistStatus: 'pending' })
        .select('username email artistStatus createdAt')
        .sort({ createdAt: 1 });

    return res.status(200).json({ artists });
}

async function decideArtistRequest(req, res) {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const artist = await userModel.findOneAndUpdate(
        { _id: req.params.userId, role: 'artist', artistStatus: 'pending' },
        { artistStatus: status },
        { new: true }
    ).select('username email artistStatus');

    if (!artist) return res.status(404).json({ message: 'Pending artist request not found.' });
    return res.status(200).json({ message: `Artist request ${status}.`, artist });
}

module.exports = { listArtistRequests, decideArtistRequest };
