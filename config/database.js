const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Failed to connect to database:', err.message);
        console.log('Continuing without database connection for testing...');
        // Don't exit, allow server to continue for testing
    }
}
module.exports = connectDB;