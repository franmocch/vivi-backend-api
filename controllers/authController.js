const { signToken, verifyToken } = require('../security/signToken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const hashToken = require('../security/hashToken ');
const { setTokenCookie } = require('../security/cookieOption');

const createSendToken = (user, statusCode, res) => {
  //Generate token
  const token = signToken(user._id);
  //Generate Cookie
  const cookie = setTokenCookie();
  res.cookie('jwt', token, cookie);
  // Hide password before sending user
  user.password = undefined;
  //Send Status
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const {
    name,
    lastName,
    email,
    password,
    passwordConfirm,
    birthDate,
    idType,
    idNumber,
    passwordChangedAt,
    role,
    active,
  } = req.body;

  const newUser = await User.create({
    name,
    lastName,
    email,
    password,
    passwordConfirm,
    birthDate,
    idType,
    idNumber,
    passwordChangedAt,
    role,
    active,
  });

  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Find user + explicitly select password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));

  // 2) Generate the random reset token + persist hashed version + expiry
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // we’re not changing required fields

  // 3) Build reset URL
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `
    You requested a password reset.\n
    Submit a PATCH request with your new password and passwordConfirm to:\n
    ${resetURL}\n\n
    If you didn't request this, please ignore this email.
  `;

  try {
    // 4) Send email with reset link
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // If email sending fails, clean token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Hash the token from the URL to compare with DB
  const hashedToken = hashToken(req.params.token);

  // 2) Find user by token and check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // 3) Set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save(); // validators run here

  // 4)  Log user in again by sending JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2) Check if POSTed current password is correct
  const correct = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!correct) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // save() triggers pre-save hooks (hashing, timestamps, etc.)

  // 4) Log user in, send new JWT
  createSendToken(user, 200, res);
});
const getTokenFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  } /*
  if (req.cookies && req.cookies.jwt) return req.cookies.jwt;*/
  return null;
};
exports.protect = catchAsync(async (req, res, next) => {
  //  Check if the req has a  valid token

  // 1) Get token
  const token = getTokenFromRequest(req);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = await verifyToken(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (
    currentUser.changedPasswordAfter &&
    currentUser.changedPasswordAfter(decoded.iat)
  ) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // 5) Grant access
  req.user = currentUser;
  //res.locals.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized', 403));
    }
    next();
  };
