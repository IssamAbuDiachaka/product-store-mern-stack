// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,                                    // No duplicate emails
    lowercase: true,                                 // Convert to lowercase
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false                                    // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: ['customer', 'admin'],                     // Only these two roles allowed
    default: 'customer'
  },
  
  avatar: {
    type: String,                                    // URL to profile picture
    default: 'https://via.placeholder.com/150'
  },
  
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Ghana' }
  },
  
  isActive: {
    type: Boolean,
    default: true                                    // For soft deleting users
  },
  
  emailVerified: {
    type: Boolean,
    default: false                                   // For email verification feature
  },
  
  lastLogin: {
    type: Date
  }
  
}, {
  timestamps: true
});