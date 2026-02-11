const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'No token provided. Please login first.' });
        }

        const decodedObject = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedObject.userId).select("-password");

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authMiddleware;