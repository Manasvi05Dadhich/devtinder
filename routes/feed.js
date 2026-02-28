const express = require('express');
const User = require('../models/userModels');

const router = express.Router();

router.get('/feed', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password');
    res.json(allUsers);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Unable to fetch feed' });
  }
});

module.exports = router;
