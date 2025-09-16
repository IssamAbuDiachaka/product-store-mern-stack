/**
 * Product Service - Business logic layer for product operations
 * Handles business rules, validation, and coordinates between controller and repository
 */

import ProductRepository from '../repositories/ProductRepository.js';
import { AppError } from '../utils/AppError.js';
import { validateProduct } from '../validators/productValidator.js';

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  // Get all products with filtering and pagination
  async getAllProducts(queryParams) {
    try {
      const options = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 12,
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc',
        category: queryParams.category,
        minPrice: queryParams.minPrice,
        maxPrice: queryParams.maxPrice,
        inStock: queryParams.inStock === 'true',
        featured: queryParams.featured ? queryParams.featured === 'true' : undefined,
        search: queryParams.search,
        status: queryParams.status || 'active'
      };

      const result = await this.productRepository.findAll(options);
      
      return {
        success: true,
        data: result.products,
        pagination: result.pagination,
        filters: {
          category: options.category,
          priceRange: {
            min: options.minPrice,
            max: options.maxPrice
          },
          inStock: options.inStock,
          featured: options.featured
        }
      };
    } catch (error) {
      throw new AppError('Failed to fetch products', 500);
    }
  }

  // Get single product by ID
  async getProductById(id) {
    try {
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Increment view count
      await this.productRepository.incrementViewCount(id);

      return {
        success: true,
        data: product
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch product', 500);
    }
  }

  // Get product by slug
  async getProductBySlug(slug) {
    try {
      const product = await this.productRepository.findBySlug(slug);
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Increment view count
      await this.productRepository.incrementViewCount(product._id);

      return {
        success: true,
        data: product
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch product', 500);
    }
  }

  // Create new product
  async createProduct(productData, createdBy) {
    try {
      // Validate product data
      const { error, value } = validateProduct(productData);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Add creator information
      value.createdBy = createdBy;

      // Process images if provided
      if (value.images && value.images.length > 0) {
        value.images = value.images.map((img, index) => ({
          url: img.url || img,
          alt: img.alt || value.name,
          isPrimary: index === 0
        }));
      } else if (value.imageUrl) {
        value.images = [{
          url: value.imageUrl,
          alt: value.name,
          isPrimary: true
        }];
      }

      const product = await this.productRepository.create(value);

      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create product', 500);
    }
  }

  // Update product
  async updateProduct(id, updateData, modifiedBy) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new AppError('Product not found', 404);
      }

      // Validate update data
      const { error, value } = validateProduct(updateData, false);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      // Add modifier information
      value.modifiedBy = modifiedBy;

      // Process images if provided
      if (value.images) {
        value.images = value.images.map((img, index) => ({
          url: img.url || img,
          alt: img.alt || value.name || existingProduct.name,
          isPrimary: img.isPrimary || index === 0
        }));
      }

      const updatedProduct = await this.productRepository.updateById(id, value);

      return {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update product', 500);
    }
  }

  // Delete product (soft delete)
  async deleteProduct(id, deletedBy) {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      await this.productRepository.deleteById(id, deletedBy);

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete product', 500);
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await this.productRepository.getFeatured(limit);

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw new AppError('Failed to fetch featured products', 500);
    }
  }

  // Search products
  async searchProducts(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new AppError('Search term must be at least 2 characters long', 400);
      }

      const products = await this.productRepository.search(searchTerm, options);

      return {
        success: true,
        data: products,
        searchTerm
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to search products', 500);
    }
  }

  // Get product categories
  async getCategories() {
    try {
      const categories = await this.productRepository.getCategories();

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  // Get products by category
  async getProductsByCategory(category, options = {}) {
    try {
      const result = await this.productRepository.getByCategory(category, options);

      return {
        success: true,
        data: result.products,
        pagination: result.pagination,
        category
      };
    } catch (error) {
      throw new AppError('Failed to fetch products by category', 500);
    }
  }

  // Get low stock products (admin only)
  async getLowStockProducts() {
    try {
      const products = await this.productRepository.getLowStock();

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw new AppError('Failed to fetch low stock products', 500);
    }
  }

  // Update product stock
  async updateStock(id, quantity, operation = 'set') {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      let newStock;
      if (operation === 'increment') {
        newStock = product.stock + quantity;
      } else if (operation === 'decrement') {
        newStock = product.stock - quantity;
        if (newStock < 0) {
          throw new AppError('Insufficient stock', 400);
        }
      } else {
        newStock = quantity;
      }

      const updatedProduct = await this.productRepository.updateById(id, { stock: newStock });

      return {
        success: true,
        message: 'Stock updated successfully',
        data: {
          productId: id,
          previousStock: product.stock,
          newStock: newStock
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update stock', 500);
    }
  }

  // Add review to product
  async addReview(productId, reviewData, userId) {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const updatedProduct = await this.productRepository.addReview(productId, {
        ...reviewData,
        userId
      });

      return {
        success: true,
        message: 'Review added successfully',
        data: updatedProduct
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.message === 'You have already reviewed this product') {
        throw new AppError(error.message, 400);
      }
      throw new AppError('Failed to add review', 500);
    }
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const relatedProducts = await this.productRepository.getRelated(
        productId,
        product.category,
        limit
      );

      return {
        success: true,
        data: relatedProducts
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch related products', 500);
    }
  }

  // Get product statistics (admin only)
  async getStatistics() {
    try {
      const stats = await this.productRepository.getStatistics();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new AppError('Failed to fetch product statistics', 500);
    }
  }

  // Bulk update products (admin only)
  async bulkUpdateProducts(updates) {
    try {
      const result = await this.productRepository.bulkUpdate(updates);

      return {
        success: true,
        message: 'Products updated successfully',
        data: {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount
        }
      };
    } catch (error) {
      throw new AppError('Failed to bulk update products', 500);
    }
  }

  // Check stock availability
  async checkStockAvailability(productId, quantity) {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const isAvailable = product.stock >= quantity;
      
      return {
        success: true,
        data: {
          productId,
          requestedQuantity: quantity,
          availableStock: product.stock,
          isAvailable,
          message: isAvailable 
            ? 'Stock is available' 
            : `Only ${product.stock} items available`
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to check stock availability', 500);
    }
  }
}

export default ProductService;
