const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/me', authController.protect, authController.getMe);

// Update password
router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;