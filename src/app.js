const express = require('express');
const connectDB = require('../config/database');
const app = express();
const cookieParser = require('cookie-parser');
const coreRoutes = require('../routes/core');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile');
const userRoutes = require('../routes/user');
const feedRoutes = require('../routes/feed');
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/', coreRoutes);
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', userRoutes);
app.use('/', feedRoutes);

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});