/**
 * Order Repository - Data access layer for order operations
 * Handles all database operations for orders
 */

import Order from '../models/Order.js';

class OrderRepository {
  
  // Create new order
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  // Find order by ID
  async findById(id) {
    return await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name slug');
  }

  // Find order by order number
  async findByOrderNumber(orderNumber) {
    return await Order.findOne({ orderNumber })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name slug');
  }

  // Update order by ID
  async updateById(id, updateData) {
    return await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Get all orders with filtering and pagination
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      paymentStatus,
      customerId,
      startDate,
      endDate,
      search
    } = options;

    const query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (customerId) query.customer = customerId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'payment.transactionId': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Get orders by customer
  async getCustomerOrders(customerId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status
    } = options;

    const query = { customer: customerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.product', 'name slug imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Update order status
  async updateStatus(id, newStatus, updatedBy, note) {
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    
    return await order.updateStatus(newStatus, updatedBy, note);
  }

  // Process payment
  async processPayment(id, transactionId) {
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    
    return await order.processPayment(transactionId);
  }

  // Process refund
  async processRefund(id, refundAmount) {
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    
    return await order.processRefund(refundAmount);
  }

  // Add tracking information
  async addTracking(id, trackingNumber, shippedDate) {
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    
    return await order.addTracking(trackingNumber, shippedDate);
  }

  // Get order statistics
  async getStatistics(period = 30) {
    return await Order.getStatistics(period);
  }

  // Get recent orders
  async getRecent(limit = 5) {
    return await Order.find({})
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // Get orders by status
  async getByStatus(status, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const orders = await Order.find({ status })
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ status });

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Get orders requiring action
  async getRequiringAction() {
    return await Order.find({
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('customer', 'name email')
    .sort({ createdAt: 1 })
    .limit(10);
  }

  // Get revenue analytics
  async getRevenueAnalytics(period = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    return analytics;
  }

  // Get top customers
  async getTopCustomers(limit = 10) {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          customer: {
            name: '$customer.name',
            email: '$customer.email'
          },
          totalSpent: 1,
          orderCount: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: limit
      }
    ]);
  }

  // Get orders by date range
  async getByDateRange(startDate, endDate, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Search orders
  async search(searchTerm, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const query = {
      $or: [
        { orderNumber: { $regex: searchTerm, $options: 'i' } },
        { 'payment.transactionId': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Check if order exists
  async exists(id) {
    return await Order.exists({ _id: id });
  }

  // Delete order (admin only)
  async deleteById(id) {
    return await Order.findByIdAndDelete(id);
  }

  // Bulk update orders
  async bulkUpdate(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: update.data,
        upsert: false
      }
    }));

    return await Order.bulkWrite(operations);
  }

  // Get order summary for dashboard
  async getDashboardSummary() {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats, weekStats, monthStats] = await Promise.all([
      Order.aggregate([
        {
          $match: { createdAt: { $gte: startOfToday } }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { createdAt: { $gte: startOfWeek } }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { createdAt: { $gte: startOfMonth } }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ])
    ]);

    return {
      today: todayStats[0] || { count: 0, revenue: 0 },
      thisWeek: weekStats[0] || { count: 0, revenue: 0 },
      thisMonth: monthStats[0] || { count: 0, revenue: 0 }
    };
  }
}

export default OrderRepository;
