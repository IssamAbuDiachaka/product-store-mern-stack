/**
 * Authentication Routes - Dedicated auth endpoints
 * Handles user authentication and session management
 */

import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/auth.js';
import { validationMiddleware } from '../middlewares/validation.js';
import { validateUser, validateLogin, validateChangePassword } from '../validators/userValidator.js';
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
router.use(authenticate);

router.post('/logout',
  generalLimiter,
  authController.logout
);

router.post('/logout-all',
  generalLimiter,
  authController.logoutAllDevices
);

router.get('/me',
  generalLimiter,
  authController.getProfile
);

router.put('/profile',
  generalLimiter,
  authController.updateProfile
);

router.post('/change-password',
  authLimiter,
  validationMiddleware(validateChangePassword, 'body'),
  authController.changePassword
);

export default router;
