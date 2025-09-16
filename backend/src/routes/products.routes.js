// routes/productRoutes.js (Updated)
import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (anyone can access)
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (admin only)
router.post('/', authenticate, authorize('admin'), createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;