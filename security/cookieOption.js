/**
 * Set JWT as a secure cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
exports.setTokenCookie = () => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Client JS cannot access the cookie
    secure: process.env.NODE_ENV === 'production', // Only sent via HTTPS in prod
    sameSite: 'lax', // Mitigate CSRF; use 'strict' if FE and BE same domain
  };

  return cookieOptions;
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
