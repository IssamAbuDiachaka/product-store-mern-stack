/**
 * Validation Middleware
 * Handles request validation using Joi schemas
 */

import { AppError } from '../utils/AppError.js';

// Generic validation middleware
export const validationMiddleware = (validationSchema, source = 'body', isUpdate = false) => {
  return (req, res, next) => {
    let dataToValidate;
    
    // Get data based on source
    switch (source) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      case 'headers':
        dataToValidate = req.headers;
        break;
      default:
        dataToValidate = req.body;
    }

    // Validate data
    const { error, value } = validationSchema(dataToValidate, isUpdate);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('. ');
      return next(new AppError(errorMessage, 400));
    }

    // Replace original data with validated data
    switch (source) {
      case 'body':
        req.body = value;
        break;
      case 'query':
        req.query = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'headers':
        req.headers = value;
        break;
    }

    next();
  };
};

// Middleware to validate MongoDB ObjectId
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdPattern.test(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

// Middleware to validate required fields
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }
    
    next();
  };
};

// Middleware to sanitize input
export const sanitizeInput = (req, res, next) => {
  // Remove any fields that start with $ or contain dots (prevent NoSQL injection)
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};

export default {
  validationMiddleware,
  validateObjectId,
  validateRequiredFields,
  sanitizeInput
};
