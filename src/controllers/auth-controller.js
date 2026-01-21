const { StatusCodes } = require('http-status-codes');
const { AuthenticationService, AuthorizationService } = require('../services');
const { SuccessResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

/**
 * AuthController
 * Handles all authentication and authorization endpoints
 */

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      throw new AppError(
        'Email or password or firstName or lastName or phoneNumber are required',
        StatusCodes.BAD_REQUEST,
      );
    }

    const result = await AuthenticationService.register({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse(result, 'User registered successfully', StatusCodes.CREATED));
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', StatusCodes.BAD_REQUEST);
    }

    const result = await AuthenticationService.login(email, password);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(result, 'Login successful', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', StatusCodes.BAD_REQUEST);
    }

    const tokens = await AuthenticationService.refreshAccessToken(refreshToken);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(tokens, 'Token refreshed successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token
 * Used by other microservices to verify tokens
 * POST /api/v1/auth/verify-token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;

    if (!token) {
      throw new AppError('Token is required', StatusCodes.BAD_REQUEST);
    }

    const result = AuthenticationService.verifyToken(token);

    if (!result.valid) {
      throw new AppError(result.error, StatusCodes.UNAUTHORIZED);
    }

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(result.user, 'Token is valid', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Validate user access
 * Used by other microservices to check if user has access
 * POST /api/v1/auth/validate-access
 */
const validateAccess = async (req, res, next) => {
  try {
    const { userId, requiredRole } = req.body;

    if (!userId || !requiredRole) {
      throw new AppError('userId and requiredRole are required', StatusCodes.BAD_REQUEST);
    }

    const hasAccess = await AuthorizationService.hasPermission(userId, requiredRole);

    if (!hasAccess) {
      throw new AppError('User does not have required permissions', StatusCodes.FORBIDDEN);
    }

    const user = await AuthorizationService.getUserWithRole(userId);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ user, hasAccess: true }, 'User has access', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Get user info
 * GET /api/v1/auth/user/:userId
 */
const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await AuthorizationService.getUserWithRole(userId);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(user, 'User fetched successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin only)
 * PUT /api/v1/auth/user/:userId/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    if (!newRole) {
      throw new AppError('newRole is required', StatusCodes.BAD_REQUEST);
    }

    const result = await AuthorizationService.updateUserRole(userId, newRole);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(result, 'User role updated successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user (Admin only)
 * PUT /api/v1/auth/user/:userId/deactivate
 */
const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await AuthorizationService.deactivateUser(userId);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(result, 'User deactivated successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user (Admin only)
 * PUT /api/v1/auth/user/:userId/activate
 */
const activateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await AuthorizationService.activateUser(userId);

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(result, 'User activated successfully', StatusCodes.OK));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyToken,
  validateAccess,
  getUser,
  updateUserRole,
  deactivateUser,
  activateUser,
};
