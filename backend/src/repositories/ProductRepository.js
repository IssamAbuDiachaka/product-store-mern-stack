/**
 * Product Repository - Data access layer for product operations
 * Handles all database operations for products
 */

import Product from '../models/Product.js';

class ProductRepository {
  
  // Get all products with filtering and pagination
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      status = 'active'
    } = options;

    const query = { isActive: true, status };
    
    // Apply filters
    if (category) query.category = category;
    if (inStock) query.stock = { $gt: 0 };
    if (featured !== undefined) query.isFeatured = featured;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name')
      .lean();

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Find product by ID
  async findById(id) {
    return await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('reviews.user', 'name avatar');
  }

  // Find product by slug
  async findBySlug(slug) {
    return await Product.findOne({ slug, isActive: true })
      .populate('createdBy', 'name email')
      .populate('reviews.user', 'name avatar');
  }

  // Create new product
  async create(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  // Update product by ID
  async updateById(id, updateData) {
    return await Product.findByIdAndUpdate(
      id,
      { ...updateData, lastModifiedBy: updateData.modifiedBy },
      { new: true, runValidators: true }
    );
  }

  // Delete product (soft delete)
  async deleteById(id, deletedBy) {
    return await Product.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        status: 'discontinued',
        lastModifiedBy: deletedBy
      },
      { new: true }
    );
  }

  // Hard delete product
  async hardDeleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  // Get featured products
  async getFeatured(limit = 8) {
    return await Product.find({
      isActive: true,
      status: 'active',
      isFeatured: true,
      stock: { $gt: 0 }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  }

  // Get low stock products
  async getLowStock() {
    return await Product.find({
      isActive: true,
      status: 'active',
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
    .sort({ stock: 1 })
    .lean();
  }

  // Search products
  async search(searchTerm, options = {}) {
    return await Product.search(searchTerm, options);
  }

  // Get product categories
  async getCategories() {
    return await Product.distinct('category', { isActive: true });
  }

  // Get products by category
  async getByCategory(category, options = {}) {
    const { limit = 12, page = 1 } = options;
    
    const products = await Product.find({
      category,
      isActive: true,
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

    const total = await Product.countDocuments({
      category,
      isActive: true,
      status: 'active'
    });

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Update stock
  async updateStock(id, quantity) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { new: true }
    );
  }

  // Increment view count
  async incrementViewCount(id) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  // Add review to product
  async addReview(id, reviewData) {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    
    return await product.addReview(
      reviewData.userId,
      reviewData.userName,
      reviewData.rating,
      reviewData.comment,
      reviewData.isVerifiedPurchase
    );
  }

  // Get product statistics
  async getStatistics() {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$stock', 0] },
                  { $lte: ['$stock', '$lowStockThreshold'] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalProducts: 0,
      totalValue: 0,
      averagePrice: 0,
      totalStock: 0,
      outOfStock: 0,
      lowStock: 0
    };
  }

  // Bulk operations
  async bulkUpdate(updates) {
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: update.data,
        upsert: false
      }
    }));

    return await Product.bulkWrite(operations);
  }

  // Check if product exists
  async exists(id) {
    return await Product.exists({ _id: id, isActive: true });
  }

  // Get related products
  async getRelated(productId, category, limit = 4) {
    return await Product.find({
      _id: { $ne: productId },
      category,
      isActive: true,
      status: 'active',
      stock: { $gt: 0 }
    })
    .sort({ averageRating: -1 })
    .limit(limit)
    .lean();
  }
}

export default ProductRepository;
