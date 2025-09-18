/**
 * User Routes - Complete user management routes
 * Handles authentication, profile, cart, and admin operations
 */

import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validationMiddleware } from '../middlewares/validation.js';
import { validateCartItem, validateWishlistItem, validateUserQuery, validateUpdateRole } from '../validators/userValidator.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();
const userController = new UserController();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each user to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes - Authentication
router.post('/register', 
  generalLimiter,
  authController.register
);

router.post('/login', 
  generalLimiter,
  authController.login
);

// Protected user routes - require authentication
router.use(authenticate);

router.get('/profile', 
  generalLimiter,
  authController.getProfile
);

router.put('/profile',
  generalLimiter,
  authController.updateProfile
);

router.post('/logout', 
  generalLimiter,
  authController.logout
);

router.post('/logout-all',
  generalLimiter, 
  authController.logoutAllDevices
);

router.post('/change-password',
  generalLimiter,
  authController.changePassword
);

// Cart operations
router.get('/cart',
  generalLimiter,
  userController.getCart
);

router.post('/cart',
  generalLimiter,
  userController.addToCart
);

router.put('/cart/:productId',
  generalLimiter,
  userController.updateCartItem
);

router.delete('/cart/:productId',
  generalLimiter,
  userController.removeFromCart
);

router.delete('/cart',
  generalLimiter,
  userController.clearCart
);

// Wishlist operations
router.get('/wishlist',
  generalLimiter,
  userController.getWishlist
);

router.post('/wishlist',
  generalLimiter,
  userController.addToWishlist
);

router.delete('/wishlist/:productId',
  generalLimiter,
  userController.removeFromWishlist
);

// User orders
router.get('/orders',
  generalLimiter,
  userController.getUserOrders
);

// Admin-only routes
router.get('/admin/all',
  authorize('admin'),
  userController.getAllUsers
);

router.get('/admin/statistics',
  authorize('admin'),
  userController.getUserStatistics
);

router.patch('/admin/:userId/role',
  authorize('admin'),
  userController.updateUserRole
);

router.patch('/admin/:userId/deactivate',
  authorize('admin'),
  userController.deactivateUser
);

router.get('/admin/search',
  authorize('admin'),
  userController.searchUsers
);

export default router;
