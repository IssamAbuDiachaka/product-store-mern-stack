/**
 * Order Validation Schemas
 * Joi validation schemas for order-related operations
 */

import Joi from 'joi';

// Order creation validation
export const validateOrder = (data) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
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
            .required()
            .messages({
              'number.integer': 'Quantity must be a whole number',
              'number.min': 'Quantity must be at least 1',
              'number.max': 'Quantity cannot exceed 100',
              'any.required': 'Quantity is required'
            })
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Order items are required'
      }),

    paymentMethod: Joi.string()
      .valid('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery')
      .required()
      .messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      }),

    shipping: Joi.object({
      address: Joi.object({
        street: Joi.string()
          .min(5)
          .max(100)
          .required()
          .messages({
            'string.min': 'Street address must be at least 5 characters',
            'string.max': 'Street address cannot exceed 100 characters',
            'any.required': 'Street address is required'
          }),

        city: Joi.string()
          .min(2)
          .max(50)
          .required()
          .messages({
            'string.min': 'City must be at least 2 characters',
            'string.max': 'City cannot exceed 50 characters',
            'any.required': 'City is required'
          }),

        state: Joi.string()
          .min(2)
          .max(50)
          .required()
          .messages({
            'string.min': 'State must be at least 2 characters',
            'string.max': 'State cannot exceed 50 characters',
            'any.required': 'State is required'
          }),

        zipCode: Joi.string()
          .min(3)
          .max(20)
          .required()
          .messages({
            'string.min': 'ZIP code must be at least 3 characters',
            'string.max': 'ZIP code cannot exceed 20 characters',
            'any.required': 'ZIP code is required'
          }),

        country: Joi.string()
          .min(2)
          .max(50)
          .required()
          .messages({
            'string.min': 'Country must be at least 2 characters',
            'string.max': 'Country cannot exceed 50 characters',
            'any.required': 'Country is required'
          })
      }).required(),

      method: Joi.string()
        .valid('standard', 'express', 'overnight', 'pickup')
        .default('standard')
        .messages({
          'any.only': 'Invalid shipping method'
        })
    }).required(),

    currency: Joi.string()
      .valid('USD', 'EUR', 'GHS', 'GBP')
      .default('USD')
      .messages({
        'any.only': 'Currency must be one of USD, EUR, GHS, or GBP'
      }),

    taxRate: Joi.number()
      .min(0)
      .max(1)
      .precision(4)
      .default(0)
      .messages({
        'number.min': 'Tax rate cannot be negative',
        'number.max': 'Tax rate cannot exceed 100%',
        'number.precision': 'Tax rate can have maximum 4 decimal places'
      }),

    shippingCost: Joi.number()
      .min(0)
      .precision(2)
      .default(0)
      .messages({
        'number.min': 'Shipping cost cannot be negative',
        'number.precision': 'Shipping cost can have maximum 2 decimal places'
      }),

    discount: Joi.number()
      .min(0)
      .precision(2)
      .default(0)
      .messages({
        'number.min': 'Discount cannot be negative',
        'number.precision': 'Discount can have maximum 2 decimal places'
      }),

    notes: Joi.object({
      customer: Joi.string().max(500).optional().allow(''),
      admin: Joi.string().max(500).optional().allow(''),
      internal: Joi.string().max(500).optional().allow('')
    }).optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Order status update validation
export const validateOrderStatusUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      )
      .required()
      .messages({
        'any.only': 'Invalid order status',
        'any.required': 'Order status is required'
      }),

    note: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Note cannot exceed 500 characters'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Payment processing validation
export const validatePayment = (data) => {
  const schema = Joi.object({
    transactionId: Joi.string()
      .min(5)
      .max(100)
      .required()
      .messages({
        'string.min': 'Transaction ID must be at least 5 characters',
        'string.max': 'Transaction ID cannot exceed 100 characters',
        'any.required': 'Transaction ID is required'
      }),

    amount: Joi.number()
      .min(0.01)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Payment amount must be greater than 0',
        'number.precision': 'Payment amount can have maximum 2 decimal places',
        'any.required': 'Payment amount is required'
      }),

    currency: Joi.string()
      .valid('USD', 'EUR', 'GHS', 'GBP')
      .default('USD')
      .messages({
        'any.only': 'Currency must be one of USD, EUR, GHS, or GBP'
      }),

    gateway: Joi.string()
      .valid('stripe', 'paypal', 'square', 'razorpay')
      .optional()
      .messages({
        'any.only': 'Invalid payment gateway'
      }),

    metadata: Joi.object().optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Refund processing validation
export const validateRefund = (data) => {
  const schema = Joi.object({
    amount: Joi.number()
      .min(0.01)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Refund amount must be greater than 0',
        'number.precision': 'Refund amount can have maximum 2 decimal places',
        'any.required': 'Refund amount is required'
      }),

    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Refund reason must be at least 10 characters',
        'string.max': 'Refund reason cannot exceed 500 characters',
        'any.required': 'Refund reason is required'
      }),

    refundMethod: Joi.string()
      .valid('original_payment', 'store_credit', 'bank_transfer')
      .default('original_payment')
      .messages({
        'any.only': 'Invalid refund method'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Tracking information validation
export const validateTracking = (data) => {
  const schema = Joi.object({
    trackingNumber: Joi.string()
      .min(5)
      .max(50)
      .required()
      .messages({
        'string.min': 'Tracking number must be at least 5 characters',
        'string.max': 'Tracking number cannot exceed 50 characters',
        'any.required': 'Tracking number is required'
      }),

    carrier: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Carrier name cannot exceed 50 characters'
      }),

    shippedDate: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Shipped date cannot be in the future'
      }),

    estimatedDeliveryDate: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Estimated delivery date cannot be in the past'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Order query validation (for filtering and pagination)
export const validateOrderQuery = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid(
      'createdAt', 'total', 'status', 'orderNumber'
    ).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    
    status: Joi.string().valid(
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ).optional(),
    
    paymentStatus: Joi.string().valid(
      'pending', 'completed', 'failed', 'refunded'
    ).optional(),
    
    customerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid customer ID format'
      }),
    
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    
    minTotal: Joi.number().min(0).optional(),
    maxTotal: Joi.number().min(Joi.ref('minTotal')).optional(),
    
    search: Joi.string().min(2).max(100).optional()
  });

  return schema.validate(query, { abortEarly: false });
};

// Order cancellation validation
export const validateOrderCancellation = (data) => {
  const schema = Joi.object({
    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Cancellation reason must be at least 10 characters',
        'string.max': 'Cancellation reason cannot exceed 500 characters',
        'any.required': 'Cancellation reason is required'
      }),

    refundRequested: Joi.boolean()
      .default(true)
  });

  return schema.validate(data, { abortEarly: false });
};

// Bulk order operations validation
export const validateBulkOrderUpdate = (data) => {
  const schema = Joi.object({
    orderIds: Joi.array()
      .items(
        Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .messages({
            'string.pattern.base': 'Invalid order ID format'
          })
      )
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'At least one order ID is required',
        'array.max': 'Cannot update more than 100 orders at once',
        'any.required': 'Order IDs are required'
      }),

    action: Joi.string()
      .valid('updateStatus', 'cancel', 'archive')
      .required()
      .messages({
        'any.only': 'Action must be updateStatus, cancel, or archive',
        'any.required': 'Action is required'
      }),

    data: Joi.object().when('action', {
      is: 'updateStatus',
      then: Joi.object({
        status: Joi.string().valid(
          'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
        ).required(),
        note: Joi.string().max(500).optional()
      }).required(),
      otherwise: Joi.object({
        reason: Joi.string().min(10).max(500).optional()
      })
    })
  });

  return schema.validate(data, { abortEarly: false });
};
