/**
 * Product Validation Schemas
 * Joi validation schemas for product-related operations
 */

import Joi from 'joi';

// Product creation/update validation
export const validateProduct = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),

    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Product description is required'
      }),

    shortDescription: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Short description cannot exceed 200 characters'
      }),

    price: Joi.number()
      .min(0)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Price cannot be negative',
        'number.precision': 'Price can have maximum 2 decimal places',
        'any.required': 'Product price is required'
      }),

    originalPrice: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .messages({
        'number.min': 'Original price cannot be negative',
        'number.precision': 'Original price can have maximum 2 decimal places'
      }),

    currency: Joi.string()
      .valid('USD', 'EUR', 'GHS', 'GBP')
      .default('USD')
      .messages({
        'any.only': 'Currency must be one of USD, EUR, GHS, or GBP'
      }),

    imageUrl: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Please provide a valid image URL',
        'any.required': 'Product image URL is required'
      }),

    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          alt: Joi.string().max(100).default(''),
          isPrimary: Joi.boolean().default(false)
        })
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 images allowed'
      }),

    category: Joi.string()
      .valid(
        'Electronics',
        'Clothing',
        'Books',
        'Home & Garden',
        'Sports',
        'Beauty',
        'Automotive',
        'Food & Beverages',
        'Other'
      )
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Product category is required'
      }),

    subcategory: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Subcategory cannot exceed 50 characters'
      }),

    brand: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Brand name cannot exceed 50 characters'
      }),

    sku: Joi.string()
      .max(20)
      .optional()
      .messages({
        'string.max': 'SKU cannot exceed 20 characters'
      }),

    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.integer': 'Stock must be a whole number',
        'number.min': 'Stock cannot be negative',
        'any.required': 'Stock quantity is required'
      }),

    lowStockThreshold: Joi.number()
      .integer()
      .min(0)
      .default(10)
      .messages({
        'number.integer': 'Low stock threshold must be a whole number',
        'number.min': 'Low stock threshold cannot be negative'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'discontinued')
      .default('active')
      .messages({
        'any.only': 'Status must be active, inactive, or discontinued'
      }),

    isFeatured: Joi.boolean()
      .default(false),

    metaTitle: Joi.string()
      .max(60)
      .optional()
      .messages({
        'string.max': 'Meta title cannot exceed 60 characters'
      }),

    metaDescription: Joi.string()
      .max(160)
      .optional()
      .messages({
        'string.max': 'Meta description cannot exceed 160 characters'
      }),

    metaKeywords: Joi.array()
      .items(Joi.string().max(30))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 keywords allowed'
      }),

    specifications: Joi.object({
      weight: Joi.number().min(0).optional(),
      dimensions: Joi.object({
        length: Joi.number().min(0).optional(),
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional(),
        unit: Joi.string().valid('cm', 'in').default('cm')
      }).optional(),
      color: Joi.string().max(30).optional(),
      material: Joi.string().max(50).optional(),
      warranty: Joi.string().max(100).optional()
    }).optional()
  });

  // Make all fields optional for updates
  if (isUpdate) {
    const updateSchema = schema.fork(
      ['name', 'description', 'price', 'imageUrl', 'category', 'stock'],
      (field) => field.optional()
    );
    return updateSchema.validate(data, { abortEarly: false });
  }

  return schema.validate(data, { abortEarly: false });
};

// Product search/filter validation
export const validateProductQuery = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    sortBy: Joi.string().valid(
      'name', 'price', 'createdAt', 'averageRating', 'viewCount', 'soldCount'
    ).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    brand: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    inStock: Joi.boolean().optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'discontinued').default('active'),
    search: Joi.string().min(2).max(100).optional()
  });

  return schema.validate(query, { abortEarly: false });
};

// Product review validation
export const validateProductReview = (data) => {
  const schema = Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': 'Rating must be between 1 and 5',
        'number.max': 'Rating must be between 1 and 5',
        'any.required': 'Rating is required'
      }),

    comment: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Comment must be at least 10 characters long',
        'string.max': 'Comment cannot exceed 1000 characters',
        'any.required': 'Comment is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Stock update validation
export const validateStockUpdate = (data) => {
  const schema = Joi.object({
    quantity: Joi.number()
      .integer()
      .required()
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'any.required': 'Quantity is required'
      }),

    operation: Joi.string()
      .valid('set', 'increment', 'decrement')
      .default('set')
      .messages({
        'any.only': 'Operation must be set, increment, or decrement'
      })
  });

  return schema.validate(data, { abortEarly: false });
};
