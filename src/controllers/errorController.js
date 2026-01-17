const cloneError = require('../utils/cloneError');
const AppError = require('../utils/appError');

const handleJsonWebErrorDB = () =>
  new AppError('Invalid token . Please log-in again!', 401);
const handleTokenExpiredErrorDB = () =>
  new AppError('Your token has expired!. Please log-in again!', 401);
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;

  return new AppError(message, 400);
};
const handleDuplicatedFieldsDB = (err) => {
  const fields = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'field';
  const values = err.keyValue ? Object.values(err.keyValue).join(', ') : '';
  const message = `Duplicate value for ${fields}${values ? `: ${values}` : ''}. Please use another value.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors || {}).map((e) => e.message);
  return new AppError(`Invalid input data. ${messages.join(' ')}`, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // Operational, trusted  error:  send  message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknow error

    console.error('Error💥💣', err);
    res.status(500).json({
      status: 'error',
      stack: 'Something went wrong!',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = cloneError(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicatedFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebErrorDB();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredErrorDB();
    }
    sendErrorProduction(error, res);
  }
};
