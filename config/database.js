const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');
    } catch (err) {
        console.error(' Failed to connect to database:', err.message);
        process.exit(1); 
    }
}

module.exports = connectDB;