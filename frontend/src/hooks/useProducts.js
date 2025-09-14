/**
 * Custom hook for managing products state and operations
 * Provides centralized product management with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService.js';
import { toast } from 'sonner';

export const useProducts = (initialLoad = true) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productService.getProducts(params);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product created successfully!');
      return newProduct;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing product
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => 
        prev.map(product => 
          product._id === id ? updatedProduct : product
        )
      );
      toast.success('Product updated successfully!');
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product._id !== id));
      toast.success('Product deleted successfully!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await productService.searchProducts(query);
      setProducts(searchResults);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initialLoad) {
      fetchProducts();
    }
  }, [fetchProducts, initialLoad]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    refetch: fetchProducts,
  };
};
