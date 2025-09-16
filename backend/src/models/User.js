/**
 * User Model - Enhanced with security features and proper validation
 * Supports authentication, roles, and user management
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ],
    index: true // Index for faster queries
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    index: true
  },
  
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name='
  },
  
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'Ghana', trim: true }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security fields
  lastLogin: {
    type: Date
  },
  
  refreshTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' }
  }],
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Shopping preferences
  cart: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'cart.product': 1 });

// Virtual for full name if needed later
userSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  // Hash password with salt rounds of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to set avatar with name
userSchema.pre('save', function(next) {
  if (this.isModified('name') && this.avatar.includes('ui-avatars.com')) {
    this.avatar = `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${encodeURIComponent(this.name)}`;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT tokens
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = async function(refreshToken) {
  this.refreshTokens.push({ token: refreshToken });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  await this.save();
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = async function(refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
  await this.save();
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return user;
};

// Instance method to add to cart
userSchema.methods.addToCart = async function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return await this.save();
};

// Instance method to remove from cart
userSchema.methods.removeFromCart = async function(productId) {
  this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
  return await this.save();
};

// Instance method to clear cart
userSchema.methods.clearCart = async function() {
  this.cart = [];
  return await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
