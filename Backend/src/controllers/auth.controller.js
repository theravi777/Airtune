const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const initialAdminEmail = (process.env.INITIAL_ADMIN_EMAIL || '').toLowerCase();

async function registerUser(req, res) {
    const { username, email, password, role = 'user' } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ 
        $or: [     // Check if either username or email already exists
            { username }, 
            { email }
        ]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: 'User already exists' });
    }   

    const hash = await bcrypt.hash(password, 10);  // Hash the password before saving

    const isInitialAdmin = email.toLowerCase() === initialAdminEmail;
    const user = await userModel.create({   // Create a new user with the provided
         username, 
         email, 
        password: hash,
        role: isInitialAdmin ? 'admin' : role,
        artistStatus: isInitialAdmin ? 'none' : (role === 'artist' ? 'pending' : 'none'),
         });

    const token = jwt.sign({  // Generate a JWT token for the newly registered user
         id: user._id,
         role: user.role,
         }, process.env.JWT_SECRET);     

    res.cookie('token', token)  // Set the token in a cookie

    res.status(201).json({
         message: 'User registered successfully',
          user : {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            artistStatus: user.artistStatus,
          }
        });

}

async function loginUser(req, res) {
    const {username, email, password } = req.body;

    const user = await userModel.findOne({  // Find a user by either username or email
        $or: [
            { username },
            { email }
        ]   
    })

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);  // Compare the provided password with the hashed password stored in the database

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }   

    const token = jwt.sign({  // Generate a JWT token for the authenticated user
        id: user._id,
        role: user.role,
    }, process.env.JWT_SECRET);

    res.cookie('token', token);  // Set the token in a cookie

    res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            artistStatus: user.artistStatus,
        }
    });
}

function logoutUser(req, res) {
    res.clearCookie('token');

    return res.status(200).json({
        message: 'User logged out successfully',
    });
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};
