/**
 * Auth Controller - Authentication and Authorization
 * Handles user authentication, registration, and session management
 */

import UserService from '../services/UserService.js';
import { catchAsync } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  // User registration
  register = catchAsync(async (req, res) => {
    const result = await this.userService.registerUser(req.body);

    // Set secure HTTP-only cookies
    this.setTokenCookies(res, result.data.tokens);

    logger.logAuth('user_registered', result.data.user.id, {
      email: result.data.user.email,
      role: result.data.user.role
    });

    // Remove tokens from response body for security
    const response = {
      ...result,
      data: {
        user: result.data.user
      }
    };

    res.status(201).json(response);
  });

  // User login
  login = catchAsync(async (req, res) => {
    const result = await this.userService.loginUser(req.body);

    // Set secure HTTP-only cookies
    this.setTokenCookies(res, result.data.tokens);

    logger.logAuth('user_login', result.data.user.id, {
      email: result.data.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Remove tokens from response body for security
    const response = {
      ...result,
      data: {
        user: result.data.user
      }
    };

    res.status(200).json(response);
  });

  // Refresh access token
  refreshToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await this.userService.refreshToken(refreshToken);

    // Set new tokens in cookies
    this.setTokenCookies(res, result.data.tokens);

    logger.logAuth('token_refreshed', null, {
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  });

  // User logout
  logout = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (req.user && refreshToken) {
      await this.userService.logoutUser(req.user.id, refreshToken);
      
      logger.logAuth('user_logout', req.user.id, {
        ip: req.ip
      });
    }

    // Clear cookies
    this.clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  // Logout from all devices
  logoutAllDevices = catchAsync(async (req, res) => {
    await this.userService.logoutAllDevices(req.user.id);

    logger.logAuth('user_logout_all_devices', req.user.id, {
      ip: req.ip
    });

    // Clear cookies
    this.clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  });

  // Get current user profile
  getProfile = catchAsync(async (req, res) => {
    const result = await this.userService.getUserProfile(req.user.id);
    res.status(200).json(result);
  });

  // Update user profile
  updateProfile = catchAsync(async (req, res) => {
    const result = await this.userService.updateUserProfile(req.user.id, req.body);

    logger.logBusiness('profile_updated', {
      userId: req.user.id
    });

    res.status(200).json(result);
  });

  // Change password
  changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await this.userService.changePassword(req.user.id, oldPassword, newPassword);

    logger.logAuth('password_changed', req.user.id, {
      ip: req.ip
    });

    // Clear cookies to force re-login
    this.clearTokenCookies(res);

    res.status(200).json(result);
  });

  // Helper method to set secure cookies
  setTokenCookies(res, tokens) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Access token cookie (shorter expiration)
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Refresh token cookie (longer expiration)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  // Helper method to clear cookies
  clearTokenCookies(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}

export default AuthController;
