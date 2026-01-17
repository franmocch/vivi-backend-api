// ─────────────────────────────
// External dependencies
// ─────────────────────────────
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

// ─────────────────────────────
// Internal libraries / config
// ─────────────────────────────
const swaggerSpec = require('./docs');
const mongoSanitize = require('./security/mongoSanitize');
const xssSanitize = require('./security/xssSanitize');
const { createGlobalLimiter } = require('./security/RateLimiter');

// ─────────────────────────────
// Routes & controllers
// ─────────────────────────────
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// Security HTTP headers
app.use(helmet());

// Limiters of request
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', createGlobalLimiter());
}

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection and XSS
app.use(mongoSanitize);
app.use(xssSanitize);

// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

//  Swagger MUST go before 404 & error handler
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Health check (for CI & monitoring)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1', userRouter);

// Handle all undefined routes (404 Not Found)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware (ALWAYS last)
app.use(globalErrorHandler);

module.exports = app;
