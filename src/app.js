const express = require('express');
const connectDB = require('../config/database');
const app = express();
const User = require('../models/userModels');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// ========== AUTH ROUTES ==========

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, age, skills, about, photoUrl } = req.body;

    // Validate required fields
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: firstName, email, and password are required' });
    }

    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userObj = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      gender,
      age,
      skills,
      about,
      photoUrl
    });

    await userObj.save();
    res.status(201).json({ message: 'User created successfully', userId: userObj._id });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
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

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
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

// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ========== PROTECTED ROUTES (require authentication) ==========

// Get user profile
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    // User is already attached to req by authMiddleware
    res.json(req.user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== USER ROUTES ==========

// Get user by email (using query parameter)
app.get('/user', async (req, res) => {
  const userEmail = req.query.email; // Changed from req.body to req.query

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

// Update user by ID
app.patch('/user/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Prevent password updates through this endpoint
    if (updates.password) {
      return res.status(400).json({ error: 'Cannot update password through this endpoint' });
    }

    // Only allow users to update their own profile
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

// Delete user
app.delete('/user', authMiddleware, async (req, res) => {
  const userID = req.body.userID;

  try {
    if (!userID) {
      return res.status(400).json({ error: 'userID is required' });
    }

    // Only allow users to delete their own account
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

// ========== FEED ROUTES ==========

// Get all users (feed)
app.get('/feed', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password');
    res.json(allUsers);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Unable to fetch feed' });
  }
});

// ========== TEST ROUTES (for development only) ==========

// Set test cookie
app.get('/set-cookie', (req, res) => {
  res.cookie('testcookie', 'hello cookie');
  res.json({ message: 'Cookie set successfully' });
});

// Test cookie reading
app.get("/profile-test", (req, res) => {
  console.log(req.cookies);
  res.json({ cookies: req.cookies });
});

// ========== SERVER ==========

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});