import jwt from 'jsonwebtoken';

/**
 * Create a signed access token.
 * @param {object} payload - The JWT payload (e.g., { id, email, role }).
 * @returns {string} Signed JWT access token.
 */
export const createAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRE || '15m';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Create a signed refresh token.
 * @param {object} payload - The JWT payload (same as for access token).
 * @returns {string} Signed JWT refresh token.
 */
export const createRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh';
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};
