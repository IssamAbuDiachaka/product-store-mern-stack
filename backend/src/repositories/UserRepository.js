/**
 * User Repository - Data access layer for user operations
 * Handles all database operations for users
 */

import User from '../models/User.js';

class UserRepository {
  
  // Create new user
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Find user by ID
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  // Find user by ID with password (for authentication)
  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  // Find user by email
  async findByEmail(email) {
    return await User.findOne({ email, isActive: true }).select('-password');
  }

  // Find user by email with password (for authentication)
  async findByEmailWithPassword(email) {
    return await User.findOne({ email, isActive: true }).select('+password');
  }

  // Find user by credentials (login)
  async findByCredentials(email, password) {
    return await User.findByCredentials(email, password);
  }

  // Update user by ID
  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  // Delete user (soft delete)
  async deleteById(id) {
    return await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');
  }

  // Hard delete user
  async hardDeleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  // Get all users with pagination
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      isActive = true,
      search
    } = options;

    const query = { isActive };
    
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Check if email exists
  async emailExists(email, excludeId = null) {
    const query = { email, isActive: true };
    if (excludeId) query._id = { $ne: excludeId };
    
    return await User.exists(query);
  }

  // Update last login
  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    ).select('-password');
  }

  // Add refresh token
  async addRefreshToken(id, refreshToken) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    await user.addRefreshToken(refreshToken);
    return user;
  }

  // Remove refresh token
  async removeRefreshToken(id, refreshToken) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    await user.removeRefreshToken(refreshToken);
    return user;
  }

  // Verify refresh token
  async verifyRefreshToken(id, refreshToken) {
    const user = await User.findById(id);
    if (!user) return false;
    
    return user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
  }

  // Clear all refresh tokens
  async clearRefreshTokens(id) {
    return await User.findByIdAndUpdate(
      id,
      { refreshTokens: [] },
      { new: true }
    );
  }

  // Cart operations
  async getCart(id) {
    const user = await User.findById(id)
      .populate('cart.product', 'name price imageUrl stock')
      .select('cart');
    
    return user ? user.cart : [];
  }

  async addToCart(id, productId, quantity = 1) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    return await user.addToCart(productId, quantity);
  }

  async updateCartItem(id, productId, quantity) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    const cartItem = user.cart.find(item => 
      item.product.toString() === productId.toString()
    );
    
    if (cartItem) {
      cartItem.quantity = quantity;
      await user.save();
    }
    
    return user;
  }

  async removeFromCart(id, productId) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    return await user.removeFromCart(productId);
  }

  async clearCart(id) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    return await user.clearCart();
  }

  // Wishlist operations
  async getWishlist(id) {
    const user = await User.findById(id)
      .populate('wishlist', 'name price imageUrl averageRating')
      .select('wishlist');
    
    return user ? user.wishlist : [];
  }

  async addToWishlist(id, productId) {
    return await User.findByIdAndUpdate(
      id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).select('wishlist');
  }

  async removeFromWishlist(id, productId) {
    return await User.findByIdAndUpdate(
      id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).select('wishlist');
  }

  // Update user profile
  async updateProfile(id, profileData) {
    const allowedFields = [
      'name',
      'phone',
      'address',
      'avatar'
    ];
    
    const updateData = {};
    Object.keys(profileData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = profileData[key];
      }
    });
    
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
  }

  // Change password
  async changePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    user.password = newPassword;
    await user.save();
    
    return user;
  }

  // Get user statistics
  async getStatistics() {
    const stats = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalCustomers: {
            $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
          },
          totalAdmins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: ['$emailVerified', 1, 0] }
          }
        }
      }
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    return {
      ...stats[0],
      recentRegistrations: recentUsers
    } || {
      totalUsers: 0,
      totalCustomers: 0,
      totalAdmins: 0,
      verifiedUsers: 0,
      recentRegistrations: 0
    };
  }

  // Search users
  async search(searchTerm, options = {}) {
    const {
      page = 1,
      limit = 10,
      role
    } = options;

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  // Check if user exists
  async exists(id) {
    return await User.exists({ _id: id, isActive: true });
  }

  // Get users by role
  async getByRole(role, options = {}) {
    const {
      page = 1,
      limit = 10,
      isActive = true
    } = options;

    const users = await User.find({ role, isActive })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role, isActive });

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }
}

export default UserRepository;
