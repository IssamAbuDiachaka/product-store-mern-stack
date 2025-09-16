/**
 * Order Service - Business logic layer for order operations
 * Handles order processing, payment, and business rules
 */

import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';
import { validateOrder } from '../validators/orderValidator.js';

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
  }

  // Create new order
  async createOrder(orderData, customerId) {
    try {
      // Validate order data
      const { error, value } = validateOrder(orderData);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Check if customer exists
      const customer = await this.userRepository.findById(customerId);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      // Validate and process order items
      const processedItems = [];
      let subtotal = 0;

      for (const item of value.items) {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        processedItems.push({
          product: product._id,
          name: product.name,
          image: product.primaryImage || product.imageUrl,
          price: product.price,
          quantity: item.quantity,
          total: itemTotal
        });

        // Reserve stock (decrease inventory)
        await this.productRepository.updateStock(product._id, -item.quantity);
      }

      // Calculate totals
      const tax = subtotal * (value.taxRate || 0);
      const shippingCost = value.shippingCost || 0;
      const discount = value.discount || 0;
      const total = subtotal + tax + shippingCost - discount;

      // Create order
      const order = await this.orderRepository.create({
        customer: customerId,
        items: processedItems,
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
        currency: value.currency || 'USD',
        payment: {
          method: value.paymentMethod,
          status: 'pending'
        },
        shipping: value.shipping,
        notes: value.notes || {}
      });

      // Clear customer's cart after successful order
      await this.userRepository.clearCart(customerId);

      return {
        success: true,
        message: 'Order created successfully',
        data: order
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create order', 500);
    }
  }

  // Get order by ID
  async getOrderById(orderId, userId, userRole) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user has access to this order
      if (userRole !== 'admin' && order.customer._id.toString() !== userId) {
        throw new AppError('Access denied', 403);
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch order', 500);
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber, userId, userRole) {
    try {
      const order = await this.orderRepository.findByOrderNumber(orderNumber);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user has access to this order
      if (userRole !== 'admin' && order.customer._id.toString() !== userId) {
        throw new AppError('Access denied', 403);
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch order', 500);
    }
  }

  // Get all orders (admin only)
  async getAllOrders(queryParams) {
    try {
      const options = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 10,
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc',
        status: queryParams.status,
        paymentStatus: queryParams.paymentStatus,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        search: queryParams.search
      };

      const result = await this.orderRepository.findAll(options);

      return {
        success: true,
        data: result.orders,
        pagination: result.pagination
      };
    } catch (error) {
      throw new AppError('Failed to fetch orders', 500);
    }
  }

  // Get customer orders
  async getCustomerOrders(customerId, queryParams) {
    try {
      const options = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 10,
        status: queryParams.status
      };

      const result = await this.orderRepository.getCustomerOrders(customerId, options);

      return {
        success: true,
        data: result.orders,
        pagination: result.pagination
      };
    } catch (error) {
      throw new AppError('Failed to fetch customer orders', 500);
    }
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus, updatedBy, note) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus, updatedBy, note);

      // Handle stock restoration if order is cancelled
      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          await this.productRepository.updateStock(item.product, item.quantity);
        }
      }

      return {
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update order status', 500);
    }
  }

  // Process payment
  async processPayment(orderId, paymentData) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.payment.status === 'completed') {
        throw new AppError('Order payment already completed', 400);
      }

      // Simulate payment processing
      // In real application, integrate with payment gateway
      const isPaymentSuccessful = await this.simulatePayment(paymentData);
      
      if (!isPaymentSuccessful) {
        throw new AppError('Payment processing failed', 400);
      }

      const updatedOrder = await this.orderRepository.processPayment(orderId, paymentData.transactionId);

      return {
        success: true,
        message: 'Payment processed successfully',
        data: updatedOrder
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process payment', 500);
    }
  }

  // Process refund
  async processRefund(orderId, refundAmount, processedBy) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.payment.status !== 'completed') {
        throw new AppError('Cannot refund unpaid order', 400);
      }

      if (refundAmount > order.total) {
        throw new AppError('Refund amount cannot exceed order total', 400);
      }

      const updatedOrder = await this.orderRepository.processRefund(orderId, refundAmount);

      // Restore stock for refunded items
      for (const item of order.items) {
        await this.productRepository.updateStock(item.product, item.quantity);
      }

      return {
        success: true,
        message: 'Refund processed successfully',
        data: updatedOrder
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process refund', 500);
    }
  }

  // Add tracking information
  async addTracking(orderId, trackingData, updatedBy) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const updatedOrder = await this.orderRepository.addTracking(
        orderId, 
        trackingData.trackingNumber, 
        trackingData.shippedDate
      );

      return {
        success: true,
        message: 'Tracking information added successfully',
        data: updatedOrder
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add tracking information', 500);
    }
  }

  // Get order statistics (admin only)
  async getOrderStatistics(period = 30) {
    try {
      const stats = await this.orderRepository.getStatistics(period);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new AppError('Failed to fetch order statistics', 500);
    }
  }

  // Get revenue analytics (admin only)
  async getRevenueAnalytics(period = 30) {
    try {
      const analytics = await this.orderRepository.getRevenueAnalytics(period);

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      throw new AppError('Failed to fetch revenue analytics', 500);
    }
  }

  // Get top customers (admin only)
  async getTopCustomers(limit = 10) {
    try {
      const customers = await this.orderRepository.getTopCustomers(limit);

      return {
        success: true,
        data: customers
      };
    } catch (error) {
      throw new AppError('Failed to fetch top customers', 500);
    }
  }

  // Get recent orders (admin only)
  async getRecentOrders(limit = 5) {
    try {
      const orders = await this.orderRepository.getRecent(limit);

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      throw new AppError('Failed to fetch recent orders', 500);
    }
  }

  // Get orders requiring action (admin only)
  async getOrdersRequiringAction() {
    try {
      const orders = await this.orderRepository.getRequiringAction();

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      throw new AppError('Failed to fetch orders requiring action', 500);
    }
  }

  // Get dashboard summary (admin only)
  async getDashboardSummary() {
    try {
      const summary = await this.orderRepository.getDashboardSummary();

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      throw new AppError('Failed to fetch dashboard summary', 500);
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId, userRole, reason) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user has permission to cancel
      if (userRole !== 'admin' && order.customer._id.toString() !== userId) {
        throw new AppError('Access denied', 403);
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new AppError('Order cannot be cancelled at this stage', 400);
      }

      const updatedOrder = await this.orderRepository.updateStatus(
        orderId, 
        'cancelled', 
        userId, 
        reason || 'Order cancelled by customer'
      );

      // Restore stock
      for (const item of order.items) {
        await this.productRepository.updateStock(item.product, item.quantity);
      }

      // Process refund if payment was completed
      if (order.payment.status === 'completed') {
        await this.orderRepository.processRefund(orderId, order.total);
      }

      return {
        success: true,
        message: 'Order cancelled successfully',
        data: updatedOrder
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to cancel order', 500);
    }
  }

  // Search orders
  async searchOrders(searchTerm, options = {}) {
    try {
      const result = await this.orderRepository.search(searchTerm, options);

      return {
        success: true,
        data: result.orders,
        pagination: result.pagination,
        searchTerm
      };
    } catch (error) {
      throw new AppError('Failed to search orders', 500);
    }
  }

  // Simulate payment processing (replace with real payment gateway)
  async simulatePayment(paymentData) {
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  // Validate order can be created from cart
  async validateCartForOrder(customerId) {
    try {
      const cart = await this.userRepository.getCart(customerId);
      
      if (!cart || cart.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      const validationResults = [];
      let hasErrors = false;

      for (const item of cart) {
        const product = await this.productRepository.findById(item.product._id);
        
        const result = {
          productId: item.product._id,
          name: item.product.name,
          requestedQuantity: item.quantity,
          availableStock: product ? product.stock : 0,
          isValid: true,
          message: 'OK'
        };

        if (!product || !product.isActive || product.status !== 'active') {
          result.isValid = false;
          result.message = 'Product is no longer available';
          hasErrors = true;
        } else if (product.stock < item.quantity) {
          result.isValid = false;
          result.message = `Only ${product.stock} items available`;
          hasErrors = true;
        }

        validationResults.push(result);
      }

      return {
        success: true,
        data: {
          isValid: !hasErrors,
          items: validationResults,
          message: hasErrors ? 'Some items in your cart are not available' : 'Cart is valid for checkout'
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to validate cart', 500);
    }
  }
}

export default OrderService;
