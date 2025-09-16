/**
 * Product Model - Enhanced with search optimization and better structure
 * Supports categories, reviews, and advanced querying
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    minlength: [2, 'Product name must be at least 2 characters'],
    index: 'text' // Text index for search
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true // Index for faster queries
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    index: 'text' // Text index for search
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GHS', 'GBP']
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Maintain backward compatibility
  imageUrl: {
    type: String,
    required: [true, 'Product image is required']
  },
  
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports',
      'Beauty',
      'Automotive',
      'Food & Beverages',
      'Other'
    ],
    default: 'Other',
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  
  sku: {
    type: String,
    unique: true,
    uppercase: true,
    index: true
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  
  // Product status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  
  // Product specifications
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    color: String,
    material: String,
    warranty: String
  },
  
  // Ratings and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    }
  }],
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  
  soldCount: {
    type: Number,
    default: 0
  },
  
  // Admin fields
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for complex queries
productSchema.index({ category: 1, status: 1, isActive: 1 });
productSchema.index({ price: 1, averageRating: -1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
  }
  return this.imageUrl;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to update short description
productSchema.pre('save', function(next) {
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description.substring(0, 150) + 
                           (this.description.length > 150 ? '...' : '');
  }
  next();
});

// Pre-save middleware to set primary image
productSchema.pre('save', function(next) {
  if (this.isModified('images') && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Instance method to add review
productSchema.methods.addReview = async function(userId, userName, rating, comment, isVerifiedPurchase = false) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(review => review.user.toString() === userId.toString());
  
  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }
  
  this.reviews.push({
    user: userId,
    name: userName,
    rating,
    comment,
    isVerifiedPurchase
  });
  
  // Recalculate average rating
  this.calculateAverageRating();
  
  return await this.save();
};

// Instance method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = (sum / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  return await this.save();
};

// Static method to search products
productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    inStock = true,
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = options;

  const searchQuery = {
    isActive: true,
    status: 'active'
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (category) {
    searchQuery.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }

  // Stock filter
  if (inStock) {
    searchQuery.stock = { $gt: 0 };
  }

  // Featured filter
  if (featured !== undefined) {
    searchQuery.isFeatured = featured;
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(searchQuery)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('createdBy', 'name')
    .populate('reviews.user', 'name avatar');
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
  return this.find({
    isActive: true,
    status: 'active',
    isFeatured: true,
    stock: { $gt: 0 }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get low stock products
productSchema.statics.getLowStock = function() {
  return this.find({
    isActive: true,
    status: 'active',
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  })
  .sort({ stock: 1 });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
