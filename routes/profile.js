const express = require('express');
const User = require('../models/userModels');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/profile/edit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastname, age, gender, skills, about, photoUrl } = req.body;

    const updatedata = {};
    if (firstName !== undefined) updatedata.firstName = firstName;
    if (lastname !== undefined) updatedata.lastname = lastname;
    if (age !== undefined) updatedata.age = age;
    if (gender !== undefined) updatedata.gender = gender;
    if (skills !== undefined) updatedata.skills = skills;
    if (about !== undefined) updatedata.about = about;
    if (photoUrl !== undefined) updatedata.photoUrl = photoUrl;

    const user = await User.findByIdAndUpdate(userId, updatedata, { new: true, runValidators: true }).select('-password');

    res.json({ message: 'Profile updated successfully', user: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/profile/password', authMiddleware, async (req, res) => {
  try {
    const userid = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const user = await User.findById(userid);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
