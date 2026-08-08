const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({  // Define the album schema
    title: {
        type: String,
        required: true,
    },
    musics: [{  // Array of music references
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music", // Reference to the Music model   
    }],
    artist: {  
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
        ref: "User", // Reference to the User model
        required: true,
    }   
});

const albumModel = mongoose.model("Album", albumSchema); // Create the Album model based on the album schema

module.exports = albumModel;