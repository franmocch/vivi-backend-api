const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { createSensitiveLimiter } = require('../security/RateLimiter');

const router = express.Router();

/**
 * AUTH ROUTES  (/auth/*)
 * Public endpoints with rate-limit due to brute-force risk.
 */
router.post('/auth/signup', createSensitiveLimiter(), authController.signUp);
router.post('/auth/login', createSensitiveLimiter(), authController.login);
router.post(
  '/auth/forgot-password',
  createSensitiveLimiter(),
  authController.forgotPassword
);
router.patch(
  '/auth/reset-password/:token',
  createSensitiveLimiter(),
  authController.resetPassword
);

// Optional: refresh/logout if you implement refresh tokens/cookies
// router.post('/auth/refresh', createSensitiveLimiter(), authController.refreshToken);
// router.post('/auth/logout', authController.protect, authController.logout);

/**
 * SELF-SERVICE ROUTES  (/me/*)
 * User manages their own account. Everything below requires authentication.
 */
router.use(authController.protect);

// Get my profile
// getMe sets req.params.id = req.user.id, then reuses getUserByID
router.get('/me', userController.getMe, userController.getUserByID);

// Update my public profile fields (controller must whitelist fields)
router.patch('/me', userController.updateMe);

// Update my password (sensitive → extra limiter)
router.patch(
  '/me/password',
  createSensitiveLimiter(),
  authController.updatePassword
);

// Soft delete my account (sets active:false)
router.delete('/me', userController.deleteMe);

/**
 * ADMIN ROUTES  (/users/*)
 * Only admins/superadmins can manage other users.
 */
router.use(authController.restrictTo('admin', 'superadmin'));

// List & create users
router
  .route('/users')
  .get(userController.getAllUsers) // supports filters: ?lastName=, ?active=true, pagination, etc.
  .post(userController.createNewUser); // admin-only creation

// CRUD by ID
router
  .route('/users/:id')
  .get(userController.getUserByID)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
