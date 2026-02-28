const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, age, skills, about, photoUrl } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: firstName, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const userObj = new User({
      firstName,
      lastName,
      email,
      password,
      gender,
      age,
      skills,
      about,
      photoUrl
    });

    await userObj.save();
    res.status(201).json({ message: 'User created successfully', userId: userObj._id });
  } catch (err) {
    console.error('Signup error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('connected')) {
      return res.status(503).json({ error: 'Database connection failed. Please ensure MongoDB is properly configured.' });
    }
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.json({
      message: 'Login successful 🎉',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: 'If email exists, a reset link has been sent'
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET + 'reset',
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    res.json({
      message: 'Password reset link would be sent to email',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'token, newPassword, and confirmPassword are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET + 'reset');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.resetPasswordToken !== token ||
        new Date() > user.resetPasswordExpires) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
