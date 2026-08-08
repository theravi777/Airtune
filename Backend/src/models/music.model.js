const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({  // Define the music schema
    uri: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
        ref: "User", // Reference to the User model
        required: true,
    }   
});

const musicModel = mongoose.model("Music", musicSchema);

module.exports = musicModel;