const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { createSensitiveLimiter } = require('../security/RateLimiter');

const router = express.Router();

/* AUTH */
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

/* ME */
router.use(authController.protect);
router.get('/me', userController.getMe, userController.getUserByID);
router.patch('/me', userController.updateMe);
router.patch(
  '/me/password',
  createSensitiveLimiter(),
  authController.updatePassword
);
router.delete('/me', userController.deleteMe);

/* USERS (admin) */
router.use(authController.restrictTo('admin', 'superadmin'));
router
  .route('/users')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);
router
  .route('/users/:id')
  .get(userController.getUserByID)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
