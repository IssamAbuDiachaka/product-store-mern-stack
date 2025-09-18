/**
 * Cart Context and Hook
 * Provides global cart state management
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  // Load cart from API
  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const items = await apiService.getCart();
      setCartItems(items);
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      setLoading(true);
      await apiService.addToCart(productId, quantity);
      await loadCart(); // Refresh cart
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      if (quantity <= 0) {
        await removeFromCart(productId);
        return { success: true };
      }
      
      await apiService.updateCartItem(productId, quantity);
      await loadCart(); // Refresh cart
      toast.success('Cart updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to update cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      await apiService.removeFromCart(productId);
      await loadCart(); // Refresh cart
      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to remove item from cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      await apiService.clearCart();
      setCartItems([]);
      toast.success('Cart cleared!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals
  const cartTotals = {
    itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0),
    get total() {
      return this.subtotal; // Add tax, shipping, etc. later
    }
  };

  const value = {
    cartItems,
    loading,
    cartTotals,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
