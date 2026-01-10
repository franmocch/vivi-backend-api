const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('./security/mongoSanitize');
const xssSanitize = require('./security/xssSanitize');
const { createGlobalLimiter } = require('./security/RateLimiter');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

//Security HTTP headers
app.use(helmet());
// Limiters  of request
app.use('/api', createGlobalLimiter());
app.use('/api/v1', userRouter);

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '10kb' }));

// Data sanitazation against NoSQL  query injection and  Data sanitazation against XSS
app.use(mongoSanitize);
app.use(xssSanitize);
//Prevent parameters solutions

app.use(
  hpp({
    whitelist: [], // parameters can be repeated
  })
);
// Mount the user router on the specified path

//app.use('/api/v1/users', userRouter);
app.use('/api/v1', userRouter);

// Handle all undefined routes (404 Not Found)
// This middleware will be triggered if no previous route matches
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
// Catches all operational errors and sends a proper response
app.use(globalErrorHandler);

// Export the app instance so it can be used in server.js
module.exports = app;
