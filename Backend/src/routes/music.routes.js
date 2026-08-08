const express = require("express");
const musicController = require("../controllers/music.controller"); // Import the musicController
const authMiddleware = require("../middlewares/auth.middleware"); // Import the authMiddleware

const multer = require("multer"); // Import multer for handling file uploads


const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory for processing
}); // Create a multer instance for handling multipart/form-data

const router = express.Router();


router.post("/upload", authMiddleware.authArtist, upload.single("music"), musicController.createMusic); // Route for uploading music

router.post("/album", authMiddleware.authArtist, musicController.createAlbum); // Route for creating an album

router.patch("/albums/:albumId/tracks", authMiddleware.authArtist, musicController.addTracksToAlbum);

router.get("/", authMiddleware.authUser, musicController.getAllMusic); // Route for retrieving all music

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById)

module.exports = router;
