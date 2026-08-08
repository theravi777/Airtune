const express = require('express');
const authController = require('../controllers/auth.controller'); // Import the authController  
const { registerValidation, loginValidation } = require('../middlewares/validation.middleware');

const router = express.Router();


router.post('/register', registerValidation, authController.registerUser); // Route for user registration

router.post('/login', loginValidation, authController.loginUser); // Route for user login

router.post('/logout', authController.logoutUser);

module.exports = router;
