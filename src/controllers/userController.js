const User = require('../models/userModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Can not update password from this route. Please /updateMyPassword',
        400
      )
    );
  }
  // 2) Filtering unwanted fields not allowed to updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3) Update User document

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));

  user.active = false;
  await user.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getMe = (req, _res, next) => {
  req.params.id = req.user.id;
  next();
};

/*  // TO CHECK AGAIN */
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getUserByID = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.createNewUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query, {
    filterConfig: {
      lastName: { type: 'prefix', minLength: 2 },
      email: { type: 'regex', minLength: 2 },
      active: { type: 'exact' },
    },
    defaultFields: 'name lastName email idType idNumber birthDate',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});
