const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.services");
const jwt = require('jsonwebtoken');
const albumModel = require("../models/album.model"); // Import the album model

async function createMusic(req, res) {

    // const token = req.cookies.token;  // Get the token from cookies

    // if (!token) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }

    // try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token

    //     if (decoded.role !== 'artist') {  // Check if the user is an admin
    //         return res.status(403).json({ message: 'you dont have permission to perform this action' });
    //     }

    //*** */ due to the use of authArtist middleware, we can remove the token verification and role check from this function


    const {title} = req.body;
    const file = req.file;

    const result = await uploadFile(file.buffer.toString('base64'));     // Upload the file to ImageKit

    const music = await musicModel.create({
        uri: result.url,  // Store the URL of the uploaded file
        title,
        artist: req.user.id,  // Store the ID of the user who uploaded the music
    });

    res.status(201).json({
        message: 'Music created successfully',
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist,
        },
    });

    // }catch (error) {
    //     console.log(error);
        
    //     return res.status(401).json({ message: 'Invalid token' });
    // }



}

async function createAlbum(req, res) {
    // const token = req.cookies.token;  // Get the token from cookies

    // if (!token) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }

    // try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token

    //     if (decoded.role !== 'artist') {  // Check if the user is an admin
    //         return res.status(403).json({ message: 'you dont have permission to create an album' });
    //     }

    // *** */ due to the use of authArtist middleware, we can remove the token verification and role check from this function

        const { title,musics } = req.body;

        const album = await albumModel.create({
            title,
            artist: req.user.id,  // Store the ID of the user who created the album
            musics: musics,  // Store the IDs of the music tracks in the album
        });

        res.status(201).json({
            message: 'Album created successfully',
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            },
        });

    // } catch (error) {
    //     console.log(error);
    //     return res.status(401).json({ message: 'Invalid token' });
    // }
}

async function getAllMusic(req, res) {

    const musics = await musicModel
    .find()
    .populate('artist', 'username'); // Retrieve only the public artist name

    res.status(200).json({
        message: 'Music retrieved successfully',
        musics: musics,
    });
}

async function getAllAlbums(req,res) {

    const albums = await albumModel.find().select("title artist").populate("artist", "username")

    res.status(200).json({
        message: "Albums fetched successfully",
        albums: albums,
})
}

async function addTracksToAlbum(req, res) {
    const { albumId } = req.params;
    const { musics } = req.body;

    if (!Array.isArray(musics) || musics.length === 0) {
        return res.status(400).json({ message: 'Select at least one track to add.' });
    }

    const album = await albumModel.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found.' });

    if (album.artist.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own albums.' });
    }

    const uniqueMusicIds = [...new Set(musics)];
    const ownedTracks = await musicModel.find({
        _id: { $in: uniqueMusicIds },
        artist: req.user.id,
    }).select('_id');

    if (ownedTracks.length !== uniqueMusicIds.length) {
        return res.status(400).json({ message: 'You can only add your own uploaded tracks.' });
    }

    const existingIds = new Set(album.musics.map((music) => music.toString()));
    uniqueMusicIds.forEach((musicId) => {
        if (!existingIds.has(musicId)) album.musics.push(musicId);
    });
    await album.save();

    return res.status(200).json({
        message: 'Tracks added to album successfully.',
        album: { id: album._id, title: album.title, musics: album.musics },
    });
}

async function renameMusic(req, res) {
    const { musicId } = req.params;
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';

    if (!title || title.length > 100) {
        return res.status(400).json({ message: 'Track title must be between 1 and 100 characters.' });
    }

    const music = await musicModel.findOneAndUpdate(
        { _id: musicId, artist: req.user.id },
        { title },
        { new: true, runValidators: true }
    ).populate('artist', 'username');

    if (!music) {
        return res.status(404).json({ message: 'Track not found, or you do not have permission to edit it.' });
    }

    return res.status(200).json({
        message: 'Track title updated successfully.',
        music,
    });
}

async function getAlbumById(req,res){

    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate("artist", "username").populate("musics")

    return res.status(200).json({
        message: "Album fetched successfully",
        album: album,
})
}



module.exports = {
    createMusic,  // Export the createMusic function for use in other parts of the application
    createAlbum,  // Export the createAlbum function for use in other parts of the application
    getAllMusic,  // Export the getAllMusic function for use in other parts of the application
    getAllAlbums,
    getAlbumById,
    addTracksToAlbum,
    renameMusic,
};
