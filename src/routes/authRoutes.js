const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// Define the login route
router.post('/login', loginUser);

module.exports = router;
