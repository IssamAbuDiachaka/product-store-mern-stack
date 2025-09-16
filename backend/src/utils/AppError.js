/**
 * Application Error Class
 * Custom error handling for consistent error responses
 */

export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

// Error factory functions
export const createValidationError = (message) => {
  return new AppError(message, 400);
};

export const createAuthenticationError = (message = 'Authentication required') => {
  return new AppError(message, 401);
};

export const createAuthorizationError = (message = 'Insufficient permissions') => {
  return new AppError(message, 403);
};

export const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404);
};

export const createDuplicateError = (field) => {
  return new AppError(`${field} already exists`, 409);
};

export const createRateLimitError = (message = 'Too many requests') => {
  return new AppError(message, 429);
};

// Error handler for async functions
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// MongoDB duplicate key error handler
export const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return new AppError(`${field} already exists`, 409);
};

// MongoDB validation error handler
export const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  return new AppError(`Validation Error: ${errors.join('. ')}`, 400);
};

// JWT error handlers
export const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

export const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Cast error handler for invalid MongoDB ObjectIds
export const handleCastError = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};
