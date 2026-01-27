const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

/* ME (self-service) */
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUserByID);
router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

/* USERS (admin) */
router.use(authController.restrictTo('admin', 'superadmin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);

router
  .route('/:id')
  .get(userController.getUserByID)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
