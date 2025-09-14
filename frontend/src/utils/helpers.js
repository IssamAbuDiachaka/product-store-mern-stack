/**
 * Form validation utilities
 * Provides reusable validation functions for forms
 */

export const validateProduct = (product) => {
  const errors = {};

  // Name validation
  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters long';
  }

  // Price validation
  if (!product.price || parseFloat(product.price) <= 0) {
    errors.price = 'Price must be a positive number';
  }

  // Stock validation
  if (product.stock === undefined || product.stock === null || parseInt(product.stock) < 0) {
    errors.stock = 'Stock must be a non-negative number';
  }

  // Image URL validation
  if (!product.imageUrl || !isValidUrl(product.imageUrl)) {
    errors.imageUrl = 'Please provide a valid image URL';
  }

  // Description validation
  if (!product.description || product.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// URL validation helper
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Format date for display
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Debounce function for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
