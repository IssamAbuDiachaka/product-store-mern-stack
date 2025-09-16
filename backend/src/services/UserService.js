/**
 * User Service - Business logic layer for user operations
 * Handles authentication, user management, and business rules
 */

import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';
import { validateUser, validateLogin, validateUpdateProfile } from '../validators/userValidator.js';

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // Register new user
  async registerUser(userData) {
    try {
      // Validate user data
      const { error, value } = validateUser(userData);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(value.email);
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      // Create user
      const user = await this.userRepository.create(value);

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Save refresh token
      await this.userRepository.addRefreshToken(user._id, refreshToken);

      // Update last login
      await this.userRepository.updateLastLogin(user._id);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Registration failed', 500);
    }
  }

  // Login user
  async loginUser(credentials) {
    try {
      // Validate credentials
      const { error, value } = validateLogin(credentials);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Find user by credentials
      const user = await this.userRepository.findByCredentials(value.email, value.password);

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Save refresh token
      await this.userRepository.addRefreshToken(user._id, refreshToken);

      // Update last login
      await this.userRepository.updateLastLogin(user._id);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            lastLogin: new Date()
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };
    } catch (error) {
      if (error.message === 'Invalid login credentials') {
        throw new AppError('Invalid email or password', 401);
      }
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500);
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if refresh token exists in database
      const isValid = await this.userRepository.verifyRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new tokens
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Replace old refresh token with new one
      await this.userRepository.removeRefreshToken(decoded.id, refreshToken);
      await this.userRepository.addRefreshToken(decoded.id, newRefreshToken);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }
        }
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error instanceof AppError) throw error;
      throw new AppError('Token refresh failed', 500);
    }
  }

  // Logout user
  async logoutUser(userId, refreshToken) {
    try {
      if (refreshToken) {
        await this.userRepository.removeRefreshToken(userId, refreshToken);
      }

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new AppError('Logout failed', 500);
    }
  }

  // Logout from all devices
  async logoutAllDevices(userId) {
    try {
      await this.userRepository.clearRefreshTokens(userId);

      return {
        success: true,
        message: 'Logged out from all devices'
      };
    } catch (error) {
      throw new AppError('Logout from all devices failed', 500);
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch user profile', 500);
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      // Validate update data
      const { error, value } = validateUpdateProfile(updateData);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Check if email is being updated and if it already exists
      if (value.email) {
        const emailExists = await this.userRepository.emailExists(value.email, userId);
        if (emailExists) {
          throw new AppError('Email already in use', 409);
        }
      }

      const updatedUser = await this.userRepository.updateProfile(userId, value);

      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update profile', 500);
    }
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // Get user with password
      const user = await this.userRepository.findByIdWithPassword(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify old password
      const isValidPassword = await user.comparePassword(oldPassword);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Update password
      await this.userRepository.changePassword(userId, newPassword);

      // Clear all refresh tokens (logout from all devices)
      await this.userRepository.clearRefreshTokens(userId);

      return {
        success: true,
        message: 'Password changed successfully. Please login again.'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to change password', 500);
    }
  }

  // Get all users (admin only)
  async getAllUsers(queryParams) {
    try {
      const options = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 10,
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc',
        role: queryParams.role,
        isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : true,
        search: queryParams.search
      };

      const result = await this.userRepository.findAll(options);

      return {
        success: true,
        data: result.users,
        pagination: result.pagination
      };
    } catch (error) {
      throw new AppError('Failed to fetch users', 500);
    }
  }

  // Get user statistics (admin only)
  async getUserStatistics() {
    try {
      const stats = await this.userRepository.getStatistics();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new AppError('Failed to fetch user statistics', 500);
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId, newRole, adminId) {
    try {
      // Prevent admin from changing their own role
      if (userId === adminId) {
        throw new AppError('Cannot change your own role', 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updatedUser = await this.userRepository.updateById(userId, { role: newRole });

      // Clear user's refresh tokens if role changed to force re-login
      await this.userRepository.clearRefreshTokens(userId);

      return {
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update user role', 500);
    }
  }

  // Deactivate user (admin only)
  async deactivateUser(userId, adminId) {
    try {
      // Prevent admin from deactivating themselves
      if (userId === adminId) {
        throw new AppError('Cannot deactivate your own account', 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.userRepository.deleteById(userId);

      // Clear user's refresh tokens
      await this.userRepository.clearRefreshTokens(userId);

      return {
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to deactivate user', 500);
    }
  }

  // Cart operations
  async getCart(userId) {
    try {
      const cart = await this.userRepository.getCart(userId);

      return {
        success: true,
        data: cart
      };
    } catch (error) {
      throw new AppError('Failed to fetch cart', 500);
    }
  }

  async addToCart(userId, productId, quantity = 1) {
    try {
      await this.userRepository.addToCart(userId, productId, quantity);

      return {
        success: true,
        message: 'Product added to cart'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add to cart', 500);
    }
  }

  async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        await this.userRepository.removeFromCart(userId, productId);
        return {
          success: true,
          message: 'Product removed from cart'
        };
      }

      await this.userRepository.updateCartItem(userId, productId, quantity);

      return {
        success: true,
        message: 'Cart updated'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update cart', 500);
    }
  }

  async removeFromCart(userId, productId) {
    try {
      await this.userRepository.removeFromCart(userId, productId);

      return {
        success: true,
        message: 'Product removed from cart'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove from cart', 500);
    }
  }

  async clearCart(userId) {
    try {
      await this.userRepository.clearCart(userId);

      return {
        success: true,
        message: 'Cart cleared'
      };
    } catch (error) {
      throw new AppError('Failed to clear cart', 500);
    }
  }

  // Wishlist operations
  async getWishlist(userId) {
    try {
      const wishlist = await this.userRepository.getWishlist(userId);

      return {
        success: true,
        data: wishlist
      };
    } catch (error) {
      throw new AppError('Failed to fetch wishlist', 500);
    }
  }

  async addToWishlist(userId, productId) {
    try {
      await this.userRepository.addToWishlist(userId, productId);

      return {
        success: true,
        message: 'Product added to wishlist'
      };
    } catch (error) {
      throw new AppError('Failed to add to wishlist', 500);
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      await this.userRepository.removeFromWishlist(userId, productId);

      return {
        success: true,
        message: 'Product removed from wishlist'
      };
    } catch (error) {
      throw new AppError('Failed to remove from wishlist', 500);
    }
  }

  // Search users (admin only)
  async searchUsers(searchTerm, options = {}) {
    try {
      const result = await this.userRepository.search(searchTerm, options);

      return {
        success: true,
        data: result.users,
        pagination: result.pagination,
        searchTerm
      };
    } catch (error) {
      throw new AppError('Failed to search users', 500);
    }
  }
}

export default UserService;
