const jwt = require('jsonwebtoken');
const User = require('../models/userModels');       

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decodedObject = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedObject.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user; 
    next();

  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;