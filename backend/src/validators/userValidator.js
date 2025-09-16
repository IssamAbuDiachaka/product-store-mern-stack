/**
 * User Validation Schemas
 * Joi validation schemas for user-related operations
 */

import Joi from 'joi';

// User registration validation
export const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),

    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      }),

    role: Joi.string()
      .valid('customer', 'admin')
      .default('customer')
      .messages({
        'any.only': 'Role must be either customer or admin'
      }),

    phone: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),

    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(50).default('Ghana')
    }).optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// User login validation
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Update profile validation
export const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .optional()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),

    email: Joi.string()
      .email()
      .lowercase()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),

    phone: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),

    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid avatar URL'
      }),

    address: Joi.object({
      street: Joi.string().max(100).optional().allow(''),
      city: Joi.string().max(50).optional().allow(''),
      state: Joi.string().max(50).optional().allow(''),
      zipCode: Joi.string().max(20).optional().allow(''),
      country: Joi.string().max(50).optional().allow('')
    }).optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Change password validation
export const validateChangePassword = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),

    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'New password is required'
      }),

    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// User query validation (for admin operations)
export const validateUserQuery = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid(
      'name', 'email', 'createdAt', 'lastLogin', 'role'
    ).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    role: Joi.string().valid('customer', 'admin').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().min(2).max(100).optional(),
    emailVerified: Joi.boolean().optional()
  });

  return schema.validate(query, { abortEarly: false });
};

// Update user role validation (admin only)
export const validateUpdateRole = (data) => {
  const schema = Joi.object({
    role: Joi.string()
      .valid('customer', 'admin')
      .required()
      .messages({
        'any.only': 'Role must be either customer or admin',
        'any.required': 'Role is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Cart item validation
export const validateCartItem = (data) => {
  const schema = Joi.object({
    productId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid product ID format',
        'any.required': 'Product ID is required'
      }),

    quantity: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(1)
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 100'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Wishlist item validation
export const validateWishlistItem = (data) => {
  const schema = Joi.object({
    productId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid product ID format',
        'any.required': 'Product ID is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Password reset request validation
export const validatePasswordResetRequest = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Password reset validation
export const validatePasswordReset = (data) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),

    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      }),

    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};
