const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {              // Define the role field
        type: String,
        enum: ['user', 'artist'], // Define the allowed roles
        default: 'user',
    },
});


const userModel = mongoose.model('User', userSchema);

module.exports = userModel;