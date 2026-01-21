const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '3d',
};
