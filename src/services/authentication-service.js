const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JwtConfig } = require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { AuthRepository } = require('../repositories');
const authRepository = new AuthRepository();

/**
 * AuthenticationService
 * Centralized service for user authentication
 * - User registration
 * - User login
 * - Password hashing & verification
 * - JWT token generation & refresh
 */
class AuthenticationService {
  /**
   * Register new user
   */
  static async register(data) {
    try {
      const existingUser = await authRepository.getByFilter({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError('User already exists with this email', StatusCodes.CONFLICT);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await authRepository.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });

      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(email, password) {
    try {
      const user = await authRepository.getByFilter({ where: { email } });

      if (!user) {
        throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
      }

      if (!user.isActive) {
        throw new AppError('User account is inactive', StatusCodes.FORBIDDEN);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
      }

      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(user) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JwtConfig.JWT_SECRET,
      {
        expiresIn: JwtConfig.JWT_EXPIRY,
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JwtConfig.JWT_SECRET,
      {
        expiresIn: JwtConfig.REFRESH_TOKEN_EXPIRY,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: JwtConfig.JWT_EXPIRY,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JwtConfig.JWT_SECRET);

      const user = await authRepository.get(decoded.id);

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
    }
  }

  /**
   * Verify token validity
   * Used by other services to validate tokens
   */
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JwtConfig.JWT_SECRET);
      return {
        valid: true,
        user: decoded,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        };
      }
      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
        };
      }
      return {
        valid: false,
        error: 'Token verification failed',
        code: 'VERIFICATION_FAILED',
      };
    }
  }
}

module.exports = AuthenticationService;
