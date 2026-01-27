// ─────────────────────────────
// Environment variables
// ─────────────────────────────
const dotenv = require('dotenv');

// Load env vars BEFORE anything else
dotenv.config({ path: './src/config/config.env' });

// ─────────────────────────────
// External dependencies
// ─────────────────────────────
const mongoose = require('mongoose');

// ─────────────────────────────
// Internal utilities
// ─────────────────────────────
const logAndExit = require('./utils/processLogger');

// ─────────────────────────────
// Process-level error handling
// ─────────────────────────────
process.on('uncaughtException', (err) => {
  logAndExit('UNCAUGHT EXCEPTION', err);
});

process.on('unhandledRejection', (err) => {
  logAndExit('UNHANDLED REJECTION', err);
});

// ─────────────────────────────
// App import (AFTER env is loaded)
// ─────────────────────────────
const app = require('./app');

// ─────────────────────────────
// Database connection
// ─────────────────────────────
const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

if (!DB) {
  console.error(
    '❌ Missing DATABASE or DATABASE_PASSWORD. Check src/config/config.env'
  );
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(() => {
    console.log('✅ DB connection successful!');
  })
  .catch((err) => {
    console.error('💥 DB connection error', err.message || err);
    process.exit(1);
  });

// ─────────────────────────────
// Start HTTP server
// ─────────────────────────────
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// ─────────────────────────────
// Graceful shutdown (optional but pro)
// ─────────────────────────────
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
