const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { createSensitiveLimiter } = require('../security/RateLimiter');

const router = express.Router();

///////////          SENSITIVES                 ///////////////////////////////////////////////
router.post('/signup', createSensitiveLimiter(), authController.singUp);
router.post('/login', createSensitiveLimiter(), authController.login);
router.post(
  '/forgotPassword',
  createSensitiveLimiter(),
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  createSensitiveLimiter(),
  authController.resetPassword
);
/////////////// ITSELF UPDATES  //////////////////////////////////////////////////////////

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
/////////////// THIRDS PASRTS UPDATES  //////////////////////////////////////////////////////////

router
  .route('/lastname/:lastName')
  .get(authController.protect, userController.getUsersbyLastName);
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(authController.protect, userController.createNewUser);
router
  .route('/id/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'superadmin'),
    userController.getUserbyID
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'superadmin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'superadmin'),
    userController.deleteUser
  );

module.exports = router;
