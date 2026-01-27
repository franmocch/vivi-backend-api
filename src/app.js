// ─────────────────────────────
// External dependencies
// ─────────────────────────────
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');

// ─────────────────────────────
// Internal config & libraries
// ─────────────────────────────
const corsMiddleware = require('./config/cors');
const setupSwagger = require('./config/swagger');
const mongoSanitize = require('./security/mongoSanitize');
const xssSanitize = require('./security/xssSanitize');
const { createGlobalLimiter } = require('./security/RateLimiter');

// ─────────────────────────────
// Routes & controllers
// ─────────────────────────────
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

// ─────────────────────────────
// App initialization
// ─────────────────────────────
const app = express();

// ─────────────────────────────
// Global security middlewares
// ─────────────────────────────

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(corsMiddleware);

// Global rate limiter (disabled in tests)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', createGlobalLimiter());
}

// ─────────────────────────────
// Body parsing & sanitization
// ─────────────────────────────

// Parse incoming JSON
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL injection & XSS
app.use(mongoSanitize);
app.use(xssSanitize);

// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

// ─────────────────────────────
// API documentation (Swagger)
// ─────────────────────────────

// Swagger setup (configurable via env)
setupSwagger(app);

// ─────────────────────────────
// Health check (monitoring & CI)
// ─────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ─────────────────────────────
// API routes
// ─────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// ─────────────────────────────
// 404 handler
// ─────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ─────────────────────────────
// Global error handler (ALWAYS LAST)
// ─────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
