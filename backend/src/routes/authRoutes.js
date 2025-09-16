/**
 * Authentication Routes
 * Handles user authentication and authorization endpoints
 */

import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/auth.js';
import { validationMiddleware } from '../middlewares/validation.js';
import { validateUser, validateLogin, validateChangePassword, validateUpdateProfile } from '../validators/userValidator.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // More lenient for general auth operations
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register',
  authLimiter,
  validationMiddleware(validateUser, 'body'),
  authController.register
);

router.post('/login',
  authLimiter,
  validationMiddleware(validateLogin, 'body'),
  authController.login
);

router.post('/refresh-token',
  generalLimiter,
  authController.refreshToken
);

// Protected routes
router.post('/logout',
  generalLimiter,
  authenticate,
  authController.logout
);

router.post('/logout-all',
  generalLimiter,
  authenticate,
  authController.logoutAllDevices
);

router.get('/profile',
  generalLimiter,
  authenticate,
  authController.getProfile
);

router.put('/profile',
  generalLimiter,
  authenticate,
  validationMiddleware(validateUpdateProfile, 'body'),
  authController.updateProfile
);

router.post('/change-password',
  authLimiter,
  authenticate,
  validationMiddleware(validateChangePassword, 'body'),
  authController.changePassword
);

export default router;
