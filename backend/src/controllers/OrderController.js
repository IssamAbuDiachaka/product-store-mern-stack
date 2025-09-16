/**
 * Order Controller - Order management and processing
 * Handles order lifecycle from creation to fulfillment
 */

import OrderService from '../services/OrderService.js';
import { catchAsync } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  // Create new order
  createOrder = catchAsync(async (req, res) => {
    const result = await this.orderService.createOrder(req.body, req.user.id);

    logger.logBusiness('order_created', {
      orderId: result.data._id,
      customerId: req.user.id,
      total: result.data.total,
      itemCount: result.data.items.length
    });

    res.status(201).json(result);
  });

  // Get order by ID
  getOrderById = catchAsync(async (req, res) => {
    const result = await this.orderService.getOrderById(
      req.params.id, 
      req.user.id, 
      req.user.role
    );

    res.status(200).json(result);
  });

  // Get order by order number
  getOrderByNumber = catchAsync(async (req, res) => {
    const result = await this.orderService.getOrderByNumber(
      req.params.orderNumber, 
      req.user.id, 
      req.user.role
    );

    res.status(200).json(result);
  });

  // Get all orders (admin only)
  getAllOrders = catchAsync(async (req, res) => {
    const result = await this.orderService.getAllOrders(req.query);

    logger.logBusiness('orders_list_accessed', {
      adminId: req.user.id,
      filters: req.query
    });

    res.status(200).json(result);
  });

  // Update order status (admin only)
  updateOrderStatus = catchAsync(async (req, res) => {
    const { status, note } = req.body;
    const result = await this.orderService.updateOrderStatus(
      req.params.id, 
      status, 
      req.user.id, 
      note
    );

    logger.logBusiness('order_status_updated', {
      orderId: req.params.id,
      newStatus: status,
      updatedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Process payment (admin only)
  processPayment = catchAsync(async (req, res) => {
    const result = await this.orderService.processPayment(req.params.id, req.body);

    logger.logBusiness('payment_processed', {
      orderId: req.params.id,
      transactionId: req.body.transactionId,
      amount: req.body.amount,
      processedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Process refund (admin only)
  processRefund = catchAsync(async (req, res) => {
    const result = await this.orderService.processRefund(
      req.params.id, 
      req.body.amount, 
      req.user.id
    );

    logger.logBusiness('refund_processed', {
      orderId: req.params.id,
      refundAmount: req.body.amount,
      processedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Add tracking information (admin only)
  addTracking = catchAsync(async (req, res) => {
    const result = await this.orderService.addTracking(
      req.params.id, 
      req.body, 
      req.user.id
    );

    logger.logBusiness('tracking_added', {
      orderId: req.params.id,
      trackingNumber: req.body.trackingNumber,
      addedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Cancel order
  cancelOrder = catchAsync(async (req, res) => {
    const { reason } = req.body;
    const result = await this.orderService.cancelOrder(
      req.params.id, 
      req.user.id, 
      req.user.role, 
      reason
    );

    logger.logBusiness('order_cancelled', {
      orderId: req.params.id,
      cancelledBy: req.user.id,
      reason
    });

    res.status(200).json(result);
  });

  // Validate cart for order creation
  validateCartForOrder = catchAsync(async (req, res) => {
    const result = await this.orderService.validateCartForOrder(req.user.id);
    res.status(200).json(result);
  });

  // Admin analytics endpoints
  getOrderStatistics = catchAsync(async (req, res) => {
    const period = parseInt(req.query.period) || 30;
    const result = await this.orderService.getOrderStatistics(period);

    logger.logBusiness('order_statistics_accessed', {
      adminId: req.user.id,
      period
    });

    res.status(200).json(result);
  });

  getRevenueAnalytics = catchAsync(async (req, res) => {
    const period = parseInt(req.query.period) || 30;
    const result = await this.orderService.getRevenueAnalytics(period);

    logger.logBusiness('revenue_analytics_accessed', {
      adminId: req.user.id,
      period
    });

    res.status(200).json(result);
  });

  getTopCustomers = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await this.orderService.getTopCustomers(limit);

    logger.logBusiness('top_customers_accessed', {
      adminId: req.user.id,
      limit
    });

    res.status(200).json(result);
  });

  getRecentOrders = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const result = await this.orderService.getRecentOrders(limit);

    res.status(200).json(result);
  });

  getOrdersRequiringAction = catchAsync(async (req, res) => {
    const result = await this.orderService.getOrdersRequiringAction();

    res.status(200).json(result);
  });

  getDashboardSummary = catchAsync(async (req, res) => {
    const result = await this.orderService.getDashboardSummary();

    logger.logBusiness('dashboard_accessed', {
      adminId: req.user.id
    });

    res.status(200).json(result);
  });

  searchOrders = catchAsync(async (req, res) => {
    const { q: searchTerm, ...options } = req.query;
    const result = await this.orderService.searchOrders(searchTerm, options);

    logger.logBusiness('orders_searched', {
      adminId: req.user.id,
      searchTerm,
      resultsCount: result.data?.length || 0
    });

    res.status(200).json(result);
  });
}

export default OrderController;
