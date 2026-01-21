const express = require('express');
const AuthController = require('../../controllers/auth-controller');
const AuthMiddleware = require('../../middlewares/auth-middleware');

const router = express.Router();

/**
 * Public Routes - No authentication required
 */

// User registration
router.post('/register', AuthController.register);

// User login
router.post('/login', AuthController.login);

// Refresh token
router.post('/refresh-token', AuthController.refreshToken);

/**
 * Protected Routes - Authentication required
 */

// Verify token (used by other microservices)
router.post('/verify-token', AuthController.verifyToken);

// Validate access (used by other microservices)
router.post('/validate-access', AuthController.validateAccess);

// Get user info
router.get('/user/:userId', AuthMiddleware.verifyToken, AuthController.getUser);

/**
 * Admin Routes - Admin role required
 */

// Update user role
router.put(
  '/user/:userId/role',
  AuthMiddleware.verifyToken,
  AuthMiddleware.authorizeRole('admin'),
  AuthController.updateUserRole,
);

// Deactivate user
router.put(
  '/user/:userId/deactivate',
  AuthMiddleware.verifyToken,
  AuthMiddleware.authorizeRole('admin'),
  AuthController.deactivateUser,
);

// Activate user
router.put(
  '/user/:userId/activate',
  AuthMiddleware.verifyToken,
  AuthMiddleware.authorizeRole('admin'),
  AuthController.activateUser,
);

module.exports = router;
