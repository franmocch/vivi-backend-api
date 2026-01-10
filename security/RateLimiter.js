// security/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // <- IMPORTANTE

// Global
const createGlobalLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RL_GLOBAL_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  });

// Sensibles: 5 por hora, clave = IP (normalizada) + email
const createSensitiveLimiter = () =>
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: Number(process.env.RL_SENSITIVE_MAX || 5),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests. Please try again in an hour.',
    keyGenerator: (req /*, res*/) => {
      const ipKey = ipKeyGenerator(req); //
      const email = (req.body?.email || '').toLowerCase();
      return `${ipKey}:${email}`;
    },
  });

module.exports = { createGlobalLimiter, createSensitiveLimiter };
