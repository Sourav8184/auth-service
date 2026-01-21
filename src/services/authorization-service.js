const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const AppError = require('../utils/errors/app-error');

/**
 * AuthorizationService
 * Centralized service for user authorization
 * - Role verification
 * - Permission checking
 * - Access control
 * - User role management
 */
class AuthorizationService {
  /**
   * Check if user has specific role
   */
  static async hasRole(userId, requiredRoles) {
    try {
      const user = await User.findByPk(userId);

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', StatusCodes.UNAUTHORIZED);
      }

      if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(user.role);
      }

      return user.role === requiredRoles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check user permission based on role hierarchy
   */
  static async hasPermission(userId, requiredRole) {
    try {
      const user = await User.findByPk(userId);

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', StatusCodes.UNAUTHORIZED);
      }

      const roleHierarchy = {
        admin: 10,
        moderator: 5,
        user: 1,
      };

      const userRoleLevel = roleHierarchy[user.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is active
   */
  static async isUserActive(userId) {
    try {
      const user = await User.findByPk(userId);
      return user && user.isActive;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user with role info
   */
  static async getUserWithRole(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
      });

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user can access resource
   */
  static async canAccessResource(userId, resourceOwnerId, userRole = 'user') {
    try {
      if (userRole === 'admin') {
        return true;
      }

      return userId === resourceOwnerId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId, newRole) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      await user.update({ role: newRole });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      await user.update({ isActive: false });

      return { message: 'User deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activate user
   */
  static async activateUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      await user.update({ isActive: true });

      return { message: 'User activated successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthorizationService;
