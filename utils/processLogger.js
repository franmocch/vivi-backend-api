// Utility for logging fatal process errors and exiting
module.exports = function logAndExit(reason, err) {
  console.error(`${reason} 💥 Shutting down...`);
  if (err) {
    console.error(err.name || 'Error', err.message || err);
    if (err.stack) console.error(err.stack);
  }
  process.exit(1);
};
