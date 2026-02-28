const express = require('express');
const User = require('../models/userModels');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/user', async (req, res) => {
  const userEmail = req.query.email;

  try {
    if (!userEmail) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const users = await User.find({ email: userEmail }).select('-password');
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Unable to get user data' });
  }
});

router.patch('/user/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (updates.password) {
      return res.status(400).json({ error: 'Cannot update password through this endpoint' });
    }

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update user error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/user', authMiddleware, async (req, res) => {
  const userID = req.body.userID;

  try {
    if (!userID) {
      return res.status(400).json({ error: 'userID is required' });
    }

    if (req.user._id.toString() !== userID) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    const user = await User.findByIdAndDelete(userID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.clearCookie('token');
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
