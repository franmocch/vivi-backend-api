const express = require('express');
const authController = require('../controllers/authController');
const { createSensitiveLimiter } = require('../security/RateLimiter');

const router = express.Router();

// Sensitive endpoints
router.post('/signup', createSensitiveLimiter(), authController.signUp);
router.post('/login', createSensitiveLimiter(), authController.login);
router.post(
  '/forgot-password',
  createSensitiveLimiter(),
  authController.forgotPassword
);
router.patch(
  '/reset-password/:token',
  createSensitiveLimiter(),
  authController.resetPassword
);

// Logged-in users can update their password
router.patch(
  '/update-password',
  createSensitiveLimiter(),
  authController.protect,
  authController.updatePassword
);

module.exports = router;
