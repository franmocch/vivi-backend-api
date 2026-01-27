/**
 * Set JWT as a secure cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
/**
 * Set JWT as a secure cookie
 */
exports.setTokenCookie = () => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProd, // HTTPS only in production (Render)
    sameSite: isProd ? 'none' : 'lax', // 👈 REQUIRED for cross-site cookies
  };
};
/**
 * Clear JWT cookie (logout)
 * @param {Object} res - Express response object
 */
/*exports.clearTokenCookie = (res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // expire in 10s
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};*/
