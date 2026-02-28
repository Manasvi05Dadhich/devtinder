const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

router.get('/set-cookie', (req, res) => {
  res.cookie('testcookie', 'hello cookie');
  res.json({ message: 'Cookie set successfully' });
});

router.get('/profile-test', (req, res) => {
  console.log(req.cookies);
  res.json({ cookies: req.cookies });
});

module.exports = router;
