/**
 * Product Controller - Clean Architecture Implementation
 * Handles HTTP requests and delegates business logic to services
 */

import ProductService from '../services/ProductService.js';
import { catchAsync } from '../utils/AppError.js';
import logger from '../utils/logger.js';

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  // Get all products with filtering and pagination
  getAllProducts = catchAsync(async (req, res) => {
    const startTime = Date.now();
    
    const result = await this.productService.getAllProducts(req.query);
    
    logger.logPerformance('getAllProducts', Date.now() - startTime, {
      resultsCount: result.data.length,
      filters: req.query
    });

    res.status(200).json(result);
  });

  // Get single product by ID
  getProductById = catchAsync(async (req, res) => {
    const result = await this.productService.getProductById(req.params.id);

    logger.logBusiness('product_viewed', {
      productId: req.params.id,
      userId: req.user?.id
    });

    res.status(200).json(result);
  });

  // Get product by slug
  getProductBySlug = catchAsync(async (req, res) => {
    const result = await this.productService.getProductBySlug(req.params.slug);

    logger.logBusiness('product_viewed', {
      productSlug: req.params.slug,
      userId: req.user?.id
    });

    res.status(200).json(result);
  });

  // Create new product (admin only)
  createProduct = catchAsync(async (req, res) => {
    const result = await this.productService.createProduct(req.body, req.user.id);

    logger.logBusiness('product_created', {
      productId: result.data._id,
      createdBy: req.user.id
    });

    res.status(201).json(result);
  });

  // Update product (admin only)
  updateProduct = catchAsync(async (req, res) => {
    const result = await this.productService.updateProduct(
      req.params.id, 
      req.body, 
      req.user.id
    );

    logger.logBusiness('product_updated', {
      productId: req.params.id,
      updatedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Delete product (admin only)
  deleteProduct = catchAsync(async (req, res) => {
    const result = await this.productService.deleteProduct(req.params.id, req.user.id);

    logger.logBusiness('product_deleted', {
      productId: req.params.id,
      deletedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Get featured products
  getFeaturedProducts = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const result = await this.productService.getFeaturedProducts(limit);

    res.status(200).json(result);
  });

  // Search products
  searchProducts = catchAsync(async (req, res) => {
    const { q: searchTerm, ...options } = req.query;
    const result = await this.productService.searchProducts(searchTerm, options);

    logger.logBusiness('product_search', {
      searchTerm,
      resultsCount: result.data.length,
      userId: req.user?.id
    });

    res.status(200).json(result);
  });

  // Get product categories
  getCategories = catchAsync(async (req, res) => {
    const result = await this.productService.getCategories();
    res.status(200).json(result);
  });

  // Get products by category
  getProductsByCategory = catchAsync(async (req, res) => {
    const result = await this.productService.getProductsByCategory(
      req.params.category,
      req.query
    );

    res.status(200).json(result);
  });

  // Get low stock products (admin only)
  getLowStockProducts = catchAsync(async (req, res) => {
    const result = await this.productService.getLowStockProducts();
    res.status(200).json(result);
  });

  // Update product stock (admin only)
  updateStock = catchAsync(async (req, res) => {
    const { quantity, operation = 'set' } = req.body;
    const result = await this.productService.updateStock(
      req.params.id, 
      quantity, 
      operation
    );

    logger.logBusiness('stock_updated', {
      productId: req.params.id,
      operation,
      quantity,
      updatedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Add review to product
  addReview = catchAsync(async (req, res) => {
    const result = await this.productService.addReview(
      req.params.id,
      {
        ...req.body,
        userName: req.user.name
      },
      req.user.id
    );

    logger.logBusiness('review_added', {
      productId: req.params.id,
      userId: req.user.id,
      rating: req.body.rating
    });

    res.status(201).json(result);
  });

  // Get related products
  getRelatedProducts = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 4;
    const result = await this.productService.getRelatedProducts(req.params.id, limit);

    res.status(200).json(result);
  });

  // Get product statistics (admin only)
  getStatistics = catchAsync(async (req, res) => {
    const result = await this.productService.getStatistics();
    res.status(200).json(result);
  });

  // Bulk update products (admin only)
  bulkUpdateProducts = catchAsync(async (req, res) => {
    const result = await this.productService.bulkUpdateProducts(req.body.updates);

    logger.logBusiness('products_bulk_updated', {
      count: req.body.updates.length,
      updatedBy: req.user.id
    });

    res.status(200).json(result);
  });

  // Check stock availability
  checkStockAvailability = catchAsync(async (req, res) => {
    const { quantity } = req.query;
    const result = await this.productService.checkStockAvailability(
      req.params.id, 
      parseInt(quantity)
    );

    res.status(200).json(result);
  });
}

export default ProductController;
