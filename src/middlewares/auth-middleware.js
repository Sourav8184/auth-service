const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { JwtConfig } = require('../config');
const AppError = require('../utils/errors/app-error');

/**
 * AuthMiddleware
 * Handles token verification and role-based access control
 */
class AuthMiddleware {
  /**
   * Verify JWT token
   */
  static verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new AppError('Authorization token is required', StatusCodes.UNAUTHORIZED);
      }

      const decoded = jwt.verify(token, JwtConfig.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', StatusCodes.UNAUTHORIZED);
      }
      throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);
    }
  }

  /**
   * Authorize based on role
   */
  static authorizeRole(...allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new AppError('User not authenticated', StatusCodes.UNAUTHORIZED);
        }

        if (!allowedRoles.includes(req.user.role)) {
          throw new AppError('Insufficient permissions', StatusCodes.FORBIDDEN);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = AuthMiddleware;
