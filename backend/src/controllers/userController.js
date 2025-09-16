/**
 * User Controller - User management and profile operations
 * Handles user-related operations, cart, wishlist, and admin functions
 */

import UserService from '../services/UserService.js';
import { catchAsync } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // Get current user profile
  getProfile = catchAsync(async (req, res) => {
    const result = await this.userService.getUserProfile(req.user.id);
    res.status(200).json(result);
  });

  // Cart operations
  getCart = catchAsync(async (req, res) => {
    const result = await this.userService.getCart(req.user.id);
    res.status(200).json(result);
  });

  addToCart = catchAsync(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const result = await this.userService.addToCart(req.user.id, productId, quantity);

    logger.logBusiness('item_added_to_cart', {
      userId: req.user.id,
      productId,
      quantity
    });

    res.status(200).json(result);
  });

  updateCartItem = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const result = await this.userService.updateCartItem(req.user.id, productId, quantity);

    logger.logBusiness('cart_item_updated', {
      userId: req.user.id,
      productId,
      quantity
    });

    res.status(200).json(result);
  });

  removeFromCart = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const result = await this.userService.removeFromCart(req.user.id, productId);

    logger.logBusiness('item_removed_from_cart', {
      userId: req.user.id,
      productId
    });

    res.status(200).json(result);
  });

  clearCart = catchAsync(async (req, res) => {
    const result = await this.userService.clearCart(req.user.id);

    logger.logBusiness('cart_cleared', {
      userId: req.user.id
    });

    res.status(200).json(result);
  });

  // Wishlist operations
  getWishlist = catchAsync(async (req, res) => {
    const result = await this.userService.getWishlist(req.user.id);
    res.status(200).json(result);
  });

  addToWishlist = catchAsync(async (req, res) => {
    const { productId } = req.body;
    const result = await this.userService.addToWishlist(req.user.id, productId);

    logger.logBusiness('item_added_to_wishlist', {
      userId: req.user.id,
      productId
    });

    res.status(200).json(result);
  });

  removeFromWishlist = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const result = await this.userService.removeFromWishlist(req.user.id, productId);

    logger.logBusiness('item_removed_from_wishlist', {
      userId: req.user.id,
      productId
    });

    res.status(200).json(result);
  });

  // User orders
  getUserOrders = catchAsync(async (req, res) => {
    // This would typically call OrderService instead of UserService
    // But for simplicity, we'll assume UserService has this method
    const result = await this.userService.getUserOrders?.(req.user.id, req.query) || {
      success: true,
      message: 'Orders endpoint - would be implemented via OrderService',
      data: []
    };
    
    res.status(200).json(result);
  });

  // Admin operations
  getAllUsers = catchAsync(async (req, res) => {
    const result = await this.userService.getAllUsers(req.query);

    logger.logBusiness('users_list_accessed', {
      adminId: req.user.id,
      filters: req.query
    });

    res.status(200).json(result);
  });

  getUserStatistics = catchAsync(async (req, res) => {
    const result = await this.userService.getUserStatistics();

    logger.logBusiness('user_statistics_accessed', {
      adminId: req.user.id
    });

    res.status(200).json(result);
  });

  updateUserRole = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    const result = await this.userService.updateUserRole(userId, role, req.user.id);

    logger.logBusiness('user_role_updated', {
      adminId: req.user.id,
      targetUserId: userId,
      newRole: role
    });

    res.status(200).json(result);
  });

  deactivateUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await this.userService.deactivateUser(userId, req.user.id);

    logger.logBusiness('user_deactivated', {
      adminId: req.user.id,
      targetUserId: userId
    });

    res.status(200).json(result);
  });

  searchUsers = catchAsync(async (req, res) => {
    const { q: searchTerm, ...options } = req.query;
    const result = await this.userService.searchUsers(searchTerm, options);

    logger.logBusiness('users_searched', {
      adminId: req.user.id,
      searchTerm,
      resultsCount: result.data?.length || 0
    });

    res.status(200).json(result);
  });
}

export default UserController;
