const express = require('express');
const connectDB = require('../config/database');
const app = express();
const User = require('../models/userModels');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());


connectDB();

app.post('/signup', async (req, res) => {
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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

   
    res.cookie("token", token, {
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

// Logout endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
   
    res.json(req.user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user', async (req, res) => {
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


app.patch('/user/:id', authMiddleware, async (req, res) => {
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


app.delete('/user', authMiddleware, async (req, res) => {
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


app.get('/feed', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password');
    res.json(allUsers);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Unable to fetch feed' });
  }
});


app.get('/set-cookie', (req, res) => {
  res.cookie('testcookie', 'hello cookie');
  res.json({ message: 'Cookie set successfully' });
});


app.get("/profile-test", (req, res) => {
  console.log(req.cookies);
  res.json({ cookies: req.cookies });
});

app.patch('/profile/edit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const {firstName, lastname, age, gender, skills, about, photoUrl} = req.body; 

    const updatedata = {};
    if (firstName !==undefined) updatedata.firstName = firstName;
    if (lastname !==undefined) updatedata.lastname = lastname;
    if (age !==undefined) updatedata.age = age;
    if ( gender !==undefined) updatedata.gender = gender;
    if (skills !==undefined) updatedata.skills = skills;
    if (about !==undefined) updatedata.about = about;
    if (photoUrl !==undefined) updatedata.photoUrl = photoUrl;

    const user = await User.findByIdAndUpdate(userId, updatedata, { new: true, runValidators: true }).select('-password');

    res.json({ message: 'Profile updated successfully', user: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/profile/password', authMiddleware, async (req, res) => {
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

app.post('/forgot-password', async (req, res) => {
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

app.post('/reset-password', async (req, res) => {
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

    // Verify token
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

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});