/**
 * Enhanced API service for frontend-backend communication
 * Handles authentication, products, users, and orders
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Generic request method with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  async changePassword(passwordData) {
    return this.post('/auth/change-password', passwordData);
  }

  // Product methods
  async getProducts(params = {}) {
    const response = await this.get('/products', params);
    return response.data || [];
  }

  async getProduct(id) {
    const response = await this.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(query, params = {}) {
    const response = await this.get('/products/search', { q: query, ...params });
    return response.data || [];
  }

  async getFeaturedProducts(limit = 8) {
    const response = await this.get('/products/featured', { limit });
    return response.data || [];
  }

  async getCategories() {
    const response = await this.get('/products/categories');
    return response.data || [];
  }

  async getProductsByCategory(category, params = {}) {
    const response = await this.get(`/products/category/${category}`, params);
    return response.data || [];
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Cart methods
  async getCart() {
    const response = await this.get('/users/cart');
    return response.data || [];
  }

  async addToCart(productId, quantity = 1) {
    return this.post('/users/cart', { productId, quantity });
  }

  async updateCartItem(productId, quantity) {
    return this.put(`/users/cart/${productId}`, { quantity });
  }

  async removeFromCart(productId) {
    return this.delete(`/users/cart/${productId}`);
  }

  async clearCart() {
    return this.delete('/users/cart');
  }

  // Wishlist methods
  async getWishlist() {
    const response = await this.get('/users/wishlist');
    return response.data || [];
  }

  async addToWishlist(productId) {
    return this.post('/users/wishlist', { productId });
  }

  async removeFromWishlist(productId) {
    return this.delete(`/users/wishlist/${productId}`);
  }

  // Order methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrders(params = {}) {
    const response = await this.get('/orders', params);
    return response.data || [];
  }

  async getOrder(id) {
    const response = await this.get(`/orders/${id}`);
    return response.data;
  }

  async getUserOrders(params = {}) {
    const response = await this.get('/users/orders', params);
    return response.data || [];
  }

  async updateOrderStatus(id, status, note) {
    return this.patch(`/orders/${id}/status`, { status, note });
  }

  async cancelOrder(id, reason) {
    return this.delete(`/orders/${id}/cancel`, { reason });
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Admin methods
  async getAdminStats() {
    const response = await this.get('/products/admin/statistics');
    return response.data;
  }

  async getLowStockProducts() {
    const response = await this.get('/products/admin/low-stock');
    return response.data || [];
  }
}

export default new ApiService();
