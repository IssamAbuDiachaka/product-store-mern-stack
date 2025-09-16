/**
 * User Routes - User management and profile operations
 * Includes cart and wishlist management
 */

import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validationMiddleware } from '../middlewares/validation.js';
import { validateCartItem, validateWishlistItem, validateUserQuery, validateUpdateRole } from '../validators/userValidator.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const userController = new UserController();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each user to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Protected user routes - require authentication
router.use(authenticate);

// User profile and account management
router.get('/profile', 
  generalLimiter,
  userController.getProfile
);

// Cart operations
router.get('/cart',
  generalLimiter,
  userController.getCart
);

router.post('/cart',
  generalLimiter,
  validationMiddleware(validateCartItem, 'body'),
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
  validationMiddleware(validateWishlistItem, 'body'),
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
  validationMiddleware(validateUserQuery, 'query'),
  userController.getAllUsers
);

router.get('/admin/statistics',
  authorize('admin'),
  userController.getUserStatistics
);

router.patch('/admin/:userId/role',
  authorize('admin'),
  validationMiddleware(validateUpdateRole, 'body'),
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
