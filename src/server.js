const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logAndExit = require('./utils/processLogger');

// Must be at the top of the file
process.on('uncaughtException', (err) => logAndExit('UNCAUGHT EXCEPTION', err));
process.on('unhandledRejection', (err) =>
  logAndExit('UNHANDLED REJECTION', err)
);

// Load env vars BEFORE importing app
dotenv.config({ path: './config.env' });

const app = require('./app');

// ---- DB Connection ----
const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.error('DB connection error 💥', err.message || err);
    process.exit(1);
  });

// ---- Start HTTP server ----
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
