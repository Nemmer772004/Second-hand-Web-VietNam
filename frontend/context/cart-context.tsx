'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../lib/types';
import { client } from '../lib/apollo-client';
import {
  GET_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART
} from '../services/cart';
import { useAuth } from './auth-context';
import { logInteraction } from '@/lib/interaction-tracker';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: Error | null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  loading: false,
  error: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  total: 0,
});

const resolveProductIdentifier = (product: Product | undefined | null, fallback?: string) => {
  if (product?.productId != null) {
    return String(product.productId);
  }
  if (product?.legacyId != null) {
    return String(product.legacyId);
  }
  if (fallback && /^\d+$/.test(fallback)) {
    return fallback;
  }
  return product?.id ?? fallback ?? '';
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await client.query<{ cart: CartItem[] }>({
        query: GET_CART,
        fetchPolicy: 'network-only'
      });
      setCart(data?.cart || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    fetchCart();
  }, [authLoading, fetchCart]);

  const total = cart.reduce(
    (sum: number, item: CartItem) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const addToCart = async (product: Product, quantity: number) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
    }
    setLoading(true);
    try {
      const resolvedProductId = resolveProductIdentifier(product);
      const numericProductId = /^\d+$/.test(resolvedProductId) ? resolvedProductId : null;
      const serviceProductId = numericProductId ?? product.id;

      const response = await client.mutate({
        mutation: ADD_TO_CART,
        variables: {
          input: {
            productId: serviceProductId,
            quantity,
          },
        },
        refetchQueries: [{ query: GET_CART }]
      });
      void logInteraction({
        eventType: 'add_to_cart',
        userId: user?.id,
        productId: numericProductId ?? undefined,
        metadata: {
          quantity,
          price: product.price,
          cartItemId: response.data?.addToCart?.id,
          productId: numericProductId ?? resolvedProductId ?? null,
          numericProductId,
          sourceId: product.id,
        },
      });
      await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để chỉnh sửa giỏ hàng.');
    }
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      await client.mutate({
        mutation: UPDATE_CART_ITEM,
        variables: {
          id: itemId,
          input: {
            quantity,
          },
        },
        refetchQueries: [{ query: GET_CART }]
      });
      await fetchCart();
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để chỉnh sửa giỏ hàng.');
    }
    try {
      await client.mutate({
        mutation: REMOVE_FROM_CART,
        variables: { id: itemId },
        refetchQueries: [{ query: GET_CART }]
      });
      await fetchCart();
    } catch (err) {
      console.error('Error removing cart item:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      await client.mutate({
        mutation: CLEAR_CART,
        refetchQueries: [{ query: GET_CART }]
      });
      await fetchCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
