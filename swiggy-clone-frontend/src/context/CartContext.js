'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialCart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  totalAmount: 0,
  restaurant: null
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(initialCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || user?.role === 'owner') {
      setCart(initialCart);
      return;
    }

    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      // Cart might be empty or user not allowed
      setCart(initialCart);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (foodId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartAPI.addToCart({ foodId, quantity });
      if (res?.data) {
        setCart(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (foodId, quantity) => {
    setLoading(true);
    try {
      const res = await cartAPI.updateItem({ foodId, quantity });
      if (res?.data) {
        setCart(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (foodId) => {
    setLoading(true);
    try {
      const res = await cartAPI.removeItem(foodId);
      if (res?.data) {
        setCart(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.clearCart();
      setCart(initialCart);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    itemCount: cart?.itemCount || 0,
    items: cart?.items || [],
    subtotal: cart?.subtotal || 0,
    totalAmount: cart?.totalAmount || 0,
    restaurant: cart?.restaurant || null,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
