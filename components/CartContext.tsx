"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = {
  cartId: string;
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  size?: string;
  image?: string;
  description?: string;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  delivery: number;
  total: number;
  addToCart: (item: Omit<CartItem, "cartId">) => void;
  removeFromCart: (cartId: string) => void;
  updateQty: (cartId: string, change: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("flafe_cart") : null;
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flafe_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "cartId">) => {
    const cartId = item.size ? `${item.id}-${item.size}` : `${item.id}-base`;
    setCart((prev) => {
      const existing = prev.find((entry) => entry.cartId === cartId);
      if (existing) {
        return prev.map((entry) =>
          entry.cartId === cartId ? { ...entry, qty: entry.qty + item.qty } : entry
        );
      }
      return [...prev, { ...item, cartId }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQty = (cartId: string, change: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, qty: Math.max(1, item.qty + change) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const delivery = useMemo(() => (subtotal > 0 ? 150 : 0), [subtotal]);
  const total = useMemo(() => subtotal + delivery, [subtotal, delivery]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, subtotal, delivery, total, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export type { CartItem };
