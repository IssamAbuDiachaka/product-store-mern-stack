/**
 * Product Routes - RESTful API endpoints for product operations
 * Implements proper HTTP methods and status codes
 */

import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const productController = new ProductController();

// Rate limiting for product operations
const createProductLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each admin to 10 product creation requests per windowMs
  message: 'Too many products created, try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const searchLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per windowMs
  message: 'Too many search requests, try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes - no authentication required
router.get('/', 
  optionalAuth,
  productController.getAllProducts
);

router.get('/featured', 
  productController.getFeaturedProducts
);

router.get('/categories', 
  productController.getCategories
);

router.get('/search', 
  searchLimit,
  optionalAuth,
  productController.searchProducts
);

router.get('/category/:category',
  optionalAuth,
  productController.getProductsByCategory
);

router.get('/:id/related',
  productController.getRelatedProducts
);

router.get('/:id/stock-check',
  productController.checkStockAvailability
);

router.get('/slug/:slug',
  optionalAuth,
  productController.getProductBySlug
);

router.get('/:id',
  optionalAuth,
  productController.getProductById
);

// Protected routes - authentication required
router.post('/:id/reviews',
  authenticate,
  productController.addReview
);

// Admin only routes
router.post('/',
  authenticate,
  authorize('admin'),
  createProductLimit,
  productController.createProduct
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  productController.updateProduct
);

router.patch('/:id/stock',
  authenticate,
  authorize('admin'),
  productController.updateStock
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

// Admin analytics and management routes
router.get('/admin/statistics',
  authenticate,
  authorize('admin'),
  productController.getStatistics
);

router.get('/admin/low-stock',
  authenticate,
  authorize('admin'),
  productController.getLowStockProducts
);

router.post('/admin/bulk-update',
  authenticate,
  authorize('admin'),
  productController.bulkUpdateProducts
);

export default router;
