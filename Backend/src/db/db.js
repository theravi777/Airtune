const mongoose = require('mongoose');
const userModel = require('../models/user.model');



async function connectDB() {
    try { 
        await mongoose.connect(process.env.MONGO_URI)
        const initialAdminEmail = (process.env.INITIAL_ADMIN_EMAIL || '').toLowerCase();
        if (initialAdminEmail) {
            await userModel.updateOne(
                { email: initialAdminEmail },
                { $set: { role: 'admin', artistStatus: 'none' } }
            );
        }
        console.log('MongoDB connected');
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

module.exports = connectDB;
