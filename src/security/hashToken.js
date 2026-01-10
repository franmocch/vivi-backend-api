const crypto = require('crypto');

/**
 * Hash a given token using sha256
 * @param {string} token - Raw token (usually from URL or generated string)
 * @returns {string} - Hashed token in hex format
 */
const hashToken = (token) => {
  if (!token) throw new Error('Token is required to hash');
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = hashToken;
