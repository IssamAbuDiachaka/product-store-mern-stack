/**
 * Authentication and Authorization Middleware
 * JWT token verification and role-based access control
 */

import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { AppError, catchAsync } from '../utils/AppError.js';
import logger from '../utils/logger.js';

const userRepository = new UserRepository();

// Middleware to authenticate user with JWT token
export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // Get token from cookies or Authorization header
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access token is required. Please login.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if user still exists
    const currentUser = await userRepository.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User no longer exists. Please login again.', 401));
    }

    // Check if user account is active
    if (!currentUser.isActive) {
      return next(new AppError('Account is deactivated. Contact support.', 401));
    }

    // Attach user to request
    req.user = {
      id: currentUser._id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please refresh your token.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token. Please login again.', 401));
    }
    return next(new AppError('Token verification failed.', 401));
  }
});

// Middleware to check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.logAuth('unauthorized_access_attempt', req.user.id, {
        requiredRoles: roles,
        userRole: req.user.role,
        route: req.originalUrl,
        ip: req.ip
      });

      return next(new AppError('Insufficient permissions to access this resource.', 403));
    }

    next();
  };
};

// Optional authentication - don't fail if no token
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from cookies or Authorization header
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const currentUser = await userRepository.findById(decoded.id);
    
    if (currentUser && currentUser.isActive) {
      req.user = {
        id: currentUser._id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug(`Optional auth failed: ${error.message}`);
  }

  next();
});

// Middleware to check if user owns the resource
export const checkOwnership = (resourceIdField = 'id', userIdField = 'customer') => {
  return catchAsync(async (req, res, next) => {
    // Skip ownership check for admins
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[resourceIdField];
    
    // For resources that have a user/customer field, we need to fetch and check
    // This is a simplified example - in reality, you'd check based on resource type
    if (req.user.id !== resourceId && req.user.role !== 'admin') {
      return next(new AppError('Access denied. You can only access your own resources.', 403));
    }

    next();
  });
};

// Middleware to validate request body size
export const validateRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length']);
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      return next(new AppError(`Request body too large. Maximum size is ${maxSize}.`, 413));
    }
    
    next();
  };
};

// Middleware for API versioning
export const apiVersion = (version) => {
  return (req, res, next) => {
    req.apiVersion = version;
    res.set('API-Version', version);
    next();
  };
};

// Helper function to parse size strings
function parseSize(size) {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toString().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return value * (units[unit] || 0);
}

// Middleware to log requests
export const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Log response when it finishes
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware to add request ID
export const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.set('X-Request-ID', req.id);
  next();
};

// Middleware to add security headers
export const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
};

export default {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  validateRequestSize,
  apiVersion,
  logRequest,
  requestId,
  securityHeaders
};
