/**
 * Order Model - Complete order management with payment tracking
 * Supports order lifecycle, payment status, and order analytics
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Customer information
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required'],
    index: true
  },
  
  // Order items - store price at purchase time
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GHS', 'GBP']
  },
  
  // Order status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending',
    index: true
  },
  
  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    transactionId: String,
    paymentDate: Date,
    refundDate: Date,
    refundAmount: Number
  },
  
  // Shipping information
  shipping: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    trackingNumber: String,
    shippedDate: Date,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date
  },
  
  // Order notes and communication
  notes: {
    customer: String,
    admin: String,
    internal: String
  },
  
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    note: String
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for order summary
orderSchema.virtual('summary').get(function() {
  return {
    orderNumber: this.orderNumber,
    itemCount: this.items.length,
    total: this.total,
    status: this.status,
    createdAt: this.createdAt
  };
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.orderNumber = `ORD${year}${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate final total
  this.total = this.subtotal + this.tax + this.shippingCost - this.discount;
  
  next();
});

// Pre-save middleware to track status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus, updatedBy, note) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    note,
    updatedAt: new Date()
  });
  
  return await this.save();
};

// Instance method to process payment
orderSchema.methods.processPayment = async function(transactionId) {
  this.payment.status = 'completed';
  this.payment.transactionId = transactionId;
  this.payment.paymentDate = new Date();
  
  // Auto-confirm order after successful payment
  if (this.status === 'pending') {
    this.status = 'confirmed';
    this.statusHistory.push({
      status: 'confirmed',
      updatedAt: new Date(),
      note: 'Auto-confirmed after payment'
    });
  }
  
  return await this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = async function(refundAmount) {
  this.payment.status = 'refunded';
  this.payment.refundDate = new Date();
  this.payment.refundAmount = refundAmount || this.total;
  this.status = 'refunded';
  
  this.statusHistory.push({
    status: 'refunded',
    updatedAt: new Date(),
    note: `Refunded $${this.payment.refundAmount}`
  });
  
  return await this.save();
};

// Instance method to add tracking information
orderSchema.methods.addTracking = async function(trackingNumber, shippedDate) {
  this.shipping.trackingNumber = trackingNumber;
  this.shipping.shippedDate = shippedDate || new Date();
  
  if (this.status !== 'shipped') {
    this.status = 'shipped';
    this.statusHistory.push({
      status: 'shipped',
      updatedAt: new Date(),
      note: `Tracking: ${trackingNumber}`
    });
  }
  
  return await this.save();
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function(period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0
  };
};

// Static method to get orders by customer
orderSchema.statics.getCustomerOrders = function(customerId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  
  const query = { customer: customerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('items.product', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
