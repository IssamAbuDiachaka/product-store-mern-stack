/**
 * Order Routes - Order management and processing
 * Handles order lifecycle from creation to fulfillment
 */

import { Router } from 'express';
import OrderController from '../controllers/OrderController.js';
import { authenticate, authorize, checkOwnership } from '../middlewares/auth.js';
import { validationMiddleware, validateObjectId } from '../middlewares/validation.js';
import { 
  validateOrder, 
  validateOrderStatusUpdate, 
  validatePayment, 
  validateRefund, 
  validateTracking, 
  validateOrderQuery,
  validateOrderCancellation 
} from '../validators/orderValidator.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const orderController = new OrderController();

// Rate limiting
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit order operations
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/',
  orderLimiter,
  validationMiddleware(validateOrder, 'body'),
  orderController.createOrder
);

router.get('/validate-cart',
  generalLimiter,
  orderController.validateCartForOrder
);

router.get('/:id',
  generalLimiter,
  validateObjectId('id'),
  orderController.getOrderById
);

router.get('/number/:orderNumber',
  generalLimiter,
  orderController.getOrderByNumber
);

router.delete('/:id/cancel',
  orderLimiter,
  validateObjectId('id'),
  validationMiddleware(validateOrderCancellation, 'body'),
  orderController.cancelOrder
);

// Admin routes
router.get('/',
  authorize('admin'),
  generalLimiter,
  validationMiddleware(validateOrderQuery, 'query'),
  orderController.getAllOrders
);

router.patch('/:id/status',
  authorize('admin'),
  orderLimiter,
  validateObjectId('id'),
  validationMiddleware(validateOrderStatusUpdate, 'body'),
  orderController.updateOrderStatus
);

router.post('/:id/payment',
  authorize('admin'),
  orderLimiter,
  validateObjectId('id'),
  validationMiddleware(validatePayment, 'body'),
  orderController.processPayment
);

router.post('/:id/refund',
  authorize('admin'),
  orderLimiter,
  validateObjectId('id'),
  validationMiddleware(validateRefund, 'body'),
  orderController.processRefund
);

router.post('/:id/tracking',
  authorize('admin'),
  orderLimiter,
  validateObjectId('id'),
  validationMiddleware(validateTracking, 'body'),
  orderController.addTracking
);

// Admin analytics and management
router.get('/admin/statistics',
  authorize('admin'),
  generalLimiter,
  orderController.getOrderStatistics
);

router.get('/admin/analytics/revenue',
  authorize('admin'),
  generalLimiter,
  orderController.getRevenueAnalytics
);

router.get('/admin/customers/top',
  authorize('admin'),
  generalLimiter,
  orderController.getTopCustomers
);

router.get('/admin/recent',
  authorize('admin'),
  generalLimiter,
  orderController.getRecentOrders
);

router.get('/admin/requiring-action',
  authorize('admin'),
  generalLimiter,
  orderController.getOrdersRequiringAction
);

router.get('/admin/dashboard',
  authorize('admin'),
  generalLimiter,
  orderController.getDashboardSummary
);

router.get('/admin/search',
  authorize('admin'),
  generalLimiter,
  orderController.searchOrders
);

export default router;
