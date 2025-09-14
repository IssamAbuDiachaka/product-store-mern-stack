/**
 * Product service for all product-related API operations
 * Abstracts API calls and provides clean interface for components
 */

import apiService from './api.js';

export const productService = {
  // Get all products with optional filtering and pagination
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get(endpoint);
    return response.data || [];
  },

  // Get single product by ID
  async getProductById(id) {
    const response = await apiService.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  async createProduct(productData) {
    const response = await apiService.post('/products', productData);
    return response.data;
  },

  // Update existing product
  async updateProduct(id, productData) {
    const response = await apiService.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  async deleteProduct(id) {
    const response = await apiService.delete(`/products/${id}`);
    return response.data;
  },

  // Search products
  async searchProducts(query) {
    const response = await apiService.get(`/products?search=${encodeURIComponent(query)}`);
    return response.data || [];
  },
};
